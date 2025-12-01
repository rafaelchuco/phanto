import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useCategoryProducts, useCategoryDetail } from '../hooks/useCategories';
import { API_URL, productAPI } from '../services/api';
import { getProductImage } from '../utils/productImages';
import FilterSidebar from '../components/FilterSidebar';
import './ProductosPorCategoria.css';

const ProductosPorCategoria = () => {
  const queryClient = useQueryClient();
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [filters, setFilters] = useState(() => ({
    ordering: searchParams.get('ordering') || '',
    brand: searchParams.get('brand') || '',
    material: searchParams.get('material') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    in_stock: searchParams.get('in_stock') || '',
  }));

  useEffect(() => {
    setFilters({
      ordering: searchParams.get('ordering') || '',
      brand: searchParams.get('brand') || '',
      material: searchParams.get('material') || '',
      min_price: searchParams.get('min_price') || '',
      max_price: searchParams.get('max_price') || '',
      in_stock: searchParams.get('in_stock') || '',
    });
  }, [searchParams]);

  const { data: categoryData, isLoading: categoryLoading } = useCategoryDetail(slug);
  const { data: productsData, isLoading: productsLoading, error } = useCategoryProducts(slug, filters);

  const isLoading = categoryLoading || productsLoading;

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    const newParams = new URLSearchParams();
    if (filters.ordering) {
      newParams.set('ordering', filters.ordering);
    }
    setSearchParams(newParams);
  };

  const handleOrderingChange = (e) => {
    handleFilterChange('ordering', e.target.value);
  };

  const handleProductHover = (productSlug) => {
    if (!productSlug) return;
    queryClient.prefetchQuery({
      queryKey: ['product', productSlug],
      queryFn: () => productAPI.getBySlug(productSlug),
      staleTime: 1000 * 60 * 5,
    });
  };

  if (isLoading) {
    return (
      <div className="productos-categoria-page">
        <div className="container">
          <div className="loading-container">
            <div className="spinner-large"></div>
            <p>Cargando productos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="productos-categoria-page">
        <div className="container">
          <div className="error-container">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h3>Error al cargar productos</h3>
            <p>{error.message}</p>
            <Link to="/categorias" className="btn btn-primary">
              Volver a Categorías
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const productos = productsData?.results || productsData || [];
  const categoria = categoryData || {};

  return (
    <div className="productos-categoria-page fade-in">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Inicio</Link>
          <span>/</span>
          <Link to="/categorias">Categorías</Link>
          <span>/</span>
          <span>{categoria.name}</span>
        </div>

        <div className="categoria-header">
          <div className="categoria-header-content">
            <h1 className="categoria-titulo-page">{categoria.name}</h1>
            {categoria.description && (
              <p className="categoria-description">{categoria.description}</p>
            )}
          </div>
        </div>

        <div className="productos-container-with-filters">
          {/* Sidebar de Filtros - Desktop */}
          <div className="filters-desktop">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              totalProducts={productos.length}
            />
          </div>

          {/* Sidebar de Filtros - Mobile */}
          {showMobileFilters && (
            <>
              <div className="filter-overlay" onClick={() => setShowMobileFilters(false)}></div>
              <div className="filters-mobile mobile-open">
                <div className="mobile-filter-header">
                  <h3>Filtros</h3>
                  <button className="btn-close-filters" onClick={() => setShowMobileFilters(false)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
                <FilterSidebar
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={handleClearFilters}
                  totalProducts={productos.length}
                />
              </div>
            </>
          )}

          {/* Contenido Principal */}
          <div className="productos-main-content">
            {/* Barra de Herramientas */}
            <div className="productos-toolbar">
              <button className="btn-toggle-filters" onClick={() => setShowMobileFilters(true)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="21" x2="4" y2="14" />
                  <line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" />
                  <line x1="20" y1="12" x2="20" y2="3" />
                  <line x1="1" y1="14" x2="7" y2="14" />
                  <line x1="9" y1="8" x2="15" y2="8" />
                  <line x1="17" y1="16" x2="23" y2="16" />
                </svg>
                Filtros
              </button>

              <div className="productos-count-mobile">
                {productos.length} productos
              </div>

              <div className="ordering-select-wrapper">
                <label htmlFor="ordering">Ordenar por:</label>
                <select
                  id="ordering"
                  value={filters.ordering}
                  onChange={handleOrderingChange}
                  className="ordering-select"
                >
                  <option value="">Más relevante</option>
                  <option value="price">Precio: Menor a Mayor</option>
                  <option value="-price">Precio: Mayor a Menor</option>
                  <option value="-average_rating">Mejor valorados</option>
                  <option value="-created_at">Más nuevos</option>
                  <option value="name">Nombre: A-Z</option>
                  <option value="-name">Nombre: Z-A</option>
                </select>
              </div>
            </div>

            {/* Grid de Productos */}
            {productos.length === 0 ? (
              <div className="no-productos">
                <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <h3>No hay productos con estos filtros</h3>
                <p>Intenta ajustar los filtros o borrarlos</p>
                <button className="btn btn-primary" onClick={handleClearFilters}>
                  Limpiar Filtros
                </button>
              </div>
            ) : (
              <div className="productos-grid">
                {productos.map((producto) => (
                  <Link
                    key={producto.id}
                    to={`/producto/${producto.slug}`}
                    className="producto-card"
                    onMouseEnter={() => handleProductHover(producto.slug)}
                  >
                    <div className="producto-imagen">
                      {producto.primary_image || getProductImage(producto.slug) ? (
                        <img
                          src={producto.primary_image ? `${API_URL}${producto.primary_image}` : getProductImage(producto.slug)}
                          alt={producto.name}
                        />
                      ) : (
                        <div className="producto-placeholder">
                          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="M21 15l-5-5L5 21" />
                          </svg>
                        </div>
                      )}
                      {producto.is_new && (
                        <span className="badge-nuevo">Nuevo</span>
                      )}
                      {producto.discount_percentage && parseFloat(producto.discount_percentage) > 0 && (
                        <span className="badge-descuento">-{producto.discount_percentage}%</span>
                      )}
                    </div>

                    <div className="producto-info">
                      <h3 className="producto-nombre">{producto.name}</h3>

                      <div className="producto-rating">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={i < Math.floor(parseFloat(producto.average_rating || 0)) ? 'star filled' : 'star'}
                          >
                            ★
                          </span>
                        ))}
                        <span className="rating-numero">({producto.average_rating || '0.0'})</span>
                      </div>

                      <div className="producto-footer">
                        <div className="producto-precios">
                          {producto.discount_price ? (
                            <>
                              <p className="producto-precio-original">${producto.price}</p>
                              <p className="producto-precio">${producto.final_price}</p>
                            </>
                          ) : (
                            <p className="producto-precio">${producto.price}</p>
                          )}
                        </div>
                        <button className="btn-ver-mas">
                          Ver más →
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductosPorCategoria;