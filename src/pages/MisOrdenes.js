import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';
import './MisOrdenes.css';

const MisOrdenes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderAPI.getAll();
      setOrders(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError('Error al cargar órdenes');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      processing: 'En Proceso',
      shipped: 'Enviada',
      in_transit: 'En Tránsito',
      delivered: 'Entregada',
      cancelled: 'Cancelada',
      refunded: 'Reembolsada',
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      confirmed: '✅',
      processing: '⚙️',
      shipped: '📦',
      in_transit: '🚚',
      delivered: '✔️',
      cancelled: '❌',
      refunded: '💰',
    };
    return icons[status] || '•';
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const handleCancelOrder = async (orderNumber) => {
    if (window.confirm('¿Estás seguro de que deseas cancelar esta orden?')) {
      try {
        await orderAPI.cancel(orderNumber);
        setError('');
        loadOrders();
      } catch (err) {
        setError('Error al cancelar la orden');
      }
    }
  };

  const handleDownloadInvoice = async (orderNumber) => {
    try {
      await orderAPI.getInvoice(orderNumber);
    } catch (err) {
      setError('Error al descargar la factura');
    }
  };

  if (!user) {
    return (
      <div className="mis-ordenes-page">
        <div className="container">
          <div className="error-container">
            <h2>Debes iniciar sesión</h2>
            <p>Para ver tus órdenes, inicia sesión en tu cuenta</p>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/login')}
            >
              Ir a Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mis-ordenes-page">
      <div className="container">
        <div className="ordenes-header">
          <h1>Mis Órdenes</h1>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/')}
          >
            Continuar Comprando
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <p>Cargando tus órdenes...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-container">
            <div className="empty-icon">📭</div>
            <h2>No tienes órdenes aún</h2>
            <p>Cuando realices tu primera compra, aparecerá aquí</p>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/')}
            >
              Empezar a Comprar
            </button>
          </div>
        ) : (
          <>
            <div className="ordenes-filters">
              <div className="filter-group">
                <label>Filtrar por estado:</label>
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Todas las órdenes</option>
                  <option value="pending">Pendientes</option>
                  <option value="confirmed">Confirmadas</option>
                  <option value="processing">En Proceso</option>
                  <option value="shipped">Enviadas</option>
                  <option value="in_transit">En Tránsito</option>
                  <option value="delivered">Entregadas</option>
                  <option value="cancelled">Canceladas</option>
                </select>
              </div>
              <p className="ordenes-count">
                Mostrando {filteredOrders.length} de {orders.length} órdenes
              </p>
            </div>

            <div className="ordenes-grid">
              {filteredOrders.map((order) => (
                <div key={order.id} className="orden-card">
                  <div className="orden-header-card">
                    <div className="orden-numero">
                      <strong>Orden #{order.order_number}</strong>
                      <span className={`status-badge status-${order.status}`}>
                        {getStatusIcon(order.status)} {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <div className="orden-fecha">
                      {new Date(order.created_at).toLocaleDateString('es-PE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>

                  <div className="orden-items">
                    <strong>Artículos ({order.items?.length || 0})</strong>
                    <div className="items-list">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="item-row">
                          <span className="item-name">{item.product_name || `Producto #${item.product}`}</span>
                          <span className="item-qty">x{item.quantity}</span>
                          <span className="item-price">${parseFloat(item.price || 0).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="orden-totales">
                    <div className="total-row total-final">
                      <strong>Total:</strong>
                      <strong>${parseFloat(order.total || 0).toFixed(2)}</strong>
                    </div>
                    <div className="total-row">
                      <span>Estado de Pago:</span>
                      <span className={order.is_paid ? 'paid' : 'pending'}>
                        {order.is_paid ? '✅ Pagado' : '⏳ Pendiente'}
                      </span>
                    </div>
                  </div>

                  <div className="orden-acciones">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                    >
                      {selectedOrder?.id === order.id ? 'Ocultar Detalles' : 'Ver Detalles'}
                    </button>
                    {['pending', 'confirmed'].includes(order.status) && (
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleCancelOrder(order.order_number)}
                      >
                        Cancelar Orden
                      </button>
                    )}
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleDownloadInvoice(order.order_number)}
                    >
                      📄 Factura
                    </button>
                  </div>

                  {selectedOrder?.id === order.id && (
                    <div className="orden-detalles-expandido">
                      <div className="detalles-seccion">
                        <h4>Información de la Orden</h4>
                        <p><strong>ID:</strong> {order.id}</p>
                        <p><strong>Número:</strong> {order.order_number}</p>
                        <p><strong>Fecha:</strong> {new Date(order.created_at).toLocaleString('es-PE')}</p>
                        <p><strong>Estado:</strong> {getStatusLabel(order.status)}</p>
                        <p><strong>Estado de Pago:</strong> {order.is_paid ? '✅ Pagado' : '⏳ Pendiente'}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MisOrdenes;