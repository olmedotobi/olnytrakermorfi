export type PaletteId = 'almendra' | 'lavanda' | 'salvia' | 'niebla' | 'rosa' | 'atardecer' | 'oceano' | 'caramelo' | 'blanco' | 'negro' | 'esmeralda' | 'indigo';
export type Mode = 'light' | 'dark';
type Vars = Record<string, string>;

export type Palette = {
  id: PaletteId;
  name: string;
  swatches: readonly [string, string, string];
  light: Vars;
  dark: Vars;
};

const LS: Vars = {
  '--salmon': '#E8704A', '--salmon-bg': '#FEF0E9',
  '--mint': '#2DAA7E',   '--mint-bg':   '#EBF8F2',
  '--lavender': '#7C6DC7', '--lavender-bg': '#EFECF8',
  '--sky': '#3B82C4',    '--sky-bg':    '#E8F2FA',
  '--protein': '#7C6DC7', '--carbs': '#F59E0B', '--carbs-bg': '#FEF9E7',
  '--fat': '#E8704A',    '--fat-bg': '#FEF0E9',
  '--warning': '#F59E0B', '--danger': '#EF4444', '--success': '#2DAA7E',
};

const DS: Vars = {
  '--salmon': '#F0886A', '--salmon-bg': 'rgba(232,112,74,0.18)',
  '--mint': '#3DC48F',   '--mint-bg':   'rgba(45,170,126,0.18)',
  '--lavender': '#9E90D9', '--lavender-bg': 'rgba(124,109,199,0.18)',
  '--sky': '#5E9ED4',    '--sky-bg':    'rgba(59,130,196,0.18)',
  '--protein': '#9E90D9', '--carbs': '#F5A823', '--carbs-bg': 'rgba(245,158,11,0.18)',
  '--fat': '#F0886A',    '--fat-bg': 'rgba(232,112,74,0.18)',
  '--warning': '#F5A823', '--danger': '#F47070', '--success': '#3DC48F',
};

