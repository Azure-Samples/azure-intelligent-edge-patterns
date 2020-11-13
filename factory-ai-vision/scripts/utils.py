#!/usr/bin/env python

import json
import logging
import logging.config
import os
import subprocess
from os import listdir

logger = logging.getLogger(__name__)


def get_script_name(file):
    return os.path.basename(file)


def get_script_abs_path(file):
    return os.path.realpath(file)


def get_script_abs_dir(file):
    return os.path.dirname(get_script_abs_path(file))


def get_git_root(abs_path):
    return (
        subprocess.Popen(
            ["git", "rev-parse", "--show-toplevel"],
            stdout=subprocess.PIPE,
            cwd=get_script_abs_dir(abs_path),
        )
        .communicate()[0]
        .rstrip()
        .decode("utf-8")
    )


def isModuleDir(abs_path):
    if not os.path.isdir(abs_path):
        logger.info("%s is not dir", abs_path)
        return False
    if abs_path.lower().find("module") < 0:
        logger.info("%s name does not contain module", abs_path)
        return False
    module_json = abs_path + "/module.json"
    if not os.path.isfile(module_json):
        logger.info("%s path does not have module.json", abs_path)
        return False
    return True


def get_modules(modules_base_path, with_abs_path: bool = False):
    module_candidates = listdir(modules_base_path)
    rs = []
    for module_path in module_candidates:
        modules_abs_path = modules_base_path + "/" + module_path
        if isModuleDir(modules_abs_path):
            if with_abs_path:
                rs.append(modules_abs_path)
            else:
                rs.append(module_path)
    return rs


def load_module_json(abs_path):
    data = {}
    with open(abs_path) as json_file:
        data = json.load(json_file)
    return data


def get_module_version(module_data):
    return module_data["image"]["tag"]["version"]


def update_module_version(module_data, version_str: str):
    module_data["image"]["tag"]["version"] = version_str


def to_semantic_versions(version_str):
    versions = version_str.split(".")
    return [int(version) for version in versions]


def update_patch_version(version_str):
    semantic_version = to_semantic_versions(version_str)
    semantic_version[2] += 1
    version_str = ".".join([str(v) for v in semantic_version])
    return version_str


def update_minor_version(version_str):
    semantic_version = to_semantic_versions(version_str)
    semantic_version[1] += 1
    semantic_version[2] = 0
    version_str = ".".join([str(v) for v in semantic_version])
    return version_str


def update_module_patch_version(abs_path):
    module_data = load_module_json(abs_path)
    old_version_str = get_module_version(module_data)
    new_version_str = update_patch_version(old_version_str)
    update_module_version(module_data, new_version_str)
    logger.info("%s => %s", old_version_str, new_version_str)
    with open(abs_path, "w") as outfile:
        json.dump(module_data, outfile, indent=2)


def update_module_minor_version(abs_path):
    module_data = load_module_json(abs_path)
    old_version_str = get_module_version(module_data)
    new_version_str = update_minor_version(old_version_str)
    update_module_version(module_data, new_version_str)
    logger.info("%s => %s", old_version_str, new_version_str)
    with open(abs_path, "w") as outfile:
        json.dump(module_data, outfile, indent=2)
