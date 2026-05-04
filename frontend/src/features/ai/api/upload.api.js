import { api } from "@lib/axios";

const VITE_URL_APP = import.meta.env.VITE_API_URL;
export const uploadToCloudinary = async ({ file }) => {
  try {
    console.log("FILE SENT");
    console.log(file);
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(
      `${VITE_URL_APP}/api/upload/cloudinary`,
      formData,
    );
    return response;
  } catch (error) {
    throw new Error(error);
  }
};
