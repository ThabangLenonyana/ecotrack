export class FacilityTypeMapper {
  static getFontAwesomeIcon(type?: string): string {
    const facilityType = type?.toLowerCase() || 'default';
    
    // Font Awesome icon classes based on facility type
    const icons: {[key: string]: string} = {
      'drop-off': 'fas fa-arrow-circle-down',
      'drop-off (recycling)': 'fas fa-recycle',
      'recycler': 'fas fa-sync-alt',
      'transfer station & recycling': 'fas fa-exchange-alt',
      'landfill': 'fas fa-trash-alt',
      'reverse vending machine': 'fas fa-robot',
      'buyback': 'fas fa-money-bill-wave',
      'municipal drop-off': 'fas fa-building',
      'transfer station': 'fas fa-truck-loading',
      'collector': 'fas fa-truck',
      'default': 'fas fa-map-marker-alt',
    };
    
    return icons[facilityType] || icons['default'];
  }
  
  static getMarkerColor(type?: string): string {
    const facilityType = type?.toLowerCase() || 'default';
    
    const colors: {[key: string]: string} = {
      'drop-off': '#2196F3',            // Blue
      'drop-off (recycling)': '#4CAF50', // Green
      'recycler': '#00BCD4',             // Cyan
      'transfer station & recycling': '#009688', // Teal
      'landfill': '#795548',             // Brown
      'reverse vending machine': '#E91E63', // Pink
      'buyback': '#FF9800',              // Orange
      'municipal drop-off': '#3F51B5',   // Indigo
      'transfer station': '#673AB7',     // Deep Purple
      'collector': '#FFC107',            // Amber
      'default': '#9C27B0'               // Purple
    };
    
    return colors[facilityType] || colors['default'];
  }
}