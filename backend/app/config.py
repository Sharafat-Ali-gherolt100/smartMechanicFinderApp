"""
Centralised configuration — loaded by create_app() in __init__.py.
All values fall back to safe defaults so the server can start even
without a .env file.
"""
import os
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv

_ENV_PATH = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(_ENV_PATH)


class Config:
    # Flask
    SECRET_KEY: str = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG: bool = os.getenv('DEBUG', 'False').lower() == 'true'

    # JWT
    JWT_SECRET_KEY: str = os.getenv('JWT_SECRET_KEY', 'dev-jwt-secret-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES: timedelta = timedelta(
        seconds=int(os.getenv('JWT_EXPIRES_SECONDS', '86400'))
    )

    # MongoDB
    MONGODB_URI: str = os.getenv(
        'MONGODB_URI', 'mongodb://localhost:27017/mechanic_finder_db'
    )

    # Mail
    MAIL_SERVER: str = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT: int = int(os.getenv('MAIL_PORT', '587'))
    MAIL_USE_TLS: bool = os.getenv('MAIL_USE_TLS', 'True') == 'True'
    MAIL_USERNAME: str = os.getenv('MAIL_USERNAME', '')
    MAIL_PASSWORD: str = os.getenv('MAIL_PASSWORD', '')

    # Uploads
    UPLOAD_FOLDER: str = os.getenv('UPLOAD_FOLDER', 'uploads')
    MAX_CONTENT_LENGTH: int = int(
        os.getenv('MAX_CONTENT_LENGTH', str(16 * 1024 * 1024))
    )

    # Redis (optional)
    REDIS_URL: str = os.getenv('REDIS_URL', '')


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


config_map = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig,
}
