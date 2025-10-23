from collections import defaultdict
from datetime import datetime, timedelta
from typing import List, Dict
import statistics

class BudgetAnalytics:
    def __init__(self, bills: List[Dict]):
        self.bills = bills
    
    def calculate_monthly_spending(self) -> Dict:
        """Calculate spending by month"""
        monthly_totals = defaultdict(float)
        
        for bill in self.bills:
            created_at = bill.get('created_at')
            if isinstance(created_at, str):
                date = datetime.fromisoformat(created_at)
            else:
                date = created_at
            
            month_key = date.strftime('%Y-%m')
            monthly_totals[month_key] += bill.get('total', 0)
        
        return dict(sorted(monthly_totals.items()))
    
    def get_category_breakdown(self) -> Dict:
        """Get spending by category"""
        category_totals = defaultdict(float)
        category_counts = defaultdict(int)
        
        for bill in self.bills:
            for item in bill.get('items', []):
                category = item.get('category', 'General')
                price = item.get('price', 0)
                quantity = item.get('quantity', 1)
                
                category_totals[category] += price * quantity
                category_counts[category] += 1
        
        return {
            'totals': dict(category_totals),
            'counts': dict(category_counts),
            'averages': {cat: total / category_counts[cat] 
                        for cat, total in category_totals.items()}
        }
    
    def get_spending_trends(self) -> Dict:
        """Analyze spending trends"""
        if not self.bills:
            return {}
        
        totals = [bill.get('total', 0) for bill in self.bills]
        
        return {
            'average': round(statistics.mean(totals), 2),
            'median': round(statistics.median(totals), 2),
            'min': round(min(totals), 2),
            'max': round(max(totals), 2),
            'std_dev': round(statistics.stdev(totals), 2) if len(totals) > 1 else 0,
            'total_bills': len(self.bills),
            'total_spent': round(sum(totals), 2)
        }
    
    def get_top_items(self, limit: int = 10) -> List[Dict]:
        """Get most purchased items"""
        item_frequency = defaultdict(lambda: {'count': 0, 'total_spent': 0})
        
        for bill in self.bills:
            for item in bill.get('items', []):
                name = item.get('name')
                price = item.get('price', 0)
                quantity = item.get('quantity', 1)
                
                item_frequency[name]['count'] += quantity
                item_frequency[name]['total_spent'] += price * quantity
        
        sorted_items = sorted(
            item_frequency.items(),
            key=lambda x: x[1]['count'],
            reverse=True
        )
        
        return [
            {
                'name': name,
                'purchase_count': data['count'],
                'total_spent': round(data['total_spent'], 2)
            }
            for name, data in sorted_items[:limit]
        ]
    
    def predict_next_month_budget(self) -> Dict:
        """Predict next month's budget based on trends"""
        monthly_spending = self.calculate_monthly_spending()
        
        if len(monthly_spending) < 2:
            return {'prediction': 0, 'confidence': 'low'}
        
        values = list(monthly_spending.values())
        avg = statistics.mean(values)
        trend = values[-1] - values[-2]
        
        prediction = round(values[-1] + trend, 2)
        confidence = 'high' if abs(trend) < avg * 0.2 else 'medium'
        
        return {
            'prediction': prediction,
            'confidence': confidence,
            'trend': 'increasing' if trend > 0 else 'decreasing',
            'trend_amount': round(trend, 2)
        }