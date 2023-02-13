terraform {
  required_version = "1.3.7"
  backend "s3" {
    bucket         = "terraform-state-storage-863362256468"
    dynamodb_table = "terraform-state-lock-863362256468"
    key            = "imcgill-fav-color/dev/setup.tfstate"
    region         = "us-west-2"
  }
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.53"
    }
  }
}

locals {
  env       = "dev"
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

module "setup" {
  source = "../../modules/setup"
  env    = local.env
}
