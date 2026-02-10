import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './OrderSuccess.css';

const OrderSuccess = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        // Scroll to top on mount
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="order-success-page">
            <div className="success-container">
                <div className="success-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>

                <h1>¡Gracias por tu compra!</h1>
                <p className="success-message">
                    Tu orden ha sido procesada exitosamente.
                </p>

                {orderId && (
                    <div className="order-id-badge">
                        Orden #{orderId}
                    </div>
                )}

                <p className="email-notice">
                    Hemos enviado un correo de confirmación con los detalles de tu pedido.
                </p>

                <div className="success-actions">
                    <button
                        className="btn-primary"
                        onClick={() => navigate('/')}
                    >
                        Volver al Inicio
                    </button>

                    <button
                        className="btn-secondary"
                        onClick={() => navigate('/mis-ordenes')}
                    >
                        Ver Mis Órdenes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
