# Routers package
from app.routers.chat import router as chat_router
from app.routers.auth import router as auth_router
from app.routers.multimodal import router as multimodal_router

__all__ = ["chat_router", "auth_router", "multimodal_router"]
