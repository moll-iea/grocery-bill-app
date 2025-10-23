import re

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return False, 'Password must be at least 8 characters long'
    
    if not re.search(r'[A-Z]', password):
        return False, 'Password must contain at least one uppercase letter'
    
    if not re.search(r'[a-z]', password):
        return False, 'Password must contain at least one lowercase letter'
    
    if not re.search(r'\d', password):
        return False, 'Password must contain at least one number'
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, 'Password must contain at least one special character'
    
    return True, 'Password is valid'

def validate_item_price(price):
    if price < 0:
        raise ValueError("Price cannot be negative.")
    return True

def validate_item_quantity(quantity):
    if quantity <= 0:
        raise ValueError("Quantity must be greater than zero.")
    return True

def validate_user_email(email):
    import re
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    if not re.match(email_regex, email):
        raise ValueError("Invalid email format.")
    return True

def validate_bill_items(items):
    if not isinstance(items, list) or len(items) == 0:
        raise ValueError("Items must be a non-empty list.")
    for item in items:
        if not isinstance(item, dict) or 'price' not in item or 'quantity' not in item:
            raise ValueError("Each item must be a dictionary with 'price' and 'quantity' keys.")
        validate_item_price(item['price'])
        validate_item_quantity(item['quantity'])
    return True