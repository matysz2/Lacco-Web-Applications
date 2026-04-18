import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import './SalesmenPage.scss';

/**
 * SalesmenPage Component
 * Zarządzanie zespołem handlowym.
 */
const SalesmenPage = () => {
    const [salesmen, setSalesmen] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSalesman, setEditingSalesman] = useState(null);
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        currentMonthGoal: 0
    });

    const fetchSalesmen = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/salesmen');
            setSalesmen(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Błąd pobierania:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSalesmen();
    }, [fetchSalesmen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'currentMonthGoal' ? parseFloat(value) || 0 : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSalesman) {
                await api.put(`/api/salesmen/${editingSalesman.id}`, formData);
            } else {
                await api.post('/api/salesmen', { ...formData, role: 'TRADER' });
            }
            fetchSalesmen();
            closeModal();
        } catch  {
            alert('Błąd zapisu.');
        }
    };

    const handleEdit = (salesman) => {
        setEditingSalesman(salesman);
        setFormData({
            firstName: salesman.firstName || '',
            lastName: salesman.lastName || '',
            email: salesman.email || '',
            currentMonthGoal: salesman.currentMonthGoal || 0
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingSalesman(null);
        setFormData({ firstName: '', lastName: '', email: '', currentMonthGoal: 0 });
    };

    // --- POPRAWIONA KONFIGURACJA KOLUMN ---
    const columns = [
        { 
            key: 'fullName', // Zmieniamy klucz na wirtualny
            label: 'Handlowiec', 
            sortable: true,
            // Jeśli Twoje DataTable nie wspiera render, upewnij się, że dane mają to pole.
            // Tutaj wymuszamy wyświetlanie obu pól:
            render: (_, item) => `${item.firstName || ''} ${item.lastName || ''}`.trim()
        },
        { key: 'email', label: 'E-mail', sortable: true },
        { 
            key: 'currentMonthGoal', 
            label: 'Cel Bieżący', 
            sortable: true,
            render: (val) => val ? `${Number(val).toLocaleString()} zł` : '0 zł'
        }
    ];

    const actions = [
        { label: 'Edytuj/Cel', onClick: handleEdit, className: 'edit-btn' },
        { 
            label: 'Usuń', 
            onClick: async (item) => {
                if(window.confirm(`Usunąć ${item.firstName}?`)) {
                    await api.delete(`/api/salesmen/${item.id}`);
                    fetchSalesmen();
                }
            }, 
            className: 'delete-btn' 
        }
    ];

    // Mapujemy dane przed wysłaniem do tabeli, aby mieć pewność, że imię i nazwisko są dostępne pod jednym kluczem
    const tableData = salesmen.map(s => ({
        ...s,
        fullName: `${s.firstName || ''} ${s.lastName || ''}`.trim()
    }));

    if (loading) return <div className="loader">Ładowanie...</div>;

    return (
        <div className="salesmen-page">
            <header className="page-header">
                <h1>Zarządzanie Zespołem</h1>
                <button className="add-btn" onClick={() => setShowModal(true)}>+ Dodaj Handlowca</button>
            </header>

            <DataTable 
                data={tableData} 
                columns={columns} 
                actions={actions} 
                searchable={true} 
            />

            <Modal isOpen={showModal} onClose={closeModal} title={editingSalesman ? 'Edytuj' : 'Nowy'}>
                <form onSubmit={handleSubmit} className="salesman-form">
                    <div className="form-group">
                        <label>Imię</label>
                        <input name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <label>Nazwisko</label>
                        <input name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <label>E-mail</label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <label>Cel finansowy (PLN)</label>
                        <input type="number" name="currentMonthGoal" value={formData.currentMonthGoal} onChange={handleInputChange} />
                    </div>
                    <div className="form-actions">
                        <button type="button" onClick={closeModal}>Anuluj</button>
                        <button type="submit" className="submit-btn">Zapisz</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};


export default SalesmenPage;