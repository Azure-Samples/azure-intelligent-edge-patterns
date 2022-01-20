#/bin/bash
yapf -ri .
isort -rc .
yapf -ri .
