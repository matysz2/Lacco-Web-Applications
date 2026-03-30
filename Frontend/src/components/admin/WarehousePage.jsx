import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import './WarehousePage.scss';

/**
 * Warehouse Page component
 * Manages products in warehouse
 */
const WarehousePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantityInStock: 0,
    pricePerKg: 0
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('quantity') || name.includes('price') ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/api/products/${editingProduct.id}`, formData);
      } else {
        await api.post('/api/products', formData);
      }
      fetchProducts();
      setShowModal(false);
      setEditingProduct(null);
      setFormData({ name: '', description: '', quantityInStock: 0, pricePerKg: 0 });
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Błąd podczas zapisywania produktu');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      quantityInStock: product.quantityInStock,
      pricePerKg: product.pricePerKg
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten produkt?')) {
      try {
        await api.delete(`/api/products/${id}`);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Błąd podczas usuwania produktu');
      }
    }
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({ name: '', description: '', quantityInStock: 0, pricePerKg: 0 });
    setShowModal(true);
  };

  const columns = [
    { key: 'name', label: 'Nazwa', sortable: true },
    { key: 'description', label: 'Opis', sortable: true },
    {
      key: 'quantityInStock',
      label: 'Ilość w magazynie',
      sortable: true,
      render: (value) => `${value} kg`
    },
    {
      key: 'pricePerKg',
      label: 'Cena za kg',
      sortable: true,
      render: (value) => `${value} PLN`
    }
  ];

  const actions = [
    {
      label: 'Edytuj',
      onClick: handleEdit,
      className: 'edit-btn'
    },
    {
      label: 'Usuń',
      onClick: (item) => handleDelete(item.id),
      className: 'delete-btn'
    }
  ];

  if (loading) {
    return <div className="loading">Ładowanie produktów...</div>;
  }

  return (
    <div className="warehouse-page">
      <div className="page-header">
        <h1>Magazyn</h1>
        <button className="add-btn" onClick={handleAdd}>
          ➕ Dodaj produkt
        </button>
      </div>

      <DataTable
        data={products}
        columns={columns}
        actions={actions}
        searchable={true}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingProduct ? 'Edytuj produkt' : 'Dodaj produkt'}
      >
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label htmlFor="name">Nazwa</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Opis</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="quantityInStock">Ilość w magazynie (kg)</label>
            <input
              type="number"
              id="quantityInStock"
              name="quantityInStock"
              value={formData.quantityInStock}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="pricePerKg">Cena za kg (PLN)</label>
            <input
              type="number"
              id="pricePerKg"
              name="pricePerKg"
              value={formData.pricePerKg}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => setShowModal(false)}>
              Anuluj
            </button>
            <button type="submit">
              {editingProduct ? 'Zapisz' : 'Dodaj'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WarehousePage;