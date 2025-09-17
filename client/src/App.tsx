import React, { useState } from 'react';
import './App.css';
import SearchForm from './components/SearchForm';
import ResultsDisplay from './components/ResultsDisplay';
import Header from './components/Header';
import { PlaceResult, SearchFilters } from './types';
import * as api from './services/api';

function App() {
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSearch = async (query: string, filters: SearchFilters) => {
    setLoading(true);
    setError(null);
    setSearchQuery(query);
    
    try {
      const response = await api.searchPlaces(query, filters);
      setResults(response.data);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.response?.data?.error || err.message || 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSearch = async (queries: string[], filters: SearchFilters) => {
    setLoading(true);
    setError(null);
    setSearchQuery(`Bulk search (${queries.length} queries)`);
    
    try {
      const response = await api.bulkSearchPlaces(queries, filters);
      setResults(response.data);
    } catch (err: any) {
      console.error('Bulk search error:', err);
      setError(err.response?.data?.error || err.message || 'Bulk search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    if (results.length === 0) return;
    
    try {
      await api.exportData(results, format, `google-places-${searchQuery || 'export'}`);
    } catch (err: any) {
      console.error('Export error:', err);
      setError(`Export failed: ${err.message}`);
    }
  };

  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <SearchForm onSearch={handleSearch} onBulkSearch={handleBulkSearch} loading={loading} />
        
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}
        
        <ResultsDisplay 
          results={results}
          loading={loading}
          searchQuery={searchQuery}
          onExport={handleExport}
        />
      </main>
    </div>
  );
}

export default App;
