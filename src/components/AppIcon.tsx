import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';

export type AppIconName =
  | 'add'
  | 'alert'
  | 'chart'
  | 'check-circle'
  | 'chevron-left'
  | 'chevron-right'
  | 'close-circle'
  | 'document'
  | 'download'
  | 'edit'
  | 'home'
  | 'image'
  | 'info'
  | 'settings'
  | 'star'
  | 'trash'
  | 'trending-down'
  | 'trending-up'
  | 'wallet';

interface AppIconProps {
  name: AppIconName;
  size?: number;
  color?: string;
}

export function AppIcon({ name, size = 22, color = '#7A6A5F' }: AppIconProps) {
  const stroke = color;
  const common = {
    fill: 'none',
    stroke,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 2,
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityRole="image">
      {name === 'add' ? (
        <>
          <Line x1="12" y1="5" x2="12" y2="19" {...common} />
          <Line x1="5" y1="12" x2="19" y2="12" {...common} />
        </>
      ) : null}
      {name === 'chevron-left' ? <Polyline points="15 18 9 12 15 6" {...common} /> : null}
      {name === 'chevron-right' ? <Polyline points="9 18 15 12 9 6" {...common} /> : null}
      {name === 'check-circle' ? (
        <>
          <Circle cx="12" cy="12" r="9" {...common} />
          <Polyline points="8 12.5 10.8 15.2 16 9" {...common} />
        </>
      ) : null}
      {name === 'close-circle' ? (
        <>
          <Circle cx="12" cy="12" r="9" {...common} />
          <Line x1="9" y1="9" x2="15" y2="15" {...common} />
          <Line x1="15" y1="9" x2="9" y2="15" {...common} />
        </>
      ) : null}
      {name === 'edit' ? (
        <>
          <Path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3z" {...common} />
          <Line x1="14" y1="7" x2="17" y2="10" {...common} />
        </>
      ) : null}
      {name === 'trash' ? (
        <>
          <Path d="M4 7h16" {...common} />
          <Path d="M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3" {...common} />
        </>
      ) : null}
      {name === 'settings' ? (
        <>
          <Circle cx="12" cy="12" r="3" {...common} />
          <Path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.4 1a7.7 7.7 0 0 0-2-1.1L14 3h-4l-.5 2.8a7.7 7.7 0 0 0-2 1.1l-2.4-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.4-1a7.7 7.7 0 0 0 2 1.1L10 21h4l.5-2.8a7.7 7.7 0 0 0 2-1.1l2.4 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z" {...common} />
        </>
      ) : null}
      {name === 'home' ? (
        <>
          <Path d="M3 11.5 12 4l9 7.5" {...common} />
          <Path d="M5 10.5V20h5v-5h4v5h5v-9.5" {...common} />
        </>
      ) : null}
      {name === 'image' ? (
        <>
          <Rect x="4" y="5" width="16" height="14" rx="2.5" {...common} />
          <Circle cx="9" cy="10" r="1.5" {...common} />
          <Path d="M6.5 17 11 12.5l3 3 1.5-1.5 2 3" {...common} />
        </>
      ) : null}
      {name === 'trending-up' ? (
        <>
          <Polyline points="3 17 9 11 13 15 21 7" {...common} />
          <Polyline points="15 7 21 7 21 13" {...common} />
        </>
      ) : null}
      {name === 'trending-down' ? (
        <>
          <Polyline points="3 7 9 13 13 9 21 17" {...common} />
          <Polyline points="15 17 21 17 21 11" {...common} />
        </>
      ) : null}
      {name === 'chart' ? (
        <>
          <Line x1="5" y1="19" x2="5" y2="11" {...common} />
          <Line x1="12" y1="19" x2="12" y2="5" {...common} />
          <Line x1="19" y1="19" x2="19" y2="9" {...common} />
        </>
      ) : null}
      {name === 'document' ? (
        <>
          <Path d="M7 3h7l4 4v14H7z" {...common} />
          <Path d="M14 3v5h5M9 13h6M9 17h6" {...common} />
        </>
      ) : null}
      {name === 'wallet' ? (
        <>
          <Rect x="3" y="6" width="18" height="13" rx="3" {...common} />
          <Path d="M16 12h5v4h-5a2 2 0 0 1 0-4z" {...common} />
        </>
      ) : null}
      {name === 'star' ? (
        <Path
          d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z"
          fill={color}
          stroke={color}
          strokeLinejoin="round"
          strokeWidth={1.5}
        />
      ) : null}
      {name === 'alert' ? (
        <>
          <Circle cx="12" cy="12" r="9" {...common} />
          <Line x1="12" y1="7" x2="12" y2="13" {...common} />
          <Line x1="12" y1="17" x2="12.01" y2="17" {...common} />
        </>
      ) : null}
      {name === 'info' ? (
        <>
          <Circle cx="12" cy="12" r="9" {...common} />
          <Line x1="12" y1="11" x2="12" y2="17" {...common} />
          <Line x1="12" y1="7" x2="12.01" y2="7" {...common} />
        </>
      ) : null}
      {name === 'download' ? (
        <>
          <Path d="M12 4v10" {...common} />
          <Polyline points="8 10 12 14 16 10" {...common} />
          <Path d="M5 19h14" {...common} />
        </>
      ) : null}
    </Svg>
  );
}
