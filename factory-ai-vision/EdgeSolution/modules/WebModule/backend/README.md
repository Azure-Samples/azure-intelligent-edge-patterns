# Camera App

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
python manage.py test
```

## Test coverage

```bash
coverage run --source='vision_on_edge' manage.py test vision_on_edge.tests
```
