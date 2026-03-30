import React, { useState, useMemo } from 'react';
import './DataTable.scss';

/**
 * DataTable component
 * Reusable table with sorting and filtering
 */
const DataTable = ({ data, columns, actions = [], searchable = false }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return sortedData;

    return sortedData.filter(item =>
      columns.some(column =>
        String(item[column.key]).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [sortedData, searchTerm, columns]);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div className="data-table-container">
      {searchable && (
        <div className="table-search">
          <input
            type="text"
            placeholder="Szukaj..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      )}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(column => (
                <th
                  key={column.key}
                  onClick={() => column.sortable && handleSort(column.key)}
                  className={column.sortable ? 'sortable' : ''}
                >
                  {column.label}
                  {column.sortable && sortConfig.key === column.key && (
                    <span className="sort-indicator">
                      {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
              ))}
              {actions.length > 0 && <th>Akcje</th>}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={item.id || index}>
                {columns.map(column => (
                  <td key={column.key}>
                    {item[column.key]}
                  </td>
                ))}
                {actions.length > 0 && (
                  <td className="actions-cell">
                    {actions.map((action, actionIndex) => (
                      <button
                        key={actionIndex}
                        className={`action-btn ${action.className}`}
                        onClick={() => action.onClick(item)}
                      >
                        {action.label}
                      </button>
                    ))}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredData.length === 0 && (
        <div className="no-data">
          Brak danych do wyświetlenia
        </div>
      )}
    </div>
  );
};

export default DataTable;