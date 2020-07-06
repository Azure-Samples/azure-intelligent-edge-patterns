terraform {
  backend "azurerm" {
  }
  required_version = "~> 0.12.24"
}

provider "azurerm" {
  version                     = "~> 2.9.0"
  skip_provider_registration  = true
  skip_credentials_validation = true
  features {}
}

provider "random" {
  version = "~> 2.2.1"
}

# Random Pet Name (based on Resource Group Name)
resource "random_pet" "name" {
  separator = ""
  length    = 2
  prefix    = ""
  keepers = {
    azurerm_resource_group_location = azurerm_resource_group.deployment.location
    azurerm_resource_group_name     = azurerm_resource_group.deployment.name
  }
}

# Create a Resource Group (in Azure)
resource "azurerm_resource_group" "deployment" {
  name     = var.resource_group
  location = var.location
}

# Azure Container Registry
# https://www.terraform.io/docs/providers/azurerm/r/container_registry.html
resource "azurerm_container_registry" "acr" {
  name                     = lower(random_pet.name.id)
  resource_group_name      = azurerm_resource_group.deployment.name
  location                 = azurerm_resource_group.deployment.location
  sku                      = "Standard"
  admin_enabled            = false
}

# Create a Loganalytics Workspace (for Container Insights)
resource "azurerm_log_analytics_workspace" "deployment" {
  name                = "${lower(random_pet.name.id)}-law"
  location            = azurerm_resource_group.deployment.location
  resource_group_name = azurerm_resource_group.deployment.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

# Create a Traffic Manager Resource
# https://www.terraform.io/docs/providers/azurerm/r/traffic_manager_endpoint.html
resource "azurerm_traffic_manager_profile" "deployment" {
  name                = "${lower(random_pet.name.id)}-tmep"
  resource_group_name = azurerm_resource_group.deployment.name

  traffic_routing_method = "Weighted"

  dns_config {
    relative_name = "${lower(random_pet.name.id)}-tmep"
    ttl           = 100
  }

  monitor_config {
    protocol                     = "http"
    port                         = 80
    path                         = "/"
    interval_in_seconds          = 30
    timeout_in_seconds           = 9
    tolerated_number_of_failures = 3
  }

  tags = {
    environment = "Production"
  }
}
