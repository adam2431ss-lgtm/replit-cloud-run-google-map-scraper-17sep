export interface PlaceResult {
  // Basic Information
  id: string;
  placeId: string;
  title: string;
  name: string;
  subtitle: string | null;
  description: string | null;
  categoryName: string | null;
  
  // Address Information
  address: string;
  shortFormattedAddress: string | null;
  adrFormatAddress: string | null;
  street: string | null;
  neighborhood: string | null;
  city: string | null;
  postalCode: string | null;
  state: string | null;
  countryCode: string | null;
  
  // Location
  location: {
    lat: number;
    lng: number;
  } | null;
  plusCode: string | null;
  
  // Contact Information
  phone: string | null;
  phoneUnformatted: string | null;
  website: string | null;
  googleMapsUrl: string | null;
  
  // Business Details
  rating: number;
  totalScore: number;
  userRatingCount: number;
  reviewsCount: number;
  reviewsDistribution: {
    oneStar: number;
    twoStar: number;
    threeStar: number;
    fourStar: number;
    fiveStar: number;
  };
  types: string[];
  categories: string[];
  primaryType: string;
  businessStatus: string;
  permanentlyClosed: boolean;
  temporarilyClosed: boolean;
  
  // Pricing
  priceLevel: string | null;
  price: string | null;
  
  // Hours
  openingHours: Array<{
    day: string;
    hours: string;
  }> | null;
  
  // Images
  photos: Array<{
    name: string;
    widthPx: number;
    heightPx: number;
    authorAttributions: any[];
  }>;
  imagesCount: number;
  imageUrl: string | null;
  images: Array<{
    imageUrl: string;
    authorName: string;
    authorUrl: string | null;
    uploadedAt: string | null;
  }>;
  imageUrls: string[];
  
  // Reviews
  reviews: Array<{
    name: string;
    text: string;
    textTranslated: string | null;
    publishAt: string | null;
    publishedAtDate: string | null;
    likesCount: number;
    reviewId: string | null;
    reviewUrl: string | null;
    reviewerId: string | null;
    reviewerUrl: string | null;
    reviewerPhotoUrl: string | null;
    reviewerNumberOfReviews: number | null;
    isLocalGuide: boolean;
    reviewOrigin: string;
    stars: number;
    rating: number;
    responseFromOwnerDate: string | null;
    responseFromOwnerText: string | null;
    reviewImageUrls: string[];
    reviewContext: any;
    reviewDetailedRating: any;
  }>;
  
  // Additional Business Information
  additionalInfo: any;
  
  // Metadata
  scrapedAt: string;
  
  // URLs and Links
  url: string | null;
  menu: string | null;
  reserveTableUrl: string | null;
  googleFoodUrl: string | null;
  
  // Review Analytics
  reviewsTags: Array<{
    title: string;
    count: number;
  }>;
  
  // Additional Apify-compatible fields
  rank: number | null;
  searchPageUrl: string | null;
  searchPageLoadedUrl: string | null;
  isAdvertisement: boolean;
  locatedIn: string | null;
  claimThisBusiness: boolean;
  hotelStars: number | null;
  hotelDescription: string | null;
  checkInDate: string | null;
  checkOutDate: string | null;
  similarHotelsNearby: any | null;
  hotelReviewSummary: any | null;
  hotelAds: any[];
  peopleAlsoSearch: any[];
  placesTags: any[];
  gasPrices: any[];
  questionsAndAnswers: any[];
  updatesFromCustomers: any | null;
  ownerUpdates: any[];
  kgmid: string | null;
  webResults: any[];
  parentPlaceUrl: string | null;
  tableReservationLinks: any[];
  bookingLinks: any[];
  orderBy: any[];
  userPlaceNote: any | null;
  restaurantData: any;
}

export interface SearchFilters {
  location?: {
    lat: number;
    lng: number;
  };
  radius?: number;
  categories?: string[];
  maxResults?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  query?: string;
  location?: any;
  error?: string;
}