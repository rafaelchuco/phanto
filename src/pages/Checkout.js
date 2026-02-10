import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { orderAPI } from '../services/api';
import { getProductPrimaryImage } from '../utils/productImages';
import StripePaymentForm from '../components/StripePaymentForm';
import './Checkout.css';

const Checkout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, getTotalPrice, clearCart } = useCart();
  const [step, setStep] = useState('resumen');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: user?.email || '',
    nombre: user?.first_name || '',
    apellido: user?.last_name || '',
    telefono: '',
    ciudad: '',
    provincia: '',
    codigoPostal: '',
    pais: 'Perú',
    direccion: '',
    referencias: '',
    metodoPago: 'tarjeta',
  });

  const [orderNumber, setOrderNumber] = useState(null);

  const cartItems = cart?.items || [];
  const subtotal = getTotalPrice() || 0;
  const envio = subtotal >= 1000 ? 0 : 10;
  const total = subtotal + envio;

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="error-container">
            <p>Tu carrito está vacío</p>
            <Link to="/" className="btn btn-primary">
              Volver a Comprar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.email) return 'Email es requerido';
    if (!formData.nombre) return 'Nombre es requerido';
    if (!formData.apellido) return 'Apellido es requerido';
    if (!formData.telefono) return 'Teléfono es requerido';
    if (!formData.ciudad) return 'Ciudad es requerida';
    if (!formData.provincia) return 'Provincia es requerida';
    if (!formData.codigoPostal) return 'Código postal es requerido';
    if (!formData.direccion) return 'Dirección es requerida';
    return null;
  };

  const handleProceedToPayment = () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setStep('pago');
    setError('');
  };

  const handleProcessPayment = async (paymentIntentId = null) => {
    if (!formData.metodoPago) {
      setError('Selecciona un método de pago');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderData = {
        full_name: `${formData.nombre} ${formData.apellido}`,
        email: formData.email,
        phone: formData.telefono,
        address_line1: formData.direccion,
        city: formData.ciudad,
        state: formData.provincia,
        postal_code: formData.codigoPostal,
        country: formData.pais,
        order_notes: formData.referencias,
        payment_method: formData.metodoPago,
        items: cartItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
      };

      console.log('📦 Enviando orden:', orderData);

      let response;

      if (formData.metodoPago === 'tarjeta' && paymentIntentId) {
        response = await orderAPI.confirmPayment(paymentIntentId, orderData);
      } else {
        response = await orderAPI.create(orderData);
      }

      console.log('✅ Orden creada:', response);

      if (response && response.order_number) {
        setOrderNumber(response.order_number);
      } else {
        setOrderNumber(`ORD-${Date.now()}`);
      }

      // Invalidate queries to refresh stock
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      queryClient.invalidateQueries({ queryKey: ['bestSellers'] });

      clearCart();

      // Redirect to success page
      const finalOrderNumber = response?.order_number || orderNumber || `ORD-${Date.now()}`;
      navigate(`/order-success/${finalOrderNumber}`);

    } catch (err) {
      setError(err.message || 'Error procesando el pago');
      console.error('❌ Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewOrder = () => {
    navigate('/');
  };

  return (
    <div className="checkout-page fade-in">
      <div className="container">
        <div className="checkout-header">
          <h1>Finalizar Compra</h1>
          <div className="checkout-steps">
            <div className={`step ${step === 'resumen' || step === 'datos' || step === 'pago' || step === 'confirmacion' ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">Resumen</div>
            </div>
            <div className={`step-line ${(step === 'datos' || step === 'pago' || step === 'confirmacion') ? 'active' : ''}`}></div>
            <div className={`step ${step === 'datos' || step === 'pago' || step === 'confirmacion' ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Datos</div>
            </div>
            <div className={`step-line ${(step === 'pago' || step === 'confirmacion') ? 'active' : ''}`}></div>
            <div className={`step ${step === 'pago' || step === 'confirmacion' ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-label">Pago</div>
            </div>
            <div className={`step-line ${step === 'confirmacion' ? 'active' : ''}`}></div>
            <div className={`step ${step === 'confirmacion' ? 'active' : ''}`}>
              <div className="step-number">4</div>
              <div className="step-label">Confirmación</div>
            </div>
          </div>
        </div>

        {(step === 'resumen' || step === 'datos' || step === 'pago' || step === 'confirmacion') && (
          <div className="checkout-content">
            <div className="checkout-left">
              <div className="resumen-carrito">
                <h3 className="resumen-titulo">Resumen de tu Compra</h3>

                <div className="resumen-items">
                  {cartItems.map((item) => (
                    <div key={item.id} className="resumen-item">
                      <div className="item-imagen">
                        <img
                          src={getProductPrimaryImage(item.product)}
                          alt={item.product.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/100x100?text=No+Image';
                          }}
                        />
                      </div>
                      <div className="item-detalles">
                        <h4>{item.product.name}</h4>
                        <p className="item-cantidad">Cantidad: {item.quantity}</p>
                        <p className="item-precio">${(item.product.final_price || item.product.price).toFixed(2)} c/u</p>
                      </div>
                      <div className="item-subtotal">
                        ${((item.product.final_price || item.product.price) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="resumen-totales">
                  <div className="total-linea">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="total-linea">
                    <span>Envío</span>
                    <span className={envio === 0 ? 'gratis' : ''}>
                      {envio === 0 ? 'Gratis' : `$${envio.toFixed(2)}`}
                    </span>
                  </div>
                  {subtotal >= 1000 && (
                    <div className="envio-gratis-info">
                      ✓ ¡Envío gratis por compra mayor a $1000!
                    </div>
                  )}
                  <div className="total-linea total">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="checkout-right">
              {step === 'resumen' && (
                <div className="checkout-step-content">
                  <h2>Tu Compra</h2>
                  <p>Se procederá a completar los datos de envío y el pago.</p>
                  <div className="paso-acciones">
                    <button
                      className="btn btn-primary"
                      onClick={() => setStep('datos')}
                    >
                      Continuar con Datos de Envío
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14" />
                        <path d="M12 5l7 7-7 7" />
                      </svg>
                    </button>
                    <Link to="/carrito" className="btn btn-secondary">
                      Volver al Carrito
                    </Link>
                  </div>
                </div>
              )}

              {step === 'datos' && (
                <div className="checkout-step-content">
                  <h2>Datos de Envío</h2>

                  {error && (
                    <div className="error-message">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {error}
                    </div>
                  )}

                  <form className="checkout-form">
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="tu@email.com"
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Nombre</label>
                        <input
                          type="text"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleInputChange}
                          placeholder="Juan"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Apellido</label>
                        <input
                          type="text"
                          name="apellido"
                          value={formData.apellido}
                          onChange={handleInputChange}
                          placeholder="Pérez"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Teléfono</label>
                      <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        placeholder="+56912345678"
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Ciudad</label>
                        <input
                          type="text"
                          name="ciudad"
                          value={formData.ciudad}
                          onChange={handleInputChange}
                          placeholder="Santiago"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Provincia</label>
                        <input
                          type="text"
                          name="provincia"
                          value={formData.provincia}
                          onChange={handleInputChange}
                          placeholder="Metropolitana"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Código Postal</label>
                        <input
                          type="text"
                          name="codigoPostal"
                          value={formData.codigoPostal}
                          onChange={handleInputChange}
                          placeholder="8320000"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>País</label>
                        <input
                          type="text"
                          name="pais"
                          value={formData.pais}
                          onChange={handleInputChange}
                          placeholder="Perú"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Dirección</label>
                      <input
                        type="text"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleInputChange}
                        placeholder="Calle Principal 123, Apartamento 4"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Referencias o Notas (opcional)</label>
                      <textarea
                        name="referencias"
                        value={formData.referencias}
                        onChange={handleInputChange}
                        placeholder="Ej: Casa con portón gris, timbre izquierdo"
                        rows="3"
                      />
                    </div>
                  </form>

                  <div className="paso-acciones">
                    <button
                      className="btn btn-primary"
                      onClick={handleProceedToPayment}
                    >
                      Proceder al Pago
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14" />
                        <path d="M12 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setStep('resumen')}
                    >
                      Volver
                    </button>
                  </div>
                </div>
              )}

              {step === 'pago' && (
                <div className="checkout-step-content">
                  <h2>Método de Pago</h2>

                  {error && (
                    <div className="error-message">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {error}
                    </div>
                  )}

                  <div className="metodos-pago">
                    <label className="metodo-pago">
                      <input
                        type="radio"
                        name="metodoPago"
                        value="tarjeta"
                        checked={formData.metodoPago === 'tarjeta'}
                        onChange={handleInputChange}
                      />
                      <div className="metodo-contenido">
                        <div className="metodo-icon">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                            <line x1="1" y1="10" x2="23" y2="10" />
                          </svg>
                        </div>
                        <div className="metodo-info">
                          <h4>Tarjeta de Crédito/Débito</h4>
                          <p>Visa, Mastercard, Diners Club</p>
                        </div>
                      </div>
                    </label>

                    {formData.metodoPago === 'tarjeta' && (
                      <div className="stripe-container">
                        <StripePaymentForm
                          amount={total}
                          onSuccess={(paymentIntentId) => {
                            console.log('✅ Pago exitoso:', paymentIntentId);
                            handleProcessPayment(paymentIntentId);
                          }}
                          onError={(error) => {
                            console.error('❌ Error de pago:', error);
                          }}
                          isProcessing={loading}
                        />
                      </div>
                    )}

                    <label className="metodo-pago">
                      <input
                        type="radio"
                        name="metodoPago"
                        value="transferencia"
                        checked={formData.metodoPago === 'transferencia'}
                        onChange={handleInputChange}
                      />
                      <div className="metodo-contenido">
                        <div className="metodo-icon">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="16" y1="21" x2="16" y2="3" />
                            <line x1="8" y1="21" x2="8" y2="3" />
                            <line x1="12" y1="17" x2="8" y2="13" />
                            <line x1="12" y1="17" x2="16" y2="13" />
                          </svg>
                        </div>
                        <div className="metodo-info">
                          <h4>Transferencia Bancaria</h4>
                          <p>Transfe a nuestra cuenta bancaria</p>
                        </div>
                      </div>
                    </label>

                    <label className="metodo-pago">
                      <input
                        type="radio"
                        name="metodoPago"
                        value="efectivo"
                        checked={formData.metodoPago === 'efectivo'}
                        onChange={handleInputChange}
                      />
                      <div className="metodo-contenido">
                        <div className="metodo-icon">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="1" />
                            <path d="M12 1v6m0 6v6" />
                            <circle cx="12" cy="12" r="8" />
                          </svg>
                        </div>
                        <div className="metodo-info">
                          <h4>Efectivo en Entrega</h4>
                          <p>Paga al recibir tu compra</p>
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="info-seguridad">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <p>Tus datos de pago están protegidos con encriptación SSL</p>
                  </div>

                  <div className="paso-acciones">
                    {formData.metodoPago !== 'tarjeta' && (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleProcessPayment()}
                        disabled={loading}
                      >
                        {loading ? 'Procesando...' : 'Completar Compra'}
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </button>
                    )}
                    <button
                      className="btn btn-secondary"
                      onClick={() => setStep('datos')}
                      disabled={loading}
                    >
                      Volver
                    </button>
                  </div>
                </div>
              )}

              {step === 'confirmacion' && (
                <div className="checkout-step-content confirmacion">
                  <div className="confirmacion-icon">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h2>¡Compra Confirmada!</h2>
                  <p className="confirmacion-subtitulo">Número de Orden: #{orderNumber || 'PROCESANDO...'}</p>

                  <div className="confirmacion-detalles">
                    <h4>Detalles del Pedido</h4>
                    <div className="detalles-item">
                      <span>Dirección de Envío:</span>
                      <p>{formData.direccion}, {formData.ciudad}, {formData.provincia}</p>
                    </div>
                    <div className="detalles-item">
                      <span>Teléfono de Contacto:</span>
                      <p>{formData.telefono}</p>
                    </div>
                    <div className="detalles-item">
                      <span>Método de Pago:</span>
                      <p className="capitalize">
                        {formData.metodoPago === 'tarjeta' && 'Tarjeta de Crédito/Débito'}
                        {formData.metodoPago === 'transferencia' && 'Transferencia Bancaria'}
                        {formData.metodoPago === 'efectivo' && 'Efectivo en Entrega'}
                      </p>
                    </div>
                    <div className="detalles-item">
                      <span>Total a Pagar:</span>
                      <p className="total-amount">${total.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="confirmacion-mensaje">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <p>Se ha enviado un correo de confirmación a <strong>{formData.email}</strong></p>
                  </div>

                  <div className="paso-acciones">
                    <button
                      className="btn btn-primary"
                      onClick={handleNewOrder}
                    >
                      Continuar Comprando
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14" />
                        <path d="M12 5l7 7-7 7" />
                      </svg>
                    </button>
                    <Link to="/perfil" className="btn btn-secondary">
                      Ver Mis Órdenes
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;