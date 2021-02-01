import numpy as np
from torchvision.models.detection.faster_rcnn import FastRCNNPredictor
from torchvision.models.detection.mask_rcnn import MaskRCNNPredictor
from torchvision.models.detection.mask_rcnn import MaskRCNN
from torchvision.models.detection.backbone_utils import resnet_fpn_backbone

class Net(MaskRCNN):
    def __init__(self):
        backbone = resnet_fpn_backbone('resnet50', False)
        super(Net, self).__init__(backbone, num_classes=91)
        self.num_classes = 2

        # get the number of input features for the classifier
        in_features = self.roi_heads.box_predictor.cls_score.in_features
        # replace the pre-trained head with a new one
        self.roi_heads.box_predictor = FastRCNNPredictor(in_features, self.num_classes)

        in_features_mask = self.roi_heads.mask_predictor.conv5_mask.in_channels
        hidden_layer = 256
        self.roi_heads.mask_predictor = MaskRCNNPredictor(in_features_mask,
                                                     hidden_layer,
                                                     self.num_classes)

    def __call__(self, inputs):
        predictions = super(Net, self).__call__(inputs)
        preds_numpy = np.array([{
            "masks": prediction['masks'][0, 0].mul(255).byte().cpu().numpy().tolist(),
            "boxes": prediction['boxes'].numpy().tolist(),
            "labels": prediction['labels'].numpy().tolist(),
            "scores": prediction['scores'].numpy().tolist(),

        } for prediction in predictions])

        return preds_numpy


