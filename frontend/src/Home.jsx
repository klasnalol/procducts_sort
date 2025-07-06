import React, { useEffect, useState } from 'react';
import { createProduct, getQrCode, scanProduct, sellProduct } from './api';
import { Scanner, useDevices } from '@yudiel/react-qr-scanner';

export default function Home() {
  const [product, setProduct] = useState({ name: '', type: 'standard', quantity: 1 });
  const [imageFile, setImageFile] = useState(null);
  const [productId, setProductId] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [sellAmount, setSellAmount] = useState(1);
  const { devices } = useDevices();
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    if (devices && devices.length > 0 && !deviceId) {
      setDeviceId(devices[0].deviceId);
    }
  }, [devices]);

  const handleCreate = async () => {
    const form = new FormData();
    form.append('name', product.name);
    form.append('type', product.type);
    form.append('quantity', product.quantity);
    if (imageFile) form.append('image', imageFile);
    const res = await createProduct(form);
    setProductId(res.data.id);
  };

  const handleScan = async (result) => {
    if (result && result.length > 0) {
      const scannedId = parseInt(result[0].rawValue);
      setScanResult(scannedId);
      const res = await scanProduct(scannedId);
      setProductDetails(res.data);
    }
  };

  const handleError = (error) => {
    console.error(error);
  };

  const handleSell = async () => {
    const res = await sellProduct(scanResult, sellAmount);
    alert(res.data.message);
    setProductDetails({ ...productDetails, quantity: res.data.remaining });
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Product Inventory with QR Codes</h1>

      {/* Product Creation */}
      <div className="space-x-2 space-y-2">
        <input
          placeholder="Name"
          className="border p-2 rounded"
          value={product.name}
          onChange={(e) => setProduct({ ...product, name: e.target.value })}
        />
        <input
          type="file"
          accept="image/*"
          className="border p-2 rounded"
          onChange={(e) => setImageFile(e.target.files[0])}
        />
        <select
          className="border p-2 rounded"
          value={product.type}
          onChange={(e) => setProduct({ ...product, type: e.target.value })}
        >
          <option value="standard">Standard</option>
          <option value="fabric">Fabric (per meter)</option>
        </select>
        <input
          type="number"
          className="border p-2 rounded w-32"
          value={product.quantity}
          onChange={(e) => setProduct({ ...product, quantity: e.target.value })}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleCreate}
        >
          Create & Generate QR
        </button>
      </div>

      {/* QR Code Display */}
      {productId && (
        <div>
          <h2 className="font-semibold">Generated QR Code:</h2>
          <img
            className="mt-2 border rounded"
            src={getQrCode(productId)}
            alt="QR Code"
          />
        </div>
      )}

      {/* QR Scanner */}
      <div className="mt-4">
        <h2 className="font-semibold">Scan QR Code:</h2>
        <div className="space-y-2 w-full max-w-sm mt-2">
          <select
            className="border p-2 rounded w-full"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
          >
            {devices?.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>{d.label || d.deviceId}</option>
            ))}
          </select>
          <Scanner
            onScan={handleScan}
            onError={handleError}
            constraints={deviceId ? { deviceId: { exact: deviceId } } : undefined}
            styles={{ container: { width: '100%' } }}
          />
        </div>
      </div>

      {/* Product Details and Sell */}
      {productDetails && (
        <div className="mt-4 p-4 border rounded shadow">
          <h3 className="font-semibold">Scanned Product:</h3>
          <p><strong>Name:</strong> {productDetails.name}</p>
          <p><strong>Type:</strong> {productDetails.type}</p>
          <p><strong>Quantity Available:</strong> {productDetails.quantity}</p>

          <div className="flex items-center space-x-2 mt-2">
            <input
              type="number"
              className="border p-2 rounded w-24"
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
            />
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={handleSell}
            >
              Sell
            </button>
          </div>
        </div>
      )}
    </div>
  );
}