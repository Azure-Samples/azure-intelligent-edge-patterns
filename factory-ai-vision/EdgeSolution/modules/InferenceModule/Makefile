PACKAGE := webmodule
MODULE := $(PACKAGE)
PYTHON := $$(which python3)
PIP := $(PYTHON) -m pip

.PHONY: help
help: ## show help message
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z0-9_-]+:.*?## / {gsub("\\\\n",sprintf("\n%22c",""), $$2);printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: install
install: requirements/base.txt ## install dependencies
	@$(PIP) install -r $<

.PHONY: install-dev
install-dev: requirements/local.txt ## install dev dependencies
	@echo "Installing dependencies dependencies..."
	@$(PIP) install -r $<
	@echo "Installing develop dependencies, done."
	@echo "======================================"
	@echo "Installing pre-commit hook..."
	@pre-commit install
	@echo "Installing pre-commit hook, done."

.PHONY: run
run: server.py
	@$(PYTHON) $<

.PHONY: test
test: ## unit test
	@echo "Testing..."
	@pytest
	@echo "Testing passed\n"

.PHONY: coverage
coverage: ## integration test
	@echo "Running coverage..."
	@coverage run -m pytest
	@coverage html
	@echo "Coverage run complete\n"
