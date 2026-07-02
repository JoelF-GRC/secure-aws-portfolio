# Infrastructure

These are the actual deployed configuration and source code for this project's AWS backend, exported directly from the live account — not IaC templates. The site was originally built through the AWS console; a full Terraform rebuild is tracked as future work in `project-plan.md`.

- `lambda/visitor-counter/lambda_function.py` — the deployed source for the `crc-visitor-counter` Lambda function (atomic DynamoDB counter increment).
- `iam/lambda-visitor-counter-execution-policy.json` — the Lambda execution role's policies: an inline policy scoped to exactly `dynamodb:UpdateItem`/`dynamodb:GetItem` on the single counter table, plus the standard AWS-managed `AWSLambdaBasicExecutionRole` for CloudWatch Logs. (An overly broad `AmazonDynamoDBFullAccess` managed policy was previously attached to this role from initial development and has since been removed — this file reflects the corrected, least-privilege state.)
- `cloudfront/response-headers-policy.json` — the CloudFront response headers policy actually applied to the site (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy). Note `style-src` includes `'unsafe-inline'` (required for the current Google Fonts integration) — `script-src` does not, and has no inline or eval exceptions.

AWS account IDs and role ARNs have been redacted from these files (`<AWS_ACCOUNT_ID>` placeholder). The API Gateway domain referenced in the CSP is not sensitive — it's already visible in `resume-site/assets/js/main.js` and called directly from the browser.

## Note: least-privilege fix uncovered a masked typo

When `AmazonDynamoDBFullAccess` was removed from the Lambda execution role (see above), the visitor counter started failing with a 500 error. The cause was a pre-existing typo in the inline policy's Resource ARN — two account-ID digits were transposed, so the scoped policy never actually matched the real table. `AmazonDynamoDBFullAccess` had been silently masking this the whole time. The typo was corrected directly in IAM (confirmed via CloudWatch Logs and a live re-test of the counter), and the fix is reflected in `iam/lambda-visitor-counter-execution-policy.json` above. Worth remembering: removing an overly broad grant can expose bugs that were hiding underneath it — verify the narrower policy actually works before considering the change done.
