import { Generator } from '../types';
import test from './test';
import wave from './wave';
import photoSpirals from './photo-spirals';

export default {
  test,
  wave,
  photoSpirals
} as { [k: string]: Generator }