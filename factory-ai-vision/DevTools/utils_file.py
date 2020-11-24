#!/usr/bin/env python
"""File Utilities
"""

import logging
import os
import subprocess
from logging import config

from logging_config import LOGGING_CONFIG_DEV

logger = logging.getLogger(__name__)


class FileContext:
    """File Context"""

    def __init__(self, file):
        self.path = os.path.realpath(file)

    @property
    def name(self):
        return os.path.basename(self.path)

    def __repr__(self):
        return self.name.__repr__()

    def __str__(self):
        return self.name.__str__()

    @property
    def dir(self) -> str:
        """dir

        Returns:
            str: dir path
        """
        return os.path.dirname(self.path)

    @property
    def git_root(self) -> str:
        """git_root

        Returns:
            str: git root path
        """
        return (
            subprocess.Popen(
                ["git", "rev-parse", "--show-toplevel"],
                stdout=subprocess.PIPE,
                cwd=self.dir,
            )
            .communicate()[0]
            .rstrip()
            .decode("utf-8")
        )

    def show(self):
        """show info"""
        logger.info("Path:    %s", self.path)
        logger.info("Name:    %s", self.name)
        logger.info("Dir:     %s", self.dir)
        logger.info("Git:     %s", self.git_root)


if __name__ == "__main__":
    config.dictConfig(LOGGING_CONFIG_DEV)
    fc = FileContext(__file__)
    fc.show()
