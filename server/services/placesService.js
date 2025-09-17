const axios = require('axios');

class PlacesService {
  constructor() {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY;
    this.baseUrl = 'https://places.googleapis.com/v1';
    
    if (!this.apiKey) {
      console.warn('WARNING: GOOGLE_PLACES_API_KEY not set. API calls will fail.');
    }
  }

  async searchPlaces(query, location = null, radius = 5000, categories = [], maxResults = 20) {
    try {
      return await this.searchPlacesWithFallback(query, location, radius, categories, maxResults);
    } catch (error) {
      if (error.response) {
        console.error('Places API Error:', error.response.data);
        throw new Error(`Places API error: ${error.response.data.error?.message || 'Unknown error'}`);
      }
      throw error;
    }
  }

  async searchPlacesWithFallback(query, location = null, radius = 5000, categories = [], maxResults = 20) {
    const url = `${this.baseUrl}/places:searchText`;
    
    const requestBody = {
      textQuery: query,
      maxResultCount: Math.min(maxResults, 20) // API limit
    };

    if (location) {
      requestBody.locationBias = {
        circle: {
          center: {
            latitude: location.lat,
            longitude: location.lng
          },
          radius: radius
        }
      };
    }

    // Try with full field mask first
    try {
      const response = await axios.post(url, requestBody, {
        headers: {
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': this.getFieldMask(),
          'Content-Type': 'application/json'
        }
      });
      
      return await this.processSearchResults(response, categories, maxResults);
    } catch (error) {
      // If detailed field mask fails, try with basic field mask
      if (error.response?.status === 400) {
        console.warn('Full field mask failed, trying basic field mask:', error.response.data);
        try {
          const response = await axios.post(url, requestBody, {
            headers: {
              'X-Goog-Api-Key': this.apiKey,
              'X-Goog-FieldMask': this.getBasicFieldMask(),
              'Content-Type': 'application/json'
            }
          });
          
          return await this.processSearchResults(response, categories, maxResults);
        } catch (basicError) {
          console.error('Both field masks failed:', basicError.response?.data);
          throw basicError;
        }
      }
      throw error;
    }
  }

  async processSearchResults(response, categories, maxResults) {
    let places = response.data.places || [];
    
    // Enrich places with detailed information
    const enrichedPlaces = await Promise.all(
      places.slice(0, Math.min(places.length, maxResults)).map(async (place) => {
        try {
          const detailedPlace = await this.getPlaceDetailsWithFallback(place.id);
          return detailedPlace;
        } catch (error) {
          console.warn(`Failed to get details for place ${place.id}:`, error.message);
          return this.transformPlaceData(place); // Return basic data if detailed fetch fails
        }
      })
    );

    // Filter by categories if specified (after enrichment)
    let finalPlaces = enrichedPlaces;
    if (categories.length > 0) {
      finalPlaces = enrichedPlaces.filter(place => 
        place.types && place.types.some(type => 
          categories.some(cat => 
            type.toLowerCase().includes(cat.toLowerCase()) ||
            cat.toLowerCase().includes(type.toLowerCase())
          )
        )
      );
    }

    return finalPlaces;
  }

  async getPlaceDetails(placeId) {
    return await this.getPlaceDetailsWithFallback(placeId);
  }

  async getPlaceDetailsWithFallback(placeId) {
    const url = `${this.baseUrl}/places/${placeId}`;
    
    // Try with detailed field mask first
    try {
      const response = await axios.get(url, {
        headers: {
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': this.getDetailedFieldMask()
        }
      });

      return this.transformPlaceData(response.data);
    } catch (error) {
      // If detailed field mask fails, try with basic field mask
      if (error.response?.status === 400) {
        console.warn('Detailed field mask failed for place details, trying basic field mask:', error.response.data);
        try {
          const response = await axios.get(url, {
            headers: {
              'X-Goog-Api-Key': this.apiKey,
              'X-Goog-FieldMask': this.getBasicDetailedFieldMask()
            }
          });

          return this.transformPlaceData(response.data);
        } catch (basicError) {
          console.error('Both field masks failed for place details:', basicError.response?.data);
          throw new Error(`Place Details API error: ${basicError.response?.data?.error?.message || 'Unknown error'}`);
        }
      }
      
      if (error.response) {
        console.error('Place Details API Error:', error.response.data);
        throw new Error(`Place Details API error: ${error.response.data.error?.message || 'Unknown error'}`);
      }
      throw error;
    }
  }

