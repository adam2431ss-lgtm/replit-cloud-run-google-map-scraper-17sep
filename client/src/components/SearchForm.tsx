import React, { useState } from 'react';
import { SearchFilters } from '../types';

interface SearchFormProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  onBulkSearch?: (queries: string[], filters: SearchFilters) => void;
  loading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, onBulkSearch, loading }) => {
  const [query, setQuery] = useState('');
  const [bulkQueries, setBulkQueries] = useState('');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState(5000);
  const [categories, setCategories] = useState<string[]>([]);
  const [maxResults, setMaxResults] = useState(20);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const commonCategories = [
    'restaurant', 'cafe', 'bar', 'hotel', 'shopping_mall',
    'gas_station', 'hospital', 'pharmacy', 'bank', 'gym',
    'beauty_salon', 'hair_care', 'dentist', 'lawyer', 'real_estate_agency'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const filters: SearchFilters = {
      radius,
      categories: categories.length > 0 ? categories : undefined,
      maxResults
    };

    // Parse location if provided
    if (location.trim()) {
      const coords = location.split(',').map(coord => parseFloat(coord.trim()));
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        filters.location = { lat: coords[0], lng: coords[1] };
      }
    }

    if (isBulkMode && bulkQueries.trim()) {
      const queries = bulkQueries
        .split('\n')
        .map(q => q.trim())
        .filter(q => q.length > 0)
        .slice(0, 10); // Limit to 10 queries
      
      if (queries.length > 0 && onBulkSearch) {
        onBulkSearch(queries, filters);
      }
    } else if (!isBulkMode && query.trim()) {
      onSearch(query, filters);
    }
  };

  const toggleCategory = (category: string) => {
    setCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="search-form-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-mode-toggle">
          <button
            type="button"
            className={`mode-btn ${!isBulkMode ? 'active' : ''}`}
            onClick={() => setIsBulkMode(false)}
          >
            Single Search
          </button>
          <button
            type="button"
            className={`mode-btn ${isBulkMode ? 'active' : ''}`}
            onClick={() => setIsBulkMode(true)}
          >
            Bulk Search
          </button>
        </div>

        <div className="search-main">
          {isBulkMode ? (
            <div className="bulk-search-group">
              <textarea
                value={bulkQueries}
                onChange={(e) => setBulkQueries(e.target.value)}
                placeholder="Enter multiple search queries (one per line, max 10):&#10;restaurants in New York&#10;coffee shops in Boston&#10;hotels in San Francisco"
                className="bulk-search-input"
                rows={5}
                disabled={loading}
              />
              <div className="bulk-info">
                {bulkQueries.split('\n').filter(q => q.trim()).length}/10 queries
              </div>
            </div>
          ) : (
            <div className="search-input-group">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for places (e.g., 'restaurants in New York')"
                className="search-input"
                disabled={loading}
              />
            </div>
          )}
          
          <button 
            type="submit" 
            className="search-button"
            disabled={loading || (isBulkMode ? !bulkQueries.trim() : !query.trim())}
          >
            {loading ? (
              <div className="loading-spinner"></div>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L16.514 16.506M19 10.5C19 15.194 15.194 19 10.5 19S2 15.194 2 10.5 5.806 2 10.5 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Search
              </>
            )}
          </button>
        </div>

        <button 
          type="button" 
          className="advanced-toggle"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Options
        </button>

        {showAdvanced && (
          <div className="advanced-options">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="location">Location (lat, lng)</label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="40.7128, -74.0060"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="radius">Radius (meters)</label>
                <select
                  id="radius"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="form-select"
                >
                  <option value={1000}>1 km</option>
                  <option value={2500}>2.5 km</option>
                  <option value={5000}>5 km</option>
                  <option value={10000}>10 km</option>
                  <option value={25000}>25 km</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="maxResults">Max Results</label>
                <select
                  id="maxResults"
                  value={maxResults}
                  onChange={(e) => setMaxResults(Number(e.target.value))}
                  className="form-select"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>

            <div className="categories-section">
              <label>Filter by Categories (optional)</label>
              <div className="categories-grid">
                {commonCategories.map(category => (
                  <button
                    key={category}
                    type="button"
                    className={`category-chip ${categories.includes(category) ? 'active' : ''}`}
                    onClick={() => toggleCategory(category)}
                  >
                    {category.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchForm;