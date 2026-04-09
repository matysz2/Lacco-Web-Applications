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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [formData, setFormData] = useState({
    klientId: '',
    handlowiecId: '',
    status: 'NEW',
    sumaBrutto: 0,
    sumaNetto: 0,
    uwagi: '',
    orderItems: []
  });
  const [newItem, setNewItem] = useState({
    produktId: '',
    ilosc: 1,
    cenaZastosowana: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

const fetchData = async () => {
  try {
    setLoading(true);
    // 1. Dodajemy pobieranie produktów do Promise.all
    const [ordersRes, customersRes, salesmenRes, productsRes] = await Promise.all([
      api.get('/api/orders'),
      api.get('/api/customers'),
      api.get('/api/salesmen'),
      api.get('/api/products') // Tego brakowało
    ]);

    const customersData = customersRes.data || [];
    const salesmenData = salesmenRes.data || [];
    const productsData = productsRes.data || [];

    // 2. Mapujemy zamówienia, aby DataTable widziała gotowe teksty
    const mappedOrders = (ordersRes.data || []).map(order => {
      const customer = customersData.find(c => String(c.id) === String(order.klientId));
      const salesman = salesmenData.find(s => String(s.id).toLowerCase() === String(order.handlowiecId).toLowerCase());
      
      const d = new Date(order.createdAt);
      const formattedDate = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;

      return {
        ...order,
        displayKlient: customer ? customer.nazwaFirmy : `ID: ${order.klientId}`,
        displayHandlowiec: salesman ? `${salesman.firstName} ${salesman.lastName}` : order.handlowiecId,
        displayBrutto: `${Number(order.sumaBrutto || 0).toFixed(2)} PLN`,
        displayNetto: `${Number(order.sumaNetto || 0).toFixed(2)} PLN`,
        displayDate: formattedDate
      };
    });

    // 3. Ustawiamy wszystkie stany
    setCustomers(customersData);
    setSalesmen(salesmenData);
    setProducts(productsData); // Ustawiamy produkty
    setOrders(mappedOrders);
  } catch (error) {
    console.error('Błąd podczas pobierania danych:', error);
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

  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]: name === 'ilosc' || name === 'cenaZastosowana' ? Number.parseFloat(value) || 0 : value
    }));
  };

  const addOrderItem = () => {
    if (!newItem.produktId || newItem.ilosc <= 0 || newItem.cenaZastosowana <= 0) {
      alert('Wypełnij wszystkie pola pozycji zamówienia');
      return;
    }
    const product = products.find(p => p.id === newItem.produktId);
    const item = {
      produktId: newItem.produktId,
      ilosc: newItem.ilosc,
      cenaZastosowana: newItem.cenaZastosowana,
      nazwa: product ? product.nazwa : ''
    };
    const updatedItems = [...formData.orderItems, item];
    setFormData(prev => ({
      ...prev,
      orderItems: updatedItems,
      sumaNetto: calculateNetto(updatedItems),
      sumaBrutto: calculateBrutto(updatedItems)
    }));
    setNewItem({ produktId: '', ilosc: 1, cenaZastosowana: 0 });
  };

  const removeOrderItem = (index) => {
    const updatedItems = formData.orderItems.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      orderItems: updatedItems,
      sumaNetto: calculateNetto(updatedItems),
      sumaBrutto: calculateBrutto(updatedItems)
    }));
  };

  const calculateNetto = (items) => {
    return items.reduce((sum, item) => sum + (item.ilosc * item.cenaZastosowana), 0);
  };

  const calculateBrutto = (items) => {
    const netto = calculateNetto(items);
    return netto * 1.23; // Zakładając 23% VAT
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      orderItems: formData.orderItems.map(item => ({
        produktId: item.produktId,
        ilosc: item.ilosc,
        cenaZastosowana: item.cenaZastosowana,
        nazwa: item.nazwa
      }))
    };
    try {
      if (editingOrder) {
        await api.put(`/api/orders/${editingOrder.id}`, payload);
      } else {
        await api.post('/api/orders', payload);
      }
      fetchData();
      setShowModal(false);
      setEditingOrder(null);
      setFormData({ klientId: '', handlowiecId: '', status: 'NEW', sumaBrutto: 0, sumaNetto: 0, uwagi: '', numerZamowienia: null, orderItems: [] });
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Błąd podczas zapisywania zamówienia');
    }
  };

