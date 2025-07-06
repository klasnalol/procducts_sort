import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './Home.jsx';
import ProductsPage from './ProductsPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <nav className="p-4 space-x-4 bg-gray-100">
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
