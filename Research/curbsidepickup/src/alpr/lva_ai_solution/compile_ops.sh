#!/usr/bin/env bash

PYTHON=${PYTHON:-"python3"}

echo "Building roi align op..."
cd lpdet/ops/roi_align
if [ -d "build" ]; then
    rm -r build
fi
$PYTHON setup.py build_ext --inplace

echo "Building roi crop op..."
cd ../roi_crop
if [ -d "build" ]; then
    rm -r build
fi
$PYTHON setup.py build_ext --inplace


echo "Building roi pool op..."
cd ../roi_pool
if [ -d "build" ]; then
    rm -r build
fi
$PYTHON setup.py build_ext --inplace

echo "Building nms op..."
cd ../nms
if [ -d "build" ]; then
    rm -r build
fi
$PYTHON setup.py build_ext --inplace

echo "Building dcn..."
cd ../dcn
if [ -d "build" ]; then
    rm -r build
fi
$PYTHON setup.py build_ext --inplace

echo "Building sigmoid focal loss op..."
cd ../sigmoid_focal_loss
if [ -d "build" ]; then
    rm -r build
fi
$PYTHON setup.py build_ext --inplace

echo "Build polyiou op..."
cd ../polyiou
if [ -d "build" ]; then
    rm -r build
fi
swig -c++ -python polyiou.i
$PYTHON setup.py build_ext --inplace
