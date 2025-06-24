export interface Data {
  start_timestamp: string;
  end_timestamp?: string;
  type: string;
  message?: string;
  details?: object;
}

// Internal data structure with parsed timestamps for better performance
export interface DataInternal {
  start_timestamp: Date;
  end_timestamp?: Date;
  type: string;
  message?: string;
  details?: object;
}

// Standardized type for category-to-indexes mapping
export type CategoryIndexes = { [key: string]: number[] }; 