from flask import Blueprint, request, jsonify
from models.bill import Bill
from models.item import Item
from services.calculator import Calculator
from services.analytics import BudgetAnalytics
from services.price_tracker import PriceTracker
from services.shopping_list import ShoppingListGenerator
from services.ocr_service import ReceiptOCRService

bills_bp = Blueprint('bills', __name__)

@bills_bp.route('/calculate', methods=['POST'])
def calculate_bill():
    """Calculate bill total from items"""
    try:
        data = request.get_json()
        items = data.get('items', [])
        
        if not items:
            return jsonify({'error': 'No items provided'}), 400
        
        calculator = Calculator()
        subtotal = calculator.calculate_subtotal(items)
        tax = calculator.calculate_tax(subtotal)
        discount = data.get('discount', 0)
        total = calculator.calculate_total(subtotal, tax, discount)
        
        return jsonify({
            'subtotal': subtotal,
            'tax': tax,
            'discount': discount,
            'total': total,
            'items': items
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bills_bp.route('/', methods=['POST'])
def create_bill():
    """Create and save a new bill"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        items = data.get('items', [])
        
        if not user_id or not items:
            return jsonify({'error': 'user_id and items are required'}), 400
        
        # Calculate totals
        calculator = Calculator()
        subtotal = calculator.calculate_subtotal(items)
        tax = calculator.calculate_tax(subtotal)
        discount = data.get('discount', 0)
        total = calculator.calculate_total(subtotal, tax, discount)
        
        # Create bill
        bill = Bill(
            user_id=user_id,
            items=items,
            total=total,
            discount=discount
        )
        
        bill_id = bill.save()
        
        return jsonify({
            'message': 'Bill created successfully',
            'bill_id': bill_id,
            'bill': bill.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bills_bp.route('/<bill_id>', methods=['GET'])
def get_bill(bill_id):
    """Get a bill by ID"""
    try:
        bill = Bill.find_by_id(bill_id)
        if bill:
            return jsonify(bill.to_dict()), 200
        return jsonify({'error': 'Bill not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bills_bp.route('/user/<user_id>', methods=['GET'])
def get_user_bills(user_id):
    """Get all bills for a user"""
    try:
        bills = Bill.find_by_user(user_id)
        return jsonify([bill.to_dict() for bill in bills]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bills_bp.route('/<bill_id>', methods=['DELETE'])
def delete_bill(bill_id):
    """Delete a bill by ID"""
    try:
        from bson.objectid import ObjectId
        result = Bill.get_collection().delete_one({'_id': ObjectId(bill_id)})
        
        if result.deleted_count > 0:
            return jsonify({'message': 'Bill deleted successfully'}), 200
        return jsonify({'error': 'Bill not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bills_bp.route('/analytics/<user_id>', methods=['GET'])
def get_analytics(user_id):
    """Get spending analytics for a user"""
    try:
        bills = Bill.find_by_user(user_id)
        bills_data = [bill.to_dict() for bill in bills]
        
        analytics = BudgetAnalytics(bills_data)
        
        return jsonify({
            'monthly_spending': analytics.calculate_monthly_spending(),
            'category_breakdown': analytics.get_category_breakdown(),
            'spending_trends': analytics.get_spending_trends(),
            'top_items': analytics.get_top_items(),
            'budget_prediction': analytics.predict_next_month_budget()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bills_bp.route('/price-trends/<item_name>', methods=['GET'])
def get_price_trends(item_name):
    """Get price trends for a specific item"""
    try:
        # Get all bills containing this item
        all_bills = Bill.get_collection().find()
        
        tracker = PriceTracker()
        
        for bill in all_bills:
            for item in bill.get('items', []):
                if item.get('name').lower() == item_name.lower():
                    tracker.add_item_price(
                        item.get('name'),
                        item.get('price'),
                        bill.get('created_at')
                    )
        
        trend = tracker.get_price_trend(item_name)
        
        if trend:
            return jsonify(trend), 200
        return jsonify({'error': 'Item not found'}), 404
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bills_bp.route('/shopping-list/<user_id>', methods=['GET'])
def generate_shopping_list(user_id):
    """Generate smart shopping list"""
    try:
        days_back = request.args.get('days', 30, type=int)
        
        bills = Bill.find_by_user(user_id)
        bills_data = [bill.to_dict() for bill in bills]
        
        generator = ShoppingListGenerator(bills_data)
        suggested_list = generator.generate_smart_list(days_back)
        grouped_list = generator.group_by_category(suggested_list)
        
        return jsonify({
            'suggested_items': suggested_list,
            'grouped_by_category': grouped_list,
            'total_items': len(suggested_list)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bills_bp.route('/parse-receipt', methods=['POST'])
def parse_receipt():
    """Parse receipt text and extract items"""
    try:
        data = request.get_json()
        receipt_text = data.get('text', '')
        
        if not receipt_text:
            return jsonify({'error': 'No receipt text provided'}), 400
        
        ocr_service = ReceiptOCRService()
        items = ocr_service.parse_receipt_text(receipt_text)
        
        return jsonify({
            'items': items,
            'count': len(items)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bills_bp.route('/best-deals/<user_id>', methods=['GET'])
def get_best_deals(user_id):
    """Find best deals based on price history"""
    try:
        bills = Bill.find_by_user(user_id)
        
        tracker = PriceTracker()
        
        # Build price history
        for bill in bills:
            bill_dict = bill.to_dict()
            for item in bill_dict.get('items', []):
                tracker.add_item_price(
                    item.get('name'),
                    item.get('price'),
                    bill_dict.get('created_at')
                )
        
        # Get latest bill items
        if bills:
            latest_bill = bills[-1].to_dict()
            deals = tracker.find_best_deals(latest_bill.get('items', []))
            
            return jsonify({
                'deals': deals,
                'savings_count': len(deals)
            }), 200
        
        return jsonify({'deals': [], 'savings_count': 0}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500