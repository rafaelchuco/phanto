
import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useBestSellers, useNewProducts, useFeaturedProducts } from '../hooks/useProducts';
import { getProductPrimaryImage } from '../utils/productImages';
import { productAPI } from '../services/api';
import './Home.css';

const Home = () => {
  const [searchParams] = useSearchParams();
  const { wishlist } = useCart();

  const { data: bestSellers, isLoading: loadingBestSellers } = useBestSellers();
  const { data: newProducts, isLoading: loadingNew } = useNewProducts();
  const { data: featuredProducts, isLoading: loadingFeatured } = useFeaturedProducts();

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce Search Effect
  React.useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const data = await productAPI.getAll({ search: searchQuery });
          setSearchResults((data.results || data || []).slice(0, 5));
          setShowDropdown(true);
        } catch (error) {
          console.error('Error searching:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  // Close dropdown on click outside
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.hero-search')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);



  if (loadingBestSellers || loadingNew || loadingFeatured) {
    return (
      <div className="loading-container">
        <p>Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Haz Tu Interior Más
              <span className="hero-accent"> Minimalista y Moderno</span>
            </h1>
            <p className="hero-subtitle">
              Transforma tu espacio con planta de una manera más minimalista y moderna con facilidad y rapidez
            </p>
            <div className="hero-search" style={{ position: 'relative' }}>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  window.location.href = `/productos?search=${encodeURIComponent(searchQuery)}`;
                }
              }} style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Buscar muebles"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim().length >= 2 && setShowDropdown(true)}
                />
                <button type="submit">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </button>
              </form>

              {showDropdown && (
                <div className="search-dropdown" style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '12px',
                  background: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  zIndex: 100,
                  overflow: 'hidden'
                }}>
                  {isSearching ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: '#636e72' }}>Buscando...</div>
                  ) : searchResults.length > 0 ? (
                    <>
                      {searchResults.map((product) => (
                        <Link
                          key={product.id}
                          to={`/producto/${product.slug}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 16px',
                            borderBottom: '1px solid #f1f2f6',
                            textDecoration: 'none',
                            color: 'inherit',
                            gap: '12px'
                          }}
                        >
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            background: '#f1f2f6',
                            flexShrink: 0
                          }}>
                            <img
                              src={getProductPrimaryImage(product)}
                              alt={product.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://placehold.co/40x40?text=...';
                              }}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#2d3436' }}>{product.name}</div>
                            <div style={{ fontSize: '0.9rem', color: '#e67e22', fontWeight: 700 }}>${product.final_price || product.price}</div>
                          </div>
                        </Link>
                      ))}
                      <button
                        onClick={() => window.location.href = `/productos?search=${encodeURIComponent(searchQuery)}`}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: '#f8f9fa',
                          border: 'none',
                          color: '#2d3436',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        Ver todos los resultados
                      </button>
                    </>
                  ) : searchQuery.trim().length >= 2 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: '#636e72' }}>No se encontraron productos</div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>





      <section id="productos" className="productos-section">
        <div className="container">

          {/* Featured Section */}
          {featuredProducts && featuredProducts.length > 0 && (
            <div className="featured-section mb-12">
              <h2 className="section-title text-left mb-6">Destacados</h2>
              <div className="productos-grid">
                {featuredProducts.slice(0, 4).map((producto) => (
                  <ProductCard key={producto.id} producto={producto} wishlist={wishlist} />
                ))}
              </div>
            </div>
          )}

          {/* New Arrivals Section */}
          {newProducts && newProducts.length > 0 && (
            <div className="new-arrivals-section mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="section-title text-left">Nuevos Lanzamientos</h2>
                <Link to="/?sort=new" className="text-primary font-semibold hover:underline">Ver todos</Link>
              </div>
              <div className="productos-grid">
                {newProducts.slice(0, 4).map((producto) => (
                  <ProductCard key={producto.id} producto={producto} wishlist={wishlist} />
                ))}
              </div>
            </div>
          )}

          {/* Best Sellers Section */}
          {bestSellers && bestSellers.length > 0 && (
            <div className="best-sellers-section mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="section-title text-left">Más Vendidos</h2>
                <Link to="/?sort=bestsellers" className="text-primary font-semibold hover:underline">Ver todos</Link>
              </div>
              <div className="productos-grid">
                {bestSellers.slice(0, 4).map((producto) => (
                  <ProductCard key={producto.id} producto={producto} wishlist={wishlist} />
                ))}
              </div>
            </div>
          )}

        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 7h-9" />
                  <path d="M14 17H5" />
                  <circle cx="17" cy="17" r="3" />
                  <circle cx="7" cy="7" r="3" />
                </svg>
              </div>
              <h3>Envío Gratis</h3>
              <p>En compras mayores a $1000</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3>Garantía Extendida</h3>
              <p>2 años en todos los productos</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <h3>Entrega Rápida</h3>
              <p>Recibe en 24-48 horas</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </div>
              <h3>Devoluciones Fáciles</h3>
              <p>30 días para devoluciones</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Helper component for rendering product cards to avoid duplication
const ProductCard = ({ producto, wishlist }) => {
  const { addToWishlistAsync, removeWishlistItemAsync, isAddingToWishlist, isRemovingWishlist } = useCart();
  const slugOrId = producto.slug || producto.id;
  const image = getProductPrimaryImage(producto);
  const categoryName = producto.category?.name || producto.category || '';
  const price = producto.final_price || producto.price || 0;
  const rating = producto.average_rating || '0.0';

  return (
    <Link
      to={`/producto/${slugOrId}`}
      className="producto-card"
    >
      <div className="producto-imagen">
        <img
          src={image}
          alt={producto.name || 'Producto'}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/600x400?text=No+Image';
          }}
        />
        <button
          className={`btn-wishlist-card ${wishlist?.results?.some(item => item.product.id === producto.id) ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const inWishlist = wishlist?.results?.find(item => item.product.id === producto.id);
            if (inWishlist) {
              removeWishlistItemAsync(inWishlist.id);
            } else {
              addToWishlistAsync(producto.id);
            }
          }}
          disabled={isAddingToWishlist || isRemovingWishlist}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={wishlist?.results?.some(item => item.product.id === producto.id) ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
        {producto.is_new && <span className="badge-nuevo-small">Nuevo</span>}
        {producto.discount_percentage > 0 && <span className="badge-descuento-small">-{producto.discount_percentage}%</span>}
      </div>

      <div className="producto-info">
        <div className="producto-categoria-tag">{categoryName}</div>
        <h3 className="producto-nombre">{producto.name || 'Producto'}</h3>

        <div className="producto-rating">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={i < Math.floor(parseFloat(rating)) ? 'star filled' : 'star'}>★</span>
          ))}
          <span className="rating-numero">({rating})</span>
        </div>

        <div className="producto-footer">
          <div className="producto-precios">
            {producto.discount_price ? (
              <>
                <p className="producto-precio-original">${producto.price}</p>
                <p className="producto-precio">${price}</p>
              </>
            ) : (
              <p className="producto-precio">${price}</p>
            )}
          </div>
          <button className="btn-ver-mas">Ver más →</button>
        </div>
      </div>
    </Link>
  );
};

export default Home;