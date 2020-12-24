PACKAGE := webmodule
MODULE := $(PACKAGE)
PYTHON := $$(which python3)
PIP := $(PYTHON) -m pip

.PHONY: help
help: ## Show help message
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z0-9_-]+:.*?## / {gsub("\\\\n",sprintf("\n%22c",""), $$2);printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: pack-arm
pack-arm: ## Pack ARM template manifest
	@echo "Packing ARM manifest."
	@bash DevTools/pack-arm-manifest.sh
	@echo "Packing ARM manifest, complete! Please commit manually"

.PHONY: push-image-x86
push-image-x86: ## Push all x64 docker images
	@echo "Push all x86 images."
	@bash DevTools/push_docker_images.py --platform=x86
	@echo "Pushed all x86 images, complete!"

.PHONY: push-image-arm64
push-image-arm64:  ## Push all arm64v8 docker images
	@echo "Push all arm64v8 images."
	@bash DevTools/push_docker_images.py --platform=arm64
	@echo "Pushed all arm64v8 images, complete!"

.PHONY: push-image-all
push-image-all: ## Push all docker images (both x64 and arm64v8)
	@echo "Push all images."
	@make push-image-arm64
	@make push-image-x86
	@echo "Pushed all images, complete!"

.PHONY: update-patch
update-patch: ## Update patch version
	@echo "Update version for each modules..."
	@$(PYTHON) DevTools/update_version.py patch
	@make pack-arm
	@echo "Update version for each modules, complete! Please build and update images and commit manually"

.PHONY: update-minor
update-minor: ## Update minor version
	@echo "Update version for each modules..."
	@$(PYTHON) DevTools/update_version.py minor
	@make pack-arm
	@echo "Update version for each modules, complete! Please build and update images and commit manually"

.PHONY: update-major
update-major: ## Update major version
	@echo "Update version for each modules..."
	@$(PYTHON) DevTools/update_version.py major
	@make pack-arm
	@echo "Update version for each modules, complete! Please build and update images and commit manually"

.PHONY: set-version
set-version: ## Set version (make set-version version=x.x.x")
	@echo "Update version for each modules..."
	@$(PYTHON) DevTools/update_version.py set --version=$(version)
	@make pack-arm
	@echo "Update version for each modules, complete! Please build and update images and commit manually"

