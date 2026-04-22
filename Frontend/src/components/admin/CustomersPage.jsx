import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import './CustomersPage.scss';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [salesmen, setSalesmen] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [formData, setFormData] = useState({
    nazwaFirmy: '',
    telefon: '',
    adres: '',
    region: '',
    handlowiec: '',
    statusWizyty: '',
    opisNotatki: '',
    grupaCenowa: 1 // ✅ zawsze number
  });

  useEffect(() => {
    fetchData();
  }, []);

  const getGrupaLabel = (val) => {
    switch (val) {
      case 1: return '1 - Tania';
      case 2: return '2 - Średnia';
      case 3: return '3 - Premium';
      default: return '-';
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const [customersRes, salesmenRes] = await Promise.all([
        api.get('/api/customers'),
        api.get('/api/salesmen')
      ]);

      const salesmenData = salesmenRes.data || [];
      const customersData = customersRes.data || [];

      const mappedCustomers = customersData.map(customer => {
        const s = salesmenData.find(item =>
          String(item.id) === String(customer.handlowiec)
        );

        return {
          ...customer,
          displayHandlowiec: s
            ? `${s.firstName} ${s.lastName}`
            : 'Nieprzypisany',
          displayGrupa: getGrupaLabel(customer.grupaCenowa)
        };
      });

      setSalesmen(salesmenData);
      setCustomers(mappedCustomers);

    } catch (error) {
      console.error('Błąd podczas pobierania danych:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(customers.length / itemsPerPage);

  const paginatedData = customers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
const handleInputChange = (e) => {
  const { name, value } = e.target;

  setFormData(prev => ({
    ...prev,
    [name]: name === 'grupaCenowa' 
      ? (value === "" ? null : parseInt(value, 10)) // Jawne parsowanie na Int
      : value
  }));
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      handlowiec: formData.handlowiec || null,
      grupaCenowa: Number(formData.grupaCenowa) // ✅ 100% number
    };

    try {
      if (editingCustomer) {
        await api.put(`/api/customers/${editingCustomer.id}`, payload);
      } else {
        await api.post('/api/customers', payload);
      }

      setShowModal(false);
      setEditingCustomer(null);
      setCurrentPage(1);

      // reset form
      setFormData({
        nazwaFirmy: '',
        telefon: '',
        adres: '',
        region: '',
        handlowiec: '',
        statusWizyty: '',
        opisNotatki: '',
        grupaCenowa: 1
      });

      fetchData();

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
      opisNotatki: customer.opisNotatki || '',
      grupaCenowa: customer.grupaCenowa || 1
    });

    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (globalThis.confirm('Czy na pewno chcesz usunąć tego klienta?')) {
      try {
        await api.delete(`/api/customers/${id}`);
        setCurrentPage(1);
        fetchData();
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
      opisNotatki: '',
      grupaCenowa: 1 // ✅ NIE STRING
    });

    setShowModal(true);
  };

  const columns = [
    { key: 'nazwaFirmy', label: 'Nazwa firmy', sortable: true },
    { key: 'telefon', label: 'Telefon', sortable: true },
    { key: 'adres', label: 'Adres', sortable: true },
    { key: 'region', label: 'Region', sortable: true },
    { key: 'displayHandlowiec', label: 'Handlowiec', sortable: true },
    { key: 'displayGrupa', label: 'Grupa', sortable: true } // ✅ poprawione
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

      <div className="table-wrapper">
        <DataTable
          data={paginatedData}
          columns={columns}
          actions={actions}
          searchable={true}
        />
      </div>

      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => prev - 1)}
        >
          ←
        </button>

        <span>
          Strona {currentPage} z {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(prev => prev + 1)}
        >
          →
        </button>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCustomer ? 'Edytuj klienta' : 'Dodaj klienta'}
      >
        <form onSubmit={handleSubmit} className="customer-form">

          <div className="form-group">
            <label>Nazwa firmy</label>
            <input
              type="text"
              name="nazwaFirmy"
              value={formData.nazwaFirmy}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Telefon</label>
            <input
              type="tel"
              name="telefon"
              value={formData.telefon}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Adres</label>
            <input
              type="text"
              name="adres"
              value={formData.adres}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Region</label>
            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Handlowiec</label>
            <select
              name="handlowiec"
              value={formData.handlowiec}
              onChange={handleInputChange}
              required
            >
              <option value="">Wybierz handlowca</option>
              {salesmen.map(s => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ JEDEN poprawny select */}
 
 <div className="form-group">
  <label>Grupa cenowa</label>
<select
  name="grupaCenowa"
  value={String(formData.grupaCenowa)} // Konwersja na string dla spójności z DOM
  onChange={handleInputChange}
>
  <option value="1">1 - Tania</option>
  <option value="2">2 - Średnia</option>
  <option value="3">3 - Premium</option>
</select>
</div>

          <div className="form-group">
            <label>Uwagi</label>
            <textarea
              name="opisNotatki"
              value={formData.opisNotatki}
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