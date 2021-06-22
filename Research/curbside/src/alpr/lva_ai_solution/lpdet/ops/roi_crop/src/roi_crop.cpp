#include <torch/extension.h>

#include <vector>

// CUDA forward declarations

int crop_and_resize_cuda_forward(
    at::Tensor image,
    at::Tensor rois,
    const float extrapolation_value,
    at::Tensor output);

int crop_and_resize_cuda_backward(
    at::Tensor grads,
    at::Tensor rois,
    at::Tensor bottom_grads
);

// C++ interface

int crop_and_resize_cpu_forward(
    at::Tensor image,
    at::Tensor rois,
    const float extrapolation_value,
    at::Tensor output);

int crop_and_resize_cpu_backward(
    at::Tensor grads,
    at::Tensor rois,
    at::Tensor bottom_grads
);

// NOTE: AT_ASSERT has become AT_CHECK on master after 0.4.
#define CHECK_CUDA(x) AT_ASSERTM(x.type().is_cuda(), #x " must be a CUDA tensor")
#define CHECK_CONTIGUOUS(x) AT_ASSERTM(x.is_contiguous(), #x " must be contiguous")

int crop_and_resize_forward(
    at::Tensor image,
    at::Tensor rois,
    const float extrapolation_value,
    at::Tensor output)
{
    CHECK_CONTIGUOUS(image);
    CHECK_CONTIGUOUS(rois);

    if(image.type().is_cuda())
    {
        CHECK_CUDA(rois);
        return crop_and_resize_cuda_forward(image, rois, extrapolation_value, output);
    }
    else
    {
        return crop_and_resize_cpu_forward(image, rois, extrapolation_value, output);
    }
}


int crop_and_resize_backward(
    at::Tensor grads,
    at::Tensor rois,
    at::Tensor bottom_grads
)
{
    CHECK_CONTIGUOUS(grads);
    CHECK_CONTIGUOUS(rois);

    if(grads.type().is_cuda())
    {
        CHECK_CUDA(rois);
        return crop_and_resize_cuda_backward(grads, rois, bottom_grads);
    }
    else
    {
        return crop_and_resize_cpu_backward(grads, rois, bottom_grads);
    }
}

PYBIND11_MODULE(TORCH_EXTENSION_NAME, m) {
  m.def("forward", &crop_and_resize_forward, "Crop and resize forward");
  m.def("backward", &crop_and_resize_backward, "Crop and resize backward");
}
