#!/usr/bin/env python
import logging

from logging_config import LOGGING_CONFIG_DEV
from utils import (get_git_root, get_modules, get_script_abs_dir,
                   get_script_abs_path, get_script_name,
                   update_module_minor_version)

if __name__ == "__main__":
    logging.config.dictConfig(LOGGING_CONFIG_DEV)
    logger = logging.getLogger(__file__)

    script_abs_path = get_script_abs_path(__file__)
    script_name = get_script_name(__file__)
    script_dir = get_script_abs_dir(__file__)
    git_root = get_git_root(__file__)
    solution_path = git_root + "/factory-ai-vision/EdgeSolution"
    modules_base_path = solution_path + "/modules"
    modules = get_modules(modules_base_path)
    modules_abs_path = get_modules(modules_base_path, with_abs_path=True)
    # modules_abs_path = get_modulesAbsPath(modules_path)
    logger.info("This script's path:    %s", script_abs_path)
    logger.info("this script's name:    %s", script_name)
    logger.info("this script's dir:     %s", script_dir)
    logger.info("Git root:              %s", git_root)
    logger.info("Solution path:         %s", solution_path)
    logger.info("Modules base path:     %s", modules_base_path)
    logger.info("Modules:               %s", modules)

    for module in modules:
        while True:
            yn = input(f"Update {module} ?[y/n]") or "y"
            if yn.lower() in ["y", "yes"]:
                module_json = f"{modules_base_path}/{module}/module.json"
                update_module_patch_version(abs_path=module_json)
                break
            if yn.lower() in ["n", "no"]:
                break
            logger.error("Input Y or N")
    # logger.info("Modules Abs Path:      %s", modules_abs_path)
