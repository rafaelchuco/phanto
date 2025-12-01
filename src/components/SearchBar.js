import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI, API_URL } from '../services/api';
import './SearchBar.css';

const SearchBar = ({ variant = 'default', placeholder }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsSearching(true);
        try {
          const data = await productAPI.getAll({ search: query });
          const productos = data.results || data || [];
          console.log('🔍 Resultados búsqueda:', productos); // Debug
          setResults(productos.slice(0, 5));
          setShowDropdown(true);
        } catch (error) {
          console.error('Error buscando productos:', error);
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(query.trim())}`);
      setShowDropdown(false);
      setQuery('');
    }
  };

  const handleResultClick = (producto) => {
    console.log('🎯 Producto clickeado:', producto); // Debug
    const slug = producto.slug;

    if (!slug) {
      console.error('❌ Producto sin slug:', producto);
      alert('Error: Producto sin slug');
      return;
    }

    console.log('📍 Navegando a:', `/producto/${slug}`);
    navigate(`/producto/${slug}`);
    setShowDropdown(false);
    setQuery('');
  };

  const highlightText = (text, highlight) => {
    if (!highlight.trim()) return text;
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <mark key={i}>{part}</mark> : part
    );
  };

  return (
    <div className={`search-bar-container ${variant}`} ref={searchRef}>
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          {variant !== 'hero' && (
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          )}
          <input
            type="text"
            className="search-input"
            placeholder={placeholder || "Buscar productos..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim().length >= 2 && setShowDropdown(true)}
          />
          {variant === 'hero' && (
            <button type="submit" className="search-button-hero">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          )}
          {isSearching && (
            <div className="search-spinner">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
          )}
        </div>
      </form>

      {showDropdown && (
        <div className="search-dropdown">
          {results.length > 0 ? (
            <>
              {results.map((product) => (
                <div
                  key={product.id}
                  className="search-result-item"
                  onClick={() => handleResultClick(product)}
                >
                  <div className="search-result-image">
                    {product.primary_image ? (
                      <img src={`${API_URL}${product.primary_image}`} alt={product.name} />
                    ) : (
                      <div className="search-result-placeholder">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="M21 15l-5-5L5 21" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="search-result-info">
                    <h4>{highlightText(product.name, query)}</h4>
                    <p className="search-result-price">${product.final_price || product.price}</p>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="search-view-all"
                onClick={() => {
                  navigate(`/buscar?q=${encodeURIComponent(query.trim())}`);
                  setShowDropdown(false);
                  setQuery('');
                }}
              >
                Ver todos los resultados para "{query}"
              </button>
            </>
          ) : query.trim().length >= 2 && !isSearching ? (
            <div className="search-no-results">
              <p>No se encontraron productos</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;