# Vision On Edge - Inference Module

[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)

[![Imports: isort](https://img.shields.io/badge/%20imports-isort-%231674b1?style=flat&labelColor=00000)](https://pycqa.github.io/isort/)

## Quick Start

1. Install requirements

   ```bash
   pip install -r requirements

   # Or using Makefile
   make install
   ```

2. Run Server

   ```bash
   python server.py

   # Or using Makefile
   make run
   ```

3. Swagger Documents

   [http://localhost:5000/docs](http://localhost:5000/docs)

## Developers

1. Install requirements

   ```bash
   make install-dev
   ```

2. Tests

   ```bash
   make test
   ```

3. Coverage

   To run the tests, check your test coverage, and generate an HTML coverage report::

   ```bash
   make coverage
   ```
