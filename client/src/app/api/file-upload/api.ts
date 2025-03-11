export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type UploadResponse = {
  chatId: string;
  uploaded: {
    fileName: string;
    fileUrl: string;
    fileKey: string;
  }[];
  extractedTexts: string[];
};

export const uploadFilesToBackend = async (
  files: File[],
  userId: string,
  token: string,
  onProgress: (fileName: string, percentage: number) => void
): Promise<UploadResponse> => {
  if (!files.length || files.length > 3) {
    throw new Error("You can upload 1 to 3 files only.");
  }

  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  formData.append("userId", userId);

  return new Promise<UploadResponse>((resolve, reject) => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_URL}/api/upload/upload-files`);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          files.forEach((file) => onProgress(file.name, percentage));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          try {
            const response: UploadResponse = JSON.parse(xhr.response);
            resolve(response);
          } catch (error) {
            reject(new Error("Invalid JSON response from server"));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(formData);
    } catch (error) {
      reject(error);
    }
  });
};
