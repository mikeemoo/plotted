import React from 'react';
import Form from 'rsuite/Form';
import Slider from 'rsuite/Slider';
import { Vector2 } from 'three';
import { Generator } from '../types';

const generator: Generator = {
  controls: () => null,
  
  defaultValues: {
  },

  generate: async function *() {
    yield 'generating test';
    yield [{
      penColor: 'black',
      penWidth: 0.2,
      lines: [
        [
          new Vector2(0, 0),
          new Vector2(100, 100)
        ]
      ]
    }];
    
  }
}

export default generator;