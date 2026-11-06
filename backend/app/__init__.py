from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from dotenv import load_dotenv
from pathlib import Path
from datetime import timedelta
import os
import sys
import logging

# Ensure backend folder is in sys.path for IDEs and scripts
_backend_dir = str(Path(__file__).resolve().parent.parent)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

# Load .env from backend directory regardless of cwd
_ENV_PATH = Path(_backend_dir) / '.env'
load_dotenv(_ENV_PATH)

jwt = JWTManager()
mail = Mail()
redis_client = None

logger = logging.getLogger(__name__)


def create_app():
    app = Flask(__name__)

    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-me')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-jwt-secret-change-me')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(seconds=int(os.getenv('JWT_EXPIRES_SECONDS', '86400')))

    app.config['MONGODB_URI'] = os.getenv(
        'MONGODB_URI',
        'mongodb://localhost:27017/mechanic_finder_db'
    )

    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', '587'))
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True') == 'True'
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME', '')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD', '')

    project_root = Path(__file__).resolve().parent.parent.parent
    default_upload = str(project_root / 'uploads' if (project_root / 'uploads').exists() else Path(__file__).resolve().parent.parent / 'uploads')
    app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', default_upload)
    app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_CONTENT_LENGTH', str(16 * 1024 * 1024)))

    jwt.init_app(app)

    # Mail is optional — only init if credentials are provided
    if app.config.get('MAIL_USERNAME'):
        mail.init_app(app)
    else:
        app.logger.info('Mail not configured — running without email support.')

    # Allow mobile emulators/devices and local web clients
    CORS(
        app,
        resources={r"/*": {"origins": "*"}},
        supports_credentials=True,
        allow_headers=['Content-Type', 'Authorization', 'X-Offline'],
        methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    )

    from .utils.database import init_db, close_db
    init_db(app)
    app.teardown_appcontext(close_db)

    # Optional Redis (non-blocking)
    global redis_client
    try:
        import redis
        redis_url = os.getenv('REDIS_URL')
        if redis_url:
            redis_client = redis.Redis.from_url(redis_url)
            redis_client.ping()
            app.logger.info('Redis connection established')
        else:
            redis_client = None
    except Exception:
        redis_client = None
        app.logger.warning('Redis unavailable. Running without cache.')

    # Optional Firebase (non-blocking)
    try:
        import firebase_admin
        from firebase_admin import credentials
        cred_path = Path(__file__).resolve().parent.parent / 'firebase-credentials.json'
        if cred_path.exists() and not firebase_admin._apps:
            cred = credentials.Certificate(str(cred_path))
            firebase_admin.initialize_app(cred)
            app.logger.info('Firebase initialized successfully')
    except Exception:
        app.logger.warning('Firebase unavailable. Running without push notifications.')

    from .routes.auth_routes import auth_bp
    from .routes.api_routes import api_bp
    from .routes.rating_routes import rating_bp
    from .routes.history_routes import history_bp
    from .routes.sos_routes import sos_bp
    from .routes.admin_routes import admin_bp
    from .routes.video_routes import video_bp
    from .routes.sop_routes import sop_bp
    from .routes.mechanic_routes import mechanic_bp
    from .routes.alert_routes import alert_bp
    from .routes.message_routes import message_bp
    from .routes.service_request_routes import service_request_bp
    from .routes.upload_routes import upload_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(rating_bp, url_prefix='/api/ratings')
    app.register_blueprint(history_bp, url_prefix='/api/history')
    app.register_blueprint(sos_bp, url_prefix='/api/sos')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    # video_bp and sop_bp register routes at /api/videos and /api/sop
    # They must NOT share url_prefix with api_bp to avoid route conflicts.
    # Register them with url_prefix='/api' — their internal route strings
    # already start with /videos and /sop so there is no collision.
    app.register_blueprint(video_bp, url_prefix='/api')
    app.register_blueprint(sop_bp, url_prefix='/api')
    app.register_blueprint(mechanic_bp, url_prefix='/api/mechanic')
    app.register_blueprint(alert_bp, url_prefix='/api/alerts')
    app.register_blueprint(message_bp, url_prefix='/api/messages')
    app.register_blueprint(service_request_bp, url_prefix='/api/service-requests')
    app.register_blueprint(upload_bp, url_prefix='/api')

    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'photos'), exist_ok=True)
    os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'thumbnails'), exist_ok=True)
    os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'videos'), exist_ok=True)
    os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'verification'), exist_ok=True)

    @app.route('/')
    def index():
        return {
            'status': 'online',
            'message': 'GetFix API',
            'docs': '/api/',
            'health': '/health',
        }

    @app.route('/health')
    def health():
        return {'status': 'ok'}, 200

    try:
        from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError, AutoReconnect

        @app.errorhandler(ServerSelectionTimeoutError)
        @app.errorhandler(ConnectionFailure)
        @app.errorhandler(AutoReconnect)
        def handle_mongo_connection_error(ex):
            app.logger.error(f"MongoDB connection error: {ex}")
            return {
                "error": "Database Connection Error",
                "message": "Unable to connect to MongoDB server. Please ensure MongoDB is running."
            }, 503
    except ImportError:
        pass

    return app


# Default WSGI entry point for 'gunicorn app:app'
app = create_app()
