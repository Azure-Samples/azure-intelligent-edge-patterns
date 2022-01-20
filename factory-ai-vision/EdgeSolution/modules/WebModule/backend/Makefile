PACKAGE := webmodule
MODULE := $(PACKAGE)
PYTHON := $$(which python3)
PIP := $(PYTHON) -m pip

.PHONY: help
help: ## show help message
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z0-9_-]+:.*?## / {gsub("\\\\n",sprintf("\n%22c",""), $$2);printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: install
install: requirements/production-x86.txt ## install dependencies
	@$(PIP) install -r $<

.PHONY: install-dev
install-dev: requirements/local.txt ## install dev dependencies
	@echo "Installing dependencies dependencies..."
	@$(PIP) install -r $<
	@echo "Installing develop dependencies, done."
	@echo "Installing pre-commit hook..."
	@pre-commit install
	@echo "Installing pre-commit hook, done."

.PHONY: run
run:
	@$(PYTHON) manage.py migrate
	@$(PYTHON) manage.py runserver

.PHONY: run-shell
run-shell:
	@$(PYTHON) manage.py migrate
	@$(PYTHON) manage.py shell

.PHONY: test
test: ## unit test
	@echo "Testing..."
	@pytest
	@echo "Testing passed\n"

.PHONY: graph
graph: ## unit test
	@echo "Making graph..."
	@echo "You may need to install graphviz"
	@$(PYTHON) manage.py graph_models -a -o myapp_models.png
	@echo "Graph: myapp_models.png"

.PHONY: coverage-html
coverage-html: ## Dev
	@echo "Running coverage..."
	@pytest --cov=vision_on_edge --cov-report=html
	@echo "Coverage run complete\n"

.PHONY: coverage-xml
coverage-xml: ## Pipeline publish result
	@echo "Running coverage..."
	@pytest --cov=vision_on_edge --junitxml=junit/test-results.xml
	@echo "Coverage run complete\n"
