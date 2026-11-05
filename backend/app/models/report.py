from datetime import datetime
from bson import ObjectId
from app.utils.database import get_db


class Report:
    @staticmethod
    def create(user_id, mechanic_id, reason):
        db = get_db()
        report_data = {
            'user_id': str(user_id),
            'mechanic_id': str(mechanic_id),
            'reason': reason,
            'status': 'pending',
            'resolution': None,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
        }
        result = db.reports.insert_one(report_data)
        return result.inserted_id

    @staticmethod
    def find_by_id(report_id):
        db = get_db()
        return db.reports.find_one({'_id': ObjectId(report_id)})

    @staticmethod
    def to_dict(report):
        if not report:
            return None
        return {
            '_id': str(report['_id']),
            'user_id': report.get('user_id'),
            'mechanic_id': report.get('mechanic_id'),
            'reason': report.get('reason'),
            'status': report.get('status'),
            'resolution': report.get('resolution'),
            'created_at': report['created_at'].isoformat() if report.get('created_at') else None,
            'updated_at': report['updated_at'].isoformat() if report.get('updated_at') else None,
        }
