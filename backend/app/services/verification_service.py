import re
import os
from werkzeug.utils import secure_filename
from datetime import datetime

ALLOWED_DOC_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf', 'webp'}
CNIC_REGEX = r'^\d{5}-\d{7}-\d{1}$'
CNIC_PLAIN_REGEX = r'^\d{13}$'

def validate_cnic(cnic_str):
    """
    Validates Pakistani CNIC number format:
    Accepts XXXXX-XXXXXXX-X (13 digits with hyphens) or 13 contiguous digits.
    Returns normalized XXXXX-XXXXXXX-X format or None if invalid.
    """
    if not cnic_str or not isinstance(cnic_str, str):
        return None
    cnic_clean = cnic_str.strip()
    if re.match(CNIC_REGEX, cnic_clean):
        return cnic_clean
    if re.match(CNIC_PLAIN_REGEX, cnic_clean):
        return f"{cnic_clean[:5]}-{cnic_clean[5:12]}-{cnic_clean[12:]}"
    return None

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_DOC_EXTENSIONS

def save_verification_file(file_storage, upload_folder, subfolder='verification'):
    """
    Safely saves an uploaded verification document/photo and returns relative path.
    """
    target_dir = os.path.join(upload_folder, subfolder)
    os.makedirs(target_dir, exist_ok=True)
    
    filename = secure_filename(file_storage.filename)
    timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
    unique_name = f"{timestamp}_{filename}"
    full_path = os.path.join(target_dir, unique_name)
    file_storage.save(full_path)
    
    return f"/api/uploads/{subfolder}/{unique_name}", unique_name
