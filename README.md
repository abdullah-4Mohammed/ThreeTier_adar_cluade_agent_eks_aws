# ThreeTier_adar_cluade_agent_eks_aws

Three-tier application (frontend, backend, MongoDB) deployed to Amazon EKS with Terraform,
driven end to end by Azure DevOps pipelines.

## Components
- **Frontend:** static page on NGINX. Calls `/api` on the same host.
- **Backend:** Node.js (Express) API on port 3001.
  - `/api`: hello message.
  - `/api/visits`: writes to MongoDB and returns the visit count.
  - `/api/health`: health and DB status.
- **MongoDB:** runs in the cluster. Its credentials come from a Kubernetes secret.

## Structure
```
src/                 app code + Dockerfiles
deploy/terraform/    VPC, IAM and EKS (local modules)
deploy/K8s/          one manifest per resource
deploy/ingress/      NGINX ingress: /api -> backend, / -> frontend
deploy/secret/       cert-manager ClusterIssuer (kept ready, disabled)
cicd/                infra-pipeline, shared-pipeline, templates, variables
```

## No secrets in git
The account ID and DB password are **not** in this repo. They live in the Azure DevOps
variable group `threetier-secrets`:

| Variable       | Secret |
|----------------|--------|
| `awsAccountId` | no     |
| `dbPassword`   | yes    |

The pipeline fills the `__token__` placeholders in Terraform and the K8s manifests, and it
creates `mongodb-secret` in the cluster from `dbPassword`.

## Prerequisites (Azure DevOps)
- AWS service connection named `AzToAWS`.
- Extensions installed in the organisation:
  - AWS Toolkit
  - Replace Tokens
  - Terraform (JasonBJohnson)
- The variable group `threetier-secrets` described above.

## Method
1. Run `cicd/shared-pipeline.yaml` once. It creates the tfstate bucket and the ECR repository.
2. Every push to `main` runs `cicd/infra-pipeline.yaml`, which goes through these stages in order:
   1. Terraform infrastructure
   2. Build and push images
   3. Deploy the app
   4. NGINX ingress
3. Open the app on the load balancer DNS name:
   ```
   kubectl get svc -n ingress-nginx ingress-nginx-controller
   ```

## Run locally
```
cd src && DB_PASSWORD=<any> docker compose up
```

## Cost note
EKS control plane, two t3.medium nodes, a NAT gateway and the load balancer all bill hourly.
Destroy the stack when you're not using it.