  getFieldMask() {
    return [
      'places.id',
      'places.displayName',
      'places.formattedAddress',
      'places.addressComponents',
      'places.location',
      'places.rating',
      'places.userRatingCount',
      'places.types',
      'places.nationalPhoneNumber',
      'places.internationalPhoneNumber',
      'places.websiteUri',
      'places.googleMapsUri',
      'places.businessStatus',
      'places.priceLevel',
      'places.primaryType',
      'places.primaryTypeDisplayName',
      'places.shortFormattedAddress',
      'places.adrFormatAddress',
      'places.plusCode',
      'places.editorialSummary'
    ].join(',');
  }

  getDetailedFieldMask() {
    return [
      'id',
      'displayName',
      'formattedAddress',
      'addressComponents',
      'location',
      'rating',
      'userRatingCount',
      'types',
      'nationalPhoneNumber',
      'internationalPhoneNumber',
      'websiteUri',
      'googleMapsUri',
      'businessStatus',
      'priceLevel',
      'primaryType',
      'primaryTypeDisplayName',
      'shortFormattedAddress',
      'adrFormatAddress',
      'plusCode',
      'editorialSummary',
      'regularOpeningHours',
      'currentOpeningHours',
      'photos',
      'reviews',
      'paymentOptions',
      'accessibilityOptions',
      'allowsDogs',
      'delivery',
      'dineIn',
      'curbsidePickup',
      'reservable',
      'servesBreakfast',
      'servesLunch',
      'servesDinner',
      'servesBrunch',
      'servesBeer',
      'servesWine',
      'servesVegetarianFood',
      'takeout',
      'goodForChildren'
    ].join(',');
  }

  getBasicFieldMask() {
    return [
      'places.id',
      'places.displayName',
      'places.formattedAddress',
      'places.location',
      'places.rating',
      'places.userRatingCount',
      'places.types',
      'places.nationalPhoneNumber',
      'places.websiteUri',
      'places.googleMapsUri',
      'places.businessStatus',
      'places.priceLevel',
      'places.primaryType'
    ].join(',');
  }

  getBasicDetailedFieldMask() {
    return [
      'id',
      'displayName',
      'formattedAddress',
      'addressComponents',
      'location',
      'rating',
      'userRatingCount',
      'types',
      'nationalPhoneNumber',
      'internationalPhoneNumber',
      'websiteUri',
      'googleMapsUri',
      'businessStatus',
      'priceLevel',
      'primaryType',
      'primaryTypeDisplayName',
      'regularOpeningHours',
      'photos'
    ].join(',');
  }

