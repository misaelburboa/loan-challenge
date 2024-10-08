# Live site
You can check the live site in the next link.

https://d3si8pmai2ptrt.cloudfront.net/login

we can use Route53 to include a domain but we will incur in more costs

## Users to test

### Deactivated User
- user: inactive-user@yopmail.com
- password: Test.123

### Active User

This user is set up with 20 credits, you can perform the operations you want, but once the credits are not enough, you'll see an error saying so.

- user: active-user@yopmail.com
- password: Test.123

## Operation/Cost

| Operation                      | Value |
|--------------------------------|-------|
| Addition                       | 1     |
| Subtraction                    | 1     |
| Multiplication                 | 3     |
| Square Root                    | 4     |
| Random Strings Generation      | 5     |


## Important Note

This is challange project. It uses serverless technologies and due to that is not possible (at least in an easy way) to test it in local. You can for sure test the frontend, but in order to test the backend you need to deploy the lambdas and you would be required to configure your aws account and all the process that involves.

As I mentioned before, you can test the frontend locally though.

Also please consider the pagination and filtering issues are expected due to the nature of the DynamoDB database, this could be achieved using an RDS, but I would like to explain why I used this kind of DB instead, and, if you want, I can make the same mounting an RDS, I just did not want to incur in further costs for this challenge, but if you want me to do it, I will be happy to explain how I can achieve that in a call.

## Getting Started
These are some commands to test the NextJs installation

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Tech Stack
This Project is using:

- AWS CDK with Typescript to deploy the infrastructure.
- React with NextJS 14 with app router and Typescript.
- Tailwind for style classes.

The Backend is made using these AWS Serverless technologies

- AWS DynamoDB as database.
- AWS API Gateway as the api handler (You can manage the stages and versioning there).
- AWS Lambda for the business logic.
- AWS CloudFront as CDN.
- AWS Lambda@Edge to support requests params modification.
- AWS S3 as files hosting.
- AWS Cognito & AWS Amplify to handle the user sessions.

As you can see I tried to leverage the AWS services as much as I could.
