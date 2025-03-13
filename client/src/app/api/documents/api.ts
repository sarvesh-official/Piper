import { API_URL } from "../file-upload/api";

export type UploadedDocument = {
  id: string;
  name: string;
  topic: string;
  dateUploaded: string;
  fileUrl: string;
  fileKey: string;
};

export type GeneratedDocument = {
  id: string;
  name: string;
  topic: string;
  dateGenerated: string;
  type: string;
  fileUrl: string;
};

export const getUserUploadedDocuments = async (
  token: string
): Promise<UploadedDocument[]> => {
  try {
    const response = await fetch(`${API_URL}/api/documents/uploaded`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching uploaded documents: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Failed to fetch uploaded documents:", error);
    throw error;
  }
};

export const getUserGeneratedDocuments = async (
  token: string
): Promise<GeneratedDocument[]> => {
  try {
    const response = await fetch(`${API_URL}/api/documents/generated`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching generated documents: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Failed to fetch generated documents:", error);
    throw error;
  }
};

export const downloadDocument = async (
  fileUrl: string,
  fileName: string,
): Promise<void> => {
  try {
    const response = await fetch(fileUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/pdf",
        },
    });

    if (!response.ok) {
      throw new Error(`Failed to download document: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error("Failed to download document:", error);
    throw error;
  }
};
