# Services package
from app.services.sparkie_prompt import get_sparkie_system_prompt, get_greeting
from app.services.minimax import MiniMaxService, get_minimax_service
from app.services.modelscope_image import (
    ModelScopeImageService,
    get_modelscope_service,
    init_modelscope_service,
    close_modelscope_service
)

__all__ = [
    "get_sparkie_system_prompt",
    "get_greeting",
    "MiniMaxService",
    "get_minimax_service",
    "ModelScopeImageService",
    "get_modelscope_service",
    "init_modelscope_service",
    "close_modelscope_service",
]
