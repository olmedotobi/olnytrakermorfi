export type PaletteId = 'almendra' | 'lavanda' | 'salvia' | 'niebla' | 'rosa' | 'atardecer' | 'oceano' | 'caramelo' | 'blanco' | 'negro' | 'esmeralda' | 'neon';
export type ColorMode = 'light' | 'dark';

export type ThemeColors = {
  bg: string; card: string; input: string; border: string;
  text: string; muted: string;
  salmon: string; salmonBg: string;
  mint: string; mintBg: string;
  lavender: string; lavenderBg: string;
  warning: string; danger: string; success: string;
};

export type PaletteDef = {
  id: PaletteId;
  name: string;
  swatches: [string, string, string];
  light: ThemeColors;
  dark: ThemeColors;
};

// Shared accent sets
const LA: Partial<ThemeColors> = {
  salmon: '#E8704A', salmonBg: '#FEF0E9',
  mint: '#2DAA7E', mintBg: '#EBF8F2',
  lavender: '#7C6DC7', lavenderBg: '#EFECF8',
  warning: '#F59E0B', danger: '#EF4444', success: '#2DAA7E',
};
const DA: Partial<ThemeColors> = {
  salmon: '#F0886A', salmonBg: 'rgba(232,112,74,0.18)',
  mint: '#3DC48F', mintBg: 'rgba(45,170,126,0.18)',
  lavender: '#9E90D9', lavenderBg: 'rgba(124,109,199,0.18)',
  warning: '#F5A823', danger: '#F47070', success: '#3DC48F',
};

function lt(base: Partial<ThemeColors>, bg: string, card: string, input: string, border: string, text: string, muted: string): ThemeColors {
  return { ...base, bg, card, input, border, text, muted } as ThemeColors;
}

