#include <ATen/ATen.h>

#include <cuda.h>
#include <cuda_runtime.h>
#include <math.h>
#include <vector>

#if !defined(__CUDA_ARCH__) || __CUDA_ARCH__ >= 600

#else
static __inline__ __device__ double atomicAdd(double *address, double val) {
  unsigned long long int* address_as_ull = (unsigned long long int*)address;
  unsigned long long int old = *address_as_ull, assumed;
  if (val==0.0)
    return __longlong_as_double(old);
  do {
    assumed = old;
    old = atomicCAS(address_as_ull, assumed, __double_as_longlong(val +__longlong_as_double(assumed)));
  } while (assumed != old);
  return __longlong_as_double(old);
}
#endif

#define CUDA_1D_KERNEL_LOOP(i, n)                            \
for (int i = blockIdx.x * blockDim.x + threadIdx.x; i < n; \
     i += blockDim.x * gridDim.x)




namespace {

    template <typename scalar_t>
    __global__ void crop_and_resize_forward_kernel(
        const int nthreads,
        const scalar_t* __restrict__ image_ptr,
        const scalar_t* __restrict__ boxes_ptr,
        const int num_boxes,
        const int batch,
        const int image_height,
        const int image_width,
        const int crop_height,
        const int crop_width,
        const int depth,
        const float extrapolation_value,
        scalar_t* crops_ptr
    ) {

        CUDA_1D_KERNEL_LOOP(out_idx, nthreads)
        {
            // NHWC: out_idx = d + depth * (w + crop_width * (h + crop_height * b))
            // NCHW: out_idx = w + crop_width * (h + crop_height * (d + depth * b))
            int idx = out_idx;
            const int x = idx % crop_width;
            idx /= crop_width;
            const int y = idx % crop_height;
            idx /= crop_height;
            const int d = idx % depth;
            const int b = idx / depth;

            const int b_in = static_cast<int>(rintf(boxes_ptr[b * 5 + 0]));
            const scalar_t x1 = boxes_ptr[b * 5 + 1];
            const scalar_t y1 = boxes_ptr[b * 5 + 2];
            const scalar_t x2 = boxes_ptr[b * 5 + 3];
            const scalar_t y2 = boxes_ptr[b * 5 + 4];

            if (b_in < 0 || b_in >= batch)
            {
                continue;
            }

            const scalar_t height_scale =
                (crop_height > 1) ? (y2 - y1) / (crop_height - 1) : 0;
            const scalar_t width_scale =
                (crop_width > 1) ? (x2 - x1) / (crop_width - 1) : 0;

            const scalar_t in_y = (crop_height > 1)
                                    ? y1 + y * height_scale
                                    : 0.5 * (y1 + y2);
            if (in_y < 0 || in_y > image_height - 1)
            {
                crops_ptr[out_idx] = extrapolation_value;
                continue;
            }

            const scalar_t in_x = (crop_width > 1)
                                    ? x1 + x * width_scale
                                    : 0.5 * (x1 + x2);
            if (in_x < 0 || in_x > image_width - 1)
            {
                crops_ptr[out_idx] = extrapolation_value;
                continue;
            }

            const int top_y_index = floorf(in_y);
            const int bottom_y_index = ceilf(in_y);
            const scalar_t y_lerp = in_y - top_y_index;

            const int left_x_index = floorf(in_x);
            const int right_x_index = ceilf(in_x);
            const scalar_t x_lerp = in_x - left_x_index;

            const scalar_t *pimage = image_ptr + (b_in * depth + d) * image_height * image_width;
            const scalar_t top_left = pimage[top_y_index * image_width + left_x_index];
            const scalar_t top_right = pimage[top_y_index * image_width + right_x_index];
            const scalar_t bottom_left = pimage[bottom_y_index * image_width + left_x_index];
            const scalar_t bottom_right = pimage[bottom_y_index * image_width + right_x_index];

            const scalar_t top = top_left + (top_right - top_left) * x_lerp;
            const scalar_t bottom = bottom_left + (bottom_right - bottom_left) * x_lerp;
            crops_ptr[out_idx] = top + (bottom - top) * y_lerp;
        }
    }


