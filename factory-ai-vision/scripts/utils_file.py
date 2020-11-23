
#!/usr/bin/env python

import json
import logging
import os
import subprocess

logger = logging.getLogger(__name__)

class FileContext:
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
    def dir(self):
        return os.path.dirname(self.path)

    @property
    def git_root(self):
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


if __name__ == "__main__":
    fc = FileContext(__file__)
    print("git root:", fc.git_root)
    print("path:    ", fc.path)
    print("name:    ",fc.name)
    print("dir:     ", fc.dir)