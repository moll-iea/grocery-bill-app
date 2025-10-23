class Calculator:
    def __init__(self, tax_rate=0.08):
        self.tax_rate = tax_rate
    
    def calculate_subtotal(self, items):
        """Calculate subtotal from list of items"""
        subtotal = 0
        for item in items:
            price = item.get('price', 0)
            quantity = item.get('quantity', 1)
            subtotal += price * quantity
        return round(subtotal, 2)
    
    def calculate_tax(self, subtotal):
        """Calculate tax amount"""
        tax = subtotal * self.tax_rate
        return round(tax, 2)
    
    def calculate_total(self, subtotal, tax, discount=0):
        """Calculate final total"""
        total = subtotal + tax - discount
        return round(total, 2)
    
    def apply_discount(self, total, discount_percentage):
        """Apply percentage discount"""
        discount_amount = total * (discount_percentage / 100)
        return round(total - discount_amount, 2)