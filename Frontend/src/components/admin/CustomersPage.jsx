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
  const [salesmen, setSalesmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    nazwaFirmy: '',
    telefon: '',
    adres: '',
    region: '',
    handlowiec: '',
    statusWizyty: '',
    opisNotatki: ''
  });

  useEffect(() => {
    fetchCustomers();
    fetchSalesmen();
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

  const fetchSalesmen = async () => {
    try {
      const response = await api.get('/api/salesmen');
      setSalesmen(response.data);
    } catch (error) {
      console.error('Error fetching salesmen:', error);
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
    const payload = {
      ...formData,
      handlowiec: formData.handlowiec || null
    };

    try {
      if (editingCustomer) {
        await api.put(`/api/customers/${editingCustomer.id}`, payload);
      } else {
        await api.post('/api/customers', payload);
      }
      fetchCustomers();
      setShowModal(false);
      setEditingCustomer(null);
      setFormData({
        nazwaFirmy: '',
        telefon: '',
        adres: '',
        region: '',
        handlowiec: '',
        statusWizyty: '',
        opisNotatki: ''
      });
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Błąd podczas zapisywania klienta');
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      nazwaFirmy: customer.nazwaFirmy || '',
      telefon: customer.telefon || '',
      adres: customer.adres || '',
      region: customer.region || '',
      handlowiec: customer.handlowiec || '',
      statusWizyty: customer.statusWizyty || '',
      opisNotatki: customer.opisNotatki || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (globalThis.confirm('Czy na pewno chcesz usunąć tego klienta?')) {
      try {
        await api.delete(`/api/customers/${id}`);
        fetchCustomers();
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Błąd podczas usuwania klienta');
      }
    }
  };

  const handleAdd = () => {
    setEditingCustomer(null);
    setFormData({
      nazwaFirmy: '',
      telefon: '',
      adres: '',
      region: '',
      handlowiec: '',
      statusWizyty: '',
      opisNotatki: ''
    });
    setShowModal(true);
  };

  const getSalesmanName = (salesmanId) => {
    const salesman = salesmen.find((item) => item.id === salesmanId);
    return salesman ? `${salesman.firstName} ${salesman.lastName}` : 'Brak';
  };

  const columns = [
    { key: 'nazwaFirmy', label: 'Nazwa firmy', sortable: true },
    { key: 'telefon', label: 'Telefon', sortable: true },
    { key: 'adres', label: 'Adres', sortable: true },
    { key: 'region', label: 'Region', sortable: true },
    {
      key: 'handlowiec',
      label: 'Handlowiec',
      sortable: true,
      render: (value) => getSalesmanName(value)
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
            <label htmlFor="nazwaFirmy">Nazwa firmy</label>
            <input
              type="text"
              id="nazwaFirmy"
              name="nazwaFirmy"
              value={formData.nazwaFirmy}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="telefon">Telefon</label>
            <input
              type="tel"
              id="telefon"
              name="telefon"
              value={formData.telefon}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="adres">Adres</label>
            <input
              type="text"
              id="adres"
              name="adres"
              value={formData.adres}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="region">Region</label>
            <input
              type="text"
              id="region"
              name="region"
              value={formData.region}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="handlowiec">Handlowiec</label>
            <select
              id="handlowiec"
              name="handlowiec"
              value={formData.handlowiec}
              onChange={handleInputChange}
              required
            >
              <option value="">Wybierz handlowca</option>
              {salesmen.map((salesman) => (
                <option key={salesman.id} value={salesman.id}>
                  {salesman.firstName} {salesman.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="opisNotatki">Uwagi</label>
            <textarea
              id="opisNotatki"
              name="opisNotatki"
              value={formData.opisNotatki}
              onChange={handleInputChange}
              rows="3"
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