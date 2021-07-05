from .bbox_head import BBoxHead


class BBoxHeadUnshare(BBoxHead):

    def forward(self, feat_cls, feat_bbox):
        num = feat_cls.size(0)
        feat_cls = feat_cls.view(num, -1)
        feat_bbox = feat_bbox.view(num, -1)
        cls_score = self.fc_cls(feat_cls) if self.with_cls else None
        bbox_pred = self.fc_reg(feat_bbox) if self.with_reg else None
        return cls_score, bbox_pred
