#!/usr/bin/env python

import json
import logging
import logging.config
import os

from os import listdir

from semantic_version import Version
from utils_file import FileContext

logger = logging.getLogger(__name__)


def is_module_dir(path):
    """check if a path is module dir
    """
    if not os.path.isdir(path):
        return False
    if path.lower().find("module") < 0:
        return False
    module_json = path + "/module.json"
    if not os.path.isfile(module_json):
        return False
    return True


class Module:
    """A wrapper for a module dir
    """
    def __init__(self, path):
        if not is_module_dir(path):
            raise ValueError("%s is not a module" % path)
        self.path = path

    @property
    def name(self):
        return self.path.split("/")[-1]

    def __str__(self):
        return self.name.__str__()

    def __repr__(self):
        return self.name.__repr__()

    @property
    def module_path(self):
        return self.path + "/module.json"

    @property
    def module(self):
        with open(self.module_path) as json_file:
            return json.load(json_file)

    @property
    def version(self):
        return Version(self.module["image"]["tag"]["version"])

    @version.setter
    def version(self, version):
        module = self.module
        module["image"]["tag"]["version"] = str(version)
        with open(self.module_path, "w") as outfile:
            json.dump(module, outfile, indent=2)

    def next_patch(self):
        self.version = self.version.next_patch()

    def next_minor(self):
        self.version = self.version.next_minor()

    def next_major(self):
        self.version = self.version.next_major()


def get_modules(path):
    """get_modules"""
    module_candidates = listdir(path)
    rs = []
    for module_path in module_candidates:
        modules_path = path + "/" + module_path
        if is_module_dir(modules_path):
            rs.append(Module(modules_path))
    return rs


if __name__ == "__main__":
    fc = FileContext(__file__)
    module = Module(
        path=fc.git_root + "/factory-ai-vision/EdgeSolution/modules/WebModule"
    )
    print("WebModule Version:", module.version)
    print(
        "All modules found:",
        get_modules(fc.git_root + "/factory-ai-vision/EdgeSolution/modules/"),
    )
