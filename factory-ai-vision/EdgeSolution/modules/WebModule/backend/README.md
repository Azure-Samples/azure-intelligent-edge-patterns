# Vision On Edge Web Module

## How to run

### Migrate

```bash
python manage.py makemigration
python manage.py migrate
```

### Configure

```bash
vim config.py
vim configs/app_insight.py
```

### Run server

```bash
python manage.py runserver
```

Go to [Web UI](http://localhost:8000)

## Pylint

```bash
pylint
```

## How to test

Go to project directory (same level with manage.py)

```bash
export ENDPOINT=${your_endpoint}
export TRAINING_KEY=${your_key}
pytest
```

## Test coverage

To run the tests, check your test coverage, and generate an HTML coverage report::

```bash
$ coverage run -m pytest
$ coverage html
$ open htmlcov/index.html
```

