#include <ATen/ATen.h>

#include <stdio.h>
#include <math.h>

void CropAndResizePerBox(
    const float * image_data,
    const int batch_size,
    const int depth,
    const int image_height,
    const int image_width,

    const float * boxes_data,
    const int start_box,
    const int limit_box,

    float * corps_data,
    const int crop_height,
    const int crop_width,
    const float extrapolation_value
) {
    const int image_channel_elements = image_height * image_width;
    const int image_elements = depth * image_channel_elements;

    const int channel_elements = crop_height * crop_width;
    const int crop_elements = depth * channel_elements;

    int b;
    #pragma omp parallel for
    for (b = start_box; b < limit_box; ++b) {
        const float * box = boxes_data + b * 5;
        const int b_in = static_cast<int>(round(box[0]));
        const float x1 = box[1];
        const float y1 = box[2];
        const float x2 = box[3];
        const float y2 = box[4];

        if (b_in < 0 || b_in >= batch_size) {
            printf("Error: batch_index %d out of range [0, %d)\n", b_in, batch_size);
            exit(-1);
        }

        const float height_scale =
            (crop_height > 1)
                ? (y2 - y1) / (crop_height - 1)
                : 0;
        const float width_scale =
            (crop_width > 1) ? (x2 - x1) / (crop_width - 1)
                             : 0;

        for (int y = 0; y < crop_height; ++y)
        {
            const float in_y = (crop_height > 1)
                                   ? y1 + y * height_scale
                                   : 0.5 * (y1 + y2);

            if (in_y < 0 || in_y > image_height - 1)
            {
                for (int x = 0; x < crop_width; ++x)
                {
                    for (int d = 0; d < depth; ++d)
                    {
                        // crops(b, y, x, d) = extrapolation_value;
                        corps_data[crop_elements * b + channel_elements * d + y * crop_width + x] = extrapolation_value;
                    }
                }
                continue;
            }

            const int top_y_index = static_cast<int>(floorf(in_y));
            const int bottom_y_index = static_cast<int>(ceilf(in_y));
            const float y_lerp = in_y - top_y_index;

            for (int x = 0; x < crop_width; ++x)
            {
                const float in_x = (crop_width > 1)
                                       ? x1 + x * width_scale
                                       : 0.5 * (x1 + x2);
                if (in_x < 0 || in_x > image_width - 1)
                {
                    for (int d = 0; d < depth; ++d)
                    {
                        corps_data[crop_elements * b + channel_elements * d + y * crop_width + x] = extrapolation_value;
                    }
                    continue;
                }

                const int left_x_index = static_cast<int>(floorf(in_x));
                const int right_x_index = static_cast<int>(ceilf(in_x));
                const float x_lerp = in_x - left_x_index;

                for (int d = 0; d < depth; ++d)
                {
                    const float *pimage = image_data + b_in * image_elements + d * image_channel_elements;

                    const float top_left = pimage[top_y_index * image_width + left_x_index];
                    const float top_right = pimage[top_y_index * image_width + right_x_index];
                    const float bottom_left = pimage[bottom_y_index * image_width + left_x_index];
                    const float bottom_right = pimage[bottom_y_index * image_width + right_x_index];

                    const float top = top_left + (top_right - top_left) * x_lerp;
                    const float bottom =
                        bottom_left + (bottom_right - bottom_left) * x_lerp;

                    corps_data[crop_elements * b + channel_elements * d + y * crop_width + x] = top + (bottom - top) * y_lerp;
                }
            }   // end for x
        }   // end for y
    }   // end for b

}

int crop_and_resize_cpu_forward(
    at::Tensor image,
    at::Tensor rois,
    const float extrapolation_value,
    at::Tensor output)
{
    const int batch = image.size(0);
    const int depth = image.size(1);
    const int image_height = image.size(2);
    const int image_width = image.size(3);
    const int num_boxes = rois.size(0);
    const int crop_height = output.size(2);
    const int crop_width = output.size(3);

    // auto crop = at::zeros(image.type(), {num_boxes, depth, crop_height, crop_width});
    // auto crop = at::zeros({num_boxes, depth, crop_height, crop_width}, image.type());
    CropAndResizePerBox(
        image.data<float>(),
        batch,
        depth,
        image_height,
        image_width,
        rois.data<float>(),
        0,
        num_boxes,
        output.data<float>(),
        crop_height,
        crop_width,
        extrapolation_value);

    return 0;
}

