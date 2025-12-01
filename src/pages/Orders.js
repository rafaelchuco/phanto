import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../hooks/useOrders';
import { getImageUrl } from '../utils/productImages';
import OrderProductImage from '../components/OrderProductImage';
import './Orders.css';

const Orders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Use the new hook
  const {
    useGetOrders,
    cancelOrderAsync,
    isCancelling
  } = useOrders();

  const { data: ordersData, isLoading: loading, error: queryError, refetch } = useGetOrders();

  // Local error state for non-query errors (like download failures)
  const [actionError, setActionError] = useState('');

  const toggleDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleCancelOrder = async (orderNumber) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta orden?')) {
      return;
    }
    try {
      await cancelOrderAsync(orderNumber);
      setActionError('');
      // Refetch is handled automatically by the hook's invalidation
    } catch (err) {
      console.error('Error cancelling order:', err);
      setActionError('Error al cancelar la orden');
    }
  };

  const handleDownloadInvoice = async (orderNumber) => {
    try {
      // Direct fetch for blob download as it's a specific file handling case
      // or we could add a specific hook method if we wanted to abstract this further
      const response = await fetch(`http://127.0.0.1:8000/api/orders/${orderNumber}/invoice/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')).access : ''}`
        }
      });

      if (!response.ok) throw new Error('Error downloading invoice');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura-${orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setActionError('');
    } catch (err) {
      console.error('Error downloading invoice:', err);
      setActionError('Error al descargar la factura');
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      processing: 'En Preparación',
      shipped: 'Enviada',
      in_transit: 'En Tránsito',
      delivered: 'Entregada',
      cancelled: 'Cancelada',
      refunded: 'Reembolsada',
    };
    return labels[status] || status;
  };

  const orders = Array.isArray(ordersData) ? ordersData : (ordersData?.results || []);

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(order => order.status === filterStatus);

  if (!user) {
    return null;
  }

  return (
    <div className="orders-page">
      <div className="container">
        <div className="orders-header">
          <h1>Mis Órdenes</h1>
          <p className="subtitle">Historial de tus compras</p>
        </div>

        {(queryError || actionError) && (
          <div className="alert alert-error">
            <span>{actionError || 'Error al cargar las órdenes'}</span>
          </div>
        )}

        <div className="filters">
          <div className="filter-group">
            <label>Filtrar por estado:</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">Todas las órdenes</option>
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmada</option>
              <option value="processing">En Preparación</option>
              <option value="shipped">Enviada</option>
              <option value="delivered">Entregada</option>
            </select>
          </div>
          <div className="stats">
            <span className="stat-item">
              <strong>{filteredOrders.length}</strong> órdenes
            </span>
            <span className="stat-item">
              Total: <strong>${filteredOrders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0).toFixed(2)}</strong>
            </span>
          </div>
        </div>

        {loading ? (
          <div className="loading">Cargando órdenes...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: '20px', opacity: 0.3 }}>
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <h3>No tienes órdenes {filterStatus !== 'all' ? 'con este estado' : 'aún'}</h3>
            <p>
              {filterStatus !== 'all'
                ? 'Intenta cambiar el filtro para ver otras órdenes'
                : 'Comienza a comprar para ver tus órdenes aquí'}
            </p>
            {filterStatus === 'all' && (
              <button
                className="btn btn-primary"
                onClick={() => navigate('/')}
                style={{ marginTop: '20px' }}
              >
                Ir a Comprar
              </button>
            )}
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Orden #{order.order_number}</h3>
                    <p className="order-date">
                      {new Date(order.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div className={`order-status status-${order.status}`}>
                    {getStatusLabel(order.status)}
                  </div>
                </div>

                <div className="order-items">
                  <h4>Productos:</h4>
                  {order.items && order.items.map((item, idx) => {
                    return (
                      <div key={idx} className="item-row">
                        <div className="item-image">
                          <OrderProductImage
                            productId={item.product}
                            productName={item.product_name}
                            fallbackImage={getImageUrl(item.product_image || item.image)}
                          />
                        </div>
                        <div className="item-details">
                          <span className="item-name">{item.product_name}</span>
                          <span className="item-qty">x{item.quantity}</span>
                        </div>
                        <span className="item-price">${parseFloat(item.subtotal).toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>

                {expandedOrder === order.id && (
                  <div className="order-details-expanded fade-in">
                    <div className="detail-group">
                      <h5>Dirección de Envío</h5>
                      <p>{order.address_line1}</p>
                      <p>{order.city}, {order.state} {order.postal_code}</p>
                      <p>{order.country}</p>
                    </div>
                    <div className="detail-group">
                      <h5>Método de Pago</h5>
                      <p className="capitalize">
                        {order.payment_method === 'tarjeta' && 'Tarjeta de Crédito/Débito'}
                        {order.payment_method === 'transferencia' && 'Transferencia Bancaria'}
                        {order.payment_method === 'efectivo' && 'Efectivo en Entrega'}
                        {!['tarjeta', 'transferencia', 'efectivo'].includes(order.payment_method) && order.payment_method}
                      </p>
                    </div>
                    {order.phone && (
                      <div className="detail-group">
                        <h5>Contacto</h5>
                        <p>{order.phone}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="order-footer">
                  <div className="order-total">
                    Total: <strong>${parseFloat(order.total).toFixed(2)}</strong>
                  </div>

                  <div className="order-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={() => toggleDetails(order.id)}
                    >
                      {expandedOrder === order.id ? 'Ocultar Detalles' : 'Ver Detalles'}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleDownloadInvoice(order.order_number)}
                    >
                      Factura
                    </button>
                    {(order.status === 'pending' || order.status === 'confirmed') && (
                      <button
                        className="btn btn-danger"
                        onClick={() => handleCancelOrder(order.order_number)}
                        disabled={isCancelling}
                      >
                        {isCancelling ? 'Cancelando...' : 'Cancelar'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div >
  );
};

export default Orders;
