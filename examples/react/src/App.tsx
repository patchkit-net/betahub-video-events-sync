import {
  BHVESInstance,
  getMatchingData,
  getMovingWindowIndexes,
  type Data,
} from 'betahub-video-events-sync';
import { useEffect, useState } from 'react';

import { DataDisplay } from './components/DataDisplay';
import { VideoPlayer } from './components/VideoPlayer';

export const App = () => {
  const [logsData, setLogsData] = useState<Data[]>([]);
  const [prependLogsData, setPrependLogsData] = useState<Data[]>([]);
  const [appendLogsData, setAppendLogsData] = useState<Data[]>([]);

  const [interactionsData, setInteractionsData] = useState<Data[]>([]);

  const [testLogsData, setTestLogsData] = useState<Data[]>([]);
  const [prependTestLogsData, setPrependTestLogsData] = useState<Data[]>([]);
  const [appendTestLogsData, setAppendTestLogsData] = useState<Data[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<{
    status: 'loading' | 'error' | 'success';
    progress: number;
  }>({ status: 'loading', progress: 0 });
  const [eventsTime, setEventsTime] = useState<string | null>(null);

  const formatDate = (timestamp: string) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(new Date(timestamp));
  };

  useEffect(() => {
    // Initialize BHVES instance
    const bhves = new BHVESInstance({
      videoPlayerId: 'player1',
      startTimestamp: '2025-06-12T14:03:20',
      onTimeUpdate: ({ timestamp }) => {
        setEventsTime(timestamp);
      },
      onStateUpdate: ({ state, data }) => {
        // for data with no end_timestamp (logs), so the moving window works
        const diffEventData = getMatchingData(state.activeMatchingIndexes, data);
        // for data with end_timestamp (interactions, subtitles), so the data shows up and disappears in the correct time
        const eventData = getMatchingData(state.matchingIndexes, data);

        const { prepend, append } = getMovingWindowIndexes(
          state.activeMatchingIndexes,
          data,
          {
            prependSize: 3, // Show up to 3 previous events
            appendSize: 3, // Show next 3 events
            minimumSize: 7, // Show minimum 7 events total
          }
        );

        const appendData = getMatchingData(append, data);
        const prependData = getMatchingData(prepend, data);

        // Update react states
        if (diffEventData?.logs) {
          setLogsData(diffEventData.logs);
          setAppendLogsData(appendData?.logs || []);
          setPrependLogsData(prependData?.logs || []);
        }
        if (eventData?.interactions) {
          setInteractionsData(eventData.interactions);
        } else {
          setInteractionsData([]);
        }
        if (diffEventData?.test_logs) {
          setTestLogsData(diffEventData.test_logs);
          setAppendTestLogsData(appendData?.test_logs || []);
          setPrependTestLogsData(prependData?.test_logs || []);
        }
      },
    });

    // Async load data from files
    setIsLoading(true);
    setError(null);
    setProgressData({ status: 'loading', progress: 0 });
    Promise.all([
      fetch('/data/logs.jsonl').then((res) => res.text()),
      fetch('/data/interactions.jsonl').then((res) => res.text()),
      fetch('/data/test_logs.jsonl').then((res) => res.text()),
    ]).then(async ([logs, interactions, testLogs]) => {
      await bhves.addData(
        [
          { name: 'logs', dataJSONL: logs },
          { name: 'interactions', dataJSONL: interactions },
          { name: 'test_logs', dataJSONL: testLogs },
        ],
        {
          sortData: false,
          onProgress: (status) => {
            setProgressData(status);
            if (status.status === 'error') {
              setError('Error processing data files');
              setIsLoading(false);
            } else if (status.status === 'success') {
              setIsLoading(false);
            }
          },
          onSuccess: (data) => {
            setEventsTime(bhves.startTimestamp);
            setAppendLogsData(data.logs.slice(0, 7));
            setAppendTestLogsData(data.test_logs.slice(0, 7));
          },
          onError: (error) => {
            console.error('Error processing data:', error);
            setError(
              'Error processing data files. Please check the console for details.'
            );
            setIsLoading(false);
          },
        }
      );
    });
  }, []);

  return (
    <div>
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          opacity: isLoading ? 0.5 : 1,
          pointerEvents: isLoading ? 'none' : 'auto',
        }}
      >
        <VideoPlayer id="player1" />
        <div>
          <span>
            Events Time:{' '}
            {eventsTime ? formatDate(eventsTime) : ''}
          </span>
        </div>
      </div>
      {isLoading && (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          {progressData.status === 'loading' && (
            <div>Loading data: {Math.round(progressData.progress)}%</div>
          )}
        </div>
      )}
      {error && (
        <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>
          {error}
        </div>
      )}
      {!isLoading && !error && (
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ width: '33%' }}>
            <DataDisplay
              data={logsData}
              appendData={appendLogsData}
              prependData={prependLogsData}
            />
          </div>
          <div style={{ width: '33%' }}>
            <DataDisplay data={interactionsData} />
          </div>
          <div style={{ width: '33%' }}>
            <DataDisplay
              data={testLogsData}
              appendData={appendTestLogsData}
              prependData={prependTestLogsData}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
