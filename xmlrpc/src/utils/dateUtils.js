// Helper function to parse Keap date format (YYYYMMDDTHH:MM:SS)
export const parseKeapDate = (dateStr) => {
  if (!dateStr) return null;
  
  try {
    // Format: "20170424T13:26:24"
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const time = dateStr.substring(9); // "13:26:24"
    
    // Create ISO format: "2017-04-24T13:26:24"
    const isoDate = `${year}-${month}-${day}T${time}`;
    return new Date(isoDate);
  } catch (error) {
    console.error('Error parsing Keap date:', dateStr, error);
    return null;
  }
};

// Format Keap date for display
export const formatKeapDate = (dateStr, options = {}) => {
  const date = parseKeapDate(dateStr);
  if (!date) return 'Invalid date';
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  });
};

// Format Keap date with time for display
export const formatKeapDateTime = (dateStr) => {
  const date = parseKeapDate(dateStr);
  if (!date) return 'Invalid date';
  
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};