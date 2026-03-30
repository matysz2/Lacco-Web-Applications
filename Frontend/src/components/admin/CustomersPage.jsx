import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import './CustomersPage.scss';

/**
 * Customers Page component
 * Manages customers from leady_stolarze table
 */
const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contactInfo: '',
    address: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/api/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
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
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}`, formData);
      } else {
        await api.post('/api/customers', formData);
      }
      fetchCustomers();
      setShowModal(false);
      setEditingCustomer(null);
      setFormData({ name: '', contactInfo: '', address: '', phone: '', email: '' });
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Błąd podczas zapisywania klienta');
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      contactInfo: customer.contactInfo,
      address: customer.address,
      phone: customer.phone,
      email: customer.email
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Czy na pewno chcesz usunąć tego klienta?')) {
      try {
        await api.delete(`/customers/${id}`);
        fetchCustomers();
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Błąd podczas usuwania klienta');
      }
    }
  };

  const handleAdd = () => {
    setEditingCustomer(null);
    setFormData({ name: '', contactInfo: '', address: '', phone: '', email: '' });
    setShowModal(true);
  };

  const columns = [
    { key: 'name', label: 'Nazwa', sortable: true },
    { key: 'contactInfo', label: 'Informacje kontaktowe', sortable: true },
    { key: 'address', label: 'Adres', sortable: true },
    { key: 'phone', label: 'Telefon', sortable: true },
    { key: 'email', label: 'Email', sortable: true }
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
    return <div className="loading">Ładowanie klientów...</div>;
  }

  return (
    <div className="customers-page">
      <div className="page-header">
        <h1>Klienci</h1>
        <button className="add-btn" onClick={handleAdd}>
          ➕ Dodaj klienta
        </button>
      </div>

      <DataTable
        data={customers}
        columns={columns}
        actions={actions}
        searchable={true}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCustomer ? 'Edytuj klienta' : 'Dodaj klienta'}
      >
        <form onSubmit={handleSubmit} className="customer-form">
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
            <label htmlFor="contactInfo">Informacje kontaktowe</label>
            <input
              type="text"
              id="contactInfo"
              name="contactInfo"
              value={formData.contactInfo}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Adres</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Telefon</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
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
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => setShowModal(false)}>
              Anuluj
            </button>
            <button type="submit">
              {editingCustomer ? 'Zapisz' : 'Dodaj'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CustomersPage;