## Important Note

This is challange project. It uses serverless technologies and due to that is not possible (at least in an easy way) to test it in local. You can for sure test the frontend, but in order to test the backend you need to deploy the lambdas and you would be required to configure your aws account and all the process that involves.

As I mention before, you can test the frontend locally, though. These are some commands to test the NextJs installation

## Getting Started

First, run the development server:

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

- DynamoDB as database.
- API Gateway as the api handler (You can manage the stages and versioning there).
- Lambda for the business logic.
- CloudFront as CDN.
- Lambda@Edge to support requests params modification.
- S3 as files hosting.