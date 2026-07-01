import Svg, { Circle, Path } from 'react-native-svg';

interface PizzaOvenLogoProps {
  size?: number;
}

/** الشعار الرسمي: شريحة بيتزا داخل فتحة فرن طوب — انظر design/logo.svg للمصدر. */
export function PizzaOvenLogo({ size = 96 }: PizzaOvenLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Path d="M 24 186 L 24 96 A 76 76 0 0 1 176 96 L 176 186 Z" fill="#8B4A2B" />
      <Path d="M 42 186 L 42 98 A 58 58 0 0 1 158 98 L 158 186 Z" fill="#FFE3C2" />
      <Path
        d="M 100 52 L 154 176 C 138 190 120 197 100 197 C 80 197 62 190 46 176 Z"
        fill="#E8C078"
      />
      <Path
        d="M 100 70 L 140 172 C 128 181 114 186 100 186 C 86 186 72 181 60 172 Z"
        fill="#F2A93B"
      />
      <Circle cx={100} cy={104} r={11} fill="#B3261E" />
      <Circle cx={76} cy={140} r={10} fill="#B3261E" />
      <Circle cx={124} cy={144} r={10} fill="#B3261E" />
      <Circle cx={100} cy={168} r={9.5} fill="#B3261E" />
    </Svg>
  );
}
