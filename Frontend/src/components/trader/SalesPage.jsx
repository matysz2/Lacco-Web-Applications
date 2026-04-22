import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../common/Modal';
import './SalesPage.scss';

const SalesPage = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // --- PAGINACJA ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const currentUser = JSON.parse(localStorage.getItem('user'));

  const initialFormState = {
    klientId: '',
    status: 'NEW',
    sumaBrutto: 0,
    sumaNetto: 0,
    uwagi: '',
    orderItems: []
  };

  const [formData, setFormData] = useState(initialFormState);
  const [newItem, setNewItem] = useState({ produktId: '', ilosc: 1, cenaZastosowana: 0 });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [ordersRes, customersRes, productsRes] = await Promise.all([
        api.get('/api/orders/trader/my-orders'),
        api.get('/api/customers'),
        api.get('/api/products')
      ]);
      setOrders(ordersRes.data);
      setCustomers(customersRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      console.error("Błąd podczas ładowania danych:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIKA PAGINACJI ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    setExpandedId(null); // Zamykamy rozwinięte wiersze przy zmianie strony
    window.scrollTo(0, 0); // Opcjonalnie powrót na górę
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleProductSelect = (e) => {
    const pId = e.target.value;
    const product = products.find(p => String(p.id) === String(pId));
    setNewItem({
      ...newItem,
      produktId: pId,
      cenaZastosowana: product ? product.cenaA : 0
    });
  };

  const addOrderItem = () => {
    if (!newItem.produktId || newItem.ilosc <= 0) return;
    const product = products.find(p => String(p.id) === String(newItem.produktId));
    
    const item = {
      produktId: newItem.produktId,
      kodProduktu: product.kodProduktu,
      nazwaProduktu: product.nazwa,
      ilosc: Number(newItem.ilosc),
      cenaZastosowana: Number(newItem.cenaZastosowana),
      wartoscNetto: Number(newItem.ilosc * newItem.cenaZastosowana),
      opakowanie: product.jm || 'szt.'
    };

    const updatedItems = [...formData.orderItems, item];
    calculateTotals(updatedItems);
    setNewItem({ produktId: '', ilosc: 1, cenaZastosowana: 0 });
  };

  const removeOrderItem = (index) => {
    const updatedItems = formData.orderItems.filter((_, i) => i !== index);
    calculateTotals(updatedItems);
  };

  const calculateTotals = (items) => {
    const netto = items.reduce((sum, item) => sum + item.wartoscNetto, 0);
    setFormData({
      ...formData,
      orderItems: items,
      sumaNetto: netto,
      sumaBrutto: netto * 1.23
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.orderItems.length === 0) {
      alert("Dodaj przynajmniej jeden produkt!");
      return;
    }

    const dataToSend = {
      ...formData,
      handlowiecId: currentUser?.id
    };

    try {
      await api.post('/api/orders', dataToSend);
      setShowModal(false);
      setFormData(initialFormState);
      fetchInitialData();
      setCurrentPage(1); // Powrót na pierwszą stronę po dodaniu zamówienia
    } catch (err) {
      console.error("Błąd zapisu:", err);
      alert("Błąd podczas zapisywania zamówienia.");
    }
  };

  if (loading) return <div className="loader">Ładowanie panelu sprzedaży...</div>;

  return (
    <div className="sales-container">
      <div className="sales-header">
        <h1>Panel Sprzedaży</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Nowe zamówienie
        </button>
      </div>

      <div className="orders-table-wrapper">
        <div className="table-header">
          <span>Data</span>
          <span>Nr zamówienia</span>
          <span>Klient</span>
          <span>Netto</span>
          <span>Brutto</span>
          <span>Status</span>
        </div>

        {/* Używamy currentOrders zamiast orders */}
        {currentOrders.map(order => (
          <div key={order.id} className={`order-row-group ${expandedId === order.id ? 'is-expanded' : ''}`}>
            <div className="order-main-row" onClick={() => toggleExpand(order.id)}>
              <span className="order-date">{formatDate(order.createdAt)}</span>
              <span className="order-num">#{order.numerZamowienia}</span>
              <span className="client-name">
                <strong>{order.nazwaFirmy || 'Brak nazwy'}</strong>
              </span>
              <span className="price-cell">{order.sumaNetto?.toFixed(2)} zł</span>
              <span className="price-cell">{order.sumaBrutto?.toFixed(2)} zł</span>
              <div className="status-container">
                <span className={`status-pill ${order.status?.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>
            </div>

            {expandedId === order.id && (
              <div className="order-details-expanded">
                <h3>Szczegóły produktów</h3>
                <div className="table-responsive">
                  <table className="products-table">
                    <thead>
                      <tr>
                        <th>Kod</th>
                        <th>Produkt</th>
                        <th>Ilość</th>
                        <th>Cena j.</th>
                        <th>Wartość</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.orderItems?.map((item, idx) => (
                        <tr key={idx}>
                          <td><code>{item.kodProduktu}</code></td>
                          <td>{item.nazwaProduktu}</td>
                          <td>{item.ilosc} {item.opakowanie}</td>
                          <td>{item.cenaZastosowana?.toFixed(2)} zł</td>
                          <td><strong>{item.wartoscNetto?.toFixed(2)} zł</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* --- KOMPONENT PAGINACJI --- */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            disabled={currentPage === 1} 
            onClick={() => paginate(currentPage - 1)}
            className="page-btn"
          >
            &laquo; Poprzednia
          </button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
            >
              {i + 1}
            </button>
          ))}

          <button 
            disabled={currentPage === totalPages} 
            onClick={() => paginate(currentPage + 1)}
            className="page-btn"
          >
            Następna &raquo;
          </button>
        </div>
      )}

      {/* --- MODAL (Bez zmian) --- */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nowe zamówienie">
        <form onSubmit={handleSubmit} className="order-form-sales">
          <div className="form-section">
            <label>Klient</label>
            <select 
              value={formData.klientId} 
              onChange={(e) => setFormData({...formData, klientId: e.target.value})}
              required
            >
              <option value="">-- Wybierz klienta --</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.nazwaFirmy}</option>)}
            </select>
          </div>

          <div className="items-builder-box">
            <h4>Dodaj produkty</h4>
            <div className="builder-form-vertical">
              <div className="product-select-row">
                <select value={newItem.produktId} onChange={handleProductSelect}>
                  <option value="">-- Wybierz produkt --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.kodProduktu} | {p.nazwa}</option>
                  ))}
                </select>
              </div>

              <div className="quantity-action-row">
                <div className="input-with-label">
                  <label>Ilość</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    value={newItem.ilosc} 
                    onChange={(e) => setNewItem({...newItem, ilosc: e.target.value})}
                  />
                </div>
                <div className="price-preview-box">
                  <span className="label">Cena j. (netto)</span>
                  <span className="value">{newItem.cenaZastosowana?.toFixed(2)} zł</span>
                </div>
                <button type="button" className="btn-add-large" onClick={addOrderItem}>
                  Dodaj produkt
                </button>
              </div>

              <div className="added-items-list">
                {formData.orderItems.map((item, index) => (
                  <div key={index} className="added-item">
                    <div className="item-main">
                      <strong>{item.kodProduktu}</strong> - {item.nazwaProduktu}
                      <small>{item.ilosc} {item.opakowanie} x {item.cenaZastosowana.toFixed(2)} zł</small>
                    </div>
                    <div className="item-actions">
                      <span>{item.wartoscNetto.toFixed(2)} zł</span>
                      <button type="button" onClick={() => removeOrderItem(index)}>Usuń</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="order-summary">
            <div>Suma Netto: <strong>{formData.sumaNetto.toFixed(2)} zł</strong></div>
            <div>Suma Brutto: <strong>{formData.sumaBrutto.toFixed(2)} zł</strong></div>
          </div>

          <div className="form-section">
            <textarea 
              placeholder="Dodatkowe uwagi..." 
              value={formData.uwagi} 
              onChange={(e) => setFormData({...formData, uwagi: e.target.value})}
            />
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn-confirm" disabled={formData.orderItems.length === 0}>
              Złóż zamówienie
            </button>
            <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
              Anuluj
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SalesPage;