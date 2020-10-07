# Vision On Edge - Web Module

[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)
[![Imports: isort](https://img.shields.io/badge/%20imports-isort-%231674b1?style=flat&labelColor=00000)](https://pycqa.github.io/isort/)

## Quick Start

1. Run Django

   ```bash
   pip install -r requirements/production-x86.txt
   # Arm: pip install -r requirements/production-arm.txt
   python manage.py makemigration
   python manage.py migrate
   python manage.py runserver
   ```

2. Django REST Framework UI
   [http://localhost:8000/api/](http://localhost:8000/api/)
3. Swagger Documents
   [http://localhost:8000/api/swagger](http://localhost:8000/api/swagger)

## Production Setup

1. Run Django

   ```bash
   pip install -r requirements/production-x86.txt
   # Arm: pip install -r requirements/production-arm.txt
   export DBNAME="YOUR_DB_NAME"
   export DBNAME="YOUR_DB_NAME"
   export DBHOST="YOUR_DB_HOST"
   export DBUSER="YOUR_DB_USER"
   export DBPASS="YOUR_DB_PASSWORD"
   python manage.py makemigration
   python manage.py migrate
   python manage.py runserver
   ```

## Developers

1.  Installation

    ```bash
    make install-dev
    ```

2.  Tests

    ```bash
    make test
    ```

3.  Coverage

    To run the tests, check your test coverage, and generate an HTML coverage report::

    ```bash
    make coverage
    ```
