# AWS Account Setup

This page describes how to setup an AWS account and perform the initial deployment of a new instance of the app.

## Contents

[IAM](#IAM)

[Amplify](#Amplify)

[Cognito](#Cognito)

[Lambda](#Lambda)

## IAM

Within the Identity & Access Management (IAM) section of the AWS Management Console, create a programmatic-access user named `crisis-deploy` within a group named `zappa` that contains the following inline policy.

```
{
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "iam:AttachRolePolicy",
        "iam:GetRole",
        "iam:CreateRole",
        "iam:PassRole",
        "iam:PutRolePolicy"
      ],
      "Resource": [
        "arn:aws:iam::*:role/*-ZappaLambdaExecutionRole"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "apigateway:DELETE",
        "apigateway:GET",
        "apigateway:PATCH",
        "apigateway:POST",
        "apigateway:PUT",
        "events:DeleteRule",
        "events:DescribeRule",
        "events:ListRules",
        "events:ListRuleNamesByTarget",
        "events:ListTargetsByRule",
        "events:PutRule",
        "events:PutTargets",
        "events:RemoveTargets",
        "lambda:AddPermission",
        "lambda:CreateFunction",
        "lambda:DeleteFunction",
        "lambda:DeleteFunctionConcurrency",
        "lambda:GetAlias",
        "lambda:GetFunction",
        "lambda:GetFunctionConfiguration",
        "lambda:GetFunctionConcurrency",
        "lambda:GetPolicy",
        "lambda:InvokeFunction",
        "lambda:ListVersionsByFunction",
        "lambda:RemovePermission",
        "lambda:UpdateFunctionCode",
        "lambda:UpdateFunctionConfiguration",
        "lambda:PutFunctionConcurrency",
        "cloudformation:CreateStack",
        "cloudformation:DeleteStack",
        "cloudformation:DescribeStackResource",
        "cloudformation:DescribeStacks",
        "cloudformation:ListStackResources",
        "cloudformation:UpdateStack",
        "cloudfront:UpdateDistribution",
        "logs:DeleteLogGroup",
        "logs:DescribeLogStreams",
        "logs:FilterLogEvents",
        "route53:ListHostedZones"
      ],
      "Resource": [
        "*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:ListBucket",
        "s3:ListBucketMultipartUploads"
      ],
      "Resource": [
        "arn:aws:s3:::zappa-*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:DeleteObject",
        "s3:GetObject",
        "s3:PutObject",
        "s3:AbortMultipartUpload",
        "s3:ListMultipartUploadParts"
      ],
      "Resource": [
        "arn:aws:s3:::zappa-*/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:*"
      ],
      "Resource": [
        "arn:aws:s3:::crisis-cat",
        "arn:aws:s3:::crisis-cat/*"
      ]
    }
  ]
}
```

Add the user's access key and key ID as a new section in `~/.aws/credentials` as follows. These credentials are used by Zappa to deploy the server code to AWS Lambda.

```
[crisis-deploy]
aws_access_key_id=...
aws_secret_access_key=...
```

## Amplify

AWS Amplify is used to deploy the frontend code.

1. Install the AWS Amplify CLI using `sudo npm install -g @aws-amplify/cli`.
1. Run `amplify configure` and follow the steps to create an IAM user for use by the CLI. Specify a profile name of `amplify` rather than accepting the default.
1. Within a clone of this respository, run `amplify init` and follow the prompts, being sure to set the build and start commands to use Yarn.
1. Run `amplify add auth` to create an AWS Cognito user pool to contain the app users. Request default configuration and username sign-in.
1. Run `amplify add hosting` to setup hosting of the frontend code. Request Amplify Console hosting and Git-based deployment. In the browser window that opens, select the repository of this app and the desired branch, then select a backend environment from the list (eg `dev`) and create a new servce role, accepting all the default properties.
1. Finally, run `amplify push`.

> Note: In Amplify's terminology our app has both a frontend (the React app) and a backend. However, this 'backend' is not our Python code running in AWS Lambda, but rather any other AWS services used by the frontend. In our case the 'backend' consists solely of the Cognito user pool created above.

After ensuring that `amplify/team-provider-info.json` is still present in `.gitignore` (the above steps may have removed it) commit and push all changes to the repository - to the branched linked to the Amplify frontend above.

## Cognito

Within the Cognito User Pools section of the AWS Management Console, open the user pool created by the Amplify CLI and change the 'User sign-ups allowed' propery to 'Only allow administrators to create users'. Then create at least one user (eg named 'dev').

## Lambda

Zappa is used to deploy our Python server code into AWS Lambda. Run `zappa deploy dev` to deploy the development instance.
