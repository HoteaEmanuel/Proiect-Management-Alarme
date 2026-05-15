from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import logging

from .exceptions import BaseAppException

logger = logging.getLogger(__name__)

def setup_exception_handlers(app: FastAPI):
    #Handler for custom excepions
    @app.exception_handler(BaseAppException)
    async def app_exception_handler(request: Request, exception: BaseAppException):
        if exception.status_code >= 500:
            logger.error(f"Server error: {exception.message} on route {request.url}")
        
        return JSONResponse(
            status_code=exception.status_code,
            content={
                "error": {
                    "code": exception.error_code,
                    "message": exception.message
                }
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exception: Exception):
        logger.critical(f"Critical error: {exception}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "error": {
                    "code": "SYSTEM_ERROR",
                    "message": "Unexpected Server Error"
                } 
            },
        )
