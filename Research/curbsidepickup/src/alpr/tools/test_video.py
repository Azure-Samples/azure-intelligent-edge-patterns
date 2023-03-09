import torch
import _init_paths
import argparse
import os
import numpy as np
import json
import _pickle as pickle
import cv2
import time

from lpdet.apis import det_and_recognize
from lpdet.utils import Config, load_checkpoint, ProgressBar
from lpdet.models import build_detector, build_recognizer

def parse_args():
    parser = argparse.ArgumentParser(description='Test on benchmark')
    parser.add_argument('--name', default='default', type=str, help='result name')
    parser.add_argument('--det_cfg', default='configs/detector.py', type=str, help='detection configuration file')
    parser.add_argument('--det_checkpoint', default='models/detector.pth', type=str, help='detection checkpoint file')
    parser.add_argument('--rec_cfg', default='configs/recognizer.py', type=str, help='recognition configuration file')
    parser.add_argument('--rec_checkpoint', default='models/recognizer.pth', type=str, help='recognition checkpoint file')
    parser.add_argument('--output_dir', default='', type=str, help='Output dir')
    parser.add_argument('--video', default='/dev/video0', type=str, help='Live video path or rtsp stream')
    args = parser.parse_args()
    return args


def visualize_result(img, plates):

    img = img.copy()

    line_pairs = [(0, 1, 2, 3),
                  (2, 3, 4, 5),
                  (4, 5, 6, 7),
                  (6, 7, 0, 1)]

    for plate in plates:
        r = np.round(plate['corners']).astype(int)
        for lp in line_pairs:
            cv2.line(img, (r[lp[0]], r[lp[1]]), (r[lp[2]], r[lp[3]]), (0, 255, 0), thickness=2)
        x1, y1 = np.min(r[0:8:2]), np.min(r[1:8:2])
        cv2.putText(img, plate['string'], (x1, y1-20), cv2.FONT_HERSHEY_COMPLEX, 3, (0, 255, 0), thickness=2)

    return img


if __name__ == '__main__':
    args = parse_args()
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

    det_cfg = Config.fromfile(args.det_cfg)
    rec_cfg = Config.fromfile(args.rec_cfg)
    if args.det_checkpoint == '':
        args.det_checkpoint = os.path.join(det_cfg.work_dir, 'latest.pth')
    if args.rec_checkpoint == '':
        args.rec_checkpoint = os.path.join(rec_cfg.work_dir, 'latest.pth')

    detector = build_detector(det_cfg.model, test_cfg=det_cfg.test_cfg)
    load_checkpoint(detector, args.det_checkpoint)
    detector.eval()
    detector.to(device)

    recognizer = build_recognizer(rec_cfg.model, test_cfg=rec_cfg.test_cfg)
    load_checkpoint(recognizer, args.rec_checkpoint)
    recognizer.eval()
    recognizer.to(device)

    # if os.path.isdir(args.video):
    #     file_list = os.listdir(args.video)
    #     file_list = [file_name for file_name in file_list if file_name[-4:].lower() in ('.mp4', '.avi')]
    #     video_list = [os.path.join(args.video, file_name) for file_name in file_list]
    # else:
    #     video_list = [args.video]

    # print("process {}".format(video_list))

    output_dir = os.path.join(args.output_dir,
                                '{}_live_result'.format(args.name))

    if not os.path.isdir(output_dir):
        os.mkdir(output_dir)

    cap = cv2.VideoCapture(args.video)
    num_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    prog_bar = ProgressBar(num_frames)

    frame_id = 0
    all_plates = []
    while True:
        ret, img = cap.read()
        if img is None:
            break
        start = time.time()
        plates = det_and_recognize(detector, recognizer, img, det_score_thresh=0.25, det_img_scale=(480, 360), device=device)
        end = time.time()
        fps = end - start
        print(' fps {}\n'.format(1/fps))
        if plates:
            # debug
            output_img_path = os.path.join(output_dir, '{:08d}.jpg'.format(frame_id))
            img = visualize_result(img, plates)
            cv2.imwrite(output_img_path, img)
        all_plates.append(plates)
        frame_id += 1
        prog_bar.update()

        with open(os.path.join(output_dir, 'result.pkl'), 'wb') as f:
            pickle.dump(all_plates, f)