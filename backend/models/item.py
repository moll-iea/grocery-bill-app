from bson.objectid import ObjectId
from config.database import db

class Item:
    collection_name = 'items'

    def __init__(self, name, price, quantity, category=None, item_id=None):
        self.item_id = item_id
        self.name = name
        self.price = price
        self.quantity = quantity
        self.category = category

    @staticmethod
    def get_collection():
        return db.get_db()[Item.collection_name]

    def to_dict(self):
        return {
            'item_id': self.item_id,
            'name': self.name,
            'price': self.price,
            'quantity': self.quantity,
            'category': self.category
        }

    def save(self):
        item_data = {
            'name': self.name,
            'price': self.price,
            'quantity': self.quantity,
            'category': self.category
        }
        result = self.get_collection().insert_one(item_data)
        self.item_id = str(result.inserted_id)
        return self.item_id