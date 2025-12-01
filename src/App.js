import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import DetalleProducto from './pages/DetalleProducto';
import Carrito from './pages/Carrito';
import Checkout from './pages/Checkout';
import ProductosPorCategoria from './pages/ProductosPorCategoria';
import Login from './pages/Login';
import Register from './pages/Register';
import Perfil from './pages/Perfil';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';
import Brands from './pages/Brands';

import Products from './pages/Products';
import OrderSuccess from './pages/OrderSuccess';
import './App.css';

// Cargar Stripe desde variables de ambiente o usar clave de testing
const stripeKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51QnLLjJvWs3Hs2lLEp9RkZCPqKU8DRVqQ5E5Yz8nXmK0X9Z3K8Y7Y9Z0Z1Z2Z3Z4Z5Z6Z7Z8Z9';
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

console.log('🔑 STRIPE KEY:', stripeKey ? `✅ Cargada (${stripeKey.slice(0, 20)}...)` : '❌ No configurada');

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        {stripePromise ? (
          <Elements stripe={stripePromise}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/producto/:slug" element={<DetalleProducto />} />
              <Route path="/carrito" element={<Carrito />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/categoria/:slug" element={<ProductosPorCategoria />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/ordenes" element={<Orders />} />
              <Route path="/mis-ordenes" element={<Orders />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/brands" element={<Brands />} />
              <Route path="/productos" element={<Products />} />
              <Route path="/order-success/:orderId" element={<OrderSuccess />} />
            </Routes>
          </Elements>
        ) : (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/producto/:slug" element={<DetalleProducto />} />
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/ordenes" element={<Orders />} />
            <Route path="/mis-ordenes" element={<Orders />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/brands" element={<Brands />} />
            <Route path="/productos" element={<Products />} />
            <Route path="/order-success/:orderId" element={<OrderSuccess />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;