export const PALETTES: PaletteDef[] = [
  {
    id: 'almendra', name: 'Almendra', swatches: ['#E8704A', '#9C9485', '#F9F6F1'],
    light: lt(LA, '#F9F6F1', '#FFFFFF', '#F3F0EB', '#EAE5DB', '#1C1917', '#9C9485'),
    dark:  lt(DA, '#1A1510', '#221C15', '#2A2318', '#3A2F24', '#F5F0E8', '#8A7D6E'),
  },
  {
    id: 'lavanda', name: 'Lavanda', swatches: ['#9B8EC4', '#6B5CAA', '#C4A0D8'],
    light: lt(LA, '#F5F3FA', '#FDFCFF', '#EFECF8', '#DDD8F0', '#1A1530', '#8A82A0'),
    dark:  lt(DA, '#120D1E', '#1C1530', '#261D3C', '#352B50', '#EDE8FF', '#8078A8'),
  },
  {
    id: 'salvia', name: 'Salvia', swatches: ['#7AA882', '#4E8458', '#A8C4A0'],
    light: lt(LA, '#F3F7F4', '#FAFFFC', '#E8F0EA', '#D4E4D8', '#141F18', '#7A8A7E'),
    dark:  lt(DA, '#0D1610', '#14201A', '#1A2C22', '#253D2E', '#E8F5EC', '#70907A'),
  },
  {
    id: 'niebla', name: 'Niebla', swatches: ['#8E9BAA', '#5C6E82', '#C0CAD4'],
    light: lt(LA, '#F2F4F6', '#FAFBFC', '#E8ECEF', '#D4DAE0', '#151820', '#7A8290'),
    dark:  lt(DA, '#0E1117', '#151C26', '#1C2532', '#283444', '#E8ECF2', '#687888'),
  },
  {
    id: 'rosa', name: 'Rosa', swatches: ['#D4758A', '#B84F68', '#F0B8C4'],
    light: lt(LA, '#FBF3F5', '#FFFAFC', '#F5E8ED', '#EDD4DC', '#201015', '#9A8088'),
    dark:  lt(DA, '#1A0E12', '#24141C', '#2E1C26', '#402430', '#FFE8F0', '#907080'),
  },
  {
    id: 'atardecer', name: 'Atardecer', swatches: ['#E8883A', '#C45E1A', '#F4C474'],
    light: lt(LA, '#FBF5EE', '#FFFCF8', '#F5EBE0', '#E8DAC8', '#201508', '#9A8060'),
    dark:  lt(DA, '#1A1008', '#241808', '#2E2010', '#403018', '#FFF5E8', '#907040'),
  },
  {
    id: 'oceano', name: 'Océano', swatches: ['#3A7EC4', '#1A5EA0', '#74B4E4'],
    light: lt(LA, '#EFF4FA', '#F8FBFF', '#E0EBF5', '#C8DAEC', '#081520', '#607A90'),
    dark:  lt(DA, '#060E18', '#0C1622', '#121E2C', '#1C2E40', '#E0EEFA', '#507090'),
  },
  {
    id: 'caramelo', name: 'Caramelo', swatches: ['#C47A3A', '#A05A1A', '#E8B874'],
    light: lt(LA, '#FAF5EE', '#FFFCF8', '#F2E8D8', '#E4D4BE', '#1E1408', '#987850'),
    dark:  lt(DA, '#180E06', '#22160A', '#2C1C0E', '#3C2C14', '#FFF5E0', '#907040'),
  },
  {
    id: 'blanco', name: 'Blanco', swatches: ['#FFFFFF', '#E0E0E0', '#0A0A0A'],
    light: lt(LA, '#FFFFFF', '#FAFAFA', '#F2F2F2', '#E2E2E2', '#0A0A0A', '#757575'),
    dark:  lt(LA, '#FFFFFF', '#FAFAFA', '#F2F2F2', '#E2E2E2', '#0A0A0A', '#757575'),
  },
  {
    id: 'negro', name: 'Negro', swatches: ['#000000', '#2A2A2A', '#FFFFFF'],
    light: lt(DA, '#000000', '#111111', '#1C1C1C', '#2C2C2C', '#FFFFFF', '#909090'),
    dark:  lt(DA, '#000000', '#111111', '#1C1C1C', '#2C2C2C', '#FFFFFF', '#909090'),
  },
  {
    id: 'esmeralda', name: 'Esmeralda', swatches: ['#1A9E7A', '#0E7A5E', '#A0E8D0'],
    light: lt(LA, '#F0FAF7', '#FAFFFD', '#E0F5EE', '#C4E8DA', '#0A1E18', '#507A68'),
    dark:  lt(DA, '#041410', '#081E18', '#0E2820', '#163828', '#E0FAF2', '#48907A'),
  },
  {
    id: 'neon', name: 'Neón', swatches: ['#FF00AA', '#00FFAA', '#CC00FF'],
    light: {
      salmon: '#FF0080', salmonBg: 'rgba(255,0,128,0.12)',
      mint: '#00CC44', mintBg: 'rgba(0,204,68,0.12)',
      lavender: '#9900FF', lavenderBg: 'rgba(153,0,255,0.12)',
      warning: '#DD9900', danger: '#FF0040', success: '#00CC44',
      bg: '#FFFFFF', card: '#F8F0FF', input: '#EEE0FF', border: '#DDCCFF',
      text: '#0A0020', muted: '#6600BB',
    },
    dark: {
      salmon: '#FF00AA', salmonBg: 'rgba(255,0,170,0.18)',
      mint: '#00FF88', mintBg: 'rgba(0,255,136,0.15)',
      lavender: '#CC00FF', lavenderBg: 'rgba(204,0,255,0.18)',
      warning: '#FFCC00', danger: '#FF0040', success: '#00FF88',
      bg: '#000000', card: '#0A000F', input: '#150020', border: '#330044',
      text: '#FFFFFF', muted: '#CC88FF',
    },
  },
];

export const DEFAULT_PALETTE: PaletteId = 'almendra';
export const DEFAULT_MODE: ColorMode = 'light';

export function getTheme(paletteId: PaletteId, mode: ColorMode): ThemeColors {
  const p = PALETTES.find(p => p.id === paletteId) ?? PALETTES[0];
  return mode === 'light' ? p.light : p.dark;
}
