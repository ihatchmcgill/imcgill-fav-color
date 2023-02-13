terraform {
  required_version = "1.3.7"
  backend "s3" {
    bucket         = "terraform-state-storage-863362256468"
    dynamodb_table = "terraform-state-lock-863362256468"
    key            = "imcgill-fav-color/cpy/app.tfstate"
    region         = "us-west-2"
  }
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.53"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.0"
    }
  }
}

locals {
  env       = "cpy"
  repo_name = "imcgill-fav-color"
  org_name  = "byu-oit-training"
}

provider "aws" {
  region = "us-west-2"

  default_tags {
    tags = {
      repo                   = "https://github.com/${local.org_name}/${local.repo_name}"
      data-sensitivity       = "public"
      env                    = local.env
      resource-creator-email = "GitHub-Actions"
    }
  }
}

variable "image_tag" {
  type = string
}

module "app" {
  source                           = "../../modules/app"
  env                              = local.env
  image_tag                        = var.image_tag
  codedeploy_termination_wait_time = 15
  deploy_test_postman_collection   = "../../../.postman/imcgill-fav-color.postman_collection.json"
  deploy_test_postman_environment  = "../../../.postman/cpy-tst.postman_environment.json"
  log_retention_days               = 7
}

output "url" {
  value = module.app.url
}

output "codedeploy_app_name" {
  value = module.app.codedeploy_app_name
}

output "codedeploy_deployment_group_name" {
  value = module.app.codedeploy_deployment_group_name
}

output "codedeploy_appspec_json_file" {
  value = module.app.codedeploy_appspec_json_file
}
