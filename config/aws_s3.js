import {
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY_ID,
  },
});
if (!s3Client) console.log("AWS Connection failed");

const Bucket = process.env.BUCKET_NAME;

console.log("AWS Connection Successfull");

export const createPutSignUrl = async (fileFullName, filetype) => {
  try {
    const putObjCommand = new PutObjectCommand({
      Bucket,
      Key: fileFullName,
      ContentType: filetype,
    });

    const url = await getSignedUrl(s3Client, putObjCommand, {
      expiresIn: 60 * 5,
      signableHeaders: new Set(["Content-Type"]),
    });
    return url;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const createGetSignUrl = async (
  fileFullName,
  download,
  originalName
) => {
  try {
    const contentDisposition = `${
      download ? "attachment" : "inline"
    };filename=${encodeURIComponent(originalName)}`;

    const getObjCommand = new GetObjectCommand({
      Bucket,
      Key: fileFullName,
      ResponseContentDisposition: contentDisposition,
    });

    const url = await getSignedUrl(s3Client, getObjCommand, {
      expiresIn: 60 * 5,
    });
    return url;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const verifyS3Object = async (fileFullName) => {
  try {
    const headObjCommand = new HeadObjectCommand({
      Bucket,
      Key: fileFullName,
    });

    const s3Response = await s3Client.send(headObjCommand);
    return s3Response.ContentLength;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export async function deleteMultipleObjects(keys) {
  const command = new DeleteObjectsCommand({
    Bucket,
    Delete: {
      Objects: keys.map((k) => ({ Key: k })),
      Quiet: false,
    },
  });

  try {
    const { Deleted, Errors } = await s3Client.send(command);
    // console.log({Deleted,Errors})
    return { Deleted, Errors };
  } catch (err) {
    console.error("Batch delete failed:", err);
  }
}
