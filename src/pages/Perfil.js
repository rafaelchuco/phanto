import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { useMyReviews, useUpdateReview, useDeleteReview } from '../hooks/useReviews';
import './Perfil.css';

const Perfil = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profileData, setProfileData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    is_default: false
  });

  const { data: myReviews, isLoading: loadingReviews } = useMyReviews();
  const updateReviewMutation = useUpdateReview();
  const deleteReviewMutation = useDeleteReview();

  const [editingReview, setEditingReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: ''
  });

  useEffect(() => {
    loadProfile();
    loadAddresses();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await userAPI.getProfile();
      setProfileData(data);
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.phone || '',
        birth_date: data.birth_date || '',
      });
      setLoading(false);
    } catch (err) {
      setError('Error al cargar el perfil');
      setLoading(false);
    }
  };

  const loadAddresses = async () => {
    try {
      const data = await userAPI.getAddresses();
      setAddresses(data);
    } catch (err) {
      console.error('Error al cargar direcciones:', err);
    }
  };

  const handleProfileChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await userAPI.updateProfile(formData);
      setSuccess('Perfil actualizado correctamente');
      setEditMode(false);
      loadProfile();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al actualizar el perfil');
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      await userAPI.changePassword(
        passwordData.oldPassword,
        passwordData.newPassword,
        passwordData.confirmPassword
      );
      setSuccess('Contraseña actualizada correctamente');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al cambiar la contraseña. Verifica tu contraseña actual.');
    }
  };

  const handleAddressChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setAddressForm({
      ...addressForm,
      [e.target.name]: value
    });
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingAddress) {
        await userAPI.updateAddress(editingAddress.id, addressForm);
        setSuccess('Dirección actualizada correctamente');
      } else {
        await userAPI.createAddress(addressForm);
        setSuccess('Dirección agregada correctamente');
      }
      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressForm({
        label: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        is_default: false
      });
      loadAddresses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al guardar la dirección');
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm(address);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta dirección?')) {
      try {
        await userAPI.deleteAddress(id);
        setSuccess('Dirección eliminada correctamente');
        loadAddresses();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Error al eliminar la dirección');
      }
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setReviewForm({
      rating: review.rating,
      title: review.title,
      comment: review.comment
    });
  };

  const handleReviewChange = (field, value) => {
    setReviewForm({
      ...reviewForm,
      [field]: value
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const productId = typeof editingReview.product === 'object' 
      ? editingReview.product.id 
      : editingReview.product;

    try {
      await updateReviewMutation.mutateAsync({
        id: editingReview.id,
        reviewData: {
          product: productId,
          rating: reviewForm.rating,
          title: reviewForm.title,
          comment: reviewForm.comment
        }
      });
      setSuccess('Reseña actualizada correctamente');
      setEditingReview(null);
      setReviewForm({ rating: 5, title: '', comment: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error al actualizar reseña:', err);
      setError('Error al actualizar la reseña: ' + err.message);
    }
  };

  const handleDeleteReview = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta reseña?')) {
      try {
        await deleteReviewMutation.mutateAsync(id);
        setSuccess('Reseña eliminada correctamente');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Error al eliminar la reseña');
      }
    }
  };

  if (loading) {
    return (
      <div className="perfil-page">
        <div className="container">
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="perfil-page">
      <div className="container">
        <div className="perfil-header">
          <h1>Mi Perfil</h1>
          <button className="btn-logout" onClick={logout}>
            Cerrar Sesión
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {success}
          </div>
        )}

        <div className="perfil-tabs">
          <button
            className={`tab ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            Información Personal
          </button>
          <button
            className={`tab ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            Cambiar Contraseña
          </button>
          <button
            className={`tab ${activeTab === 'addresses' ? 'active' : ''}`}
            onClick={() => setActiveTab('addresses')}
          >
            Direcciones
          </button>
          <button
            className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Mis Reseñas
          </button>
        </div>

        <div className="perfil-content">
          {activeTab === 'personal' && (
            <div className="tab-content">
              <div className="section-header">
                <h2>Información Personal</h2>
                {!editMode && (
                  <button className="btn-edit" onClick={() => setEditMode(true)}>
                    Editar
                  </button>
                )}
              </div>

              {!editMode ? (
                <div className="profile-view">
                  <div className="profile-item">
                    <label>Usuario:</label>
                    <p>{profileData?.username}</p>
                  </div>
                  <div className="profile-item">
                    <label>Email:</label>
                    <p>{profileData?.email}</p>
                  </div>
                  <div className="profile-item">
                    <label>Nombre:</label>
                    <p>{profileData?.first_name || 'No especificado'}</p>
                  </div>
                  <div className="profile-item">
                    <label>Apellido:</label>
                    <p>{profileData?.last_name || 'No especificado'}</p>
                  </div>
                  <div className="profile-item">
                    <label>Teléfono:</label>
                    <p>{profileData?.phone || 'No especificado'}</p>
                  </div>
                  <div className="profile-item">
                    <label>Fecha de Nacimiento:</label>
                    <p>{profileData?.birth_date || 'No especificado'}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleProfileSubmit} className="profile-form">
                  <div className="form-group">
                    <label>Nombre</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleProfileChange}
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div className="form-group">
                    <label>Apellido</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleProfileChange}
                      placeholder="Tu apellido"
                    />
                  </div>
                  <div className="form-group">
                    <label>Teléfono</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleProfileChange}
                      placeholder="+51 999 999 999"
                    />
                  </div>
                  <div className="form-group">
                    <label>Fecha de Nacimiento</label>
                    <input
                      type="date"
                      name="birth_date"
                      value={formData.birth_date}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                      Guardar Cambios
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => setEditMode(false)}>
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === 'password' && (
            <div className="tab-content">
              <h2>Cambiar Contraseña</h2>
              <form onSubmit={handlePasswordSubmit} className="password-form">
                <div className="form-group">
                  <label>Contraseña Actual</label>
                  <input
                    type="password"
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    placeholder="Tu contraseña actual"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nueva Contraseña</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Confirmar Nueva Contraseña</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Repite la nueva contraseña"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Actualizar Contraseña
                </button>
              </form>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="tab-content">
              <div className="section-header">
                <h2>Direcciones Guardadas</h2>
                {!showAddressForm && (
                  <button className="btn btn-primary" onClick={() => setShowAddressForm(true)}>
                    + Agregar Dirección
                  </button>
                )}
              </div>

              {showAddressForm && (
                <form onSubmit={handleAddressSubmit} className="address-form">
                  <h3>{editingAddress ? 'Editar Dirección' : 'Nueva Dirección'}</h3>
                  <div className="form-group">
                    <label>Etiqueta</label>
                    <input
                      type="text"
                      name="label"
                      value={addressForm.label}
                      onChange={handleAddressChange}
                      placeholder="Casa, Oficina, etc."
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Dirección Principal</label>
                    <input
                      type="text"
                      name="address_line1"
                      value={addressForm.address_line1}
                      onChange={handleAddressChange}
                      placeholder="Calle, número, departamento"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Dirección Adicional (Opcional)</label>
                    <input
                      type="text"
                      name="address_line2"
                      value={addressForm.address_line2}
                      onChange={handleAddressChange}
                      placeholder="Referencias adicionales"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Ciudad</label>
                      <input
                        type="text"
                        name="city"
                        value={addressForm.city}
                        onChange={handleAddressChange}
                        placeholder="Lima"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Estado/Provincia</label>
                      <input
                        type="text"
                        name="state"
                        value={addressForm.state}
                        onChange={handleAddressChange}
                        placeholder="Lima"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Código Postal</label>
                      <input
                        type="text"
                        name="postal_code"
                        value={addressForm.postal_code}
                        onChange={handleAddressChange}
                        placeholder="15001"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>País</label>
                      <input
                        type="text"
                        name="country"
                        value={addressForm.country}
                        onChange={handleAddressChange}
                        placeholder="Perú"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="is_default"
                        checked={addressForm.is_default}
                        onChange={handleAddressChange}
                      />
                      <span>Establecer como dirección predeterminada</span>
                    </label>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                      {editingAddress ? 'Actualizar' : 'Guardar'} Dirección
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowAddressForm(false);
                        setEditingAddress(null);
                        setAddressForm({
                          label: '',
                          address_line1: '',
                          address_line2: '',
                          city: '',
                          state: '',
                          postal_code: '',
                          country: '',
                          is_default: false
                        });
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              <div className="addresses-list">
                {addresses.length === 0 ? (
                  <p className="empty-message">No tienes direcciones guardadas</p>
                ) : (
                  addresses.map((address) => (
                    <div key={address.id} className={`address-card ${address.is_default ? 'default' : ''}`}>
                      {address.is_default && <span className="default-badge">Predeterminada</span>}
                      <h4>{address.label}</h4>
                      <p>{address.address_line1}</p>
                      {address.address_line2 && <p>{address.address_line2}</p>}
                      <p>{address.city}, {address.state} {address.postal_code}</p>
                      <p>{address.country}</p>
                      <div className="address-actions">
                        <button className="btn-link" onClick={() => handleEditAddress(address)}>
                          Editar
                        </button>
                        <button className="btn-link danger" onClick={() => handleDeleteAddress(address.id)}>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="tab-content">
              <div className="section-header">
                <h2>Mis Reseñas</h2>
              </div>

              {loadingReviews ? (
                <p>Cargando reseñas...</p>
              ) : editingReview ? (
                <form onSubmit={handleReviewSubmit} className="review-edit-form">
                  <h3>Editar Reseña</h3>
                  
                  <div className="form-group">
                    <label>Calificación</label>
                    <div className="rating-input">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`star-input ${reviewForm.rating >= star ? 'filled' : ''}`}
                          onClick={() => handleReviewChange('rating', star)}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Título</label>
                    <input
                      type="text"
                      value={reviewForm.title}
                      onChange={(e) => handleReviewChange('title', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Comentario</label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => handleReviewChange('comment', e.target.value)}
                      rows="5"
                      required
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                      Guardar Cambios
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditingReview(null);
                        setReviewForm({ rating: 5, title: '', comment: '' });
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : myReviews && myReviews.length > 0 ? (
                <div className="reviews-list-profile">
                  {myReviews.map((review) => (
                    <div key={review.id} className="review-card-profile">
                      <div className="review-product-info">
                        <Link to={`/producto/${review.product_slug || review.product}`} className="product-link">
                          <h4>{review.product_name || `Producto #${review.product}`}</h4>
                        </Link>
                        <span className="review-date-small">
                          {new Date(review.created_at).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      
                      <div className="review-rating-small">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < review.rating ? 'star filled' : 'star'} >★</span>
                        ))}
                      </div>

                      <h3 className="review-title-small">{review.title}</h3>
                      <p className="review-comment-small">{review.comment}</p>

                      {review.is_verified_purchase && (
                        <span className="verified-badge-small">✓ Compra verificada</span>
                      )}

                      <div className="review-actions">
                        <button className="btn-link" onClick={() => handleEditReview(review)}>
                          Editar
                        </button>
                        <button className="btn-link danger" onClick={() => handleDeleteReview(review.id)}>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-message">No has dejado reseñas aún</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Perfil;
