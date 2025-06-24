# BHVES React Example

This is a React + TypeScript + Vite example demonstrating the **BHVES (BetaHub Video Events Sync)** library.

## What it demonstrates

This example shows how to:

- Initialize a BHVES instance with a video player
- Load and process JSONL data files (logs, interactions, test logs)
- Display synchronized events that match the current video timestamp
- Use moving window functionality to show context around current events
- Handle real-time updates as the video plays

## Features

- **Video Player Integration**: Synchronizes events with video playback
- **Multiple Data Types**: Handles logs, interactions, and test data
- **Moving Window**: Shows previous and upcoming events for context
- **Real-time Updates**: Events appear/disappear based on video timestamp
- **Progress Tracking**: Shows loading progress for large datasets

## Data Files

The example uses three JSONL files in the `public/data/` directory:
- `logs.jsonl` - Log entries with no end timestamps (persistent)
- `interactions.jsonl` - User interactions with start/end timestamps
- `test_logs.jsonl` - Test log entries for demonstration

## Running the Example

```bash
cd examples/react
npm install
npm run dev
```

Then open your browser to the displayed URL and watch the video player synchronize with the displayed events.

## BHVES Library

This example uses the `betahub-video-events-sync` library which provides:
- Efficient timestamp-based event indexing
- Binary search for fast lookups
- Support for multiple data categories
- Moving window functionality for context
- TypeScript support with full type safety

For more information about the BHVES library, see the main project documentation.
