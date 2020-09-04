# runtime settings
work_dir = './output/recognizer/0813_faster_rcnn_legalus'
log_level = 'INFO'
load_from = None
resume_from = None
workflow = [('train', 1)]
model = dict(
    type='FasterRCNN',
    backbone=dict(
        type='InceptionV2Lite',
        pretrained=None,
        norm_eval=True
    ),
    neck=None,
    shared_head=dict(
        type='FCLayer',
        in_channels=23520,
        hidden_channels=256,
        num_layers=2,
    ),
    rpn_head=dict(
        type='RPNHead',
        in_channels=480,
        feat_channels=480,
        anchor_scales=[2.0, ],
        anchor_ratios=[2.0, ],
        anchor_strides=[8, ],
        anchor_base_sizes=[16, ],
        target_means=[.0, .0, .0, .0],
        target_stds=[1.0, 1.0, 1.0, 1.0],
        use_sigmoid_cls=True
    ),
    character_head=dict(
        type='CharacterHead',
        mean=5.5,
        std=1,
        in_channels=480,
        convs=[48, ],
        pooling=dict(type='AdaptiveMaxPool2d', output_size=(3, 6)),
        linears=[256, 64, 256, 1],
    ),
    country_head=dict(
        type='CountryHead',
        in_channels=480,
        convs=[48, ],
        pooling=dict(type='AdaptiveMaxPool2d', output_size=(3, 6)),
        linears=[256, 56],
    ),
    bbox_roi_extractor=dict(
        type='SingleRoIExtractor',
        roi_layer=dict(type='RoIAlign', out_size=7, sample_num=2),
        out_channels=480,
        featmap_strides=[8, ]
    ),
    bbox_head=dict(
        type='BBoxHead',
        with_avg_pool=False,
        roi_feat_size=1,
        in_channels=256+56,
        num_classes=38,
        target_means=[0., 0., 0., 0.],
        target_stds=[0.1, 0.1, 0.2, 0.2],
        reg_class_agnostic=False)
)
# model training and testing settings
train_cfg = dict(
    rpn=dict(
        assigner=dict(
            type='MaxIoUAssigner',
            pos_iou_thr=0.8,
            neg_iou_thr=0.5,
            min_pos_iou=0.5,
            ignore_iof_thr=0.5),
        sampler=dict(
            type='RandomSampler',
            num=64,
            pos_fraction=0.25,
            neg_pos_ub=-1,
            add_gt_as_proposals=False),
        allowed_border=-1,
        pos_weight=-1,
        smoothl1_beta=1 / 9.0,
        debug=False),
    proposal=dict(
        nms_across_levels=False,
        nms_pre=500,
        nms_post=100,
        max_num=100,
        nms_thr=0.7,
        min_bbox_size=0
    ),
    rcnn=dict(
        assigner=dict(
            type='MaxIoUAssigner',
            pos_iou_thr=0.8,
            neg_iou_thr=0.5,
            min_pos_iou=0.5,
            ignore_iof_thr=0.5),
        sampler=dict(
            type='RandomSampler',
            num=64,
            pos_fraction=0.25,
            neg_pos_ub=-1,
            add_gt_as_proposals=True),
        pos_weight=-1,
        debug=False)
)
test_cfg = dict(
    proposal=dict(
        nms_across_levels=False,
        nms_pre=300,
        nms_post=15,
        max_num=15,
        nms_thr=0.8,
        min_bbox_size=0),
    rcnn=dict(
        score_thr=0.00,
        nms=dict(type='soft_nms', method='gaussian', iou_thr=0.5, sigma=0.05, min_score=0.34),
        max_per_img=25
    )
)
img_norm_cfg = dict(
    mean=[102.9801, 115.9465, 122.7717],
    std=[1.0, 1.0, 1.0],
    to_rgb=False
)
data = dict(
    imgs_per_gpu=8,
    workers_per_gpu=4,
    train=dict(
        dataset_name='us_recognition_0813',
        data_root_dir='data',
        img_scale=(720, 72),
        img_norm_cfg=img_norm_cfg,
        size_divisor=8,
        use_zip=True,
        test_mode=False,
        transforms=[
            dict(type='ShuffleBBoxes', prob=0.25),
            dict(type='MotionBlur', prob=0.05),
            dict(type='AspectRatioChange', prob=0.10),
            dict(type='BlurDistortion', prob=0.15),
            dict(type='Affine', prob=0.3),
            dict(type='Noisy', prob=0.10),
            dict(type='PhotoMetricDistortion', prob=0.15),
            dict(type='Sharpen', prob=0.05),
            dict(type='Invert', prob=0.15),
            dict(type='Erosion', prob=0.05),
            dict(type='Shadow', prob=0.05),
        ]
    ),
    test=dict(
        dataset_name='us_recognition_test_0701',
        data_root_dir='data',
        img_scale=(720, 72),
        img_norm_cfg=img_norm_cfg,
        size_divisor=8,
        use_zip=True,
        test_mode=True,
    )
)
total_epochs = 160
# optimizer
optimizer = dict(type='Adam', lr=0.0005)
optimizer_config = dict()
# learning policy
lr_config = dict(
    policy='step',
    warmup=None,
    warmup_iters=-1,
    warmup_ratio=1.0 / 3,
    step=[100, 140])
checkpoint_config = dict(interval=5)
log_config = dict(
    interval=100,
    hooks=[
        dict(type='TextLoggerHook'),
    ])
