export interface RecyclingFacility {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  distanceToUser?: number; // Distance to user in KM
  
  // Location info
  municipality?: string;
  city?: string;
  
  // Contact info
  website?: string;
  
  // Operation details
  operation?: string;
  
  // Classification
  type?: string;
  groupName?: string;
  
  // Additional info
  other?: string;
  distance?: number;
  
  // Materials accepted - matches backend Map<String, Boolean>
  acceptedMaterials?: {[key: string]: boolean};
  
  // Computed fields that can be derived in the frontend
  address?: string; // Derived from city/municipality in frontend
}