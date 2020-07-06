variable "location" {
  type        = string
  description = "Azure (Stack) Region"
  default     = "local"
}

variable "resource_group" {
  type        = string
  description = "Azure (Stack) Resource Group"
  default     = "default-resource-group"
}