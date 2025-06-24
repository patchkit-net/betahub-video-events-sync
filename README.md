# BetaHub Video Events Sync

A package for synchronizing time-based data with video players.

## Install in external projects

```bash
npm install betahub-video-events-sync
```

or

```bash
yarn add betahub-video-events-sync
```

## Usage

### Basic Setup

```typescript
import { BHVESInstance } from 'betahub-video-events-sync';

// Initialize the instance with a video player
const bhves = new BHVESInstance({
  videoPlayerDomId: 'my-video-player', // ID of your video element
  startTimestamp: '2025-06-12T14:03:20', // ISO timestamp when video starts
  onTimeUpdate: ({ videoPlayerTimeSeconds, timestamp }) => {
    // Called on every video timeupdate event
    console.log('Current video time:', videoPlayerTimeSeconds);
    console.log('Current ISO timestamp:', timestamp);
  },
  onStateUpdate: ({ state, data }) => {
    // Called when there are events to display
    console.log('Current state:', state);
    console.log('Available data:', data);
  }
});
```

### Adding Data

```typescript
// Add data from JSONL files or strings
await bhves.addData({
  entries: [
    { 
      name: 'logs', 
      dataJSONL: '{"start_timestamp":"2025-06-12T14:03:20","type":"log","message":"Event 1"}\n{"start_timestamp":"2025-06-12T14:03:25","type":"log","message":"Event 2"}'
    },
    { 
      name: 'interactions', 
      dataJSONL: '{"start_timestamp":"2025-06-12T14:03:22","end_timestamp":"2025-06-12T14:03:24","type":"interaction","message":"Click"}' 
    }
  ],
  options: {
    // Optional: Sort data by start time
    sortData: true,
    
    // Optional: Track loading progress
    onProgress: (status) => {
      console.log(`Loading: ${status.progress}%`);
    },
    
    // Optional: Handle successful data loading
    onSuccess: (data) => {
      console.log('Data loaded successfully:', data);
    },
    
    // Optional: Handle errors
    onError: (error) => {
      console.error('Error loading data:', error);
    }
  }
});
```

### Data Format

The library expects data in JSONL format (JSON Lines), where each line is a valid JSON object with the following structure:

```typescript
interface Data {
  start_timestamp: string;    // ISO timestamp when the event starts
  end_timestamp?: string;     // Optional ISO timestamp when the event ends
  type: string;          // Event type (e.g., 'log', 'interaction')
  message?: string;      // Optional event message
  details?: object;      // Optional additional event details
}
```

### State Updates

The `onStateUpdate` callback provides two important pieces of information:

1. `state`: Contains the current events state at the given video time
   ```typescript
   interface State {
     videoPlayerTimeSeconds: number;  // Current video time in seconds
     timestamp: string;        // Current ISO timestamp
     matchingIndexes: {        // All events that should be displayed at current time
       [category: string]: number[]
     };
     activeMatchingIndexes: {  // Most recent active events at current time
       [category: string]: number[]
     };
   }
   ```

   The difference between `matchingIndexes` and `activeMatchingIndexes`:
   - `matchingIndexes`: Contains all events that are currently active (within their time range). This is useful for events with `end_timestamp` (like interactions or subtitles) that should be displayed for their entire duration.
   - `activeMatchingIndexes`: Contains only the most recent event for each category. This is useful for events without `end_timestamp` (like logs) where you want to show only the latest event.

2. `data`: Contains all loaded data organized by category
   ```typescript
   {
     [category: string]: Data[]
   }
   ```

### Utility Functions

The library provides several utility functions to help work with the data:

```typescript
import { 
  getMatchingData,
  getMovingWindowIndexes,
  getShiftedIndexes 
} from 'betahub-video-events-sync';

// Convert index references to actual data objects
const eventData = getMatchingData(state.matchingIndexes, data);
// Returns: { category1: Data[], category2: Data[], ... }
// Example:
// Input: { logs: [0, 1], interactions: [2] }
// Output: { logs: [log1, log2], interactions: [interaction3] }

// Get a window of events around the current position
const { prepend, append } = getMovingWindowIndexes(
  state.activeMatchingIndexes,
  data,
  {
    prependSize: 3,    // Number of previous events to show
    appendSize: 3,     // Number of next events to show
    minimumSize: 7     // Minimum total events to show (affects append size if needed)
  }
);
// Returns: { 
//   prepend: { category: number[] }, // Previous events
//   append: { category: number[] }   // Next events
// }
// Example:
// Input: { logs: [5, 6, 7] }
// Output: { 
//   prepend: { logs: [3, 4] },
//   append: { logs: [8, 9] }
// }

// Get events shifted by a specific number of positions
const shiftedIndexes = getShiftedIndexes(
  state.activeMatchingIndexes,
  shift,  // Number of positions to shift (positive for next, negative for previous)
  data
);
// Returns: { [category: string]: number[] }
// Example:
// Input: { logs: [5, 6] }, shift: 2
// Output: { logs: [7, 8] }
// Example:
// Input: { logs: [5, 6] }, shift: -2
// Output: { logs: [3, 4] }
```

Each utility function serves a specific purpose:
- `getMatchingData`: Converts index references to actual data objects. Takes matching indexes and returns the corresponding data items for each category.
- `getMovingWindowIndexes`: Creates a window of events around the current position. Useful for showing a consistent number of events before and after the current position, with a minimum total size.
- `getShiftedIndexes`: Gets events shifted by a specific number of positions. Useful for navigation, allowing you to get the next N events or previous N events from the current position.

## Development Setup

Install dependencies:
```bash
yarn install:all
```
This will install dependencies for both the main package and the example React application.

## Testing Changes

1. Start the development environment:
```bash
yarn dev
```
2. Make changes to the source code in `src/`
3. The changes will be automatically rebuilt
4. The example app will reflect your changes in real-time

## Building for Production

To build the package for production:

```bash
yarn build
```

This will:
1. Compile TypeScript files
2. Bundle the code using microbundle
3. Generate both IIFE and ES module formats
4. Create TypeScript definition files