  transformPlaceData(place) {
    // Extract address components
    const addressComponents = this.parseAddressComponents(place.addressComponents || []);
    
    // Calculate review distribution if reviews are available
    const reviewsDistribution = this.calculateReviewsDistribution(place.reviews || []);
    
    // Extract business attributes
    const additionalInfo = this.extractBusinessAttributes(place);
    
    // Format opening hours
    const openingHours = this.formatOpeningHours(place.regularOpeningHours, place.currentOpeningHours);
    
    // Price level conversion to range format
    const priceRange = this.convertPriceLevel(place.priceLevel);
    
    return {
      // Basic Information
      id: place.id,
      placeId: place.id,
      title: place.displayName?.text || 'Unknown',
      name: place.displayName?.text || 'Unknown',
      subtitle: place.primaryTypeDisplayName?.text || null,
      description: place.editorialSummary?.text || null,
      categoryName: place.primaryTypeDisplayName?.text || place.primaryType || null,
      
      // Address Information
      address: place.formattedAddress || 'Address not available',
      shortFormattedAddress: place.shortFormattedAddress || null,
      adrFormatAddress: place.adrFormatAddress || null,
      ...addressComponents,
      
      // Location
      location: place.location ? {
        lat: place.location.latitude,
        lng: place.location.longitude
      } : null,
      plusCode: place.plusCode?.globalCode || null,
      
      // Contact Information
      phone: place.nationalPhoneNumber || null,
      phoneUnformatted: place.internationalPhoneNumber || null,
      website: place.websiteUri || null,
      googleMapsUrl: place.googleMapsUri || null,
      
      // Business Details
      rating: place.rating || 0,
      totalScore: place.rating || 0,
      userRatingCount: place.userRatingCount || 0,
      reviewsCount: place.userRatingCount || 0,
      reviewsDistribution,
      types: place.types || [],
      categories: place.types || [],
      primaryType: place.primaryType,
      businessStatus: place.businessStatus || 'OPERATIONAL',
      permanentlyClosed: place.businessStatus === 'CLOSED_PERMANENTLY',
      temporarilyClosed: place.businessStatus === 'CLOSED_TEMPORARILY',
      
      // Pricing
      priceLevel: place.priceLevel || null,
      price: priceRange,
      
      // Hours
      openingHours,
      
      // Images
      photos: place.photos ? place.photos.slice(0, 10).map(photo => ({
        name: photo.name,
        widthPx: photo.widthPx,
        heightPx: photo.heightPx,
        authorAttributions: photo.authorAttributions || []
      })) : [],
      imagesCount: place.photos?.length || 0,
      
      // Reviews
      reviews: place.reviews ? place.reviews.slice(0, 5).map(review => ({
        name: review.authorAttribution?.displayName || 'Anonymous',
        text: review.text?.text || '',
        textTranslated: null, // Google API doesn't provide translations
        publishAt: review.relativePublishTimeDescription || null,
        publishedAtDate: review.publishTime || null,
        likesCount: 0, // Not available in API
        reviewId: review.name || null,
        reviewUrl: null, // Would need to be constructed
        reviewerId: review.authorAttribution?.uri || null,
        reviewerUrl: review.authorAttribution?.uri || null,
        reviewerPhotoUrl: review.authorAttribution?.photoUri || null,
        reviewerNumberOfReviews: null, // Not available in basic API
        isLocalGuide: false, // Not available in basic API
        reviewOrigin: 'Google',
        stars: review.rating || 0,
        rating: review.rating || 0,
        responseFromOwnerDate: null, // Would need additional API call
        responseFromOwnerText: null, // Would need additional API call
        reviewImageUrls: [],
        reviewContext: {},
        reviewDetailedRating: {} // Not available in basic API
      })) : [],
      
      // Additional Business Information
      additionalInfo,
      
      // Metadata
      scrapedAt: new Date().toISOString(),
      
      // URLs and Links
      url: place.googleMapsUri || null,
      
      // Additional fields to match Apify structure
      rank: null,
      searchPageUrl: null,
      searchPageLoadedUrl: null,
      isAdvertisement: false,
      neighborhood: addressComponents.neighborhood || null,
      locatedIn: null,
      menu: place.websiteUri || null, // Assuming website might have menu
      claimThisBusiness: false,
      reserveTableUrl: null,
      googleFoodUrl: null,
      hotelStars: null,
      hotelDescription: null,
      checkInDate: null,
      checkOutDate: null,
      similarHotelsNearby: null,
      hotelReviewSummary: null,
      hotelAds: [],
      peopleAlsoSearch: [],
      placesTags: [],
      reviewsTags: this.extractReviewsTags(place.reviews || []),
      gasPrices: [],
      questionsAndAnswers: [],
      updatesFromCustomers: null,
      ownerUpdates: [],
      imageUrl: place.photos && place.photos[0] ? place.photos[0].name : null,
      kgmid: null, // Not available in Places API
      webResults: [],
      parentPlaceUrl: null,
      tableReservationLinks: [],
      bookingLinks: [],
      orderBy: [],
      images: place.photos ? place.photos.slice(0, 10).map(photo => ({
        imageUrl: photo.name,
        authorName: photo.authorAttributions?.[0]?.displayName || 'Unknown',
        authorUrl: photo.authorAttributions?.[0]?.uri || null,
        uploadedAt: null // Not available in API
      })) : [],
      imageUrls: place.photos ? place.photos.slice(0, 10).map(photo => photo.name) : [],
      userPlaceNote: null,
      restaurantData: {}
    };
  }

