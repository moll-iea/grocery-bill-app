import React, { useState, useEffect } from 'react';
import { generateShoppingList } from '../services/api';
import './ShoppingList.css';

const ShoppingList = ({ userId }) => {
  const [shoppingList, setShoppingList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [daysBack, setDaysBack] = useState(30);
  const [checkedItems, setCheckedItems] = useState(new Set());

  useEffect(() => {
    fetchShoppingList();
  }, [userId, daysBack]);

  const fetchShoppingList = async () => {
    try {
      setLoading(true);
      const data = await generateShoppingList(userId, daysBack);
      setShoppingList(data);
      setError('');
    } catch (err) {
      setError(err.error || 'Failed to generate shopping list');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (itemName) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(itemName)) {
      newChecked.delete(itemName);
    } else {
      newChecked.add(itemName);
    }
    setCheckedItems(newChecked);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ff6b6b';
      case 'medium': return '#ffa94d';
      case 'low': return '#51cf66';
      default: return '#868e96';
    }
  };

  if (loading) return <div className="loading">Generating shopping list...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!shoppingList) return <div>No shopping list available</div>;

  const { suggested_items, grouped_by_category, total_items } = shoppingList;

  return (
    <div className="shopping-list-container">
      <div className="list-header">
        <h1>🛒 Smart Shopping List</h1>
        <div className="list-controls">
          <label>
            Based on last
            <select value={daysBack} onChange={(e) => setDaysBack(Number(e.target.value))}>
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
            </select>
          </label>
          <div className="list-stats">
            {checkedItems.size} / {total_items} items checked
          </div>
        </div>
      </div>

      {/* Grouped by Category */}
      <div className="categories-section">
        {Object.entries(grouped_by_category).map(([category, items]) => (
          <div key={category} className="category-section">
            <h2 className="category-title">
              {category} ({items.length} items)
            </h2>
            <div className="items-list">
              {items.map((item, index) => (
                <div 
                  key={index} 
                  className={`list-item ${checkedItems.has(item.name) ? 'checked' : ''}`}
                  onClick={() => toggleItem(item.name)}
                >
                  <div className="item-checkbox">
                    <input 
                      type="checkbox" 
                      checked={checkedItems.has(item.name)}
                      onChange={() => {}}
                    />
                  </div>
                  <div className="item-details">
                    <div className="item-name">{item.name}</div>
                    <div className="item-meta">
                      <span className="item-quantity">Qty: {item.suggested_quantity}</span>
                      <span className="item-price">₱{item.estimated_price}</span>
                      <span 
                        className="item-priority"
                        style={{ backgroundColor: getPriorityColor(item.priority) }}
                      >
                        {item.priority}
                      </span>
                      <span className="item-frequency">
                        Bought {item.purchase_frequency}x
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="list-summary">
        <h3>Estimated Total</h3>
        <div className="summary-amount">
          ₱{suggested_items.reduce((sum, item) => 
            sum + (item.estimated_price * item.suggested_quantity), 0
          ).toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default ShoppingList;