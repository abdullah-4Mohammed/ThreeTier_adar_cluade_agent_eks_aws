terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "~> 5.42.0" #"4.22.0"
    }
  }
  # Terraform does not allow variables/locals inside the backend block,
  # so it is left empty here. bucket, key and region are passed at init time
  # by the pipeline (TerraformCLI@2 backendAwsBucket / backendAwsKey / backendAwsRegion).
  backend "s3" {}
}

provider "aws" {
  region = var.region
}


