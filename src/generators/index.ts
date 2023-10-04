import { Generator } from '../types';
import test from './test';
import wave from './wave';
import photoSpirals from './photo-spirals';
import deviate from './deviate';
import sketch from './sketch';

export default {
  test,
  wave,
  photoSpirals,
  deviate,
  sketch
} as { [k: string]: Generator }