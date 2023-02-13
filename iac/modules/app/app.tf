variable "env" {
  type = string
}

variable "image_tag" {
  type = string
}

variable "codedeploy_termination_wait_time" {
  type = number
}

variable "deploy_test_postman_collection" {
  type = string
}

variable "deploy_test_postman_environment" {
  type = string
}

variable "log_retention_days" {
  type = number
}

locals {
  repo_name = "imcgill-fav-color"
  org_name  = "byu-oit-training"
}

data "aws_ecr_repository" "my_ecr_repo" {
  name = "${local.repo_name}-${var.env}"
}

module "acs" {
  source = "github.com/byu-oit/terraform-aws-acs-info?ref=v4.0.0"
}

module "my_fargate_api" {
  source                           = "github.com/byu-oit/terraform-aws-fargate-api?ref=v5.0.2"
  app_name                         = "${local.repo_name}-${var.env}"
  container_port                   = 8080
  health_check_path                = "/health"
  codedeploy_test_listener_port    = 4443
  task_policies                    = []
  hosted_zone                      = module.acs.route53_zone
  https_certificate_arn            = module.acs.certificate.arn
  public_subnet_ids                = module.acs.public_subnet_ids
  private_subnet_ids               = module.acs.private_subnet_ids
  vpc_id                           = module.acs.vpc.id
  codedeploy_service_role_arn      = module.acs.power_builder_role.arn
  codedeploy_termination_wait_time = var.codedeploy_termination_wait_time
  role_permissions_boundary_arn    = module.acs.role_permissions_boundary.arn
  log_retention_in_days            = var.log_retention_days

  cpu_architecture = "ARM64"

  primary_container_definition = {
    name                  = "${local.repo_name}-${var.env}"
    image                 = "${data.aws_ecr_repository.my_ecr_repo.repository_url}:${var.image_tag}"
    ports                 = [8080]
    environment_variables = {}
    secrets               = {}
    efs_volume_mounts     = null
    ulimits               = null
  }

  autoscaling_config = {
    min_capacity = 1
    max_capacity = 2
  }

  codedeploy_lifecycle_hooks = {
    BeforeInstall         = null
    AfterInstall          = null
    AfterAllowTestTraffic = module.postman_test_lambda.lambda_function.function_name
    BeforeAllowTraffic    = null
    AfterAllowTraffic     = null
  }
}

// Databases
// If RDS is needed use the https://github.com/byu-oit/terraform-aws-rds/
// If DynamoDB Table is needed use the aws_dynamodb_table resource https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/dynamodb_table
// Then include the task policies and any env variables or secrets into the fargate module

// Smoke Test
module "postman_test_lambda" {
  source   = "github.com/byu-oit/terraform-aws-postman-test-lambda?ref=v5.0.0"
  app_name = "${local.repo_name}-${var.env}"
  postman_collections = [
    {
      collection  = var.deploy_test_postman_collection
      environment = null
    }
  ]
  # set the context here so that we don't need 10+ environment.json files
  test_env_var_overrides = {
    context : "https://${module.my_fargate_api.dns_record.name}:4443"
  }
  role_permissions_boundary_arn = module.acs.role_permissions_boundary.arn
  log_retention_in_days         = var.log_retention_days
}

output "url" {
  value = module.my_fargate_api.dns_record.name
}

output "codedeploy_app_name" {
  value = module.my_fargate_api.codedeploy_deployment_group.app_name
}

output "codedeploy_deployment_group_name" {
  value = module.my_fargate_api.codedeploy_deployment_group.deployment_group_name
}

output "codedeploy_appspec_json_file" {
  value = module.my_fargate_api.codedeploy_appspec_json_file
}
