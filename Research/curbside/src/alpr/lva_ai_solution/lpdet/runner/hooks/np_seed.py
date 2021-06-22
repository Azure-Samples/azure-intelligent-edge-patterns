import numpy as np

from .hook import Hook


# https://github.com/pytorch/pytorch/issues/5059
class NumpySeedHook(Hook):

    def before_epoch(self, runner):
        nwk = runner.data_loader.num_workers
        if nwk <= 0:
            return
        source_state = np.random.get_state()[1][0] + runner.epoch * nwk
        runner.data_loader.worker_init_fn = lambda x: np.random.seed(source_state + x)
