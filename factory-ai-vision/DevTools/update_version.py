#!/usr/bin/env python
import argparse

from utils_file import FileContext
from utils_iotedge import get_modules

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('type', choices=['patch', 'minor', 'major'], help="Update type")
    args = parser.parse_args()

    fc = FileContext(__file__)
    modules = get_modules(fc.git_root + "/factory-ai-vision/EdgeSolution/modules")
    
    for module in modules:
        if args.update_type == 'patch':
            module.next_patch()
        elif args.update_type == 'minor':
            module.next_minor()
        elif args.update_type == 'major':
            module.next_major()