// src/app/models/image-analysis.model.ts
export interface ImageAnalysisResponse {
  material: RecognizedMaterial;
  nearbyLocations: RecyclingLocation[];
  disposalGuidelines: DisposalGuideline[];
  recyclingTips: RecyclingTip[];
}

export interface RecognizedMaterial {
  materialType: string;
  detectedObjects: string[];
  confidenceScore: number;
  recyclingInstructions: string;
  recyclable: boolean;
  wasteCategoryId: number;
}

export interface RecyclingLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  type: string;
  acceptedMaterials: {
    plastic: boolean;
    paper: boolean;
    glass: boolean;
    [key: string]: boolean;
  };
}

export interface DisposalGuideline {
  id: number;
  instructions: string;
}

export interface RecyclingTip {
  id: number;
  steps: string[];
}