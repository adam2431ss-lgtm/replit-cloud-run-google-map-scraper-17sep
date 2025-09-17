const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const path = require('path');

class CsvExporter {
  generateCSV(places, filename = 'google-places-export') {
    return new Promise((resolve, reject) => {
      try {
        // Transform places data for CSV export
        const csvData = places.map(place => ({
          name: place.name,
          address: place.address,
          phone: place.phone || '',
          website: place.website || '',
          rating: place.rating || 0,
          review_count: place.userRatingCount || 0,
          primary_type: place.primaryType || '',
          types: Array.isArray(place.types) ? place.types.join('; ') : '',
          business_status: place.businessStatus,
          price_level: place.priceLevel || '',
          latitude: place.location?.lat || '',
          longitude: place.location?.lng || '',
          google_maps_url: place.googleMapsUrl || '',
          opening_hours: Array.isArray(place.openingHours) ? place.openingHours.join('; ') : ''
        }));

        // Define CSV headers
        const headers = [
          { id: 'name', title: 'Business Name' },
          { id: 'address', title: 'Address' },
          { id: 'phone', title: 'Phone Number' },
          { id: 'website', title: 'Website' },
          { id: 'rating', title: 'Rating' },
          { id: 'review_count', title: 'Review Count' },
          { id: 'primary_type', title: 'Primary Type' },
          { id: 'types', title: 'All Types' },
          { id: 'business_status', title: 'Business Status' },
          { id: 'price_level', title: 'Price Level' },
          { id: 'latitude', title: 'Latitude' },
          { id: 'longitude', title: 'Longitude' },
          { id: 'google_maps_url', title: 'Google Maps URL' },
          { id: 'opening_hours', title: 'Opening Hours' }
        ];

        // Convert to CSV string format
        let csvContent = headers.map(header => `"${header.title}"`).join(',') + '\\n';
        
        csvData.forEach(row => {
          const csvRow = headers.map(header => {
            let value = String(row[header.id] || '');
            // Prevent CSV injection by escaping dangerous prefixes
            if (value.startsWith('=') || value.startsWith('+') || value.startsWith('-') || value.startsWith('@')) {
              value = "'" + value; // Prefix with single quote to neutralize formula
            }
            // Escape quotes and wrap in quotes
            return `"${value.replace(/"/g, '""')}"`;
          }).join(',');
          csvContent += csvRow + '\\n';
        });

        resolve(csvContent);
      } catch (error) {
        console.error('CSV generation error:', error);
        reject(error);
      }
    });
  }
}

module.exports = new CsvExporter();