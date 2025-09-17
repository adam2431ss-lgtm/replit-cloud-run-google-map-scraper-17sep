import React, { useState } from 'react';
import { PlaceResult } from '../types';
import PlaceCard from './PlaceCard';

interface ResultsDisplayProps {
  results: PlaceResult[];
  loading: boolean;
  searchQuery: string;
  onExport: (format: 'csv' | 'json') => void;
}

type ViewMode = 'cards' | 'table' | 'json';

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  results,
  loading,
  searchQuery,
  onExport
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  if (loading) {
    return (
      <div className="results-container">
        <div className="loading-state">
          <div className="loading-spinner large"></div>
          <p>Searching Google Maps...</p>
        </div>
      </div>
    );
  }

  if (results.length === 0 && !loading && searchQuery) {
    return (
      <div className="results-container">
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L16.514 16.506M19 10.5C19 15.194 15.194 19 10.5 19S2 15.194 2 10.5 5.806 2 10.5 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3>No results found</h3>
          <p>Try adjusting your search terms or location filters.</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="results-container">
        <div className="welcome-state">
          <div className="welcome-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
            </svg>
          </div>
          <h2>Welcome to Google Maps Scraper</h2>
          <p>Enter a search query above to start extracting business data from Google Maps.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="results-container">
      <div className="results-header">
        <div className="results-info">
          <h2>Search Results</h2>
          <p>{results.length} places found for "{searchQuery}"</p>
        </div>
        
        <div className="results-controls">
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Card view"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"/>
              </svg>
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table view"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3h18v18H3V3zm16 16V5H5v14h14zm-8-2h6v-2h-6v2zm-6-4h12V9H5v4z"/>
              </svg>
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'json' ? 'active' : ''}`}
              onClick={() => setViewMode('json')}
              title="JSON view"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
                <path d="M9 9h6v6H9z" fill="white"/>
              </svg>
            </button>
          </div>
          
          <div className="export-buttons">
            <button 
              onClick={() => onExport('csv')}
              className="export-btn csv"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                <path d="M14 2v6h6"/>
                <path d="M16 13H8v-2h8v2zm0 4H8v-2h8v2z" fill="white"/>
              </svg>
              Export CSV
            </button>
            <button 
              onClick={() => onExport('json')}
              className="export-btn json"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                <path d="M14 2v6h6"/>
                <path d="M10 12h4v4h-4z" fill="white"/>
              </svg>
              Export JSON
            </button>
          </div>
        </div>
      </div>

      <div className="results-content">
        {viewMode === 'cards' && (
          <div className="results-grid">
            {results.map(place => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        )}
        
        {viewMode === 'table' && (
          <div className="table-container">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Rating</th>
                  <th>Address</th>
                  <th>Phone</th>
                  <th>Website</th>
                  <th>Type</th>
                  <th>Reviews</th>
                </tr>
              </thead>
              <tbody>
                {results.map(place => (
                  <tr key={place.id}>
                    <td className="name-cell">
                      <strong>{place.name}</strong>
                    </td>
                    <td className="rating-cell">
                      {place.rating > 0 && (
                        <span className="rating">
                          <span className="stars">
                            {'★'.repeat(Math.round(place.rating))}
                          </span>
                          {place.rating.toFixed(1)}
                        </span>
                      )}
                    </td>
                    <td className="address-cell">{place.address}</td>
                    <td className="phone-cell">{place.phone || '-'}</td>
                    <td className="website-cell">
                      {place.website ? (
                        <a href={place.website} target="_blank" rel="noopener noreferrer">
                          Visit
                        </a>
                      ) : '-'}
                    </td>
                    <td className="type-cell">{place.primaryType || place.types[0] || '-'}</td>
                    <td className="reviews-cell">{place.userRatingCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {viewMode === 'json' && (
          <div className="json-container">
            <pre className="json-display">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsDisplay;