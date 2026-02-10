import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getProductPrimaryImage } from '../utils/productImages';
import './Wishlist.css';

const Wishlist = () => {
    const {
        wishlist,
        wishlistLoading,
        wishlistError,
        removeWishlistItemAsync,
        moveWishlistItemToCartAsync,
        isRemovingWishlist,
        isMovingWishlist
    } = useCart();

    const handleMoveToCart = async (id) => {
        try {
            await moveWishlistItemToCartAsync(id);
        } catch (error) {
            console.error('Error moving to cart:', error);
        }
    };

    const handleRemove = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este producto de tu lista de deseos?')) {
            try {
                await removeWishlistItemAsync(id);
            } catch (error) {
                console.error('Error removing from wishlist:', error);
            }
        }
    };

    if (wishlistLoading) {
        return (
            <div className="wishlist-page">
                <div className="container loading-container">
                    <div className="spinner"></div>
                    <p>Cargando tu lista de deseos...</p>
                </div>
            </div>
        );
    }

    if (wishlistError) {
        return (
            <div className="wishlist-page">
                <div className="container error-container">
                    <h2>¡Ups! Algo salió mal</h2>
                    <p>No pudimos cargar tu lista de deseos. Por favor intenta de nuevo.</p>
                </div>
            </div>
        );
    }

    const items = wishlist?.results || wishlist || [];

    return (
        <div className="wishlist-page">
            <div className="container">
                <div className="wishlist-header">
                    <h1>Mi Lista de Deseos</h1>
                    <p>{items.length} productos guardados</p>
                </div>

                {items.length === 0 ? (
                    <div className="empty-wishlist">
                        <div className="empty-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </div>
                        <h2>Tu lista de deseos está vacía</h2>
                        <p>Guarda los productos que más te gusten para comprarlos después.</p>
                        <Link to="/" className="btn-explore">
                            Explorar Productos
                        </Link>
                    </div>
                ) : (
                    <div className="wishlist-grid">
                        {items.map((item) => {
                            const product = item.product;
                            const imageSrc = getProductPrimaryImage(product);

                            return (
                                <div key={item.id} className="wishlist-card">
                                    <Link to={`/producto/${product.slug}`} className="wishlist-image">
                                        <img
                                            src={imageSrc}
                                            alt={product.name}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://placehold.co/300x300?text=No+Image';
                                            }}
                                        />
                                        {product.stock === 0 && (
                                            <span className="badge-out-of-stock">Sin Stock</span>
                                        )}
                                    </Link>

                                    <div className="wishlist-content">
                                        <Link to={`/producto/${product.slug}`} className="product-title">
                                            {product.name}
                                        </Link>
                                        <div className="product-price">
                                            ${parseFloat(product.final_price || product.price).toFixed(2)}
                                        </div>

                                        <div className="wishlist-actions">
                                            <button
                                                className="btn-move-cart"
                                                onClick={() => handleMoveToCart(item.id)}
                                                disabled={isMovingWishlist || product.stock === 0}
                                            >
                                                {product.stock === 0 ? 'Sin Stock' : 'Mover al Carrito'}
                                            </button>
                                            <button
                                                className="btn-remove"
                                                onClick={() => handleRemove(item.id)}
                                                disabled={isRemovingWishlist}
                                                title="Eliminar de la lista"
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M3 6h18"></path>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