export const PALETTES: Palette[] = [
  {
    id: 'almendra', name: 'Almendra',
    swatches: ['#E8704A', '#9C9485', '#F9F6F1'],
    light: { ...LS, '--bg':'#F9F6F1','--bg-card':'#FFFFFF','--bg-input':'#F3F0EB','--border':'#EAE5DB','--text':'#1C1917','--text-muted':'#9C9485','--grad-start':'#E8704A','--grad-end':'#7C6DC7','--banner-start':'#FEE8DC','--banner-end':'#EDE9F8' },
    dark:  { ...DS, '--bg':'#1A1510','--bg-card':'#221C15','--bg-input':'#2A2318','--border':'#3A2F24','--text':'#F5F0E8','--text-muted':'#8A7D6E','--grad-start':'#F0886A','--grad-end':'#9E90D9','--banner-start':'#2A1A0E','--banner-end':'#1E1430' },
  },
  {
    id: 'lavanda', name: 'Lavanda',
    swatches: ['#9B8EC4', '#6B5CAA', '#C4A0D8'],
    light: { ...LS, '--bg':'#F5F3FA','--bg-card':'#FDFCFF','--bg-input':'#EFECF8','--border':'#DDD8F0','--text':'#1A1530','--text-muted':'#8A82A0','--grad-start':'#9B8EC4','--grad-end':'#C4A0D8','--banner-start':'#EDE9F8','--banner-end':'#F5E8FA' },
    dark:  { ...DS, '--bg':'#120D1E','--bg-card':'#1C1530','--bg-input':'#261D3C','--border':'#352B50','--text':'#EDE8FF','--text-muted':'#8078A8','--grad-start':'#B4A6DE','--grad-end':'#D4B4E8','--banner-start':'#1E1530','--banner-end':'#2A1840' },
  },
  {
    id: 'salvia', name: 'Salvia',
    swatches: ['#7AA882', '#4E8458', '#A8C4A0'],
    light: { ...LS, '--bg':'#F3F7F4','--bg-card':'#FAFFFC','--bg-input':'#E8F0EA','--border':'#D4E4D8','--text':'#141F18','--text-muted':'#7A8A7E','--grad-start':'#5E9E72','--grad-end':'#4E7A8A','--banner-start':'#E0F2E8','--banner-end':'#D8EEE8' },
    dark:  { ...DS, '--bg':'#0D1610','--bg-card':'#14201A','--bg-input':'#1A2C22','--border':'#253D2E','--text':'#E8F5EC','--text-muted':'#70907A','--grad-start':'#7AC48A','--grad-end':'#5EA8BE','--banner-start':'#102018','--banner-end':'#102820' },
  },
  {
    id: 'niebla', name: 'Niebla',
    swatches: ['#8E9BAA', '#5C6E82', '#C0CAD4'],
    light: { ...LS, '--bg':'#F2F4F6','--bg-card':'#FAFBFC','--bg-input':'#E8ECEF','--border':'#D4DAE0','--text':'#151820','--text-muted':'#7A8290','--grad-start':'#5E7A9E','--grad-end':'#3A5A7E','--banner-start':'#E0E8F2','--banner-end':'#D8E4EE' },
    dark:  { ...DS, '--bg':'#0E1117','--bg-card':'#151C26','--bg-input':'#1C2532','--border':'#283444','--text':'#E8ECF2','--text-muted':'#687888','--grad-start':'#7A9AB4','--grad-end':'#5A7E9E','--banner-start':'#101820','--banner-end':'#0C1420' },
  },
  {
    id: 'rosa', name: 'Rosa',
    swatches: ['#D4758A', '#B84F68', '#F0B8C4'],
    light: { ...LS, '--bg':'#FBF3F5','--bg-card':'#FFFAFC','--bg-input':'#F5E8ED','--border':'#EDD4DC','--text':'#201015','--text-muted':'#9A8088','--grad-start':'#D4758A','--grad-end':'#C4A0B8','--banner-start':'#FDEEF2','--banner-end':'#F8E8F4' },
    dark:  { ...DS, '--bg':'#1A0E12','--bg-card':'#24141C','--bg-input':'#2E1C26','--border':'#402430','--text':'#FFE8F0','--text-muted':'#907080','--grad-start':'#E48A9E','--grad-end':'#D4A8C8','--banner-start':'#280E18','--banner-end':'#2A1428' },
  },
  {
    id: 'atardecer', name: 'Atardecer',
    swatches: ['#E8883A', '#C45E1A', '#F4C474'],
    light: { ...LS, '--bg':'#FBF5EE','--bg-card':'#FFFCF8','--bg-input':'#F5EBE0','--border':'#E8DAC8','--text':'#201508','--text-muted':'#9A8060','--grad-start':'#E8883A','--grad-end':'#C45E1A','--banner-start':'#FEF0DA','--banner-end':'#FEE8C8' },
    dark:  { ...DS, '--bg':'#1A1008','--bg-card':'#241808','--bg-input':'#2E2010','--border':'#403018','--text':'#FFF5E8','--text-muted':'#907040','--grad-start':'#F0A050','--grad-end':'#E87030','--banner-start':'#281808','--banner-end':'#341E08' },
  },
  {
    id: 'oceano', name: 'Océano',
    swatches: ['#3A7EC4', '#1A5EA0', '#74B4E4'],
    light: { ...LS, '--bg':'#EFF4FA','--bg-card':'#F8FBFF','--bg-input':'#E0EBF5','--border':'#C8DAEC','--text':'#081520','--text-muted':'#607A90','--grad-start':'#2A7EC4','--grad-end':'#1A5EA0','--banner-start':'#DDE8F4','--banner-end':'#CCDFF0' },
    dark:  { ...DS, '--bg':'#060E18','--bg-card':'#0C1622','--bg-input':'#121E2C','--border':'#1C2E40','--text':'#E0EEFA','--text-muted':'#507090','--grad-start':'#4A9ED4','--grad-end':'#2A7EB4','--banner-start':'#081420','--banner-end':'#081828' },
  },
  {
    id: 'caramelo', name: 'Caramelo',
    swatches: ['#C47A3A', '#A05A1A', '#E8B874'],
    light: { ...LS, '--bg':'#FAF5EE','--bg-card':'#FFFCF8','--bg-input':'#F2E8D8','--border':'#E4D4BE','--text':'#1E1408','--text-muted':'#987850','--grad-start':'#C47A3A','--grad-end':'#A05A1A','--banner-start':'#FEF0D8','--banner-end':'#FEEAC8' },
    dark:  { ...DS, '--bg':'#180E06','--bg-card':'#22160A','--bg-input':'#2C1C0E','--border':'#3C2C14','--text':'#FFF5E0','--text-muted':'#907040','--grad-start':'#D49050','--grad-end':'#B86C30','--banner-start':'#28180A','--banner-end':'#342010' },
  },
  {
    id: 'blanco', name: 'Blanco',
    swatches: ['#FFFFFF', '#E0E0E0', '#0A0A0A'],
    light: { ...LS, '--bg':'#FFFFFF','--bg-card':'#FAFAFA','--bg-input':'#F2F2F2','--border':'#E2E2E2','--text':'#0A0A0A','--text-muted':'#757575','--grad-start':'#E8704A','--grad-end':'#7C6DC7','--banner-start':'#FEF0E9','--banner-end':'#EFECF8' },
    dark:  { ...LS, '--bg':'#FFFFFF','--bg-card':'#FAFAFA','--bg-input':'#F2F2F2','--border':'#E2E2E2','--text':'#0A0A0A','--text-muted':'#757575','--grad-start':'#E8704A','--grad-end':'#7C6DC7','--banner-start':'#FEF0E9','--banner-end':'#EFECF8' },
  },
  {
    id: 'negro', name: 'Negro',
    swatches: ['#000000', '#2A2A2A', '#FFFFFF'],
    light: { ...DS, '--bg':'#000000','--bg-card':'#111111','--bg-input':'#1C1C1C','--border':'#2C2C2C','--text':'#FFFFFF','--text-muted':'#909090','--grad-start':'#F0886A','--grad-end':'#9E90D9','--banner-start':'rgba(232,112,74,0.12)','--banner-end':'rgba(124,109,199,0.12)' },
    dark:  { ...DS, '--bg':'#000000','--bg-card':'#111111','--bg-input':'#1C1C1C','--border':'#2C2C2C','--text':'#FFFFFF','--text-muted':'#909090','--grad-start':'#F0886A','--grad-end':'#9E90D9','--banner-start':'rgba(232,112,74,0.12)','--banner-end':'rgba(124,109,199,0.12)' },
  },
  {
    id: 'esmeralda', name: 'Esmeralda',
    swatches: ['#1A9E7A', '#0E7A5E', '#A0E8D0'],
    light: { ...LS, '--bg':'#F0FAF7','--bg-card':'#FAFFFD','--bg-input':'#E0F5EE','--border':'#C4E8DA','--text':'#0A1E18','--text-muted':'#507A68','--grad-start':'#1A9E7A','--grad-end':'#0E6A9E','--banner-start':'#D8F5EC','--banner-end':'#D0EEF8' },
    dark:  { ...DS, '--bg':'#041410','--bg-card':'#081E18','--bg-input':'#0E2820','--border':'#163828','--text':'#E0FAF2','--text-muted':'#48907A','--grad-start':'#2AC48F','--grad-end':'#1A8AB4','--banner-start':'#081E14','--banner-end':'#082028' },
  },
  {
    id: 'indigo', name: 'Índigo',
    swatches: ['#4A5EC4', '#2A3E9E', '#8A9AE0'],
    light: { ...LS, '--bg':'#F0F2FA','--bg-card':'#F8F9FF','--bg-input':'#E4E8F5','--border':'#CDD4ED','--text':'#0A0E24','--text-muted':'#606888','--grad-start':'#4A5EC4','--grad-end':'#7A4EC4','--banner-start':'#DDE2F8','--banner-end':'#EAD8F8' },
    dark:  { ...DS, '--bg':'#080A18','--bg-card':'#0E1228','--bg-input':'#141A34','--border':'#1E2844','--text':'#E8EAFF','--text-muted':'#6870A0','--grad-start':'#6A7ED4','--grad-end':'#9A6ED4','--banner-start':'#0E1430','--banner-end':'#180E30' },
  },
];

export const DEFAULT_PALETTE: PaletteId = 'almendra';
export const DEFAULT_MODE: Mode = 'light';

export function getThemeVars(paletteId: PaletteId, mode: Mode): Vars {
  const p = PALETTES.find(p => p.id === paletteId) ?? PALETTES[0];
  return mode === 'light' ? p.light : p.dark;
}
