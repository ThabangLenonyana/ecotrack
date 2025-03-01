import { WasteCategory } from './waste-category';

export interface RecyclingTip {
    id?: number;
    title: string;
    steps: string[];
    difficulty: string;
    environmentalImpact: string;
    timeRequired: string;
    requiredMaterials: string; // Changed to string (comma-separated list from API)
    categoryId?: number;
    category?: WasteCategory;
}