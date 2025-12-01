import React, { useState, useEffect } from 'react';
import { useBrands } from '../hooks/useBrands';
import { useMaterials } from '../hooks/useMaterials';
import { API_URL } from '../services/api';
import './FilterSidebar.css';

const FilterSidebar = ({ filters, onFilterChange, onClearFilters, totalProducts }) => {
  const { data: brands = [], isLoading: brandsLoading } = useBrands();
  const { data: materials = [], isLoading: materialsLoading } = useMaterials();

  const [priceRange, setPriceRange] = useState({
    min: filters.min_price || '',
    max: filters.max_price || ''
  });

  useEffect(() => {
    setPriceRange({
      min: filters.min_price || '',
      max: filters.max_price || ''
    });
  }, [filters.min_price, filters.max_price]);

  const handleBrandChange = (brandSlug) => {
    const currentBrands = filters.brand ? filters.brand.split(',') : [];
    const newBrands = currentBrands.includes(brandSlug)
      ? currentBrands.filter(b => b !== brandSlug)
      : [...currentBrands, brandSlug];
    
    onFilterChange('brand', newBrands.length > 0 ? newBrands.join(',') : '');
  };

  const handleMaterialChange = (materialId) => {
    const currentMaterials = filters.material ? filters.material.split(',') : [];
    const newMaterials = currentMaterials.includes(materialId.toString())
      ? currentMaterials.filter(m => m !== materialId.toString())
      : [...currentMaterials, materialId.toString()];
    
    onFilterChange('material', newMaterials.length > 0 ? newMaterials.join(',') : '');
  };

  // ✅ CAMBIADO: Solo actualizar el estado local, no la URL
  const handlePriceInputChange = (type, value) => {
    setPriceRange(prev => ({ ...prev, [type]: value }));
  };

  // ✅ NUEVO: Aplicar filtro solo cuando sale del input (onBlur)
  const handlePriceBlur = (type) => {
    const value = priceRange[type];
    const newValue = value === '' ? '' : parseFloat(value);
    
    if (type === 'min') {
      onFilterChange('min_price', newValue);
    } else {
      onFilterChange('max_price', newValue);
    }
  };

  // ✅ NUEVO: Aplicar filtro al presionar Enter
  const handlePriceKeyPress = (e, type) => {
    if (e.key === 'Enter') {
      handlePriceBlur(type);
    }
  };

  const handleStockChange = (e) => {
    onFilterChange('in_stock', e.target.checked ? 'true' : '');
  };

  const selectedBrands = filters.brand ? filters.brand.split(',') : [];
  const selectedMaterials = filters.material ? filters.material.split(',') : [];
  const hasActiveFilters = filters.brand || filters.material || filters.min_price || filters.max_price || filters.in_stock;

  return (
    <div className="filter-sidebar">
      <div className="filter-header">
        <h3>Filtros</h3>
        {hasActiveFilters && (
          <button className="btn-clear-filters" onClick={onClearFilters}>
            Limpiar
          </button>
        )}
      </div>

      <div className="filter-results-count">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10H3"/>
          <path d="M21 6H3"/>
          <path d="M21 14H3"/>
          <path d="M21 18H3"/>
        </svg>
        <span>{totalProducts} productos encontrados</span>
      </div>

      {/* Filtro de Stock */}
      <div className="filter-section">
        <h4 className="filter-section-title">Disponibilidad</h4>
        <label className="filter-checkbox-label stock-toggle">
          <input
            type="checkbox"
            checked={filters.in_stock === 'true'}
            onChange={handleStockChange}
          />
          <span className="checkbox-custom"></span>
          <span>Solo productos en stock</span>
        </label>
      </div>

      {/* Filtro de Precio */}
      <div className="filter-section">
        <h4 className="filter-section-title">Rango de Precio</h4>
        <div className="price-inputs">
          <div className="price-input-group">
            <label>Mínimo</label>
            <div className="input-with-prefix">
              <span className="price-prefix">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={priceRange.min}
                onChange={(e) => handlePriceInputChange('min', e.target.value)}
                onBlur={() => handlePriceBlur('min')}
                onKeyPress={(e) => handlePriceKeyPress(e, 'min')}
              />
            </div>
          </div>
          <div className="price-separator">-</div>
          <div className="price-input-group">
            <label>Máximo</label>
            <div className="input-with-prefix">
              <span className="price-prefix">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="999999"
                value={priceRange.max}
                onChange={(e) => handlePriceInputChange('max', e.target.value)}
                onBlur={() => handlePriceBlur('max')}
                onKeyPress={(e) => handlePriceKeyPress(e, 'max')}
              />
            </div>
          </div>
        </div>
        <p className="price-hint">Presiona Enter o sal del campo para aplicar</p>
      </div>

      {/* Filtro de Marcas */}
      <div className="filter-section">
        <h4 className="filter-section-title">
          Marcas
          {selectedBrands.length > 0 && (
            <span className="filter-count">({selectedBrands.length})</span>
          )}
        </h4>
        {brandsLoading ? (
          <div className="filter-loading">Cargando marcas...</div>
        ) : (
          <div className="filter-options">
            {brands.map((brand) => (
              <label key={brand.slug} className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand.slug)}
                  onChange={() => handleBrandChange(brand.slug)}
                />
                <span className="checkbox-custom"></span>
                <div className="brand-option">
                  {brand.logo && (
                    <img 
                      src={`${API_URL}${brand.logo}`} 
                      alt={brand.name}
                      className="brand-logo-small"
                    />
                  )}
                  <span>{brand.name}</span>
                  {brand.product_count && (
                    <span className="brand-count">({brand.product_count})</span>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Filtro de Materiales */}
      <div className="filter-section">
        <h4 className="filter-section-title">
          Materiales
          {selectedMaterials.length > 0 && (
            <span className="filter-count">({selectedMaterials.length})</span>
          )}
        </h4>
        {materialsLoading ? (
          <div className="filter-loading">Cargando materiales...</div>
        ) : (
          <div className="filter-options">
            {materials.map((material) => (
              <label key={material.id} className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedMaterials.includes(material.id.toString())}
                  onChange={() => handleMaterialChange(material.id)}
                />
                <span className="checkbox-custom"></span>
                <span>{material.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterSidebar;