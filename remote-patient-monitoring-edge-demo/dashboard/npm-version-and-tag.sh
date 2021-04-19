#!/usr/bin/env sh

# Copyright (c) Microsoft Corporation.
# Licensed under the MIT license.

# Fail on any error
set -e

# Bump version in package(-lock).json
# The string '[version bump]' is critical here
# If you change it here, also change it in .gitlab-ci.yml
npm version patch -m "%s [version bump]"

# Add and push
git add -u
git push
git push --tags