import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import './ClientPanel.scss';

const ClientPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [filter, setFilter] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isLocating, setIsLocating] = useState(false); 
  const [editingLead, setEditingLead] = useState(null);

  const user = JSON.parse(localStorage.getItem('user')) || {};
  const traderId = user.id || user.uuid || "Nieznany-Handlowiec";

  const fetchLeads = useCallback(async () => {
    if (!traderId || traderId === "Nieznany-Handlowiec") return;

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const response = await api.get('/api/leads', { 
        params: { handlowiec: traderId, search: filter },
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      setLeads(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Błąd pobierania:', err.message);
      setError('Nie udało się pobrać listy stolarzy. Sprawdź połączenie.');
    } finally {
      setLoading(false);
    }
  }, [traderId, filter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleAutoSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const miasto = formData.get('miasto');
    const hiddenUuid = formData.get('traderUuid'); 
    
    setIsLocating(true);

    const sendData = (latitude, longitude) => {
      const payload = {
        miasto: miasto,
        szukanaFraza: "Usługi stolarskie", // Wysłane po cichu do backendu/n8n
        handlowiec: user.nazwa || "Mateusz",
        uuid: hiddenUuid,
        coords: latitude && longitude ? `@${latitude},${longitude},11z` : "" 
      };

      fetch('http://158.180.18.82.sslip.io:5678/webhook/d0daj-klienta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'omit' 
      })
      .then((response) => {
        if (!response.ok) throw new Error('Błąd serwera n8n');
        // Komunikat bez słowa "stolarz"
        alert(`Zlecenie szukania w miejscowości ${miasto} zostało wysłane!`);
        setShowSearchModal(false);
      })
      .catch((err) => {
        console.error('Błąd n8n:', err);
        alert('Błąd wysyłania do n8n.');
      })
      .finally(() => setIsLocating(false));
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          sendData(position.coords.latitude, position.coords.longitude);
        },
        () => {
          console.warn("Brak zgody na GPS, wysyłam bez współrzędnych.");
          sendData(null, null);
        },
        { timeout: 5000 }
      );
    } else {
      sendData(null, null);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const payload = { ...data, handlowiec: traderId };

    try {
      if (editingLead) {
        await api.put(`/api/leads/${editingLead.id}`, payload);
      } else {
        await api.post('/api/leads', payload);
      }
      setShowModal(false);
      setEditingLead(null);
      fetchLeads();
    } catch {
      alert('Błąd zapisu danych.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Czy na pewno chcesz usunąć tego stolarza?')) {
      try {
        await api.delete(`/api/leads/${id}`);
        fetchLeads();
      } catch {
        alert('Błąd podczas usuwania.');
      }
    }
  };

  if (loading) return <div className="loading-container">Inicjalizacja systemu...</div>;

  return (
    <div className="client-page">
      <header className="page-header">
        <div className="header-top">
          <h1>Moi Klienci</h1>
          <button 
            className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`} 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
        </div>

        <div className={`action-bar ${isMobileMenuOpen ? 'active' : ''}`}>
          <input 
            className="search-input" 
            placeholder="Szukaj..." 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)} 
          />
          <button className="btn-search-auto" onClick={() => setShowSearchModal(true)}>
            🔍 Szukaj klientów
          </button>
          <button className="btn-add" onClick={() => { setEditingLead(null); setShowModal(true); }}>
            <span>+</span> Dodaj ręcznie
          </button>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <div className="table-wrapper">
        <table className="client-table">
          <thead>
            <tr>
              <th className="col-data">Firma • Adres</th>
              <th className="col-status">Status</th>
              <th className="col-actions">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {leads.length > 0 ? leads.map(lead => (
              <tr key={lead.id || lead.uuid}>
                <td data-label="Firma / Adres">
                  <div className="inline-row">
                    <span className="firm-name">{lead.nazwaFirmy || lead.nazwa_firmy}</span>
                    <span className="dot-sep">•</span>
                    <span className="firm-addr">{lead.adres}</span>
                  </div>
                </td>
                <td data-label="Status">
                  <span className={`status-pill ${(lead.statusWizyty || lead.status_wizyty || 'nowy').toLowerCase().replace(/\s+/g, '-')}`}>
                    {lead.statusWizyty || lead.status_wizyty || 'Nowy'}
                  </span>
                </td>
                <td className="actions-cell">
                  <button className="edit-btn" onClick={() => { setEditingLead(lead); setShowModal(true); }}>✎</button>
                  <button className="del-btn" onClick={() => handleDelete(lead.id)}>🗑</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>Brak przypisanych klientów.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleSave}>
            <h2>{editingLead ? 'Edytuj dane' : 'Nowy stolarz'}</h2>
            <input name="nazwaFirmy" defaultValue={editingLead?.nazwaFirmy || editingLead?.nazwa_firmy} placeholder="Nazwa firmy" required />
            <input name="adres" defaultValue={editingLead?.adres} placeholder="Adres" required />
            <div className="modal-actions">
              <button type="button" onClick={() => setShowModal(false)}>Anuluj</button>
              <button type="submit" className="save-btn">Zapisz</button>
            </div>
          </form>
        </div>
      )}

      {showSearchModal && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleAutoSearch}>
            <h2>Automatyczne szukanie</h2>
            <p className="info-text">System użyje GPS, aby znaleźć nowych klientów w wybranym mieście.</p>
            <input name="miasto" placeholder="Wpisz miasto (np. Tarnów)" required autoFocus />
            <input type="hidden" name="traderUuid" value={traderId} />
            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button type="button" onClick={() => setShowSearchModal(false)}>Zamknij</button>
              <button type="submit" className="search-btn-submit" disabled={isLocating}>
                {isLocating ? 'Pobieranie GPS...' : 'Uruchom szukanie'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ClientPage;