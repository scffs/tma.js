import { getConfig } from './build/getConfig';

export default getConfig({
  input: 'src/index.low-level.ts',
  filename: 'index.low-level',
  formats: ['iife'],
});