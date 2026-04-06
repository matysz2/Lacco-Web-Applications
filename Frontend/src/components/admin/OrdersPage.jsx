import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import './OrdersPage.scss';

/**
 * Orders Page component
 * Manages orders with status changes
 */
const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [salesmen, setSalesmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [formData, setFormData] = useState({
    klientId: '',
    handlowiecId: '',
    status: 'NEW',
    sumaBrutto: 0,
    sumaNetto: 0,
    uwagi: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersResponse, customersResponse, salesmenResponse] = await Promise.all([
        api.get('/api/orders'),
        api.get('/api/customers'),
        api.get('/api/salesmen')
      ]);
      setOrders(ordersResponse.data);
      setCustomers(customersResponse.data);
      setSalesmen(salesmenResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['sumaBrutto', 'sumaNetto'].includes(name) ? Number.parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingOrder) {
        await api.put(`/api/orders/${editingOrder.id}`, formData);
      } else {
        await api.post('/api/orders', formData);
      }
      fetchData();
      setShowModal(false);
      setEditingOrder(null);
      setFormData({ klientId: '', handlowiecId: '', status: 'NEW', sumaBrutto: 0, sumaNetto: 0, uwagi: '' });
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Błąd podczas zapisywania zamówienia');
    }
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setFormData({
      klientId: order.klientId ?? order.customerId ?? '',
      handlowiecId: order.handlowiecId ?? order.salesmanId ?? '',
      status: order.status,
      sumaBrutto: order.sumaBrutto ?? order.totalAmount ?? 0,
      sumaNetto: order.sumaNetto ?? 0,
      uwagi: order.uwagi ?? ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (globalThis.confirm('Czy na pewno chcesz usunąć to zamówienie?')) {
      try {
        await api.delete(`/api/orders/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Błąd podczas usuwania zamówienia');
      }
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/api/orders/${orderId}`, { status: newStatus });
      fetchData();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Błąd podczas zmiany statusu');
    }
  };

  const handleAdd = () => {
    setEditingOrder(null);
    setFormData({ klientId: '', handlowiecId: '', status: 'NEW', sumaBrutto: 0, sumaNetto: 0, uwagi: '' });
    setShowModal(true);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'NEW': return 'Nowe';
      case 'IN_PROGRESS': return 'W trakcie';
      case 'COMPLETED': return 'Zakończone';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'NEW': return 'status-new';
      case 'IN_PROGRESS': return 'status-progress';
      case 'COMPLETED': return 'status-completed';
      default: return '';
    }
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.name : 'Nieznany';
  };

  const getSalesmanName = (salesmanId) => {
    const salesman = salesmen.find((s) => s.id === salesmanId);
    return salesman ? `${salesman.firstName} ${salesman.lastName}` : 'Nieznany';
  };

  const columns = [
    {
      key: 'klientId',
      label: 'Klient',
      sortable: true,
      render: (value, item) => getCustomerName(item.klientId ?? item.customerId)
    },
    {
      key: 'handlowiecId',
      label: 'Handlowiec',
      sortable: true,
      render: (value, item) => getSalesmanName(item.handlowiecId ?? item.salesmanId)
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`status-badge ${getStatusColor(value)}`}>
          {getStatusLabel(value)}
        </span>
      )
    },
    {
      key: 'sumaBrutto',
      label: 'Wartość',
      sortable: true,
      render: (value, item) => `${(item.sumaBrutto ?? item.totalAmount)?.toFixed(2) || '0.00'} PLN`
    },
    {
      key: 'sumaNetto',
      label: 'Wartość netto',
      sortable: true,
      render: (value, item) => `${(item.sumaNetto ?? 0)?.toFixed(2) || '0.00'} PLN`
    },
    {
      key: 'createdAt',
      label: 'Data utworzenia',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('pl-PL')
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
    },
    {
      label: 'Status',
      onClick: (item) => {
        const newStatus = item.status === 'NEW' ? 'IN_PROGRESS' :
                         item.status === 'IN_PROGRESS' ? 'COMPLETED' : 'NEW';
        handleStatusChange(item.id, newStatus);
      },
      className: 'status-btn',
      render: (item) => {
        const nextStatus = item.status === 'NEW' ? 'W trakcie' :
                          item.status === 'IN_PROGRESS' ? 'Zakończone' : 'Nowe';
        return `→ ${nextStatus}`;
      }
    }
  ];

  if (loading) {
    return <div className="loading">Ładowanie zamówień...</div>;
  }

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1>Zamówienia</h1>
        <button className="add-btn" onClick={handleAdd}>
          ➕ Dodaj zamówienie
        </button>
      </div>

      <DataTable
        data={orders}
        columns={columns}
        actions={actions}
        searchable={true}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingOrder ? 'Edytuj zamówienie' : 'Dodaj zamówienie'}
      >
        <form onSubmit={handleSubmit} className="order-form">
          <div className="form-group">
            <label htmlFor="klientId">Klient</label>
            <select
              id="klientId"
              name="klientId"
              value={formData.klientId}
              onChange={handleInputChange}
              required
            >
              <option value="">Wybierz klienta</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="handlowiecId">Handlowiec</label>
            <select
              id="handlowiecId"
              name="handlowiecId"
              value={formData.handlowiecId}
              onChange={handleInputChange}
              required
            >
              <option value="">Wybierz handlowca</option>
              {salesmen.map(salesman => (
                <option key={salesman.id} value={salesman.id}>
                  {salesman.firstName} {salesman.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="NEW">Nowe</option>
              <option value="IN_PROGRESS">W trakcie</option>
              <option value="COMPLETED">Zakończone</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="sumaBrutto">Wartość brutto (PLN)</label>
            <input
              type="number"
              id="sumaBrutto"
              name="sumaBrutto"
              value={formData.sumaBrutto}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="sumaNetto">Wartość netto (PLN)</label>
            <input
              type="number"
              id="sumaNetto"
              name="sumaNetto"
              value={formData.sumaNetto}
              onChange={handleInputChange}
              step="0.01"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="uwagi">Uwagi</label>
            <textarea
              id="uwagi"
              name="uwagi"
              value={formData.uwagi}
              onChange={handleInputChange}
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => setShowModal(false)}>
              Anuluj
            </button>
            <button type="submit">
              {editingOrder ? 'Zapisz' : 'Dodaj'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OrdersPage;