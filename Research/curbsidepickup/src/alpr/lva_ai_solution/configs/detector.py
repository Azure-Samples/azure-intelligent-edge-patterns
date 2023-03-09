work_dir = './output/detector/0813_rpnrcnn_legalus'
model = dict(
    type='RPNRCNNDetector',
    backbone=dict(
        type='InceptionV2Lite',
        pretrained=None,
        norm_eval=True
    ),
    rpn_head=dict(
        type='RPNHead',
        in_channels=480,
        feat_channels=0,
        anchor_scales=[2.45, 3.46, 4.24, 5.29, 9.00],
        anchor_ratios=[0.5, 0.37, 0.286],
        anchor_strides=[8],
        target_means=[.0, .0, .0, .0],
        target_stds=[1.0, 1.0, 1.0, 1.0],
        use_sigmoid_cls=True
    ),
    roi_extractor=dict(
        type='ROICrop',
        output_size=(48, 180),
        keep_ar=True,
        extend_ratio=0.2,
    ),
    corner_head=dict(
        type='SimpleFCHead',
        input_size=(48, 180),  # should match the output size of roi_extractor
        target_means=0.0,
        target_stds=0.1,
    )
)
img_norm_cfg = dict(
    mean=[102.9801, 115.9465, 122.7717],
    std=[1.0, 1.0, 1.0],
    to_rgb=False
)
data = dict(
    imgs_per_gpu=2,
    workers_per_gpu=4,
    train=dict(
        dataset_name='us_detection_0813',
        max_img_scale=(1920, 1080),
        data_root_dir='data',
        img_scale=(480, 360),
        img_norm_cfg=img_norm_cfg,
        size_divisor=8,
        use_zip=True,
        test_mode=False,
        transforms=[
            dict(type='PhotoMetricDistortion', prob=0.25),
            dict(type='Noisy', prob=0.10),
            dict(type='BlurDistortion', prob=0.3),
        ]
    ),
    test=dict(
        dataset_name='us_test0701',
        data_root_dir='data',
        img_scale=(480, 360),
        img_norm_cfg=img_norm_cfg,
        size_divisor=8,
        use_zip=False,
        test_mode=True,
    )
)
train_cfg = dict(
    rpn=dict(
        assigner=dict(
            type='MaxIoUAssigner',
            pos_iou_thr=0.7,
            neg_iou_thr=0.3,
            min_pos_iou=0.3,
            ignore_iof_thr=-1
        ),
        sampler=dict(
            type='RandomSampler',
            num=64,
            pos_fraction=0.25,
            neg_pos_ub=-1,
            add_gt_as_proposals=False
        ),
        allowed_border=0,
        pos_weight=-1,
        smoothl1_beta=1 / 9.0,
    ),
    proposal=dict(
        nms_across_levels=False,
        nms_pre=300,
        nms_post=100,
        max_num=100,
        nms_thr=0.8,
        min_bbox_size=0
    ),
    rcnn=dict(
        assigner=dict(
            type='MaxIoUAssigner',
            pos_iou_thr=0.5,
            neg_iou_thr=0.5,
            min_pos_iou=0.5,
            ignore_iof_thr=-1),
        sampler=dict(
            type='RandomSampler',
            num=64,
            pos_fraction=0.25,
            neg_pos_ub=-1,
            add_gt_as_proposals=True),
        pos_weight=1.0,
    ),
)
test_cfg = dict(
    proposal=dict(
        nms_across_levels=False,
        nms_pre=300,
        nms_post=10,
        max_num=100,
        nms_thr=0.7,
        min_bbox_size=8
    ),
    rcnn=dict(
        score_thr=0.0, nms=dict(type='nms', iou_thr=0.3)
    )
)
# optimizer
optimizer = dict(type='Adam', lr=0.001, weight_decay=0.0001)
optimizer_config = dict(grad_clip=dict(max_norm=35, norm_type=2))
# learning policy
lr_config = dict(
    policy='step',
    warmup='linear',
    warmup_iters=100,
    warmup_ratio=1.0 / 3,
    step=[50, 70]
)
checkpoint_config = dict(interval=1)
log_config = dict(
    interval=50,
    hooks=[
        dict(type='TextLoggerHook'),
    ]
)
total_epochs = 80
log_level = 'INFO'
load_from = None
resume_from = None
workflow = [('train', 1)]
