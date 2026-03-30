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
    customerId: '',
    salesmanId: '',
    status: 'NEW',
    totalAmount: 0,
    totalWeight: 0
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
      [name]: name.includes('Amount') || name.includes('Weight') ? parseFloat(value) || 0 : value
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
      setFormData({ customerId: '', salesmanId: '', status: 'NEW', totalAmount: 0, totalWeight: 0 });
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Błąd podczas zapisywania zamówienia');
    }
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setFormData({
      customerId: order.customerId,
      salesmanId: order.salesmanId,
      status: order.status,
      totalAmount: order.totalAmount,
      totalWeight: order.totalWeight
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Czy na pewno chcesz usunąć to zamówienie?')) {
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
      await api.put(`/orders/${orderId}`, { status: newStatus });
      fetchData();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Błąd podczas zmiany statusu');
    }
  };

  const handleAdd = () => {
    setEditingOrder(null);
    setFormData({ customerId: '', salesmanId: '', status: 'NEW', totalAmount: 0, totalWeight: 0 });
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

  const columns = [
    {
      key: 'customerName',
      label: 'Klient',
      sortable: true,
      render: (value, item) => item.customerName || 'Nieznany'
    },
    {
      key: 'salesmanName',
      label: 'Handlowiec',
      sortable: true,
      render: (value, item) => item.salesmanName || 'Nieznany'
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
      key: 'totalAmount',
      label: 'Wartość',
      sortable: true,
      render: (value) => `${value?.toFixed(2) || '0.00'} PLN`
    },
    {
      key: 'totalWeight',
      label: 'Waga',
      sortable: true,
      render: (value) => `${value?.toFixed(2) || '0.00'} kg`
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
            <label htmlFor="customerId">Klient</label>
            <select
              id="customerId"
              name="customerId"
              value={formData.customerId}
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
            <label htmlFor="salesmanId">Handlowiec</label>
            <select
              id="salesmanId"
              name="salesmanId"
              value={formData.salesmanId}
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
            <label htmlFor="totalAmount">Wartość całkowita (PLN)</label>
            <input
              type="number"
              id="totalAmount"
              name="totalAmount"
              value={formData.totalAmount}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="totalWeight">Waga całkowita (kg)</label>
            <input
              type="number"
              id="totalWeight"
              name="totalWeight"
              value={formData.totalWeight}
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
              {editingOrder ? 'Zapisz' : 'Dodaj'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OrdersPage;