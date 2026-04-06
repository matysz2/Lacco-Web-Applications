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
    kodProduktu: '',
    grupa: '',
    jm: '',
    nazwa: '',
    opakowanie: 0,
    cenaProdukcji: 0,
    cenaA: 0,
    cenaB: 0,
    cenaC: 0
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
      [name]: ['opakowanie', 'cenaProdukcji', 'cenaA', 'cenaB', 'cenaC'].includes(name)
        ? Number.parseFloat(value) || 0
        : value
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
      setFormData({
        kodProduktu: '',
        grupa: '',
        jm: '',
        nazwa: '',
        opakowanie: 0,
        cenaProdukcji: 0,
        cenaA: 0,
        cenaB: 0,
        cenaC: 0
      });
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Błąd podczas zapisywania produktu');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      kodProduktu: product.kodProduktu || '',
      grupa: product.grupa || '',
      jm: product.jm || '',
      nazwa: product.nazwa || '',
      opakowanie: product.opakowanie || 0,
      cenaProdukcji: product.cenaProdukcji || 0,
      cenaA: product.cenaA || 0,
      cenaB: product.cenaB || 0,
      cenaC: product.cenaC || 0
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (globalThis.confirm('Czy na pewno chcesz usunąć ten produkt?')) {
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
    setFormData({
      kodProduktu: '',
      grupa: '',
      jm: '',
      nazwa: '',
      opakowanie: 0,
      cenaProdukcji: 0,
      cenaA: 0,
      cenaB: 0,
      cenaC: 0
    });
    setShowModal(true);
  };

  const columns = [
    { key: 'kodProduktu', label: 'Kod produktu', sortable: true },
    { key: 'nazwa', label: 'Nazwa', sortable: true },
    { key: 'grupa', label: 'Grupa', sortable: true },
    { key: 'jm', label: 'Jm', sortable: true },
    {
      key: 'opakowanie',
      label: 'Opakowanie',
      sortable: true,
      render: (value) => value !== null && value !== undefined ? value.toString() : '-'
    },
    {
      key: 'cenaA',
      label: 'Cena A',
      sortable: true,
      render: (value) => value !== null && value !== undefined ? `${value.toFixed(2)} PLN` : '-'
    },
    {
      key: 'cenaB',
      label: 'Cena B',
      sortable: true,
      render: (value) => value !== null && value !== undefined ? `${value.toFixed(2)} PLN` : '-'
    },
    {
      key: 'cenaC',
      label: 'Cena C',
      sortable: true,
      render: (value) => value !== null && value !== undefined ? `${value.toFixed(2)} PLN` : '-'
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
            <label htmlFor="kodProduktu">Kod produktu</label>
            <input
              type="text"
              id="kodProduktu"
              name="kodProduktu"
              value={formData.kodProduktu}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="nazwa">Nazwa</label>
            <input
              type="text"
              id="nazwa"
              name="nazwa"
              value={formData.nazwa}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="grupa">Grupa</label>
            <input
              type="text"
              id="grupa"
              name="grupa"
              value={formData.grupa}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="jm">Jednostka miary</label>
            <input
              type="text"
              id="jm"
              name="jm"
              value={formData.jm}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="opakowanie">Opakowanie</label>
            <input
              type="number"
              id="opakowanie"
              name="opakowanie"
              value={formData.opakowanie}
              onChange={handleInputChange}
              step="0.01"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="cenaProdukcji">Cena produkcji (PLN)</label>
            <input
              type="number"
              id="cenaProdukcji"
              name="cenaProdukcji"
              value={formData.cenaProdukcji}
              onChange={handleInputChange}
              step="0.01"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="cenaA">Cena A (PLN)</label>
            <input
              type="number"
              id="cenaA"
              name="cenaA"
              value={formData.cenaA}
              onChange={handleInputChange}
              step="0.01"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="cenaB">Cena B (PLN)</label>
            <input
              type="number"
              id="cenaB"
              name="cenaB"
              value={formData.cenaB}
              onChange={handleInputChange}
              step="0.01"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="cenaC">Cena C (PLN)</label>
            <input
              type="number"
              id="cenaC"
              name="cenaC"
              value={formData.cenaC}
              onChange={handleInputChange}
              step="0.01"
              min="0"
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