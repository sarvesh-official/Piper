import AWS from "aws-sdk";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  region: process.env.AWS_REGION!,
});

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
  }
});

const bucketName = process.env.S3_BUCKET_NAME|| "";

export const uploadFileToS3 = async (userId: string, file: Express.Multer.File) => {
  const fileKey = `uploads/${userId}/${Date.now()}_${file.originalname}`;

  const params = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  await s3.upload(params).promise();

  return {
    fileUrl: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`,
    fileKey,
  };
};

export const deleteFilesFromS3 = async (fileKeys: string[]): Promise<void> => {
  try {
    const deletePromises = fileKeys.map(async (fileKey) => {
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: fileKey
      });
      
      return s3Client.send(command);
    });
    
    await Promise.all(deletePromises);
    console.log(`Successfully deleted ${fileKeys.length} files from S3`);
  } catch (error) {
    console.error("Error deleting files from S3:", error);
    throw error;
  }
};

export const uploadToS3 = async (
  fileBuffer: Buffer, 
  fileKey: string, 
  contentType: string
): Promise<AWS.S3.ManagedUpload.SendData | null> => {
  if (!bucketName) {
    console.error('AWS bucket name is not defined');
    return null;
  }

  try {
    const params: AWS.S3.PutObjectRequest = {
      Bucket: bucketName,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: contentType,
    };

    return await s3.upload(params).promise();
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return null;
  }
};

export const getFileFromS3 = async (fileKey: string): Promise<AWS.S3.GetObjectOutput | null> => {
  if (!bucketName) {
    console.error('AWS bucket name is not defined');
    return null;
  }

  try {
    const params: AWS.S3.GetObjectRequest = {
      Bucket: bucketName,
      Key: fileKey
    };

    return await s3.getObject(params).promise();
  } catch (error) {
    console.error('Error getting file from S3:', error);
    return null;
  }
};

export const deleteFileFromS3 = async (fileKey: string): Promise<boolean> => {
  if (!bucketName) {
    console.error('AWS bucket name is not defined');
    return false;
  }

  try {
    const params: AWS.S3.DeleteObjectRequest = {
      Bucket: bucketName,
      Key: fileKey
    };

    await s3.deleteObject(params).promise();
    return true;
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    return false;
  }
};
