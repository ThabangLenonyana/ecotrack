import { WasteCategory } from './waste-category';

export interface DisposalGuideline {
    id?: number;
    title: string;
    instructions: string;
    categoryId?: number;
    category?: WasteCategory;
}