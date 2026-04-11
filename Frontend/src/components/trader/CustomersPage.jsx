import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import './ClientPanel.scss';

const ClientPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [filter, setFilter] = useState('');
  
  // Stan dla Modala (Edycja/Dodawanie)
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  const user = JSON.parse(localStorage.getItem('user')) || {};
  const traderId = user.id || user.uuid;

  // 1. Pobieranie danych
  const fetchLeads = useCallback(async () => {
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
      setError('Błąd połączenia z serwerem.');
    } finally {
      setLoading(false);
    }
  }, [traderId, filter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // 2. Obsługa Akcji
  const handleEdit = (lead) => {
    setEditingLead(lead);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Czy na pewno chcesz usunąć tego stolarza?')) {
      try {
        await api.delete(`/api/leads/${id}`);
        fetchLeads();
      } catch  {
        alert('Błąd podczas usuwania.');
      }
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
    } catch  {
      alert('Błąd zapisu danych.');
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
            placeholder="Szukaj firmy lub lokalizacji..." 
            value={filter}
            onChange={(e) => setFilter(e.target.value)} 
          />
          <button className="btn-add" onClick={() => { setEditingLead(null); setShowModal(true); }}>
            <span>+</span> Dodaj stolarza
          </button>
        </div>
      </header>

      {error && <div className="error-badge">{error}</div>}

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
            {leads.map(lead => (
              <tr key={lead.id}>
                <td data-label="Firma / Adres">
                  <div className="inline-row">
                    <span className="firm-name">{lead.nazwaFirmy}</span>
                    <span className="dot-sep">•</span>
                    <span className="firm-addr">{lead.adres}</span>
                  </div>
                </td>
                <td data-label="Status">
                  <span className={`status-pill ${lead.statusWizyty?.toLowerCase().replace(/\s+/g, '-')}`}>
                    {lead.statusWizyty || 'Nowy'}
                  </span>
                </td>
                <td className="actions-cell">
                  <button className="edit-btn" onClick={() => handleEdit(lead)}>✎</button>
                  <button className="del-btn" onClick={() => handleDelete(lead.id)}>🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Edycji/Dodawania */}
      {showModal && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleSave}>
            <h2>{editingLead ? 'Edytuj dane' : 'Nowy stolarz'}</h2>
            <input name="nazwaFirmy" defaultValue={editingLead?.nazwaFirmy} placeholder="Nazwa firmy" required />
            <input name="adres" defaultValue={editingLead?.adres} placeholder="Adres" required />
            <select name="statusWizyty" defaultValue={editingLead?.statusWizyty || 'Nowy'}>
              <option value="Nowy">Nowy</option>
              <option value="W trakcie">W trakcie</option>
              <option value="Stały">Stały</option>
            </select>
            <textarea name="opisNotatki" defaultValue={editingLead?.opisNotatki} placeholder="Notatki..." />
            <div className="modal-actions">
              <button type="button" onClick={() => setShowModal(false)}>Anuluj</button>
              <button type="submit" className="save-btn">Zapisz</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ClientPage;