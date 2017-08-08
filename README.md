# Serverless uploads to a private S3 bucket
This is an example application that allows you to upload files to S3 through a pre-signed URL. The pre-signed URL is retrieved through an API Gateway endpoint invoking a Lambda function. AWS Cognito is used to authenticate and authorize the request for the pre-signed URL. Through this method, you can upload files to an otherwise private S3 bucket.

The full setup is described in the diagram below and explained in my blog post: [Using pre-signed URLs to upload a file to a private S3 bucket](https://sanderknape.com/2017/08/using-pre-signed-urls-upload-file-private-s3-bucket).

![Serverless S3 upload architecture](https://sanderknape.com/wp-content/uploads/2017/07/architecture-s3-cognito-upload.png)
