from torch.autograd import Function

from .. import roi_crop_backend


class RoICropFunction(Function):

    @staticmethod
    def forward(ctx, images, rois, out_size):
        if isinstance(out_size, int):
            out_h = out_size
            out_w = out_size
        elif isinstance(out_size, tuple):
            assert len(out_size) == 2
            assert isinstance(out_size[0], int)
            assert isinstance(out_size[1], int)
            out_h, out_w = out_size
        else:
            raise TypeError(
                '"out_size" must be an integer or tuple of integers')
        ctx.save_for_backward(rois)
        ctx.feature_size = images.size()

        batch_size, num_channels, data_height, data_width = images.size()
        num_rois = rois.size(0)

        output = images.new_zeros(num_rois, num_channels, out_h, out_w)
        roi_crop_backend.forward(images, rois, 0.0, output)

        return output

    @staticmethod
    def backward(ctx, grad_output):
        feature_size = ctx.feature_size
        rois = ctx.saved_tensors[0]
        assert (feature_size is not None)

        batch_size, num_channels, data_height, data_width = feature_size
        out_w = grad_output.size(3)
        out_h = grad_output.size(2)

        grad_input = grad_rois = None
        if ctx.needs_input_grad[0]:
            grad_input = rois.new_zeros(batch_size, num_channels, data_height, data_width)
            roi_crop_backend.backward(grad_output.contiguous(), rois, grad_input)

        return grad_input, grad_rois, None


roi_crop = RoICropFunction.apply