  parseAddressComponents(addressComponents) {
    const components = {
      street: null,
      neighborhood: null,
      city: null,
      postalCode: null,
      state: null,
      countryCode: null
    };

    if (!addressComponents || !Array.isArray(addressComponents)) {
      return components;
    }

    addressComponents.forEach(component => {
      const types = component.types || [];
      
      if (types.includes('street_number') || types.includes('route')) {
        if (!components.street) components.street = '';
        components.street += (component.longText || component.shortText || '') + ' ';
      }
      
      if (types.includes('neighborhood') || types.includes('sublocality')) {
        components.neighborhood = component.longText || component.shortText;
      }
      
      if (types.includes('locality') || types.includes('administrative_area_level_2')) {
        components.city = component.longText || component.shortText;
      }
      
      if (types.includes('postal_code')) {
        components.postalCode = component.longText || component.shortText;
      }
      
      if (types.includes('administrative_area_level_1')) {
        components.state = component.longText || component.shortText;
      }
      
      if (types.includes('country')) {
        components.countryCode = component.shortText;
      }
    });

    // Clean up street address
    if (components.street) {
      components.street = components.street.trim();
    }

    return components;
  }

  calculateReviewsDistribution(reviews) {
    const distribution = {
      oneStar: 0,
      twoStar: 0,
      threeStar: 0,
      fourStar: 0,
      fiveStar: 0
    };

    if (!reviews || !Array.isArray(reviews)) {
      return distribution;
    }

    reviews.forEach(review => {
      const rating = Math.floor(review.rating || 0);
      switch (rating) {
        case 1: distribution.oneStar++; break;
        case 2: distribution.twoStar++; break;
        case 3: distribution.threeStar++; break;
        case 4: distribution.fourStar++; break;
        case 5: distribution.fiveStar++; break;
      }
    });

    return distribution;
  }

