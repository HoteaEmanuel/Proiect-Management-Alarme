from fastapi import status

class BaseAppException(Exception):
    #base class for all app exceptions
    def __init__(self, message: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR, error_code: str = "INTERNAL_ERROR"):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        super().__init__(self.message)

class EntityNotFoundError(BaseAppException):
    def __init__(self, entity: str, entity_id: str | int):
        super().__init__(
            message=f"{entity} with id {entity_id} was not found.",
            status_code=status.HTTP_404_NOT_FOUND,
            error_code="NOT_FOUND"
        )

class UnauthorizedError(BaseAppException):
    def __init__(self, message: str = "Authentification failed or invalid token"):
        super().__init__(message=message, status_code=status.HTTP_401_UNAUTHORIZED, error_code="UNAUTHORIZED")

class ExternalServiceError(BaseAppException):
    def __init__(self, service_name: str, details: str = "Service unavailable"):
        super().__init__(
            message=f"Error occured when calling the {service_name} service.",
            status_code=status.HTTP_502_BAD_GATEWAY,
            error_code=f"{service_name.upper()}_ERROR"
        )

class DuplicateResourceError(BaseAppException):
    def __init__(self, message: str = "Resource already exists."):
        super().__init__(
            message=message,
            status_code=status.HTTP_409_CONFLICT,
            error_code="DUPLICATE_RESOURCE"
        )

class FileProcessingError(BaseAppException):
    def __init__(self, message: str = "The file is invalid or corrupted"):
        super().__init__(message, status.HTTP_400_BAD_REQUEST, "FILE_PROCESSING_ERROR")

class EmptyContentError(BaseAppException):
    def __init__(self, message: str = "The file contains no extractable text."):
        super().__init__(message, status.HTTP_400_BAD_REQUEST, "EMPTY_CONTENT_ERROR")

class InvalidFilenameError(BaseAppException):
    def __init__(self, message: str = "The provided filename is missing an extension."):
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="INVALID_FILENAME"
        )

class UnsupportedFileFormatError(BaseAppException):
    def __init__(self, extension: str):
        super().__init__(
            message=f"File format '{extension}' is not supported. Accepted formats: .csv, .xlsx, .xls, .pdf, .docx.",
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, # 415 este ideal aici
            error_code="UNSUPPORTED_FILE_FORMAT"
        )

class DatabaseOperationError(BaseAppException):
    def __init__(self, message: str = "An error occured while saving data to the database."):
        super().__init__(message, status.HTTP_409_CONFLICT, "DATABASE_CONFLICT")

class LLMQueryExecutionError(BaseAppException):
    def __init__(self, message: str = "The AI-generated query could not be executed."):
        super().__init__(
            message=message, 
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, 
            error_code="LLM_QUERY_ERROR"
        )