import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useCart } from '../context/CartContext';
import { getAllProducts, getAllCategories, productAPI } from '../services/api';
import { getProductPrimaryImage } from '../utils/productImages';
import './Products.css';

const Products = () => {
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const categoriaParam = searchParams.get('categoria');
    const {
        wishlist,
        addToWishlistAsync,
        removeWishlistItemAsync,
        isAddingToWishlist,
        isRemovingWishlist
    } = useCart();

    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [categoriaActiva, setCategoriaActiva] = useState(categoriaParam || 'todos');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Paginación frontend
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 12;

    useEffect(() => {
        const fetchProductos = async () => {
            setLoading(true);
            setError(null);

            try {
                // Obtener todos los productos usando paginación
                let allProducts = [];
                let page = 1;
                let hasMore = true;

                while (hasMore) {
                    try {
                        const response = await getAllProducts({ page, page_size: 100 });
                        const results = response.results || response || [];

                        if (results.length === 0) {
                            break; // No hay más productos
                        }

                        allProducts = [...allProducts, ...results];

                        // Verificar si hay más páginas
                        hasMore = response.next !== null;
                        page++;
                    } catch (pageError) {
                        console.log(`Paginación detenida en página ${page}: `, pageError.message);
                        break;
                    }
                }

                let filteredProducts = allProducts;

                if (categoriaParam && categoriaParam !== 'todos') {
                    filteredProducts = allProducts.filter(p => {
                        const categorySlug = p.category?.slug || '';
                        return categorySlug === categoriaParam;
                    });
                }

                const marcaParam = searchParams.get('brand') || searchParams.get('marca');
                if (marcaParam) {
                    filteredProducts = filteredProducts.filter(p => {
                        const brandSlug = p.brand?.slug || '';
                        return brandSlug === marcaParam;
                    });
                }

                setProductos(filteredProducts);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProductos();
    }, [categoriaParam, searchParams]);

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const data = await getAllCategories();
                let cats = data.results || data || [];

                if (cats.length > 0 && typeof cats[0] === 'string') {
                    const slugify = (s) =>
                        s
                            .toLowerCase()
                            .replace(/\s+/g, '-')
                            .replace(/[^a-z0-9-]/g, '');

                    cats = cats.map((name, idx) => ({ id: idx + 1, slug: slugify(name), name, product_count: 0 }));
                }

                setCategorias(cats);
            } catch (err) {
                console.error('Error al cargar categorías:', err);
            }
        };

        fetchCategorias();
    }, []);

    const navigate = useNavigate();
    const filtrarPorCategoria = (categoriaSlug) => {
        setCategoriaActiva(categoriaSlug);
        if (categoriaSlug === 'todos') {
            navigate('/productos');
        } else {
            navigate(`/productos?categoria=${categoriaSlug}`);
        }
    };

    const handleProductHover = (slug) => {
        if (!slug) return;
        queryClient.prefetchQuery({
            queryKey: ['product', slug],
            queryFn: () => productAPI.getBySlug(slug),
            staleTime: 1000 * 60 * 5,
        });
    };

    if (loading) {
        return (
            <div className="loading-container">
                <p>Cargando productos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p>Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="products-page">
            <div className="container">
                <div className="productos-header mt-12">
                    <div>
                        <h2 className="section-title">
                            {(() => {
                                const marcaParam = searchParams.get('brand') || searchParams.get('marca');
                                if (marcaParam) {
                                    // Intentar encontrar el nombre de la marca en los productos filtrados
                                    const brandName = productos.find(p => p.brand?.slug === marcaParam)?.brand?.name;
                                    return brandName ? `Productos de ${brandName}` : `Productos de ${marcaParam}`;
                                }
                                return categoriaActiva === 'todos' ? 'Todos los Productos' :
                                    categorias.find(c => c.slug === categoriaActiva)?.name || 'Productos';
                            })()}
                        </h2>
                        <p className="section-subtitle">
                            {productos.length} productos disponibles
                        </p>
                    </div>

                    <div className="filtros">
                        <button
                            className={`filtro-btn ${categoriaActiva === 'todos' ? 'active' : ''}`}
                            onClick={() => {
                                filtrarPorCategoria('todos');
                                setCurrentPage(1);
                            }}
                        >
                            Todos
                        </button>
                        {categorias.map((cat) => (
                            <Link
                                key={cat.id}
                                to={`/productos?categoria=${cat.slug}`}
                                className={`filtro-btn ${categoriaActiva === cat.slug ? 'active' : ''}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    filtrarPorCategoria(cat.slug);
                                    setCurrentPage(1);
                                }}
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="productos-grid">
                    {productos
                        .slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage)
                        .map((producto) => {
                            const slugOrId = producto.slug || producto.id;
                            const image = getProductPrimaryImage(producto);
                            const categoryName = producto.category?.name || producto.category || '';
                            const price = producto.final_price || producto.price || 0;
                            const rating = producto.average_rating || '0.0';

                            return (
                                <Link
                                    key={producto.id || slugOrId}
                                    to={`/producto/${slugOrId}`}
                                    className="producto-card"
                                    onMouseEnter={() => handleProductHover(producto.slug)}
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
                        })}
                </div>

                {/* Controles de Paginación */}
                {productos.length > productsPerPage && (
                    <div className="pagination-controls">
                        <button
                            className="pagination-btn"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            ← Anterior
                        </button>

                        <div className="pagination-info">
                            Página {currentPage} de {Math.ceil(productos.length / productsPerPage)}
                        </div>

                        <button
                            className="pagination-btn"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(productos.length / productsPerPage)))}
                            disabled={currentPage === Math.ceil(productos.length / productsPerPage)}
                        >
                            Siguiente →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
