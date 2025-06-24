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

// Data processing result types
export interface ProcessingError {
  name: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ProcessingResult {
  name: string;
  itemCount: number;
}

// Data entry processing types
export interface ProcessDataEntryResult {
  success: boolean;
  data?: Data[];
  itemCount?: number;
  error?: {
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface ProcessDataEntryOptions {
  onProgress?: (status: {
    status: 'loading' | 'error' | 'success';
    progress: number;
  }) => void;
  totalItems: number;
  totalProgress: number;
}

export interface ProcessMultipleEntriesOptions {
  onProgress?: (status: {
    status: 'loading' | 'error' | 'success';
    progress: number;
  }) => void;
  sortData?: boolean;
}

export interface StorageFunction {
  (name: string, data: Data[], sortData: boolean): Promise<void>;
} 