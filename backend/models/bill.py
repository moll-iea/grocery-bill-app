from bson.objectid import ObjectId
from datetime import datetime
from config.database import get_db

class Bill:
    collection_name = 'bills'

    def __init__(self, user_id, items=None, total=0, discount=0, bill_id=None):
        self.bill_id = bill_id
        self.user_id = user_id
        self.items = items or []
        self.total = total
        self.discount = discount
        self.created_at = datetime.utcnow()

    @staticmethod
    def get_collection():
        return get_db()[Bill.collection_name]

    def save(self):
        bill_data = {
            'user_id': self.user_id,
            'items': self.items,
            'total': self.total,
            'discount': self.discount,
            'created_at': self.created_at
        }
        result = self.get_collection().insert_one(bill_data)
        self.bill_id = str(result.inserted_id)
        return self.bill_id

    @staticmethod
    def find_by_id(bill_id):
        bill_data = Bill.get_collection().find_one({'_id': ObjectId(bill_id)})
        if bill_data:
            return Bill(
                user_id=bill_data['user_id'],
                items=bill_data['items'],
                total=bill_data['total'],
                discount=bill_data.get('discount', 0),
                bill_id=str(bill_data['_id'])
            )
        return None

    @staticmethod
    def find_by_user(user_id):
        bills = Bill.get_collection().find({'user_id': user_id}).sort('created_at', -1)
        return [Bill(
            user_id=bill['user_id'],
            items=bill['items'],
            total=bill['total'],
            discount=bill.get('discount', 0),
            bill_id=str(bill['_id'])
        ) for bill in bills]

    def to_dict(self):
        return {
            'bill_id': self.bill_id,
            'user_id': self.user_id,
            'items': self.items,
            'total': self.total,
            'discount': self.discount,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }