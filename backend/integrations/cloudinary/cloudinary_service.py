import os
import io
import logging
import cloudinary
import cloudinary.uploader
from cloudinary.exceptions import Error as CloudinaryError
from uuid import uuid4
from dotenv import load_dotenv

from schemas import RawFileAttachment, CloudinaryFileAttachment
from core import FileProcessingError, ExternalServiceError, InvalidInputError

load_dotenv()

logger = logging.getLogger(__name__)

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)


# Generates a secure, signed URL for accessing a specific Cloudinary resource
def get_signed_url(public_id: str, resource_type: str = "raw") -> str:

    if not public_id:
        raise InvalidInputError("Cloudinary public_id cannot be empty.")
    
    try:
        url, _ = cloudinary.utils.cloudinary_url(
            public_id,
            resource_type=resource_type,
            sign_url=True,
            secure=True
        )
        return url
    except Exception as e:
        raise InvalidInputError(f"Failed to generate signed URL: {str(e)}")

# Uploads a file to Cloudinary based on its extension and returns the stored metadata
def upload_file_to_cloudinary(file: RawFileAttachment) -> CloudinaryFileAttachment:

    if not file.content:
        raise FileProcessingError("The uploaded file is empty.")

    extension = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    image_types = {"jpg", "jpeg", "png", "gif", "webp", "bmp", "tiff"}
    resource_type = "image" if extension in image_types else "raw"

    try:
        result = cloudinary.uploader.upload(
            io.BytesIO(file.content),
            resource_type=resource_type,
            public_id=f"chat_files/{uuid4().hex}_{file.filename}",
            use_filename=True,
            unique_filename=True,
        )
    except CloudinaryError as e:
        raise ExternalServiceError(
            service_name="Cloudinary",
            details=f"Upload failed: {str(e)}"
        )
    
    except Exception as e:
        raise ExternalServiceError(
            service_name="Cloudinary",
            details=f"Network error during upload: {str(e)}"
        )

    file_format = result.get("format") or (
        file.filename.rsplit(".", 1)[-1] if "." in file.filename else "unknown"
    )

    return CloudinaryFileAttachment(
        filename=file.filename,
        url=result["secure_url"],
        public_id=result["public_id"],
        resource_type=result["resource_type"],
        file_format=file_format,
        file_size=result["bytes"],
    )

def delete_files_from_cloudinary(files: list[CloudinaryFileAttachment]) -> None:
    
    if not files:
        return
    
    for file in files:
        if not file.public_id:
            continue

        try:
            resource_type = file.resource_type or "image"
            cloudinary.uploader.destroy(file.public_id, resource_type)
            logger.info(f"Successfully deleted from Cloudinary: {file.public_id}")
        
        except Exception as e:
            logger.error(f"Failed to delete Cloudinary file {file.public_id}: {str(e)}")