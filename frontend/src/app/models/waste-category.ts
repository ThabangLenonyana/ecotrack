import { DisposalGuideline } from './disposal-guideline';
import { RecyclingTip } from './recycling-tip';

export interface WasteCategory {
    id?: number;
    name: string;
    description: string;
    disposalGuidelines?: DisposalGuideline[];
    recyclingTips?: RecyclingTip[];
    iconClass?: string;  // Added for FontAwesome icons
    iconColor?: string;  // Added for icon color
    shortDescription: string;
}
