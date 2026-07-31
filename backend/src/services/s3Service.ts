import { put, del, head } from "@vercel/blob";

export const uploadFileToS3 = async (userId: string, file: Express.Multer.File) => {
  const fileKey = `uploads/${userId}/${Date.now()}_${file.originalname}`;

  const blob = await put(fileKey, file.buffer, {
    access: "public",
    contentType: file.mimetype,
    addRandomSuffix: false,
  });

  return {
    fileUrl: blob.url,
    fileKey,
  };
};

export const deleteFilesFromS3 = async (fileKeys: string[]): Promise<void> => {
  try {
    const deletePromises = fileKeys.map(async (fileKey) => {
      // Vercel Blob requires the full URL to delete
      // Construct URL from the key — stored fileKey is the pathname
      return del(fileKey);
    });

    await Promise.all(deletePromises);
    console.log(`Successfully deleted ${fileKeys.length} files from Vercel Blob`);
  } catch (error) {
    console.error("Error deleting files from Vercel Blob:", error);
    throw error;
  }
};

export const uploadToS3 = async (
  fileBuffer: Buffer,
  fileKey: string,
  contentType: string
): Promise<{ url: string; pathname: string } | null> => {
  try {
    const blob = await put(fileKey, fileBuffer, {
      access: "public",
      contentType,
      addRandomSuffix: false,
    });

    return { url: blob.url, pathname: blob.pathname };
  } catch (error) {
    console.error("Error uploading to Vercel Blob:", error);
    return null;
  }
};

export const getFileFromS3 = async (fileKey: string): Promise<{ body: Buffer } | null> => {
  try {
    const blobMetadata = await head(fileKey);
    if (!blobMetadata) return null;

    const response = await fetch(fileKey);
    if (!response.ok) return null;

    const body = Buffer.from(await response.arrayBuffer());
    return { body };
  } catch (error) {
    console.error("Error getting file from Vercel Blob:", error);
    return null;
  }
};

export const deleteFileFromS3 = async (fileKey: string): Promise<boolean> => {
  try {
    await del(fileKey);
    return true;
  } catch (error) {
    console.error("Error deleting file from Vercel Blob:", error);
    return false;
  }
};
