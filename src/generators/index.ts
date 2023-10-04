import { Generator } from '../types';
import test from './test';
import wave from './wave';
import photoSpirals from './photo-spirals';
import deviate from './deviate';

export default {
  test,
  wave,
  photoSpirals,
  deviate
} as { [k: string]: Generator }