import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import './SalesmenPage.scss';

/**
 * Salesmen Page component
 * Manages salesmen (profiles with role HANDLOWIEC)
 */
const SalesmenPage = () => {
  const [salesmen, setSalesmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSalesman, setEditingSalesman] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  useEffect(() => {
    fetchSalesmen();
  }, []);

  const fetchSalesmen = async () => {
    try {
      const response = await api.get('/api/salesmen');
      setSalesmen(response.data);
    } catch (error) {
      console.error('Error fetching salesmen:', error.response?.data || error.message || error);
      alert(`Błąd ładowania handlowców (${error.response?.status}) - sprawdź backend`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSalesman) {
        await api.put(`/api/salesmen/${editingSalesman.id}`, formData);
      } else {
        await api.post('/api/salesmen', {
          ...formData,
          role: 'HANDLOWIEC'
        });
      }
      fetchSalesmen();
      setShowModal(false);
      setEditingSalesman(null);
      setFormData({ firstName: '', lastName: '', email: '' });
    } catch (error) {
      console.error('Error saving salesman:', error);
      alert('Błąd podczas zapisywania handlowca');
    }
  };

  const handleEdit = (salesman) => {
    setEditingSalesman(salesman);
    setFormData({
      firstName: salesman.firstName,
      lastName: salesman.lastName,
      email: salesman.email
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Czy na pewno chcesz usunąć tego handlowca?')) {
      try {
        await api.delete(`/api/salesmen/${id}`);
        fetchSalesmen();
      } catch (error) {
        console.error('Error deleting salesman:', error);
        alert('Błąd podczas usuwania handlowca');
      }
    }
  };

  const handleAdd = () => {
    setEditingSalesman(null);
    setFormData({ firstName: '', lastName: '', email: '' });
    setShowModal(true);
  };

  const columns = [
    { key: 'firstName', label: 'Imię', sortable: true },
    { key: 'lastName', label: 'Nazwisko', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Rola', sortable: true }
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
    return <div className="loading">Ładowanie handlowców...</div>;
  }

  return (
    <div className="salesmen-page">
      <div className="page-header">
        <h1>Handlowcy</h1>
        <button className="add-btn" onClick={handleAdd}>
          ➕ Dodaj handlowca
        </button>
      </div>

      <DataTable
        data={salesmen}
        columns={columns}
        actions={actions}
        searchable={true}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingSalesman ? 'Edytuj handlowca' : 'Dodaj handlowca'}
      >
        <form onSubmit={handleSubmit} className="salesman-form">
          <div className="form-group">
            <label htmlFor="firstName">Imię</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Nazwisko</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => setShowModal(false)}>
              Anuluj
            </button>
            <button type="submit">
              {editingSalesman ? 'Zapisz' : 'Dodaj'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SalesmenPage;