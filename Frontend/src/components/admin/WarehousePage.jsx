import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import './WarehousePage.scss';

/**
 * Warehouse Page component
 * Manages products in warehouse with full responsive support and pagination
 */
const WarehousePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Paginacja - 10 elementów
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Logika paginacji
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

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
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Błąd podczas zapisywania produktu');
    }
  };

  const resetForm = () => {
    setFormData({
      kodProduktu: '', grupa: '', jm: '', nazwa: '',
      opakowanie: 0, cenaProdukcji: 0, cenaA: 0, cenaB: 0, cenaC: 0
    });
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (globalThis.confirm('Czy na pewno chcesz usunąć ten produkt?')) {
      try {
        await api.delete(`/api/products/${id}`);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

const columns = [
  { key: 'kodProduktu', label: 'Kod', className: 'col-desktop' }, // Ukryte na mobile
  { key: 'nazwa', label: 'Nazwa', className: 'col-mobile' },     // Widoczne na mobile
  { key: 'grupa', label: 'Grupa', className: 'col-desktop' },
    { key: 'jm', label: 'Jm', sortable: true, className: 'col-desktop' },
    {
      key: 'opakowanie',
      label: 'Opak.',
      className: 'col-desktop',
      render: (val) => val ?? '-'
    },
    {
      key: 'cenaA',
      label: 'Cena A',
      className: 'col-desktop',
      render: (val) => val ? `${val.toFixed(2)} PLN` : '-'
    },
    {
      key: 'cenaB',
      label: 'Cena B',
      className: 'col-desktop',
      render: (val) => val ? `${val.toFixed(2)} PLN` : '-'
    },
    {
      key: 'cenaC',
      label: 'Cena C',
      className: 'col-desktop',
      render: (val) => val ? `${val.toFixed(2)} PLN` : '-'
    }
  ];

  const actions = [
    { label: 'Edytuj', onClick: handleEdit, className: 'edit-btn' },
    { label: 'Usuń', onClick: (item) => handleDelete(item.id), className: 'delete-btn' }
  ];

  if (loading) return <div className="loading">Ładowanie...</div>;

  return (
    <div className="warehouse-page">
      <div className="page-header">
        <h1>Magazyn</h1>
        <button className="add-btn" onClick={() => { resetForm(); setEditingProduct(null); setShowModal(true); }}>
          ➕ Dodaj produkt
        </button>
      </div>

<div className="table-responsive">
  <DataTable data={currentItems} columns={columns} actions={actions} />
</div>
 

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>&laquo;</button>
          {[...Array(totalPages).keys()].map(num => (
            <button 
              key={num + 1} 
              onClick={() => setCurrentPage(num + 1)}
              className={currentPage === num + 1 ? 'active' : ''}
            >
              {num + 1}
            </button>
          ))}
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>&raquo;</button>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingProduct ? 'Edytuj produkt' : 'Dodaj produkt'}
      >
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label>Kod produktu</label>
            <input type="text" name="kodProduktu" value={formData.kodProduktu} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Nazwa</label>
            <input type="text" name="nazwa" value={formData.nazwa} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Grupa</label>
            <input type="text" name="grupa" value={formData.grupa} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Jednostka miary</label>
            <input type="text" name="jm" value={formData.jm} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Opakowanie</label>
            <input type="number" name="opakowanie" step="0.01" value={formData.opakowanie} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Cena produkcji</label>
            <input type="number" name="cenaProdukcji" step="0.01" value={formData.cenaProdukcji} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Cena A</label>
            <input type="number" name="cenaA" step="0.01" value={formData.cenaA} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Cena B</label>
            <input type="number" name="cenaB" step="0.01" value={formData.cenaB} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Cena C</label>
            <input type="number" name="cenaC" step="0.01" value={formData.cenaC} onChange={handleInputChange} />
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => setShowModal(false)}>Anuluj</button>
            <button type="submit">{editingProduct ? 'Zapisz' : 'Dodaj'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WarehousePage;