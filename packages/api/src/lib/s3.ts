import { S3 } from "aws-sdk";

export const s3 = new S3({
  apiVersion: "2006-03-01",
  accessKeyId: process.env.AMAZON_ACCESS_KEY_ID,
  secretAccessKey: process.env.AMAZON_SECRET_ACCESS_KEY,
  region: process.env.AMAZON_REGION,
  signatureVersion: "v4",
});

interface UploadFileParams {
  name: string;
  file: S3.Body;
  type: string;
}

export function uploadFile(par: UploadFileParams) {
  const params = {
    Bucket: process.env.AMAZON_BUCKET,
    Key: par.name,
    Body: par.file,
    ContentType: par.type,
  };

  return s3.putObject(params as any).promise();
}

interface DeleteFileParams {
  name: string;
}

export async function deleteFile(par: DeleteFileParams) {
  const params = {
    Bucket: process.env.AMAZON_BUCKET,
    Key: par.name,
  };

  try {
    await s3.headObject(params as any).promise();
    try {
      await s3.deleteObject(params as any).promise();
    } catch (err) {
      JSON.stringify(err);
    }
  } catch (err) {
    JSON.stringify(err);
  }
}
