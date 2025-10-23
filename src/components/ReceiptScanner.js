import React, { useState } from 'react';
import { parseReceipt } from '../services/api';
import './ReceiptScanner.css';

const ReceiptScanner = ({ onItemsExtracted }) => {
  const [receiptText, setReceiptText] = useState('');
  const [extractedItems, setExtractedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleParseReceipt = async () => {
    if (!receiptText.trim()) {
      setError('Please enter receipt text');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await parseReceipt(receiptText);
      setExtractedItems(data.items);
      
      if (onItemsExtracted) {
        onItemsExtracted(data.items);
      }
    } catch (err) {
      setError(err.error || 'Failed to parse receipt');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setReceiptText('');
    setExtractedItems([]);
    setError('');
  };

  return (
    <div className="receipt-scanner-container">
      <h2>📄 Receipt Scanner</h2>
      <p className="scanner-description">
        Paste your receipt text below and we'll automatically extract items and prices
      </p>

      {error && <div className="error-message">{error}</div>}

      <div className="scanner-input">
        <textarea
          value={receiptText}
          onChange={(e) => setReceiptText(e.target.value)}
          placeholder="Paste your receipt text here...&#10;&#10;Example:&#10;Apple    2.50&#10;Bread    1.50&#10;Milk     3.25"
          rows={10}
        />
      </div>

      <div className="scanner-actions">
        <button 
          onClick={handleParseReceipt}
          disabled={loading || !receiptText.trim()}
          className="btn-parse"
        >
          {loading ? 'Parsing...' : '🔍 Parse Receipt'}
        </button>
        <button 
          onClick={handleClear}
          className="btn-clear"
        >
          Clear
        </button>
      </div>

      {extractedItems.length > 0 && (
        <div className="extracted-items">
          <h3>Extracted Items ({extractedItems.length})</h3>
          <div className="items-grid">
            {extractedItems.map((item, index) => (
              <div key={index} className="extracted-item">
                <div className="item-header">
                  <span className="item-name">{item.name}</span>
                  <span className="item-category">{item.category}</span>
                </div>
                <div className="item-footer">
                  <span className="item-price">₱{item.price.toFixed(2)}</span>
                  <span className="item-qty">Qty: {item.quantity}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="extraction-summary">
            <strong>Total:</strong> ₱{extractedItems.reduce((sum, item) => 
              sum + (item.price * item.quantity), 0
            ).toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptScanner;