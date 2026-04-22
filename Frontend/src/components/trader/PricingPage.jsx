import React, { useState, useEffect } from 'react';
import api from '../../services/api'; 
import './PricingPage.scss';

const PricingPage = () => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  
  // specialPrices przechowuje to, co wpisujemy w input (edycja)
  const [specialPrices, setSpecialPrices] = useState({});
  // savedPrices przechowuje to, co faktycznie jest w bazie danych (ostatnia cena)
  const [savedPrices, setSavedPrices] = useState({});
  
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ text: '', type: '' });

  // Stan paginacji
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10); // 10 pozycji na stronę

  // Ikony SVG
  const IconShield = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="12" r="3"/></svg>
  );
  const IconSave = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
  );

  // 1. Pobieranie danych początkowych (Klienci i Produkty)
  useEffect(() => {
    let isMounted = true;
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [custRes, prodRes] = await Promise.all([
          api.get('/api/customers'),
          api.get('/api/products')
        ]);
        if (isMounted) {
          setCustomers(custRes.data);
          setProducts(prodRes.data);
        }
      } catch  {
        if (isMounted) showNotification('Błąd pobierania danych podstawowych', 'error');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchInitialData();
    return () => { isMounted = false; };
  }, []);

  // 2. Pobieranie cen specjalnych po wybraniu klienta
  useEffect(() => {
    if (selectedCustomerId) {
      const fetchSpecialPrices = async () => {
        try {
          const res = await api.get(`/api/customer-prices/${selectedCustomerId}`);
          const pricesMap = {};
          res.data.forEach(item => {
            // Mapujemy po productId (UUID), bo tak mamy w encji
            const pId = item.productId; 
            if (pId) pricesMap[pId] = item.specialPrice;
          });
          // Ustawiamy oba stany - widok edycji i widok "obecnej ceny"
          setSavedPrices(pricesMap);
          setSpecialPrices(pricesMap);
          setCurrentPage(1); // Resetujemy paginację po zmianie klienta
        } catch (err) {
          console.error("Błąd pobierania cen indywidualnych", err);
        }
      };
      fetchSpecialPrices();
    } else {
      setSavedPrices({});
      setSpecialPrices({});
      setCurrentPage(1); // Resetujemy paginację, gdy klient nie jest wybrany
    }
  }, [selectedCustomerId]);

  const handlePriceChange = (productId, value) => {
    setSpecialPrices(prev => ({ ...prev, [productId]: value }));
  };

  const showNotification = (text, type) => {
    setNotification({ text, type });
    setTimeout(() => setNotification({ text: '', type: '' }), 3000);
  };

  // Obliczenia dla paginacji
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  const totalPages = Math.ceil(products.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // 3. Główna funkcja zapisu
  const savePrice = async (product) => {
    const val = specialPrices[product.id];
    if (!val) return;

    const newPrice = parseFloat(val);
    const minPrice = product.cenaProdukcji * 1.10;

    if (newPrice < minPrice) {
      showNotification(`Błąd: Marża poniżej 10%! Min: ${minPrice.toFixed(2)}`, 'error');
      return;
    }

    try {
      await api.post('/api/customer-prices/save', {
        customerId: parseInt(selectedCustomerId), 
        productId: product.id, 
        specialPrice: newPrice
      });
      
      // Po sukcesie aktualizujemy "obecną cenę" w widoku
      setSavedPrices(prev => ({ ...prev, [product.id]: newPrice }));
      showNotification(`Zaktualizowano cenę: ${product.nazwa}`, 'success');
    } catch (err) {
      const errorMsg = err.response?.data || 'Błąd zapisu ceny';
      showNotification(errorMsg, 'error');
    }
  };

  return (
    <div className="pricing-container">
      <header className="pricing-header">
        <div className="header-info">
          <div className="icon-badge"><IconShield /></div>
          <div>
            <h1>Cenniki Indywidualne</h1>
            <p>Zarządzanie marżą i cenami specjalnymi</p>
          </div>
        </div>
        
        <div className="customer-selector">
          <select 
            value={selectedCustomerId} 
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            disabled={loading}
          >
            <option value="">-- Wybierz klienta (Lead) --</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.nazwaFirmy}</option>
            ))}
          </select>
        </div>
      </header>

      {notification.text && (
        <div className={`notification ${notification.type}`}>{notification.text}</div>
      )}

      <div className="products-grid-wrapper">
        {loading ? (
          <p className="loading-text">Ładowanie produktów...</p>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>Kod</th>
                <th>Nazwa i Koszt</th>
                <th className="text-center">Cena A</th>
                <th className="text-center">Obecna Cena</th>
                <th className="text-center">Nowa Cena</th>
                <th className="text-center">Akcja</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map(product => { // Zmieniono na currentProducts.map
                const minPrice = (product.cenaProdukcji * 1.10).toFixed(2);
                const currentVal = specialPrices[product.id];
                const lastSavedVal = savedPrices[product.id];
                const isTooLow = currentVal && parseFloat(currentVal) < minPrice;

                return (
                  <tr key={product.id} className={isTooLow ? 'row-warn' : ''}>
                    <td className="code">{product.kodProduktu}</td>
                    <td>
                      <div className="product-name">{product.nazwa}</div>
                      <div className="cost-info">Koszt: {product.cenaProdukcji.toFixed(2)} PLN</div>
                    </td>
                    <td className="price-std">{product.cenaA.toFixed(2)} PLN</td>
                    
                    {/* KOLUMNA: OSTATNIA ZAPISANA CENA */}
                    <td className="text-center current-price-display">
                      {lastSavedVal ? (
                        <span className="price-tag">{parseFloat(lastSavedVal).toFixed(2)} PLN</span>
                      ) : (
                        <span className="no-price">Brak</span>
                      )}
                    </td>

                    <td className="price-input-cell">
                      <input
                        type="number"
                        step="0.01"
                        className={`price-input ${isTooLow ? 'input-error' : ''}`}
                        value={currentVal || ''}
                        onChange={(e) => handlePriceChange(product.id, e.target.value)}
                        placeholder={minPrice}
                        disabled={!selectedCustomerId}
                      />
                    </td>
                    <td>
                      <button 
                        className="save-btn"
                        onClick={() => savePrice(product)}
                        disabled={!selectedCustomerId || isTooLow || !currentVal}
                      >
                        <IconSave /> Zapisz
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Kontrolki paginacji */}
      {products.length > productsPerPage && (
        <div className="pagination">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => paginate(index + 1)}
              className={currentPage === index + 1 ? 'active' : ''}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PricingPage;