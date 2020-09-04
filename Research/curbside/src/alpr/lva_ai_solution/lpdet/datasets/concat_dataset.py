import numpy as np
from torch.utils.data.dataset import ConcatDataset as _ConcatDataset


class ConcatDataset(_ConcatDataset):
    """A wrapper of concatenated dataset.

    Same as :obj:`torch.utils.data.dataset.ConcatDataset`, but
    concat the group flag for image aspect ratio.

    Args:
        datasets (list[:obj:`Dataset`]): A list of datasets.
    """

    def __init__(self,
                 dataset_type,
                 dataset_cfgs,
                 dataset_probs=None):

        if dataset_probs is None:
            dataset_probs = [None for _ in dataset_cfgs]

        datasets = []
        for i, cfg in enumerate(dataset_cfgs):
            datasets.append(dataset_type(sample_prob=dataset_probs[i], **cfg))

        super(ConcatDataset, self).__init__(datasets)

        self.classes = datasets[0].classes
        if hasattr(datasets[0], 'country_classes'):
            self.country_classes = datasets[0].country_classes

        if hasattr(datasets[0], 'flag'):
            flags = []
            for i in range(0, len(datasets)):
                flags.append(datasets[i].flag)
            self.flag = np.concatenate(flags)
