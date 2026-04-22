import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import './ProductPage.scss';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Stan paginacji
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20); // 20 pozycji na stronę

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await api.get('/api/products', {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      // Dane zawierają teraz pole 'ilosc' i 'stanMinimalny' z tabeli stany_magazynowe
      setProducts(response.data || []);
    } catch (err) {
      console.error("Błąd pobierania danych:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filteredProducts = products.filter(p => {
    const s = searchTerm.toLowerCase();
    return (
      p.nazwa?.toLowerCase().includes(s) || 
      p.kodProduktu?.toLowerCase().includes(s) ||
      p.grupa?.toLowerCase().includes(s)
    );
  });

  // Obliczenia dla paginacji
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <div className="loader">Ładowanie magazynu...</div>;

  return (
    <div className="products-container">
      <header className="inventory-header">
        <div className="title-section">
          <h1>Stany Magazynowe</h1>
          <span className="product-count">Liczba pozycji: {filteredProducts.length}</span>
        </div>
        
        <div className="search-wrapper">
          <div className="search-bar-container">
            <i className="search-icon">🔍</i>
            <input 
              type="text" 
              placeholder="Szukaj po nazwie, kodzie lub grupie towarowej..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="modern-search"
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>
            )}
          </div>
        </div>
      </header>

      <div className="table-responsive">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Nazwa</th>
              <th>Grupa</th>
              <th>Opakowanie</th>
              <th>J.M.</th>
              <th className="text-right">Ilość</th>
              <th className="text-right">Cena A</th>
              <th className="text-right">Cena B</th>
              <th className="text-right">Cena C</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.map(p => {
              const isLowStock = p.ilosc <= p.stanMinimalny;
              return (
                <tr key={p.id} className={isLowStock ? 'low-stock-row' : ''}>
                  <td data-label="Nazwa" className="name">{p.nazwa}</td>
                  <td data-label="Grupa">{p.grupa}</td>
                  <td data-label="Opakowanie">{p.opakowanie}</td>
                  <td data-label="J.M."><span className="unit-tag">{p.jm}</span></td>
                  <td data-label="Ilość" className={`stock-bold text-right ${isLowStock ? 'warning' : 'success'}`}>
                    {p.ilosc}
                  </td>
                  <td data-label="Cena A" className="text-right">{p.cenaA?.toFixed(2)} zł</td>
                  <td data-label="Cena B" className="text-right">{p.cenaB?.toFixed(2)} zł</td>
                  <td data-label="Cena C" className="text-right">{p.cenaC?.toFixed(2)} zł</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Kontrolki paginacji */}
      {filteredProducts.length > productsPerPage && (
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

export default ProductsPage;