import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './AccountSettings.scss';

const AccountSettingsPage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const response = await api.get('/api/salesmen/me');
        if (isMounted) {
          setProfile(response.data);
          setFormData({ email: response.data.email, password: '' });
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Błąd pobierania danych profilu", err);
          setLoading(false);
        }
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const handleUpdate = async () => {
    try {
      // Budujemy pełny obiekt, aby backend nie wyzerował brakujących pól
      const updateData = {
        ...profile, // Kopiujemy wszystkie dane (id, firstName, lastName, role itd.)
        email: formData.email, // Nadpisujemy zmieniony email
      };

      // Jeśli wpisano nowe hasło, dodajemy je do paczki
      if (formData.password && formData.password.trim() !== '') {
        updateData.password = formData.password;
      }
      
      await api.put(`/api/salesmen/${profile.id}`, updateData);
      
      // Odświeżamy lokalny stan po sukcesie
      const response = await api.get('/api/salesmen/me');
      setProfile(response.data);
      setIsEditing(false);
      setFormData(prev => ({ ...prev, password: '' }));
    } catch  {
      alert("Wystąpił błąd podczas aktualizacji danych.");
    }
  };

  if (loading) return <div className="loader">Ładowanie...</div>;
  if (!profile) return <div className="error">Błąd ładowania profilu.</div>;

  return (
    <div className="account-settings-page">
      <div className="settings-container">
        <header className="settings-header">
          <h1>Ustawienia konta</h1>
          <p>Zarządzaj swoimi danymi i zabezpieczeniami</p>
        </header>

        <div className="profile-card">
          {/* Imię i Nazwisko - widoczne zawsze, abyś wiedział co wysyłasz */}
          <div className="field-group readonly">
            <label>Imię i Nazwisko</label>
            <div className="static-value">{profile.firstName} {profile.lastName}</div>
          </div>

          <div className="field-group">
            <label>Adres E-mail</label>
            {isEditing ? (
              <input 
                type="email" 
                value={formData.email || ''} 
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            ) : <div className="static-value">{profile.email}</div>}
          </div>

          <div className="field-group">
            <label>Hasło</label>
            {isEditing ? (
              <input 
                type="password" 
                placeholder="Wpisz nowe hasło (zostaw puste, aby nie zmieniać)"
                value={formData.password || ''} 
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            ) : (
              <div className="static-value password-mask">••••••••••••</div>
            )}
          </div>

     <div className="info-row">
  <div className="info-column">
    <label>Rola</label>
    <div className="value-wrapper">
      <span className="status-badge">{profile.role}</span>
    </div>
  </div>

  <div className="info-column">
    <label>Status</label>
    <div className="value-wrapper">
      <span className={`status-dot ${profile.isActive ? 'active' : ''}`}></span>
      <span className="status-text">{profile.isActive ? 'Aktywny' : 'Nieaktywny'}</span>
    </div>
  </div>
</div>

          <div className="timestamp-info">
            <small>Ostatnie logowanie: {profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : '---'}</small>
            <small>Utworzono: {new Date(profile.createdAt).toLocaleDateString()}</small>
          </div>

          <div className="settings-actions">
            {isEditing ? (
              <>
                <button className="btn-save" onClick={handleUpdate}>Zapisz zmiany</button>
                <button className="btn-cancel" onClick={() => setIsEditing(false)}>Anuluj</button>
              </>
            ) : (
              <button className="btn-edit" onClick={() => setIsEditing(true)}>Edytuj profil</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsPage;