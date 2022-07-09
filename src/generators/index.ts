import { Generator } from '../types';
import test from './test';
import wave from './wave';

export default {
  test,
  wave
} as { [k: string]: Generator }