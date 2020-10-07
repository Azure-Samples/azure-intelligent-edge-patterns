from setuptools import setup
from torch.utils.cpp_extension import BuildExtension, CUDAExtension

setup(
    name='roi_crop_backend',
    ext_modules=[
        CUDAExtension('roi_crop_backend', [
            'src/roi_crop.cpp',
            'src/roi_crop_cpu.cpp',
            'src/roi_crop_cuda.cu',
        ])
    ],
    cmdclass={'build_ext': BuildExtension})
