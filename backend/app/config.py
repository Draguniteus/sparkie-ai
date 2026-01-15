"""
Configuration management for Sparkie backend.
"""
import os
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # MiniMax API
    minimax_api_key: str
    minimax_base_url: str = "https://api.minimax.chat/v1/text/chatcompletion_v2"
    minimax_model: str = "abab6.5s-chat"
    
    # ModelScope Image Generation API (Free!)
    # Get your free token from: https://modelscope.cn/my
    modelscope_api_key: str = ""
    
    # Database
    database_url: str = "sqlite+aiosqlite:///./sparkie_hive.db"
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    
    # JWT Auth
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    
    # App
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    debug: bool = False
    log_level: str = "INFO"
    
    # Rate Limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 60
    
    # CORS
    allowed_origins: str = "http://localhost:3000"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


# Global settings instance
settings = get_settings()