const handleEdit = (order) => {
    setEditingOrder(order);
    
    // 1. Mapujemy pozycje zamówienia (zabezpieczenie przed brakiem danych)
    const items = order.orderItems ? order.orderItems.map(item => ({
      produktId: item.produktId,
      ilosc: item.ilosc,
      cenaZastosowana: item.cenaZastosowana,
      nazwa: item.nazwa || (products.find(p => p.id === item.produktId)?.nazwa || '')
    })) : [];

    // 2. Ustawiamy dane w formularzu, obsługując oba warianty kluczy (polskie i angielskie)
    setFormData({
      klientId: order.klientId || order.customerId || '',
      handlowiecId: order.handlowiecId || order.salesmanId || '',
      status: order.status,
      // Używamy sumy z obiektu lub przeliczamy ją na nowo z pozycji
      sumaBrutto: order.sumaBrutto || calculateBrutto(items),
      sumaNetto: order.sumaNetto || calculateNetto(items),
      uwagi: order.uwagi || '',
      numerZamowienia: order.numerZamowienia || '',
      orderItems: items
    });

    // 3. Otwieramy okno edycji
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
      await api.patch(`/api/orders/${orderId}/status`, { status: newStatus });
      fetchData();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Błąd podczas zmiany statusu');
    }
  };

  const handleAdd = () => {
    setEditingOrder(null);
    setFormData({ klientId: '', handlowiecId: '', status: 'NEW', sumaBrutto: 0, sumaNetto: 0, uwagi: '', numerZamowienia: null, orderItems: [] });
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

// Kolumny korzystają z gotowych pól "display", które robimy w fetchData
  const columns = [
    {
      key: 'displayKlient',
      label: 'Klient',
      sortable: true
    },
    {
      key: 'displayHandlowiec',
      label: 'Handlowiec',
      sortable: true
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
      key: 'displayBrutto',
      label: 'Wartość',
      sortable: true
    },
    {
      key: 'displayNetto',
      label: 'Wartość netto',
      sortable: true
    },
    {
      key: 'displayDate',
      label: 'Data utworzenia',
      sortable: true
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
      className: 'status-btn'
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
                  {customer.nazwaFirmy}
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
            <label>Wartość brutto (PLN): {formData.sumaBrutto.toFixed(2)}</label>
          </div>

          <div className="form-group">
            <label>Wartość netto (PLN): {formData.sumaNetto.toFixed(2)}</label>
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

          <div className="form-group">
            <label>Pozcje zamówienia</label>
            <div className="order-items-section">
              <div className="add-item-form">
                <select
                  name="produktId"
                  value={newItem.produktId}
                  onChange={handleNewItemChange}
                >
                  <option value="">Wybierz produkt</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.nazwa} ({product.kodProduktu})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  name="ilosc"
                  placeholder="Ilość"
                  value={newItem.ilosc}
                  onChange={handleNewItemChange}
                  min="0.01"
                  step="0.01"
                />
                <input
                  type="number"
                  name="cenaZastosowana"
                  placeholder="Cena"
                  value={newItem.cenaZastosowana}
                  onChange={handleNewItemChange}
                  min="0"
                  step="0.01"
                />
                <button type="button" onClick={addOrderItem}>Dodaj pozycję</button>
              </div>
              <div className="order-items-list">
                {formData.orderItems.map((item, index) => (
                  <div key={index} className="order-item">
                    <span>{item.nazwa} - {item.ilosc} szt. x {item.cenaZastosowana} PLN</span>
                    <button type="button" onClick={() => removeOrderItem(index)}>Usuń</button>
                  </div>
                ))}
              </div>
            </div>
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