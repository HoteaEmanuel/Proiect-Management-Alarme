
import axios from "axios";

const cloud_name="dtyszphgc"
const uploadFile = async (file) => {

  console.log("FILE SENT TO UPLOAD");
  console.log(file);
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "Public_Images"); // din dashboard
  formData.append("folder", "chatbot-files");

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`,
    formData,
  );

  return {
    url: response.data.secure_url,
    public_id: response.data.public_id,
    filename: file.name,
    bytes: response.data.bytes,
    format: response.data.format,
    resource_type: response.data.resource_type,
  };
};

export default uploadFile;


