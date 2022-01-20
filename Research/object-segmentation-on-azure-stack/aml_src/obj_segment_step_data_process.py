import argparse
import os
import random
import shutil

parser = argparse.ArgumentParser()
parser.add_argument('--data-path', type=str, help='input data path')
parser.add_argument('--train-split', type=str, help='training split data output path')
parser.add_argument('--test-split', type=str, help='test split data output path')
parser.add_argument('--test-size', type=int, help='test split data size')

args = parser.parse_args()
types = ["PNGImages", "PedMasks"]
img_mask_list = [[os.path.join(args.data_path, type, file) for file in sorted(os.listdir(os.path.join(args.data_path, type))) ] for type in types]
print("img_mask_list", img_mask_list)
test_indices = random.sample(range(len(img_mask_list[0])), args.test_size)

test_img_folder, test_mask_folder = [os.path.join(args.test_split, type) for type in types]
train_img_folder, train_mask_folder = [os.path.join(args.train_split, type) for type in types]

os.mkdir(test_img_folder)
os.mkdir(test_mask_folder)
os.mkdir(train_img_folder)
os.mkdir(train_mask_folder)
print("test_img_folder",test_img_folder)
for idx, img_mask in enumerate(zip(*img_mask_list)):
    img, mask = img_mask
    if idx in test_indices:
        print("img path", img)
        print("mask path", mask)
        shutil.copy(img, test_img_folder)
        shutil.copy(mask, test_mask_folder)
    else:
        shutil.copy(img, train_img_folder)
        shutil.copy(mask, train_mask_folder)