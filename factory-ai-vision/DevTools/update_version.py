"""Set version helper
"""
#!/usr/bin/env python

import argparse

import semantic_version

from utils_file import FileContext
from utils_iotedge import get_modules


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('type', choices=['patch', 'minor', 'major', 'set'], help="Update type")
    parser.add_argument('--version', type=semantic_version.Version, help="set version")
    args = parser.parse_args()

    fc = FileContext(__file__)
    modules = get_modules(fc.git_root + "/factory-ai-vision/EdgeSolution/modules")

    for module in modules:
        if args.type == 'patch':
            module.next_patch()
        elif args.type == 'minor':
            module.next_minor()
        elif args.type == 'major':
            module.next_major()
        elif args.type == 'set':
            if not args.version:
                parser.error('please provide version number (--version)')
            module.version = args.version
