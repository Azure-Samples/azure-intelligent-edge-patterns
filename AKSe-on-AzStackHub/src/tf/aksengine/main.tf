terraform {
  required_providers {
    azurerm = "~> 2.0"
  }

  backend "azurerm" {

  }
  
  required_version = "~> 0.12.24"
}

# Configure the Azure Stack Provider
# https://www.terraform.io/docs/providers/azurestack/index.html
provider "azurestack" {
  # NOTE: we recommend pinning the version of the Provider which should be used in the Provider block
  # https://github.com/terraform-providers/terraform-provider-azurestack/releases
  version = "~>0.9.0" 

  # Connection Details (can be provided via variables)
  #arm_endpoint    = "" # https://management.local.azurestack.external (for ASDK)
  #client_id       = "" # via ENV
  #client_secret   = "" # via ENV
  #subscription_id = "" # via ENV
  #tenant_id       = "" # via ENV
}

# Create a resource group
resource "azurestack_resource_group" "aksengine" {
  name     = var.resource_group
  location = var.location
}

# Random Pet Name (based on Resource Group Name)
resource "random_pet" "name" {
  separator = ""
  length    = 2
  prefix    = ""
  keepers = {
    azurerm_resource_group_location = azurestack_resource_group.aksengine.location
    azurerm_resource_group_name     = azurestack_resource_group.aksengine.name
  }
}

# Create a virtual network within the resource group
resource "azurestack_virtual_network" "aksengine" {
  name                = "aksengine-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = azurestack_resource_group.aksengine.location
  resource_group_name = azurestack_resource_group.aksengine.name
}

# Create a Subnet
resource "azurestack_subnet" "default" {
  name                 = "default"
  resource_group_name  = azurestack_resource_group.aksengine.name
  virtual_network_name = azurestack_virtual_network.aksengine.name
  address_prefix       = "10.0.1.0/24"
}

# Create a Public IP Address
resource "azurestack_public_ip" "aksengine" {
  name                         = "aksengine-pip"
  location                     = azurestack_resource_group.aksengine.location
  resource_group_name          = azurestack_resource_group.aksengine.name
  public_ip_address_allocation = "static"
  domain_name_label            = random_pet.name.id
}

# Create a Network Interface Card (NIC) for the VM
# https://www.terraform.io/docs/providers/azurestack/r/network_interface.html
resource "azurestack_network_interface" "aksengine" {
  name                = "aksengine-nic1"
  location            = azurestack_resource_group.aksengine.location
  resource_group_name = azurestack_resource_group.aksengine.name

  network_security_group_id = azurestack_network_security_group.inboundssh.id

  ip_configuration {
    name                          = "ipconfiguration1"
    subnet_id                     = azurestack_subnet.default.id
    private_ip_address_allocation = "dynamic"
    public_ip_address_id          = azurestack_public_ip.aksengine.id
  }
}

# Create a Virtual Machine
# https://www.terraform.io/docs/providers/azurestack/r/virtual_machine.html
resource "azurestack_virtual_machine" "aksengine" {
  name                  = "aksengine-vm1"
  location              = azurestack_resource_group.aksengine.location
  resource_group_name   = azurestack_resource_group.aksengine.name
  network_interface_ids = [
      azurestack_network_interface.aksengine.id
      ]
  vm_size               = "Standard_F2"

  delete_os_disk_on_termination = true
  delete_data_disks_on_termination = true

  storage_image_reference {
    publisher = "Canonical"
    offer     = "UbuntuServer"
    sku       = "18.04-LTS"
    version   = "latest"
  }
  storage_os_disk {
    name              = "aksengine-vm1-osdisk"
    caching           = "ReadWrite"
    create_option     = "FromImage"
    managed_disk_type = "Standard_LRS"
  }
  os_profile {
    computer_name  = random_pet.name.id
    admin_username = "azureadmin"
    admin_password = "Password1234!"
  }
  os_profile_linux_config {
    disable_password_authentication = false
  }
}

# Create a Virtual Machine Extension to download AKS Engine components
# https://www.terraform.io/docs/providers/azurestack/r/virtual_machine_extension.html
resource "azurestack_virtual_machine_extension" "aksengine" {
  name                 = "downloadaksengine"
  location             = azurestack_resource_group.aksengine.location
  resource_group_name  = azurestack_resource_group.aksengine.name
  virtual_machine_name = azurestack_virtual_machine.aksengine.name
  publisher            = "Microsoft.Azure.Extensions"
  type                 = "CustomScript"
  type_handler_version = "2.0"

  settings = <<SETTINGS
    {
        "commandToExecute": "curl -o get-akse.sh https://raw.githubusercontent.com/Azure/aks-engine/master/scripts/get-akse.sh && chmod 700 get-akse.sh && ./get-akse.sh --version v0.43.0"
    }
SETTINGS

  depends_on = [
    azurestack_virtual_machine.aksengine
  ]
}

# Create a new Network Security Group (NSG)
# https://www.terraform.io/docs/providers/azurestack/r/network_security_group.html
resource "azurestack_network_security_group" "inboundssh" {
  name                = "aksengine-nsg"
  location            = azurestack_resource_group.aksengine.location
  resource_group_name = azurestack_resource_group.aksengine.name

  security_rule {
    name                       = "AllowInboundSSH"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}