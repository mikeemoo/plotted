import React from 'react';
import Form from 'rsuite/Form';
import Slider from 'rsuite/Slider';
import { Generator } from '../types';

const generator: Generator = {
  controls: () => (
    <Form.Group controlId="slider">
      <Form.ControlLabel>Test:</Form.ControlLabel>
      <Form.Control
        accepter={Slider}
        name="slider"
        style={{ width: 200, margin: '10px 0' }}
      />
    </Form.Group>
  ),
  
  defaultValues: {
    slider: 10
  },

  generate: async function *() {
    yield 'generating test';
    await new Promise((res) => setTimeout(res, 4e3));
    yield 'done first timeout'
    await new Promise((res) => setTimeout(res, 4e3));
    yield [];
    
  }
}

export default generator;