int crop_and_resize_cpu_backward(
    at::Tensor grads,
    at::Tensor rois,
    at::Tensor bottom_grads
)
{
    // shape
    const int num_boxes = rois.size(0);
    const int depth = grads.size(1);
    const int crop_height = grads.size(2);
    const int crop_width = grads.size(3);
    const int batch_size = grads.size(0);
    const int image_height = bottom_grads.size(2);
    const int image_width = bottom_grads.size(3);
    // n_elements
    const int image_channel_elements = image_height * image_width;
    const int image_elements = depth * image_channel_elements;

    const int channel_elements = crop_height * crop_width;
    const int crop_elements = depth * channel_elements;

    // init output space
    // auto grads_image = at::zeros(grads.type(), {batch_size, depth, image_height, image_width});
    // auto grads_image = at::zeros({batch_size, depth, image_height, image_width}, grads.type());
    // THFloatTensor_zero(grads_image);

    // data pointer
    const float * grads_data = grads.data<float>();
    const float * boxes_data = rois.data<float>();
    float* grads_image_data = bottom_grads.data<float>();

    for (int b = 0; b < num_boxes; ++b) {
        const float * box = boxes_data + b * 5;
        const int b_in = static_cast<int>(round(box[0]));
        const float x1 = box[1];
        const float y1 = box[2];
        const float x2 = box[3];
        const float y2 = box[4];

        if (b_in < 0 || b_in >= batch_size) {
            printf("Error: batch_index %d out of range [0, %d)\n", b_in, batch_size);
            exit(-1);
        }

        const float height_scale =
            (crop_height > 1) ? (y2 - y1) / (crop_height - 1)
                              : 0;
        const float width_scale =
            (crop_width > 1) ? (x2 - x1) / (crop_width - 1)
                             : 0;

        for (int y = 0; y < crop_height; ++y)
        {
            const float in_y = (crop_height > 1)
                                   ? y1 *  + y * height_scale
                                   : 0.5 * (y1 + y2);
            if (in_y < 0 || in_y > image_height - 1)
            {
                continue;
            }
            const int top_y_index = static_cast<int>(floorf(in_y));
            const int bottom_y_index = static_cast<int>(ceilf(in_y));
            const float y_lerp = in_y - top_y_index;

            for (int x = 0; x < crop_width; ++x)
            {
                const float in_x = (crop_width > 1)
                                       ? x1 + x * width_scale
                                       : 0.5 * (x1 + x2);
                if (in_x < 0 || in_x > image_width - 1)
                {
                    continue;
                }
                const int left_x_index = static_cast<int>(floorf(in_x));
                const int right_x_index = static_cast<int>(ceilf(in_x));
                const float x_lerp = in_x - left_x_index;

                for (int d = 0; d < depth; ++d)
                {
                    float *pimage = grads_image_data + b_in * image_elements + d * image_channel_elements;
                    const float grad_val = grads_data[crop_elements * b + channel_elements * d + y * crop_width + x];

                    const float dtop = (1 - y_lerp) * grad_val;
                    pimage[top_y_index * image_width + left_x_index] += (1 - x_lerp) * dtop;
                    pimage[top_y_index * image_width + right_x_index] += x_lerp * dtop;

                    const float dbottom = y_lerp * grad_val;
                    pimage[bottom_y_index * image_width + left_x_index] += (1 - x_lerp) * dbottom;
                    pimage[bottom_y_index * image_width + right_x_index] += x_lerp * dbottom;
                }   // end d
            }   // end x
        }   // end y
    }   // end b

    return 0;
}
