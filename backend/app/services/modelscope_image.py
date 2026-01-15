"""
ModelScope Image Generation Service for Sparkie.
Uses Z-Image-Turbo model for free text-to-image generation.
"""
import base64
import time
from typing import Optional, Dict, Any
import httpx
from loguru import logger

from app.config import settings


class ModelScopeImageService:
    """Service for generating images using ModelScope API."""
    
    # ModelScope API configuration
    API_URL = "https://api-inference.modelscope.cn/v1/images/generations"
    DEFAULT_MODEL = "Tongyi-MAI/Z-Image-Turbo"
    
    # Image size mappings
    SIZE_MAP = {
        "512x512": (512, 512),
        "768x768": (768, 768),
        "1024x1024": (1024, 1024),
        "1024x768": (1024, 768),
        "768x1024": (768, 1024),
    }
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.modelscope_api_key
        self.timeout = 120.0  # Longer timeout for image generation
        
        if not self.api_key:
            logger.warning("ModelScope API key not configured. Image generation will fail.")
    
    def _build_enhanced_prompt(self, prompt: str) -> str:
        """
        Enhance the user's prompt with Sparkie/Queen Bee theme elements.
        
        Args:
            prompt: Original user prompt
            
        Returns:
            Enhanced prompt with bee/queen theme additions
        """
        # Theme descriptors to optionally add (not always, to respect user intent)
        theme_additions = [
            "in regal queen bee style",
            "black and yellow electric theme",
            "golden honey glow aesthetic",
            "with subtle bee wing motifs",
            "photorealistic, high quality",
        ]
        
        # Only add theme if not already present in prompt
        prompt_lower = prompt.lower()
        
        # Check if prompt already has bee/queen theme elements
        theme_keywords = ["bee", "queen", "honey", "sparkie", "polleneer", "hive"]
        has_theme = any(kw in prompt_lower for kw in theme_keywords)
        
        if not has_theme:
            # Add a subtle theme enhancement
            enhanced = f"{prompt}, in elegant artistic style reminiscent of a queen bee's golden kingdom"
        else:
            enhanced = prompt
        
        # Ensure high quality regardless
        if "high quality" not in prompt_lower and "photorealistic" not in prompt_lower:
            enhanced += ", high quality, detailed"
        
        return enhanced
    
    def _parse_size(self, size: str = "1024x1024") -> tuple[int, int]:
        """
        Parse size string to width and height.
        
        Args:
            size: Size string like "1024x1024"
            
        Returns:
            Tuple of (width, height)
        """
        if size in self.SIZE_MAP:
            return self.SIZE_MAP[size]
        
        try:
            parts = size.lower().split("x")
            if len(parts) == 2:
                return int(parts[0]), int(parts[1])
        except (ValueError, AttributeError):
            pass
        
        logger.warning(f"Invalid size '{size}', using default 1024x1024")
        return 1024, 1024
    
    async def generate_image(
        self,
        prompt: str,
        size: str = "1024x1024",
        steps: int = 9,
        guidance_scale: float = 0.0
    ) -> Dict[str, Any]:
        """
        Generate an image using ModelScope API.
        
        Args:
            prompt: Text description of the image to generate
            size: Image size (e.g., "1024x1024", "768x768")
            steps: Number of inference steps (default 9 for Turbo)
            guidance_scale: Guidance scale (0.0 recommended for Turbo)
            
        Returns:
            Dict containing image data (url or base64) and metadata
        """
        # Validate API key
        if not self.api_key:
            return {
                "success": False,
                "error": "ModelScope API key not configured",
                "message": "Please add MODELSCOPE_API_KEY to your environment variables"
            }
        
        try:
            # Parse and validate size
            width, height = self._parse_size(size)
            
            # Enhance prompt with Sparkie theme
            enhanced_prompt = self._build_enhanced_prompt(prompt)
            
            # Build request payload (OpenAI-compatible format)
            payload = {
                "model": self.DEFAULT_MODEL,
                "prompt": enhanced_prompt,
                "width": width,
                "height": height,
                "num_inference_steps": steps if 1 <= steps <= 50 else 9,
                "guidance_scale": guidance_scale,
            }
            
            # Build headers
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            }
            
            logger.info(f"Generating image with ModelScope: {width}x{height}, steps={steps}")
            
            # Make API request
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    self.API_URL,
                    json=payload,
                    headers=headers
                )
            
            # Handle response
            if response.status_code == 200:
                data = response.json()
                
                # Parse ModelScope response format
                if isinstance(data, list) and len(data) > 0:
                    image_data = data[0]
                    result = {
                        "success": True,
                        "url": image_data.get("url"),
                        "b64_json": image_data.get("b64_json"),
                        "revised_prompt": image_data.get("revised_prompt", enhanced_prompt),
                        "metadata": {
                            "size": f"{width}x{height}",
                            "steps": steps,
                            "model": self.DEFAULT_MODEL,
                            "original_prompt": prompt,
                            "enhanced_prompt": enhanced_prompt
                        }
                    }
                    logger.info("Image generated successfully")
                    return result
                else:
                    return {
                        "success": False,
                        "error": "Invalid response format",
                        "message": "ModelScope API returned unexpected format"
                    }
            
            elif response.status_code == 401:
                logger.error("ModelScope API authentication failed")
                return {
                    "success": False,
                    "error": "Invalid API key",
                    "message": "ModelScope API key is invalid or expired"
                }
            
            elif response.status_code == 429:
                logger.warning("ModelScope API rate limit hit")
                return {
                    "success": False,
                    "error": "Rate limited",
                    "message": "ModelScope API rate limit exceeded. Please try again later."
                }
            
            else:
                error_detail = response.text[:200] if response.text else "No error details"
                logger.error(f"ModelScope API error: {response.status_code} - {error_detail}")
                return {
                    "success": False,
                    "error": f"API error {response.status_code}",
                    "message": f"ModelScope API returned error: {error_detail}"
                }
                
        except httpx.TimeoutException:
            logger.error("ModelScope API timeout")
            return {
                "success": False,
                "error": "Timeout",
                "message": "Image generation timed out. Please try again."
            }
        except Exception as e:
            logger.exception(f"Image generation error: {e}")
            return {
                "success": False,
                "error": "Generation failed",
                "message": f"Failed to generate image: {str(e)}"
            }
    
    async def generate_image_base64(
        self,
        prompt: str,
        size: str = "1024x1024",
        steps: int = 9
    ) -> Optional[str]:
        """
        Generate image and return base64 data URL.
        
        Args:
            prompt: Text description of the image
            size: Image size
            steps: Number of inference steps
            
        Returns:
            Data URL string (base64) or None if failed
        """
        result = await self.generate_image(prompt, size, steps)
        
        if result["success"]:
            # Return data URL format for easy frontend display
            b64 = result.get("b64_json")
            url = result.get("url")
            
            if b64:
                return f"data:image/png;base64,{b64}"
            elif url:
                # Download and convert to base64
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    img_response = await client.get(url)
                    if img_response.status_code == 200:
                        b64_data = base64.b64encode(img_response.content).decode()
                        return f"data:image/png;base64,{b64_data}"
            
            return url  # Return URL if no base64 conversion needed
        
        return None


# Singleton instance
_modelscope_service: Optional[ModelScopeImageService] = None


def get_modelscope_service() -> ModelScopeImageService:
    """Get or create the ModelScope service singleton."""
    global _modelscope_service
    if _modelscope_service is None:
        _modelscope_service = ModelScopeImageService()
    return _modelscope_service


async def init_modelscope_service():
    """Initialize the ModelScope service."""
    global _modelscope_service
    _modelscope_service = ModelScopeImageService()
    logger.info("ModelScope image service initialized")


async def close_modelscope_service():
    """Close the ModelScope service."""
    global _modelscope_service
    _modelscope_service = None
    logger.info("ModelScope image service closed")