    template <typename scalar_t>
    __global__ void crop_and_resize_backward_kernel(
        const int nthreads,
        const scalar_t *grads_ptr,
        const scalar_t *boxes_ptr,
        const int num_boxes,
        const int batch,
        const int image_height,
        const int image_width,
        const int crop_height,
        const int crop_width,
        const int depth,
        scalar_t *grads_image_ptr)
    {
        CUDA_1D_KERNEL_LOOP(out_idx, nthreads)
        {
            // NHWC: out_idx = d + depth * (w + crop_width * (h + crop_height * b))
            // NCHW: out_idx = w + crop_width * (h + crop_height * (d + depth * b))
            int idx = out_idx;
            const int x = idx % crop_width;
            idx /= crop_width;
            const int y = idx % crop_height;
            idx /= crop_height;
            const int d = idx % depth;
            const int b = idx / depth;

            const scalar_t x1 = boxes_ptr[b * 5 + 1];
            const scalar_t y1 = boxes_ptr[b * 5 + 2];
            const scalar_t x2 = boxes_ptr[b * 5 + 3];
            const scalar_t y2 = boxes_ptr[b * 5 + 4];

            const int b_in = static_cast<int>(rintf(boxes_ptr[b * 5]));
            if (b_in < 0 || b_in >= batch)
            {
                continue;
            }

            const scalar_t height_scale =
                (crop_height > 1) ? (y2 - y1) / (crop_height - 1)
                                    : 0;
            const scalar_t width_scale =
                (crop_width > 1) ? (x2 - x1) / (crop_width - 1) : 0;

            const scalar_t in_y = (crop_height > 1)
                                    ? y1 * + y * height_scale
                                    : 0.5 * (y1 + y2);
            if (in_y < 0 || in_y > image_height - 1)
            {
                continue;
            }

            const scalar_t in_x = (crop_width > 1)
                                    ? x1 * (image_width - 1) + x * width_scale
                                    : 0.5 * (x1 + x2) * (image_width - 1);
            if (in_x < 0 || in_x > image_width - 1)
            {
                continue;
            }

            const int top_y_index = floorf(in_y);
            const int bottom_y_index = ceilf(in_y);
            const scalar_t y_lerp = in_y - top_y_index;

            const int left_x_index = floorf(in_x);
            const int right_x_index = ceilf(in_x);
            const scalar_t x_lerp = in_x - left_x_index;

            scalar_t *pimage = grads_image_ptr + (b_in * depth + d) * image_height * image_width;
            const scalar_t dtop = (1 - y_lerp) * grads_ptr[out_idx];
            atomicAdd(
                pimage + top_y_index * image_width + left_x_index,
                (1 - x_lerp) * dtop
            );
            atomicAdd(
                pimage + top_y_index * image_width + right_x_index,
                x_lerp * dtop
            );

            const scalar_t dbottom = y_lerp * grads_ptr[out_idx];
            atomicAdd(
                pimage + bottom_y_index * image_width + left_x_index,
                (1 - x_lerp) * dbottom
            );
            atomicAdd(
                pimage + bottom_y_index * image_width + right_x_index,
                x_lerp * dbottom
            );
        }
    }

}

int crop_and_resize_cuda_forward(
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
    const int total_count = num_boxes * crop_height * crop_width * depth;
    const int thread_per_block = 1024;
    const int block_count = (total_count + thread_per_block - 1) / thread_per_block;
    const dim3 blocks(block_count);

    cudaError_t err;
    if (total_count > 0){
        AT_DISPATCH_FLOATING_TYPES(image.type(), "crop_and_resize_forward_cuda", ([&] {
            crop_and_resize_forward_kernel<scalar_t><<<blocks, thread_per_block>>>(
                total_count,
                image.data<scalar_t>(),
                rois.data<scalar_t>(),
                num_boxes,
                batch,
                image_height,
                image_width,
                crop_height,
                crop_width,
                depth,
                extrapolation_value,
                output.data<scalar_t>());
        }));

        err = cudaGetLastError();

        if (cudaSuccess != err)
        {
            fprintf(stderr, "cudaCheckError() failed : %s\n", cudaGetErrorString(err));
            exit(-1);
        }
    }

    return 0;
}



int crop_and_resize_cuda_backward(
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
    const int batch = bottom_grads.size(0);
    const int image_height = bottom_grads.size(2);
    const int image_width = bottom_grads.size(3);
    // n_elements
    //const int image_channel_elements = image_height * image_width;
    //const int image_elements = depth * image_channel_elements;

    //const int channel_elements = crop_height * crop_width;
    //const int crop_elements = depth * channel_elements;

    // init output space
    // auto grads_image = at::zeros(grads.type(), {batch, depth, image_height, image_width});
    // auto grads_image = at::zeros({batch, depth, image_height, image_width}, grads.type());
    const int total_count = num_boxes * crop_height * crop_width * depth;
    const int thread_per_block = 1024;
    const int block_count = (total_count + thread_per_block - 1) / thread_per_block;
    const dim3 blocks(block_count);
    cudaError_t err;

    if (total_count > 0)
    {
        AT_DISPATCH_FLOATING_TYPES(grads.type(), "crop_and_resize_backward_cuda", ([&] {
            crop_and_resize_backward_kernel<scalar_t><<<blocks, thread_per_block>>>(
                total_count,
                grads.data<scalar_t>(),
                rois.data<scalar_t>(),
                num_boxes,
                batch,
                image_height,
                image_width,
                crop_height,
                crop_width,
                depth,
                bottom_grads.data<scalar_t>());
            }));

        err = cudaGetLastError();
        if (cudaSuccess != err)
        {
            fprintf(stderr, "cudaCheckError() failed : %s\n", cudaGetErrorString(err));
            exit(-1);
        }
    }

    return 0;

}
