class Discount:
    def __init__(self, percentage):
        self.percentage = percentage

    def calculate_discount(self, total_amount):
        return total_amount * (self.percentage / 100)

    def apply_discount(self, total_amount):
        discount_amount = self.calculate_discount(total_amount)
        return total_amount - discount_amount