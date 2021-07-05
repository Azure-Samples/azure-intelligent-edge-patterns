""" This script is used to convert .pkl file to final results for each video. """
import argparse
import pickle
import numpy as np
from collections import OrderedDict


def parse_args():
    parser = argparse.ArgumentParser(description='Test on benchmark')
    parser.add_argument('--result', default='', type=str, help='result path (*.pkl)')
    args = parser.parse_args()
    return args


def load_result(result_path):
    """ Loading per-frame detection results """
    with open(result_path, 'rb') as f:
        results = pickle.load(f)
    plate_strs = []
    boxes = []
    for frame_id, plates in enumerate(results):
        if len(plates) == 0:
            continue
        for plate in plates:
            c = plate['corners']
            s = plate['string']
            c = [float(frame_id)] + list(map(float, c))
            boxes.append(c)
            plate_strs.append(s)
    return np.array(boxes), plate_strs


def to_rect(corners):
    """ Convert 4 corners (8 values) into a rectangular bounding box (4 values)"""
    x1 = corners[:, 0:8:2].min(axis=1)
    y1 = corners[:, 1:8:2].min(axis=1)
    x2 = corners[:, 0:8:2].max(axis=1)
    y2 = corners[:, 1:8:2].max(axis=1)
    xc = (x1 + x2) / 2
    yc = (y1 + y2) / 2
    w = x2 - x1
    h = y2 - y1
    return np.hstack((xc[:, np.newaxis], yc[:, np.newaxis], w[:, np.newaxis], h[:, np.newaxis]))


def edit_distance(str_a, str_b):
    """ Edit distance between two string. """
    la, lb = len(str_a), len(str_b)
    dis_table = np.zeros((la+1, lb+1))
    dis_table[0, :] = np.arange(lb+1)
    dis_table[:, 0] = np.arange(la+1)
    for i in range(1, la+1):
        for j in range(1, lb+1):
            if str_a[i-1] == str_b[j-1]:
                dis_table[i, j] = dis_table[i-1, j-1]
            else:
                dis_table[i, j] = 1 + min(dis_table[i-1, j-1], dis_table[i, j-1], dis_table[i-1, j])
    return dis_table[la, lb]


def process(file_path, frame_index_th=10, spatial_std=3.0, edit_score_list=(1.0, 0.8, 0.6, 0.3, 0.1)):
    """ Core post processing function.

    Since we apply plate detection over every frame, it is necessary to merge per-frame results.
    We simply adopt greedy search algorithms. A merge-score is calculated to determinate whether two
    plates should be merged or not. This value is related to the edit distance, spatial distance
    and temporal distance.

    """
    boxes, plate_strs = load_result(file_path)
    rects = to_rect(boxes[:, 1:9])
    x = rects[:, 0].reshape(1, -1)
    y = rects[:, 1].reshape(1, -1)
    w = rects[:, 2].reshape(1, -1)
    h = rects[:, 3].reshape(1, -1)
    mean_size = ((w + w.T) + (h + h.T)) / 2
    dist_x = (x - x.T) / mean_size
    dist_y = (y - y.T) / mean_size
    spatial_dist = dist_x * dist_x + dist_y * dist_y

    n_dets = len(boxes)
    groups = []
    for i in range(n_dets):
        frame_id = boxes[i, 0]
        if plate_strs[i] == '':
            continue
        if len(groups) == 0:
            groups.append([i])
        else:
            merge_score = -np.ones((len(groups),), dtype=np.float32)
            for group_id, g in enumerate(groups):
                frame_deltas = np.abs(frame_id - boxes[g, 0])
                if np.all(frame_deltas > frame_index_th):
                    continue
                for k, ref_idx in enumerate(g):
                    frame_delta = frame_deltas[k]
                    if frame_delta == 0:
                        continue
                    if frame_delta > frame_index_th:
                        continue
                    spatial_d = spatial_dist[i, ref_idx]
                    char_d = int(edit_distance(plate_strs[i], plate_strs[ref_idx]))

                    spatial_score = np.exp(-spatial_d / (np.sqrt(frame_delta) * spatial_std))
                    if char_d >= len(edit_score_list):
                        char_score = 0.0
                    else:
                        char_score = edit_score_list[char_d]

                    merge_score[group_id] = spatial_score + char_score

            if np.max(merge_score) > 0.5:
                groups[np.argmax(merge_score)].append(i)
            else:
                groups.append([i])
    print("All {} groups".format(len(groups)))
    return groups, boxes, plate_strs


def vote(plate_strs, scores):
    """ For each group, we use majority vote to decide the final plate string. """
    vote_scores = {}
    for i in range(len(plate_strs)):
        if plate_strs[i] not in vote_scores:
            vote_scores[plate_strs[i]] = 0.0
        vote_scores[plate_strs[i]] += scores[i]
    max_score = -1.0
    max_plate_str = ''
    for k, v in vote_scores.items():
        if v > max_score:
            max_plate_str = k
            max_score = v
    return max_plate_str


def filter_plates(plates, frame_ids, boxes):
    """ The plates with low confidence (0.8) will be removed. """
    finals = []
    for k, v in plates.items():
        max_score_v = boxes[v[0], -1]
        max_score_idx = v[0]
        for i in v:
            if plate_strs[i] == k and boxes[i, -1] > max_score_v:
                max_score_v = boxes[i, -1]
                max_score_idx = i
        if max_score_v > 0.90:
            pass
        elif max_score_v > 0.80 and len(v) > 6:
            pass
        else:
            continue
        finals.append(dict(
            plate=k,
            frame_id=int(frame_ids[max_score_idx]),
            score=max_score_v,
            box=boxes[max_score_idx, 1:9],
            id_set=[int(frame_ids[i]) for i in v]
        ))
    return finals


if __name__ == '__main__':
    frame_th = 6
    spatial_std = 4.0
    char_std = 0.4
    prob_th = 0.35

    args = parse_args()

    groups, boxes, plate_strs = process(args.result)
    frame_ids = boxes[:, 0]
    plates = OrderedDict()
    for group in groups:
        k = vote([plate_strs[i] for i in group], boxes[group, -1])
        plates[k] = group
        plates[k].sort()
    finals = filter_plates(plates, frame_ids, boxes)
    frame_ids = [f['frame_id'] for f in finals]
    finals = [finals[i] for i in np.argsort(frame_ids)]
    #  save final results to output file
    output_path = args.result.replace('.pkl', '_post_process.csv')
    fid = open(output_path, 'w')
    for r in finals:
        fid.write('{},'.format(r['plate']))
        fid.write('{},{}\n'.format(r['frame_id'], r['score']))
    fid.close()
