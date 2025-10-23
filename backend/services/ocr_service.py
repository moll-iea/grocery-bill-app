import re
from datetime import datetime
from typing import List, Dict
import base64
from io import BytesIO
from PIL import Image

class ReceiptOCRService:
    def __init__(self):
        self.price_pattern = re.compile(r'\$?\d+\.?\d{0,2}')
        self.item_pattern = re.compile(r'^[A-Za-z\s]+')
    
    def parse_receipt_text(self, text: str) -> List[Dict]:
        """Parse receipt text and extract items"""
        items = []
        lines = text.strip().split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Find price in line
            price_match = self.price_pattern.search(line)
            if price_match:
                price_str = price_match.group().replace('$', '')
                try:
                    price = float(price_str)
                    # Extract item name (everything before price)
                    item_name = line[:price_match.start()].strip()
                    
                    if item_name and len(item_name) > 2:
                        items.append({
                            'name': item_name,
                            'price': price,
                            'quantity': 1,
                            'category': self._categorize_item(item_name)
                        })
                except ValueError:
                    continue
        
        return items
    
    def _categorize_item(self, item_name: str) -> str:
        """Auto-categorize items based on keywords"""
        item_lower = item_name.lower()
        
        categories = {
            'Fruits': ['apple', 'banana', 'orange', 'grape', 'berry', 'mango'],
            'Vegetables': ['carrot', 'tomato', 'lettuce', 'onion', 'potato', 'broccoli'],
            'Dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream'],
            'Meat': ['chicken', 'beef', 'pork', 'fish', 'turkey'],
            'Bakery': ['bread', 'cake', 'cookie', 'pastry', 'bun'],
            'Beverages': ['juice', 'soda', 'water', 'tea', 'coffee'],
            'Snacks': ['chips', 'candy', 'chocolate', 'nuts', 'popcorn']
        }
        
        for category, keywords in categories.items():
            if any(keyword in item_lower for keyword in keywords):
                return category
        
        return 'General'
    
    def decode_image(self, base64_string: str) -> Image:
        """Decode base64 image"""
        image_data = base64.b64decode(base64_string)
        return Image.open(BytesIO(image_data))