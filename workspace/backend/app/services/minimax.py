"""
MiniMax API service for Sparkie.
"""
import json
from typing import Optional, AsyncGenerator, Dict, Any
from openai import AsyncOpenAI
import httpx
from loguru import logger

from app.config import settings


class MiniMaxService:
    """Service for interacting with MiniMax API (OpenAI-compatible)."""
    
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.minimax_api_key
        self.model = model or settings.minimax_model
        self.base_url = settings.minimax_base_url
        
        self.client = AsyncOpenAI(
            api_key=self.api_key,
            base_url=self.base_url,
            http_client=httpx.AsyncClient(timeout=120.0)
        )
        
        logger.info(f"MiniMax service initialized with model: {self.model}")
    
    async def chat(
        self,
        messages: list[dict],
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        stream: bool = False
    ) -> AsyncGenerator[str, None]:
        """Send a chat request to MiniMax API."""
        try:
            params = {
                "model": self.model,
                "messages": messages,
                "stream": stream,
            }
            
            if temperature is not None:
                params["temperature"] = temperature
            if max_tokens is not None:
                params["max_tokens"] = max_tokens
            
            if stream:
                async for chunk in self._stream_response(params):
                    yield chunk
            else:
                response = await self.client.chat.completions.create(**params)
                yield response.choices[0].message.content or ""
                
        except Exception as e:
            logger.error(f"MiniMax API error: {e}")
            raise
    
    async def _stream_response(
        self, 
        params: Dict[str, Any]
    ) -> AsyncGenerator[str, None]:
        """Handle streaming response from MiniMax."""
        try:
            response = await self.client.chat.completions.create(**params)
            
            async for chunk in response:
                if chunk.choices and len(chunk.choices) > 0:
                    delta = chunk.choices[0].delta
                    if delta and delta.content:
                        yield delta.content
                        
        except Exception as e:
            logger.error(f"Streaming error: {e}")
            raise
    
    async def close(self):
        """Close the HTTP client."""
        await self.client.close()


_minimax_service: Optional[MiniMaxService] = None


def get_minimax_service() -> MiniMaxService:
    """Get or create the MiniMax service singleton."""
    global _minimax_service
    if _minimax_service is None:
        _minimax_service = MiniMaxService()
    return _minimax_service


async def init_minimax_service():
    """Initialize the MiniMax service."""
    global _minimax_service
    _minimax_service = MiniMaxService()
    logger.info("MiniMax service initialized")


async def close_minimax_service():
    """Close the MiniMax service."""
    global _minimax_service
    if _minimax_service:
        await _minimax_service.close()
        _minimax_service = None
