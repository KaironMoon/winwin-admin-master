import { authenticatedFetch } from './authUtils';
import config from '../config';

/**
 * Order Display API Service
 * Handles fetching pending orders and order history from the server
 */

/**
 * Fetch pending orders for a bot
 * @param {number} botId - The bot ID
 * @returns {Promise<Object>} Pending orders response
 */
export const fetchPendingOrders = async (botId) => {
  try {
    const response = await authenticatedFetch(
      `${config.API_BASE_URL}/api/order-display/pending/${botId}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `Failed to fetch pending orders: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching pending orders:', error);
    throw error;
  }
};

/**
 * Fetch order history for a bot
 * @param {number} botId - The bot ID
 * @param {number} limit - Number of orders to fetch (default: 50, max: 200)
 * @param {number} offset - Starting position (default: 0)
 * @returns {Promise<Object>} Order history response
 */
export const fetchOrderHistory = async (botId, limit = 50, offset = 0) => {
  try {
    const params = new URLSearchParams({
      limit: Math.min(limit, 200).toString(),
      offset: offset.toString()
    });

    const response = await authenticatedFetch(
      `${config.API_BASE_URL}/api/order-display/history/${botId}?${params}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `Failed to fetch order history: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching order history:', error);
    throw error;
  }
};

/**
 * Categorize pending orders into entry, take_profit, stop_loss, and cycle orders
 * @param {Object} pendingOrdersData - The pending orders response from API
 * @returns {Object} Categorized orders
 */
export const categorizePendingOrders = (pendingOrdersData) => {
  const categorized = {
    entry: [],
    take_profit: [],
    stop_loss: [],
    cycle: [] // 순환매 주문 (reverse/martingale orders)
  };

  if (!pendingOrdersData) return categorized;


  // Categorize pending entry orders
  // bot_order_type: 1=TP_SL(익절/손절), 2=MARTINGALE(진입), 3=RISK_MANAGE(순환매)
  if (pendingOrdersData.pending_orders) {
    pendingOrdersData.pending_orders.forEach(order => {

      // Use bot_order_type if available (convert to number in case it's a string)
      const botOrderType = order.bot_order_type ? Number(order.bot_order_type) : null;

      if (botOrderType) {
        switch (botOrderType) {
          case 1: // TP_SL (익절/손절)
            // This shouldn't appear in pending_orders, but handle it just in case
            if (order.side === 'buy' || order.price > pendingOrdersData.current_price) {
              categorized.take_profit.push(order);
            } else {
              categorized.stop_loss.push(order);
            }
            break;
          case 2: // MARTINGALE (진입)
            categorized.entry.push(order);
            break;
          case 3: // RISK_MANAGE (순환매)
            categorized.cycle.push(order);
            break;
          default:
            // Fallback to entry if unknown type
            categorized.entry.push(order);
        }
      } else {
        // Fallback logic if bot_order_type is not provided
        const isLongPosition = pendingOrdersData.direction === 'long';
        const isShortPosition = pendingOrdersData.direction === 'short';

        // Check if it's a cycle order based on position direction and order side
        // Long position with sell order (not conditional/trigger) = cycle order
        // Short position with buy order (not conditional/trigger) = cycle order
        const isCycleByDirection =
          (isLongPosition && order.side === 'sell' && order.order_type !== 'conditional' && order.order_type !== 'trigger') ||
          (isShortPosition && order.side === 'buy' && order.order_type !== 'conditional' && order.order_type !== 'trigger');

        if (isCycleByDirection) {
          categorized.cycle.push(order);
        } else if (order.entry_label && (
          order.entry_label.toLowerCase().includes('reverse') ||
          order.entry_label.toLowerCase().includes('martingale') ||
          order.entry_label.toLowerCase().includes('cycle')
        )) {
          categorized.cycle.push(order);
        } else if (order.entry_step && order.entry_step > 5) {
          categorized.cycle.push(order);
        } else {
          categorized.entry.push(order);
        }
      }
    });
  }

  // Categorize TP/SL orders
  if (pendingOrdersData.tp_sl_orders) {
    pendingOrdersData.tp_sl_orders.forEach(order => {
      if (order.type === 'tp') {
        categorized.take_profit.push(order);
      } else if (order.type === 'sl') {
        categorized.stop_loss.push(order);
      }
    });
  }

  return categorized;
};

/**
 * Format order data for display
 * @param {Object} order - Raw order data
 * @param {string} type - Order type (pending/history)
 * @returns {Object} Formatted order data
 */
export const formatOrderForDisplay = (order, type = 'pending') => {
  if (type === 'pending') {
    return {
      id: order.order_id,
      side: order.side,
      price: order.price,
      size: order.size,
      notional: order.notional,
      orderType: order.order_type,
      createdAt: new Date(parseInt(order.created_at)),
      entryStep: order.entry_step,
      entryLabel: order.entry_label,
      percentage: order.percentage,
      type: order.type // tp or sl
    };
  } else {
    // For history orders
    return {
      id: order.order_id || order.algo_order_id,
      side: order.side,
      price: order.price,
      size: order.size,
      filledSize: order.filled_size,
      notional: order.notional,
      orderType: order.order_type,
      status: order.status,
      createdAt: new Date(parseInt(order.created_at)),
      updatedAt: new Date(parseInt(order.updated_at)),
      entryStep: order.entry_step,
      entryLabel: order.entry_label
    };
  }
};