import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './SalesPage.scss';

const SalesPage = () => {
  const [orders, setOrders] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    api.get('/api/sales/my-orders').then(res => setOrders(res.data));
  }, []);

  return (
    <div className="sales-container">
      <div className="sales-header">
        <h1>Sprzedaż</h1>
        <button className="btn-primary" onClick={() => {/* Logika dodawania */}}>
          + Dodaj zamówienie
        </button>
      </div>

      <div className="orders-list">
        <div className="table-header">
          <span>Nr zamówienia</span>
          <span>Klient</span>
          <span>Netto</span>
          <span>Brutto</span>
          <span>Status</span>
        </div>

        {orders.map(order => (
          <div key={order.id} className={`order-item ${expandedId === order.id ? 'open' : ''}`}>
            <div className="order-main" onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}>
              <span className="order-num">{order.numerZamowienia}</span>
              <span className="client-name">{order.nazwaFirmy}</span>
              <span>{order.sumaNetto} zł</span>
              <span>{order.sumaBrutto} zł</span>
              <span className={`status ${order.status.toLowerCase()}`}>{order.status}</span>
            </div>

            {expandedId === order.id && (
              <div className="order-details">
                <table className="items-table">
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
                    {order.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.kodProduktu}</td>
                        <td>{item.nazwaProduktu}</td>
                        <td>{item.ilosc} {item.opakowanie}</td>
                        <td>{item.cenaZastosowana} zł</td>
                        <td>{item.wartoscNetto} zł</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesPage;