import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './StripePaymentForm.css';

const StripePaymentForm = ({ amount, onSuccess, onError, isProcessing }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    const createPaymentIntent = async () => {
      if (!amount || amount <= 0) {
        console.error('❌ Amount inválido:', amount);
        setErrorMessage('Monto de pago inválido');
        return;
      }

      try {
        const amountInCents = Math.round(amount * 100);
        console.log('🔵 Creando PaymentIntent con amount:', amountInCents, 'centavos ($' + amount + ')');

        const authTokens = localStorage.getItem('authTokens');
        if (!authTokens) {
          throw new Error('No hay token de autenticación');
        }

        const { access } = JSON.parse(authTokens);

        const response = await fetch('http://127.0.0.1:8000/api/orders/create-payment-intent/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access}`,
          },
          body: JSON.stringify({
            amount: amountInCents,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ Error del servidor:', errorData);
          throw new Error(errorData.error || 'Error creando PaymentIntent');
        }

        const data = await response.json();
        console.log('✅ PaymentIntent creado:', data);

        const secret = data.client_secret || data.clientSecret;

        if (!secret) {
          throw new Error('No se recibió client_secret del servidor');
        }
        
        setClientSecret(secret);
      } catch (err) {
        const errorMsg = err.message || 'Error al inicializar el pago';
        console.error('❌ Error en createPaymentIntent:', err);
        setErrorMessage(errorMsg);
        onError(errorMsg);
      }
    };

    createPaymentIntent();
  }, [amount, onError]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      console.log('⚠️ Stripe no listo:', { stripe: !!stripe, elements: !!elements, clientSecret: !!clientSecret });
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const cardElement = elements.getElement(CardElement);

      console.log('🔵 Confirmando pago con Stripe...');

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent.status === 'succeeded') {
        console.log('✅ Pago confirmado con Stripe:', paymentIntent.id);
        onSuccess(paymentIntent.id);
      } else {
        throw new Error('El pago no fue completado. Estado: ' + paymentIntent.status);
      }

    } catch (err) {
      const errorMsg = err.message || 'Error procesando el pago';
      console.error('❌ Error en handleSubmit:', err);
      setErrorMessage(errorMsg);
      onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-payment-form">
      <div className="card-element-wrapper">
        <label>Tarjeta de Crédito/Débito</label>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424242',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#fa755a',
              },
            },
          }}
        />
        <small style={{marginTop: '8px', color: '#666', display: 'block'}}>
          Tarjeta de prueba: 4242 4242 4242 4242
        </small>
      </div>

      {errorMessage && (
        <div className="error-message">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading || isProcessing || !clientSecret}
        className="btn btn-primary btn-pay"
      >
        {!clientSecret ? 'Inicializando pago...' : loading ? 'Procesando pago...' : `Pagar $${amount.toFixed(2)}`}
      </button>

      {!clientSecret && !errorMessage && (
        <small style={{display: 'block', marginTop: '8px', color: '#666', textAlign: 'center'}}>
          Preparando el pago...
        </small>
      )}
    </form>
  );
};

export default StripePaymentForm;