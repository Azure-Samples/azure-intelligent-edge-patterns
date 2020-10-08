# Vision On Edge - Web Module

[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)

[![Imports: isort](https://img.shields.io/badge/%20imports-isort-%231674b1?style=flat&labelColor=00000)](https://pycqa.github.io/isort/)

## Quick Start

1. Install requirements

   ```bash
   pip install -r requirements/production-x86.txt
   # Arm: pip install -r requirements/production-arm.txt
   ```

2. Run Server

   ```bash
   # start django
   python manage.py makemigration
   python manage.py migrate
   python manage.py runserver
   ```

3. Django REST Framework UI

   [http://localhost:8000/api/](http://localhost:8000/api/)

4. Swagger Documents

   [http://localhost:8000/api/swagger](http://localhost:8000/api/swagger)

## Production Setup

1. Run Django

   ```bash
   pip install -r requirements/production-x86.txt
   # Arm: pip install -r requirements/production-arm.txt

   # If not set, django will use sqlite
   export DJANGO_ENV="PRODUCTION"

   # database info
   export DBNAME="${YOUR_DB_NAME}"
   export DBNAME="${YOUR_DB_NAME}"
   export DBHOST="${YOUR_DB_HOST}"
   export DBUSER="${YOUR_DB_USER}"
   export DBPASS="${YOUR_DB_PASSWORD}"

   # start django
   python manage.py makemigration
   python manage.py migrate
   python manage.py runserver
   ```

## Developers

1. Installation

   ```bash
   make install-dev
   ```

2. Run tests

   ```bash
   make test
   ```

3. Run coverage (local)

   To run the tests, check your test coverage, and generate an HTML coverage report:

   ```bash
   # Generate html
   make coverage-html
   # Open with browser
   open htmlcov/index.html
   ```

4. Run coverage (publish in pipelines)

   To run the tests, and publish coverage using junit xml:

   ```bash
   # Generate junit_family: xunit2 xml
   make coverage-xml
   ```
