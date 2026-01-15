"""
Multimodal API endpoints for Sparkie.
Includes image generation, video stubs, and TTS stubs.
"""
import re
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from typing import Optional

from app.models.schemas import ErrorResponse
from app.services.modelscope_image import get_modelscope_service, ModelScopeImageService
from app.middleware.auth import get_current_user, User
from loguru import logger


router = APIRouter(prefix="/generate", tags=["Multimodal"])


# Request/Response Schemas
class ImageGenerateRequest(BaseModel):
    """Request schema for image generation."""
    prompt: str = Field(
        ..., 
        min_length=1, 
        max_length=1000,
        description="Text description of the image to generate"
    )
    size: str = Field(
        default="1024x1024",
        description="Image size (e.g., '512x512', '768x768', '1024x1024', '1024x768', '768x1024')"
    )
    steps: int = Field(
        default=9,
        ge=1,
        le=50,
        description="Number of inference steps (9 recommended for Turbo model)"
    )


class ImageGenerateResponse(BaseModel):
    """Response schema for image generation."""
    success: bool
    url: Optional[str] = None
    data_url: Optional[str] = None
    message: str
    metadata: Optional[dict] = None
    error: Optional[str] = None


# Image generation patterns for auto-detection in chat
IMAGE_PATTERNS = [
    r"generate\s+(an?\s+)?image\s+(of\s+|with\s+)?",
    r"draw\s+(me\s+)?",
    r"show\s+(me\s+)?",
    r"create\s+(an?\s+)?(image|picture|photo)",
    r"visualize\s+",
    r"what\s+does\s+(sparkie|queen bee)\s+(look|look\s+like)",
    r"show\s+(me\s+)?(sparkie|queen bee)",
    r"draw\s+(sparkie|queen bee)",
]


def detect_image_request(text: str) -> Optional[str]:
    """
    Detect if text contains an image generation request.
    
    Args:
        text: User input text
        
    Returns:
        Extracted prompt if image request detected, None otherwise
    """
    text_lower = text.lower().strip()
    
    # Check if any pattern matches
    for pattern in IMAGE_PATTERNS:
        if re.search(pattern, text_lower):
            # Extract potential prompt
            # Remove the pattern prefix and clean up
            prompt = re.sub(pattern, "", text_lower, flags=re.IGNORECASE).strip()
            
            # Clean up common artifacts
            prompt = re.sub(r"^(of|with|the|a|an)\s+", "", prompt)
            prompt = prompt.strip(".,!?;:")
            
            # If prompt is empty after extraction, use original text
            if not prompt or len(prompt) < 3:
                prompt = text
            
            # Add bee context if not already present
            bee_keywords = ["bee", "queen", "sparkie", "hive", "honey", "polleneer"]
            if not any(kw in prompt.lower() for kw in bee_keywords):
                prompt = f"{prompt}, queen bee style with golden honey glow"
            
            return prompt
    
    return None


@router.post(
    "/image",
    response_model=ImageGenerateResponse,
    responses={
        400: {"model": ErrorResponse},
        401: {"model": ErrorResponse},
        429: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    },
    summary="Generate Image",
    description="Generate an image from text prompt using ModelScope Z-Image-Turbo (free!)"
)
async def generate_image(
    request: ImageGenerateRequest,
    current_user: User = Depends(get_current_user),
    modelscope_service: ModelScopeImageService = Depends(get_modelscope_service)
):
    """
    Generate an image from a text prompt.
    
    Uses ModelScope's free Z-Image-Turbo model for text-to-image generation.
    
    The generated image will be enhanced with Sparkie/Queen Bee theme elements
    unless the prompt already contains such references.
    
    - **prompt**: Text description of the image (required)
    - **size**: Image dimensions (default: 1024x1024)
    - **steps**: Inference steps (default: 9, recommended for Turbo)
    """
    try:
        logger.info(f"Image generation request from user {current_user.username}: {request.prompt[:100]}...")
        
        # Validate size
        valid_sizes = ["512x512", "768x768", "1024x1024", "1024x768", "768x1024"]
        if request.size not in valid_sizes:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid size. Must be one of: {', '.join(valid_sizes)}"
            )
        
        # Generate image
        result = await modelscope_service.generate_image(
            prompt=request.prompt,
            size=request.size,
            steps=request.steps
        )
        
        if result["success"]:
            # Get base64 data URL for frontend
            data_url = await modelscope_service.generate_image_base64(
                prompt=request.prompt,
                size=request.size,
                steps=request.steps
            )
            
            logger.info(f"Image generated successfully for user {current_user.username}")
            
            return ImageGenerateResponse(
                success=True,
                url=result.get("url"),
                data_url=data_url,
                message="Image generated successfully! 🐝✨",
                metadata=result.get("metadata"),
                error=None
            )
        else:
            # Check if it's a rate limit or auth error
            error_code = result.get("error", "Unknown")
            if error_code in ["Rate limited", "Invalid API key"]:
                raise HTTPException(
                    status_code=429 if error_code == "Rate limited" else 401,
                    detail=result["message"]
                )
            
            logger.warning(f"Image generation failed for user {current_user.username}: {result.get('message')}")
            
            return ImageGenerateResponse(
                success=False,
                url=None,
                data_url=None,
                message=result.get("message", "Image generation failed"),
                metadata=None,
                error=result.get("error")
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Image generation error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate image: {str(e)}"
        )


@router.get(
    "/image/sizes",
    response_model=dict,
    summary="Get Available Image Sizes",
    description="Get list of available image sizes for generation"
)
async def get_available_sizes():
    """Get list of supported image sizes."""
    return {
        "sizes": [
            {"value": "512x512", "label": "Square (512x512)", "description": "Standard square, good for avatars"},
            {"value": "768x768", "label": "Square HD (768x768)", "description": "Higher resolution square"},
            {"value": "1024x1024", "label": "Square Ultra (1024x1024)", "description": "High resolution, default"},
            {"value": "1024x768", "label": "Landscape (1024x768)", "description": "Widescreen format"},
            {"value": "768x1024", "label": "Portrait (768x1024)", "description": "Vertical format"}
        ],
        "default": "1024x1024",
        "recommended": "1024x1024"
    }


@router.get(
    "/image/status",
    response_model=dict,
    summary="Check Image Service Status",
    description="Check if ModelScope image generation is available"
)
async def check_image_service_status(
    current_user: User = Depends(get_current_user),
    modelscope_service: ModelScopeImageService = Depends(get_modelscope_service)
):
    """Check if the image generation service is configured and available."""
    has_key = bool(modelscope_service.api_key)
    
    return {
        "service": "ModelScope Z-Image-Turbo",
        "status": "available" if has_key else "not_configured",
        "api_key_configured": has_key,
        "model": "Tongyi-MAI/Z-Image-Turbo",
        "free_tier": True,
        "setup_url": "https://modelscope.cn/my",
        "message": "Ready to generate beautiful images!" if has_key 
                  else "Please configure MODELSCOPE_API_KEY in your environment"
    }
