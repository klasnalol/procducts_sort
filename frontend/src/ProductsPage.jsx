import React, { useEffect, useState } from 'react';
import { getProducts, getQrCode, API_URL } from './api';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [sort, setSort] = useState('id');
  const [order, setOrder] = useState('asc');

  const fetchProducts = async () => {
    const res = await getProducts(sort, order);
    setProducts(res.data);
  };

  useEffect(() => {
    fetchProducts();
  }, [sort, order]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">All Products</h1>
      <div className="space-x-2">
        <label>Sort by:</label>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="border p-1 rounded">
          <option value="id">ID</option>
          <option value="name">Name</option>
          <option value="type">Type</option>
          <option value="quantity">Quantity</option>
        </select>
        <select value={order} onChange={(e) => setOrder(e.target.value)} className="border p-1 rounded">
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(p => (
          <div key={p.id} className="border p-2 rounded space-y-2">
            <div className="font-semibold">{p.name}</div>
            {p.image && (
              <img
                src={`${API_URL}${p.image}`}
                alt={p.name}
                className="h-32 object-contain"
              />
            )}
            <div>Type: {p.type}</div>
            <div>Qty: {p.quantity}</div>
            <img src={getQrCode(p.id)} alt="qr" className="h-32" />
          </div>
        ))}
      </div>
    </div>
  );
}