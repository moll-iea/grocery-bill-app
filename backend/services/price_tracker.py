from collections import defaultdict
from datetime import datetime
from typing import List, Dict, Optional

class PriceTracker:
    def __init__(self):
        self.price_history = defaultdict(list)
    
    def add_item_price(self, item_name: str, price: float, date: datetime):
        """Track item price over time"""
        self.price_history[item_name].append({
            'price': price,
            'date': date
        })
    
    def get_price_trend(self, item_name: str) -> Dict:
        """Get price trend for an item"""
        if item_name not in self.price_history:
            return None
        
        prices = self.price_history[item_name]
        price_values = [p['price'] for p in prices]
        
        if len(price_values) < 2:
            return {'status': 'insufficient_data'}
        
        latest_price = price_values[-1]
        previous_price = price_values[-2]
        min_price = min(price_values)
        max_price = max(price_values)
        avg_price = sum(price_values) / len(price_values)
        
        change = latest_price - previous_price
        change_percent = (change / previous_price) * 100 if previous_price > 0 else 0
        
        return {
            'item_name': item_name,
            'latest_price': round(latest_price, 2),
            'previous_price': round(previous_price, 2),
            'min_price': round(min_price, 2),
            'max_price': round(max_price, 2),
            'avg_price': round(avg_price, 2),
            'price_change': round(change, 2),
            'change_percent': round(change_percent, 2),
            'trend': 'up' if change > 0 else 'down' if change < 0 else 'stable',
            'savings_potential': round(latest_price - min_price, 2)
        }
    
    def find_best_deals(self, items: List[Dict]) -> List[Dict]:
        """Find items with best prices compared to history"""
        deals = []
        
        for item in items:
            name = item.get('name')
            price = item.get('price', 0)
            
            if name in self.price_history:
                historical_prices = [p['price'] for p in self.price_history[name]]
                avg_price = sum(historical_prices) / len(historical_prices)
                
                if price < avg_price:
                    savings = avg_price - price
                    savings_percent = (savings / avg_price) * 100
                    
                    deals.append({
                        'item': name,
                        'current_price': round(price, 2),
                        'avg_price': round(avg_price, 2),
                        'savings': round(savings, 2),
                        'savings_percent': round(savings_percent, 2)
                    })
        
        return sorted(deals, key=lambda x: x['savings_percent'], reverse=True)