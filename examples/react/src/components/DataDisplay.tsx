import type { Data } from 'betahub-video-events-sync';

const formatDate = (timestamp: string) => {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(new Date(timestamp));
};

const getTypeStyle = (type: string) => {
  switch (type.toLowerCase()) {
    case 'error':
      return {
        backgroundColor: '#fee2e2',
        color: '#dc2626',
        borderColor: '#fecaca'
      };
    case 'warning':
      return {
        backgroundColor: '#fef3c7',
        color: '#d97706',
        borderColor: '#fde68a'
      };
    case 'info':
      return {
        backgroundColor: '#e0f2fe',
        color: '#0284c7',
        borderColor: '#bae6fd'
      };
    default:
      return {
        backgroundColor: '#f0f0f0',
        color: '#666',
        borderColor: '#e5e5e5'
      };
  }
};

export const DataDisplay = ({ 
  data, 
  appendData = [], 
  prependData = [] 
}: { 
  data: Data[];
  appendData?: Data[];
  prependData?: Data[];
}) => {
  const renderDataItem = (item: Data, index: number, isDimmed = false) => {
    const typeStyle = getTypeStyle(item.type);
    return (
      <div 
        key={index} 
        style={{ 
          padding: '8px',
          marginBottom: '4px',
          opacity: isDimmed ? 0.5 : 1,
          backgroundColor: '#fff',
          borderRadius: '4px',
          outline: isDimmed ? 'none' : `1px solid ${typeStyle.borderColor}`,
          fontSize: '0.9em',
          lineHeight: '1.4',
          height: '60px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <span style={{ 
              ...typeStyle,
              fontSize: '0.85em',
              padding: '2px 6px',
              borderRadius: '3px',
              marginRight: '6px',
              display: 'inline-block'
            }}>
              {item.type}
            </span>
            <span>{item.message}</span>
          </div>
          <div style={{ 
            fontSize: '0.8em', 
            color: '#666',
            whiteSpace: 'nowrap',
            marginLeft: '8px'
          }}>
            {formatDate(item.start_time)}
            {item.end_time && ` - ${formatDate(item.end_time)}`}
          </div>
        </div>
        {item.details && Object.keys(item.details).length > 0 && (
          <div style={{ 
            fontSize: '0.8em', 
            color: '#666', 
            marginTop: '4px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px'
          }}>
            {Object.entries(item.details).map(([key, value]) => (
              <span 
                key={key} 
                style={{ 
                  backgroundColor: typeStyle.backgroundColor,
                  color: typeStyle.color,
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '0.85em'
                }}
              >
                {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ 
      padding: '12px',
      overflowY: 'auto',
      backgroundColor: '#fff',
      borderRadius: '8px'
    }}>
      {prependData.map((item, index) => renderDataItem(item, index, true))}
      {data.map((item, index) => renderDataItem(item, index))}
      {appendData.map((item, index) => renderDataItem(item, index, true))}
    </div>
  );
}; 