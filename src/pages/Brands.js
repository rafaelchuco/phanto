import React from 'react';
import { Link } from 'react-router-dom';
import { useBrands } from '../hooks/useProducts';
import './Brands.css';

const Brands = () => {
    const { data: brands, isLoading, error } = useBrands();

    if (isLoading) {
        return (
            <div className="brands-page">
                <div className="container loading-container">
                    <div className="spinner"></div>
                    <p>Cargando marcas...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="brands-page">
                <div className="container error-container">
                    <h2>¡Ups! Algo salió mal</h2>
                    <p>No pudimos cargar las marcas. Por favor intenta de nuevo.</p>
                </div>
            </div>
        );
    }

    const rawBrands = brands?.results || brands;
    const brandsList = Array.isArray(rawBrands) ? rawBrands : [];

    return (
        <div className="brands-page">
            <div className="container">
                <div className="brands-header">
                    <h1>Nuestras Marcas</h1>
                    <p>Descubre las mejores marcas con las que trabajamos</p>
                </div>

                {brandsList.length === 0 ? (
                    <div className="empty-state">
                        <p>No hay marcas disponibles en este momento.</p>
                    </div>
                ) : (
                    <div className="brands-grid">
                        {brandsList.map((brand) => (
                            <Link key={brand.id} to={`/productos?marca=${brand.slug}`} className="brand-card">
                                {brand.logo ? (
                                    <img src={brand.logo} alt={brand.name} className="brand-logo" />
                                ) : (
                                    <div className="brand-placeholder">
                                        <span>{(brand.name || '?').charAt(0)}</span>
                                    </div>
                                )}
                                <h3 className="brand-name">{brand.name}</h3>
                                {brand.description && <p className="brand-description">{brand.description}</p>}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Brands;
