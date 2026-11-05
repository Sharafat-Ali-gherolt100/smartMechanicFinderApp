import os
from flask import Blueprint, request, jsonify, send_file, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app.utils.database import get_db
from bson import ObjectId
from app.services.verification_service import allowed_file, save_verification_file

upload_bp = Blueprint('upload', __name__)

@upload_bp.route('/upload/verification', methods=['POST'])
@jwt_required(optional=True)
def upload_verification_file():
    """
    Upload a verification file (CNIC doc, Certificate, or Profile photo).
    Returns the file URL and filename.
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part in request'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
            
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed. Supported: jpg, jpeg, png, pdf, webp'}), 400
            
        doc_type = request.form.get('doc_type', 'general') # cnic, certificate, profile_photo
        subfolder = os.path.join('verification', secure_filename(doc_type))
        upload_folder = current_app.config['UPLOAD_FOLDER']
        
        file_url, filename = save_verification_file(file, upload_folder, subfolder=subfolder)
        
        return jsonify({
            'message': 'File uploaded successfully',
            'file_url': file_url,
            'filename': filename,
            'doc_type': doc_type
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@upload_bp.route('/uploads/verification/<doc_type>/<filename>', methods=['GET'])
def get_verification_file(doc_type, filename):
    """
    Serve uploaded verification files.
    """
    try:
        upload_folder = current_app.config['UPLOAD_FOLDER']
        target_dir = os.path.join(upload_folder, 'verification', secure_filename(doc_type))
        clean_filename = secure_filename(filename)
        file_path = os.path.join(target_dir, clean_filename)
        
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404
            
        # Determine mime type
        ext = clean_filename.rsplit('.', 1)[-1].lower() if '.' in clean_filename else ''
        mime = 'application/pdf' if ext == 'pdf' else f'image/{ext}' if ext in ['png', 'jpg', 'jpeg', 'webp'] else 'application/octet-stream'
        
        return send_file(file_path, mimetype=mime)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
