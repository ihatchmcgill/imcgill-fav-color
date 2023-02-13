variable "env" {
  type = string
}

locals {
  name     = "imcgill-fav-color"
  org_name = "byu-oit-training"
}

module "acs" {
  source = "github.com/byu-oit/terraform-aws-acs-info?ref=v4.0.0"
}

module "my_ecr" {
  source = "github.com/byu-oit/terraform-aws-ecr?ref=v2.0.1"
  name   = "${local.name}-${var.env}"
}

module "gha_role" {
  source                         = "terraform-aws-modules/iam/aws//modules/iam-assumable-role-with-oidc"
  version                        = "5.11.1"
  create_role                    = true
  role_name                      = "${local.name}-${var.env}-gha"
  provider_url                   = module.acs.github_oidc_provider.url
  role_permissions_boundary_arn  = module.acs.role_permissions_boundary.arn
  role_policy_arns               = module.acs.power_builder_policies[*].arn
  oidc_fully_qualified_audiences = ["sts.amazonaws.com"]
  oidc_subjects_with_wildcards   = ["repo:${local.org_name}/${local.name}:*"]
}
