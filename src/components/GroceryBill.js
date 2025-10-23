import React, { useState } from 'react';
import { calculateBill, createBill } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './GroceryBill.css';

const GroceryBill = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    name: '',
    price: '',
    quantity: '',
    category: ''
  });
  const [billSummary, setBillSummary] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem({
      ...currentItem,
      [name]: value
    });
  };

  const addItem = () => {
    if (!currentItem.name || !currentItem.price || !currentItem.quantity) {
      setError('Please fill in all item fields');
      return;
    }

    const newItem = {
      name: currentItem.name,
      price: parseFloat(currentItem.price),
      quantity: parseInt(currentItem.quantity),
      category: currentItem.category || 'General'
    };

    setItems([...items, newItem]);
    setCurrentItem({ name: '', price: '', quantity: '', category: '' });
    setError('');
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleCalculate = async () => {
    if (items.length === 0) {
      setError('Please add at least one item');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await calculateBill(items, discount);
      setBillSummary(result);
    } catch (err) {
      setError(err.error || 'Failed to calculate bill');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBill = async () => {
    if (items.length === 0) {
      setError('Please add at least one item');
      return;
    }

    if (!user || !user.id) {
      setError('User not authenticated. Please log in again.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = await createBill(user.id, items, discount);
      
      // Set success message with bill details
      setSuccessMessage(
        `✓ Bill saved successfully! Total: ₱${billSummary?.total?.toFixed(2) || '0.00'} | Items: ${items.length}`
      );
      
      // Reset form after a delay
      setTimeout(() => {
        setItems([]);
        setBillSummary(null);
        setDiscount(0);
        setSuccessMessage('');
      }, 3000);
      
    } catch (err) {
      setError(err.error || 'Failed to save bill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grocery-bill-container">
      <h1>Grocery Bill Calculator</h1>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="add-item-section">
        <h2>Add Item</h2>
        <div className="input-group">
          <input
            type="text"
            name="name"
            placeholder="Item Name"
            value={currentItem.name}
            onChange={handleInputChange}
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            step="0.01"
            value={currentItem.price}
            onChange={handleInputChange}
          />
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={currentItem.quantity}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="category"
            placeholder="Category (optional)"
            value={currentItem.category}
            onChange={handleInputChange}
          />
          <button onClick={addItem} className="btn-add">Add Item</button>
        </div>
      </div>

      <div className="items-list">
        <h2>Items ({items.length})</h2>
        {items.length === 0 ? (
          <p>No items added yet</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Category</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>₱{item.price.toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td>{item.category}</td>
                  <td>₱{(item.price * item.quantity).toFixed(2)}</td>
                  <td>
                    <button onClick={() => removeItem(index)} className="btn-remove">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="discount-section">
        <label>
          Discount: ₱
          <input
            type="number"
            step="0.01"
            value={discount}
            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
          />
        </label>
      </div>

      <div className="action-buttons">
        <button 
          onClick={handleCalculate} 
          disabled={loading || items.length === 0}
          className="btn-calculate"
        >
          {loading ? 'Calculating...' : 'Calculate Bill'}
        </button>
        <button 
          onClick={handleSaveBill} 
          disabled={loading || items.length === 0}
          className="btn-save"
        >
          {loading ? 'Saving...' : 'Save Bill'}
        </button>
      </div>

      {billSummary && (
        <div className="bill-summary">
          <h2>Bill Summary</h2>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>₱{billSummary.subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax (8%):</span>
            <span>₱{billSummary.tax.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Discount:</span>
            <span>-₱{billSummary.discount.toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>₱{billSummary.total.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroceryBill;