#!/usr/bin/env python
"""Main
"""
import argparse
import logging
import os
import subprocess

from logging_config import LOGGING_CONFIG_DEV
from utils_file import FileContext
from utils_iotedge import get_modules

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process some integers.")
    parser.add_argument(
        "--build",
        default="amd64",
        const="all",
        nargs="?",
        choices=["amd", "arm64", "all"],
        help="Build amd, arm64, or both (default: %(default)s)",
    )
    args = parser.parse_args()
    print(args.build)

    logging.config.dictConfig(LOGGING_CONFIG_DEV)
    logger = logging.getLogger(__file__)

    fc = FileContext(__file__)
    SOLUTION_PATH = fc.git_root + "/factory-ai-vision/EdgeSolution"
    # modules_abs_path = get_modulesAbsPath(modules_path)
    # fc.show()
    modules = get_modules(SOLUTION_PATH + "/modules")
    # logger.info("Solution path:         %s", SOLUTION_PATH)
    # logger.info("Modules:               %s", modules)
    my_env = os.environ.copy()
    my_env["DOCKER_BUILDKIT"] = "1"
    subprocess.run(
        ["iotedgedev", "push", "-f", "deployment.build.amd.template.json"],
        cwd=SOLUTION_PATH,
        env=my_env,
    )
