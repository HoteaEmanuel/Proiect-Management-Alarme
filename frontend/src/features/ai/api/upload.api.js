import { api } from "@lib/axios";

const VITE_URL_APP = import.meta.env.VITE_API_URL;
export const uploadFiles = async (files) => {
  try {
    const formData = new FormData();
    console.log("FILES TO UPLOAD");
    console.log(files);
    files.forEach((file) => formData.append("files", file));
    const response = await api.post(
      `${VITE_URL_APP}/api/upload-files`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data", // pentru fisiere
        },
      },
    );

    return response.data;
  } catch (error) {
    throw new Error(error);
  }
};
