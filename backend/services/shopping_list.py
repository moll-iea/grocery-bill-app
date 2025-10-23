from collections import Counter, defaultdict
from datetime import datetime, timedelta
from typing import List, Dict, Set

class ShoppingListGenerator:
    def __init__(self, bills: List[Dict]):
        self.bills = bills
    
    def generate_smart_list(self, days_back: int = 30) -> List[Dict]:
        """Generate shopping list based on purchase history"""
        cutoff_date = datetime.now() - timedelta(days=days_back)
        
        # Get items purchased in the last period
        item_frequency = Counter()
        item_details = {}
        
        for bill in self.bills:
            bill_date = bill.get('created_at')
            if isinstance(bill_date, str):
                bill_date = datetime.fromisoformat(bill_date)
            
            if bill_date >= cutoff_date:
                for item in bill.get('items', []):
                    name = item.get('name')
                    item_frequency[name] += 1
                    
                    if name not in item_details:
                        item_details[name] = {
                            'category': item.get('category', 'General'),
                            'avg_price': item.get('price', 0),
                            'avg_quantity': item.get('quantity', 1)
                        }
        
        # Generate suggested list
        suggested_items = []
        for item_name, frequency in item_frequency.most_common():
            details = item_details[item_name]
            suggested_items.append({
                'name': item_name,
                'category': details['category'],
                'suggested_quantity': details['avg_quantity'],
                'estimated_price': round(details['avg_price'], 2),
                'purchase_frequency': frequency,
                'priority': 'high' if frequency > 3 else 'medium' if frequency > 1 else 'low'
            })
        
        return suggested_items
    
    def detect_running_low_items(self, current_inventory: Dict[str, int]) -> List[str]:
        """Detect items that might be running low"""
        # This assumes you track inventory
        low_stock_items = []
        
        for item_name, quantity in current_inventory.items():
            if quantity <= 2:  # Threshold
                low_stock_items.append(item_name)
        
        return low_stock_items
    
    def group_by_category(self, items: List[Dict]) -> Dict[str, List[Dict]]:
        """Group shopping list items by category"""
        grouped = defaultdict(list)
        
        for item in items:
            category = item.get('category', 'General')
            grouped[category].append(item)
        
        return dict(grouped)