  extractBusinessAttributes(place) {
    const attributes = {};

    // Service options
    const serviceOptions = [];
    if (place.takeout) serviceOptions.push({ "Takeout": place.takeout });
    if (place.delivery) serviceOptions.push({ "Delivery": place.delivery });
    if (place.dineIn) serviceOptions.push({ "Dine-in": place.dineIn });
    if (place.curbsidePickup) serviceOptions.push({ "Curbside pickup": place.curbsidePickup });
    if (serviceOptions.length > 0) attributes["Service options"] = serviceOptions;

    // Dining options
    const diningOptions = [];
    if (place.servesBreakfast) diningOptions.push({ "Breakfast": place.servesBreakfast });
    if (place.servesLunch) diningOptions.push({ "Lunch": place.servesLunch });
    if (place.servesDinner) diningOptions.push({ "Dinner": place.servesDinner });
    if (place.servesBrunch) diningOptions.push({ "Brunch": place.servesBrunch });
    if (diningOptions.length > 0) attributes["Dining options"] = diningOptions;

    // Offerings
    const offerings = [];
    if (place.servesVegetarianFood) offerings.push({ "Vegetarian options": place.servesVegetarianFood });
    if (place.servesBeer) offerings.push({ "Beer": place.servesBeer });
    if (place.servesWine) offerings.push({ "Wine": place.servesWine });
    if (offerings.length > 0) attributes["Offerings"] = offerings;

    // Accessibility
    const accessibility = [];
    if (place.accessibilityOptions) {
      if (place.accessibilityOptions.wheelchairAccessibleEntrance !== undefined) {
        accessibility.push({ "Wheelchair accessible entrance": place.accessibilityOptions.wheelchairAccessibleEntrance });
      }
      if (place.accessibilityOptions.wheelchairAccessibleParking !== undefined) {
        accessibility.push({ "Wheelchair accessible parking lot": place.accessibilityOptions.wheelchairAccessibleParking });
      }
      if (place.accessibilityOptions.wheelchairAccessibleRestroom !== undefined) {
        accessibility.push({ "Wheelchair accessible restroom": place.accessibilityOptions.wheelchairAccessibleRestroom });
      }
      if (place.accessibilityOptions.wheelchairAccessibleSeating !== undefined) {
        accessibility.push({ "Wheelchair accessible seating": place.accessibilityOptions.wheelchairAccessibleSeating });
      }
    }
    if (accessibility.length > 0) attributes["Accessibility"] = accessibility;

    // Amenities - Note: restroom field removed as it's not reliably available
    const amenities = [];
    // Note: restroom field has been removed due to API inconsistencies
    if (amenities.length > 0) attributes["Amenities"] = amenities;

    // Children
    const children = [];
    if (place.goodForChildren !== undefined) children.push({ "Good for kids": place.goodForChildren });
    // Note: menuForChildren field removed as it's not reliably available in API
    if (children.length > 0) attributes["Children"] = children;

    // Payments
    const payments = [];
    if (place.paymentOptions) {
      if (place.paymentOptions.acceptsCreditCards !== undefined) {
        payments.push({ "Credit cards": place.paymentOptions.acceptsCreditCards });
      }
      if (place.paymentOptions.acceptsDebitCards !== undefined) {
        payments.push({ "Debit cards": place.paymentOptions.acceptsDebitCards });
      }
      if (place.paymentOptions.acceptsNfc !== undefined) {
        payments.push({ "NFC mobile payments": place.paymentOptions.acceptsNfc });
      }
    }
    if (payments.length > 0) attributes["Payments"] = payments;

    // Planning
    const planning = [];
    if (place.reservable !== undefined) planning.push({ "Accepts reservations": place.reservable });
    if (planning.length > 0) attributes["Planning"] = planning;

    return attributes;
  }

  formatOpeningHours(regularHours, currentHours) {
    const hours = regularHours || currentHours;
    if (!hours || !hours.weekdayDescriptions) {
      return null;
    }

    return hours.weekdayDescriptions.map(description => {
      // Parse "Monday: 9:00 AM – 5:00 PM" format
      const parts = description.split(': ');
      if (parts.length === 2) {
        return {
          day: parts[0],
          hours: parts[1]
        };
      }
      return {
        day: description,
        hours: "Hours not available"
      };
    });
  }

  convertPriceLevel(priceLevel) {
    if (!priceLevel) return null;
    
    switch (priceLevel) {
      case 'PRICE_LEVEL_FREE':
        return 'Free';
      case 'PRICE_LEVEL_INEXPENSIVE':
        return '$';
      case 'PRICE_LEVEL_MODERATE':
        return '$$';
      case 'PRICE_LEVEL_EXPENSIVE':
        return '$$$';
      case 'PRICE_LEVEL_VERY_EXPENSIVE':
        return '$$$$';
      default:
        return null;
    }
  }

  extractReviewsTags(reviews) {
    if (!reviews || !Array.isArray(reviews)) {
      return [];
    }

    const wordCounts = {};
    const commonWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'was', 'are', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'a', 'an']);

    reviews.forEach(review => {
      const text = review.text?.text || '';
      const words = text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2 && !commonWords.has(word));

      words.forEach(word => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      });
    });

    // Convert to array and sort by frequency
    return Object.entries(wordCounts)
      .filter(([word, count]) => count >= 2)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([title, count]) => ({ title, count }));
  }
}

module.exports = new PlacesService();