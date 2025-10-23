import React, { useState, useEffect } from 'react';
import { getAnalytics } from '../services/api';
import './Analytics.css';

const Analytics = ({ userId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchAnalytics();
    // Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchAnalytics(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [userId]);

  const fetchAnalytics = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const data = await getAnalytics(userId);
      setAnalytics(data);
      setError('');
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.error || 'Failed to load analytics');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    fetchAnalytics(true);
  };

  const calculateSavingsOpportunity = () => {
    if (!analytics?.category_breakdown?.totals) return null;
    
    const totals = analytics.category_breakdown.totals;
    const snacksSpending = totals['Snacks'] || 0;
    const beveragesSpending = totals['Beverages'] || 0;
    const processedFoods = totals['Processed Foods'] || 0;
    
    const potentialSavings = (snacksSpending * 0.3) + (beveragesSpending * 0.2) + (processedFoods * 0.25);
    
    return potentialSavings > 0 ? potentialSavings : null;
  };

  const getSpendingStatus = () => {
    if (!analytics?.budget_prediction) return null;
    
    const { trend, trend_amount } = analytics.budget_prediction;
    
    if (trend === 'increasing' && trend_amount > 500) {
      return {
        status: 'warning',
        message: '⚠️ Your spending is increasing significantly',
        action: 'Consider reviewing your budget'
      };
    } else if (trend === 'decreasing') {
      return {
        status: 'success',
        message: '✅ Great job! Your spending is decreasing',
        action: 'Keep up the good habits'
      };
    }
    
    return {
      status: 'neutral',
      message: '📊 Your spending is stable',
      action: 'Monitor your trends'
    };
  };

  const getTopExpenseCategory = () => {
    if (!analytics?.category_breakdown?.totals) return null;
    
    const totals = analytics.category_breakdown.totals;
    const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    
    if (sorted.length === 0) return null;
    
    const [category, amount] = sorted[0];
    const total = Object.values(totals).reduce((sum, val) => sum + val, 0);
    const percentage = ((amount / total) * 100).toFixed(1);
    
    return { category, amount, percentage };
  };

  if (loading) return <div className="loading">Loading analytics...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!analytics) return <div className="no-data">No analytics data available</div>;

  const { monthly_spending, category_breakdown, spending_trends, top_items, budget_prediction } = analytics;

  const hasMonthlySpending = monthly_spending && Object.keys(monthly_spending).length > 0;
  const hasCategoryBreakdown = category_breakdown && category_breakdown.totals && Object.keys(category_breakdown.totals).length > 0;
  const hasSpendingTrends = spending_trends && spending_trends.total_spent !== undefined;
  const hasTopItems = top_items && top_items.length > 0;
  const hasBudgetPrediction = budget_prediction && budget_prediction.prediction !== undefined;

  const savingsOpportunity = calculateSavingsOpportunity();
  const spendingStatus = getSpendingStatus();
  const topExpense = getTopExpenseCategory();

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <div>
          <h1>📊 Spending Analytics</h1>
          {lastUpdated && (
            <p className="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button 
          onClick={handleManualRefresh} 
          className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
          disabled={refreshing}
        >
          🔄 {refreshing ? 'Updating...' : 'Refresh'}
        </button>
      </div>

      {/* Key Insights Dashboard */}
      {hasSpendingTrends && (
        <div className="insights-dashboard">
          <h2>💡 Key Insights</h2>
          <div className="insights-grid">
            
            {/* Spending Status */}
            {spendingStatus && (
              <div className={`insight-card ${spendingStatus.status}`}>
                <div className="insight-icon">{spendingStatus.message}</div>
                <div className="insight-action">{spendingStatus.action}</div>
              </div>
            )}

            {/* Savings Opportunity */}
            {savingsOpportunity && (
              <div className="insight-card opportunity">
                <div className="insight-icon">💰 Potential Savings</div>
                <div className="insight-value">₱{savingsOpportunity.toFixed(2)}/month</div>
                <div className="insight-detail">
                  By reducing non-essential purchases by 20-30%
                </div>
              </div>
            )}

            {/* Top Expense Category */}
            {topExpense && (
              <div className="insight-card info">
                <div className="insight-icon">🎯 Biggest Expense</div>
                <div className="insight-value">{topExpense.category}</div>
                <div className="insight-detail">
                  ₱{topExpense.amount.toFixed(2)} ({topExpense.percentage}% of total)
                </div>
              </div>
            )}

            {/* Average per Trip */}
            <div className="insight-card info">
              <div className="insight-icon">🛒 Average Shopping Trip</div>
              <div className="insight-value">
                ₱{(spending_trends.average || 0).toFixed(2)}
              </div>
              <div className="insight-detail">
                {spending_trends.total_bills} trips total
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Spending Trends */}
      {hasSpendingTrends ? (
        <div className="analytics-section">
          <h2>📈 Overall Spending Overview</h2>
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-label">Total Spent</div>
              <div className="stat-value">₱{(spending_trends.total_spent || 0).toFixed(2)}</div>
              <div className="stat-detail">All time spending</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Average Bill</div>
              <div className="stat-value">₱{(spending_trends.average || 0).toFixed(2)}</div>
              <div className="stat-detail">Per shopping trip</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Highest Bill</div>
              <div className="stat-value">₱{(spending_trends.max || 0).toFixed(2)}</div>
              <div className="stat-detail">Record high</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Lowest Bill</div>
              <div className="stat-value">₱{(spending_trends.min || 0).toFixed(2)}</div>
              <div className="stat-detail">Record low</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="analytics-section">
          <h2>📈 Overall Spending Overview</h2>
          <p className="no-data-message">
            📝 Start tracking! Create your first bill to see spending insights.
          </p>
        </div>
      )}

      {/* Monthly Spending with Comparison */}
      {hasMonthlySpending ? (
        <div className="analytics-section">
          <h2>📅 Monthly Spending Trends</h2>
          <p className="section-purpose">
            Track how your spending changes month-to-month to spot patterns
          </p>
          <div className="monthly-chart">
            {Object.entries(monthly_spending).map(([month, amount], index, array) => {
              const maxAmount = Math.max(...Object.values(monthly_spending));
              const percentage = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
              const prevAmount = index > 0 ? array[index - 1][1] : amount;
              const change = amount - prevAmount;
              const changePercent = prevAmount > 0 ? ((change / prevAmount) * 100).toFixed(1) : 0;
              
              return (
                <div key={month} className="month-bar">
                  <div className="month-info">
                    <div className="month-label">{month}</div>
                    {index > 0 && (
                      <div className={`month-change ${change >= 0 ? 'increase' : 'decrease'}`}>
                        {change >= 0 ? '↑' : '↓'} {Math.abs(changePercent)}%
                      </div>
                    )}
                  </div>
                  <div className="bar-container">
                    <div 
                      className="bar-fill" 
                      style={{ width: `${percentage}%` }}
                    >
                      <span className="bar-value">₱{amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="analytics-section">
          <h2>📅 Monthly Spending Trends</h2>
          <p className="no-data-message">Create bills across different months to see trends.</p>
        </div>
      )}

      {/* Category Breakdown with Insights */}
      {hasCategoryBreakdown ? (
        <div className="analytics-section">
          <h2>🏷️ Spending by Category</h2>
          <p className="section-purpose">
            See where your money goes and identify areas to save
          </p>
          <div className="category-grid">
            {Object.entries(category_breakdown.totals)
              .sort((a, b) => b[1] - a[1])
              .map(([category, total]) => {
                const totalSpent = Object.values(category_breakdown.totals).reduce((sum, val) => sum + val, 0);
                const percentage = ((total / totalSpent) * 100).toFixed(1);
                const isHighSpending = percentage > 25;
                
                return (
                  <div key={category} className={`category-card ${isHighSpending ? 'high-spending' : ''}`}>
                    <div className="category-header">
                      <h3>{category}</h3>
                      {isHighSpending && <span className="badge">High</span>}
                    </div>
                    <div className="category-total">₱{total.toFixed(2)}</div>
                    <div className="category-percentage">{percentage}% of total</div>
                    <div className="category-count">
                      {category_breakdown.counts[category] || 0} items purchased
                    </div>
                    <div className="category-avg">
                      ₱{(category_breakdown.averages[category] || 0).toFixed(2)} avg per item
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ) : (
        <div className="analytics-section">
          <h2>🏷️ Spending by Category</h2>
          <p className="no-data-message">Add items with categories to see breakdown.</p>
        </div>
      )}

      {/* Top Items with Recommendations */}
      {hasTopItems ? (
        <div className="analytics-section">
          <h2>⭐ Most Purchased Items</h2>
          <p className="section-purpose">
            Your frequently bought items - consider buying in bulk to save!
          </p>
          <div className="top-items-list">
            {top_items.map((item, index) => {
              const avgPrice = item.total_spent / item.purchase_count;
              const shouldBulkBuy = item.purchase_count >= 5;
              
              return (
                <div key={index} className="top-item">
                  <div className="item-rank">#{index + 1}</div>
                  <div className="item-info">
                    <div className="item-header">
                      <div className="item-name">{item.name}</div>
                      {shouldBulkBuy && (
                        <span className="item-badge">💡 Buy in Bulk</span>
                      )}
                    </div>
                    <div className="item-stats">
                      <span>Purchased {item.purchase_count} times</span>
                      <span>•</span>
                      <span>Total: ₱{item.total_spent.toFixed(2)}</span>
                      <span>•</span>
                      <span>Avg: ₱{avgPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="analytics-section">
          <h2>⭐ Most Purchased Items</h2>
          <p className="no-data-message">Keep shopping to discover your favorites!</p>
        </div>
      )}

      {/* Budget Prediction with Actionable Advice */}
      {hasBudgetPrediction ? (
        <div className="analytics-section prediction-section">
          <h2>🔮 Next Month Budget Forecast</h2>
          <p className="section-purpose">
            Plan ahead and avoid surprises with our spending prediction
          </p>
          <div className="prediction-card">
            <div className="prediction-header">
              <div className="prediction-amount">₱{budget_prediction.prediction.toFixed(2)}</div>
              <div className={`confidence-badge ${budget_prediction.confidence}`}>
                {budget_prediction.confidence} confidence
              </div>
            </div>
            
            <div className="prediction-details">
              <span className={`trend-indicator ${budget_prediction.trend || 'stable'}`}>
                {budget_prediction.trend === 'increasing' ? '📈 Increasing' : 
                 budget_prediction.trend === 'decreasing' ? '📉 Decreasing' : 
                 '➡️ Stable'}
              </span>
              {budget_prediction.trend_amount !== 0 && (
                <span className="trend-amount">
                  {budget_prediction.trend === 'increasing' ? '+' : ''}
                  ₱{Math.abs(budget_prediction.trend_amount || 0).toFixed(2)} vs last month
                </span>
              )}
            </div>

            <div className="prediction-advice">
              {budget_prediction.trend === 'increasing' ? (
                <div className="advice-box warning">
                  <strong>💡 Money-Saving Tip:</strong>
                  <p>Your spending is rising. Try meal planning or buying generic brands to save ₱{(budget_prediction.trend_amount * 0.3).toFixed(2)}/month!</p>
                </div>
              ) : budget_prediction.trend === 'decreasing' ? (
                <div className="advice-box success">
                  <strong>🎉 Great Work!</strong>
                  <p>You're spending less! You've saved ₱{Math.abs(budget_prediction.trend_amount).toFixed(2)} compared to last month. Keep it up!</p>
                </div>
              ) : (
                <div className="advice-box neutral">
                  <strong>✨ Tip:</strong>
                  <p>Your spending is consistent. Set a savings goal to reduce it by 10% next month!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="analytics-section prediction-section">
          <h2>🔮 Next Month Budget Forecast</h2>
          <p className="no-data-message">
            Create bills for at least 2 months to see budget predictions!
          </p>
        </div>
      )}

      {/* Action Center */}
      <div className="analytics-section action-center">
        <h2>🎯 Recommended Actions</h2>
        <div className="action-list">
          {savingsOpportunity && savingsOpportunity > 100 && (
            <div className="action-item">
              <span className="action-icon">💰</span>
              <div className="action-content">
                <strong>Reduce non-essentials</strong>
                <p>Cut snacks & beverages by 25% to save ₱{savingsOpportunity.toFixed(2)}/month</p>
              </div>
            </div>
          )}
          
          {hasTopItems && top_items.length > 0 && (
            <div className="action-item">
              <span className="action-icon">📦</span>
              <div className="action-content">
                <strong>Buy in bulk</strong>
                <p>You buy {top_items[0].name} often ({top_items[0].purchase_count}x). Consider bulk purchasing!</p>
              </div>
            </div>
          )}

          {budget_prediction?.trend === 'increasing' && (
            <div className="action-item">
              <span className="action-icon">📋</span>
              <div className="action-content">
                <strong>Create a shopping list</strong>
                <p>Stick to a list to avoid impulse purchases and reduce overspending</p>
              </div>
            </div>
          )}

          <div className="action-item">
            <span className="action-icon">🎯</span>
            <div className="action-content">
              <strong>Set a budget goal</strong>
              <p>Aim to spend ₱{((spending_trends?.average || 0) * 0.9).toFixed(2)} per trip (10% less than average)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;