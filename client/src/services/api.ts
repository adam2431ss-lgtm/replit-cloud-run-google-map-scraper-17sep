import axios from 'axios';
import { PlaceResult, SearchFilters, ApiResponse } from '../types';

const API_BASE_URL = '';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const searchPlaces = async (
  query: string, 
  filters: SearchFilters = {}
): Promise<ApiResponse<PlaceResult[]>> => {
  const response = await api.post('/places/search', {
    query,
    location: filters.location,
    radius: filters.radius || 5000,
    categories: filters.categories || [],
    maxResults: filters.maxResults || 20
  });
  return response.data;
};

export const bulkSearchPlaces = async (
  queries: string[], 
  filters: SearchFilters = {}
): Promise<ApiResponse<PlaceResult[]>> => {
  const response = await api.post('/places/bulk-search', {
    queries,
    location: filters.location,
    radius: filters.radius || 5000,
    categories: filters.categories || [],
    maxResults: filters.maxResults || 20
  });
  return response.data;
};

export const getPlaceDetails = async (placeId: string): Promise<ApiResponse<PlaceResult>> => {
  const response = await api.get(`/places/details/${placeId}`);
  return response.data;
};

export const exportData = async (
  places: PlaceResult[], 
  format: 'csv' | 'json',
  filename: string = 'google-places-export'
): Promise<void> => {
  const response = await api.post(`/places/export/${format}`, {
    places,
    filename
  }, {
    responseType: 'blob'
  });

  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.${format}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};