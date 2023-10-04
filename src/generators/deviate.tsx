import { Vector2 } from 'three';
import { Config, DrawingPass, Generator } from '../types';
import Form from 'rsuite/Form';
import InputNumber from 'rsuite/InputNumber';
import Input from 'rsuite/Input';
import Toggle from 'rsuite/Toggle';
import { noise } from '@chriscourses/perlin-noise';

const generator: Generator = {
  controls: ({ params }: { params: Config }) => (
    <>
      <Form.Group controlId="penMain">
        <Form.ControlLabel>Pen:</Form.ControlLabel>
        <Form.Control
          accepter={InputNumber}
          name={`penWidthMain`}
          key="penWidthMain"
          step={0.1}
          style={{width: 75}}
        />
        <Form.Control
          accepter={Input}
          name={`penColorMain`}
          key="penColorMain"
          style={{width: 120}}
        />
      </Form.Group>
      <Form.Group controlId="margin">
        <Form.ControlLabel>Margin:</Form.ControlLabel>
        <Form.Control
          accepter={InputNumber}
          name="margin"
          step={1}
          style={{width: 75}}
        />
      </Form.Group>
      <Form.Group controlId="verticalSpacing">
          <Form.ControlLabel>Vertical Spacing:</Form.ControlLabel>
          <Form.Control
            accepter={InputNumber}
            name="verticalSpacing"
            step={0.2}
            style={{width: 75}}
          />
      </Form.Group>
      <Form.Group controlId="alpha">
          <Form.ControlLabel>Alpha:</Form.ControlLabel>
          <Form.Control
            accepter={InputNumber}
            name="alpha"
            step={1}
            style={{width: 100}}
          />
      </Form.Group>
      <Form.Group controlId="delta">
          <Form.ControlLabel>Delta:</Form.ControlLabel>
          <Form.Control
            accepter={InputNumber}
            name="delta"
            step={0.001}
            style={{width: 100}}
          />
      </Form.Group>
    </>
  ),
  
  defaultValues: {
    penWidthMain: 0.3,
    penColorMain: 'black',
    margin: 2,
    verticalSpacing: 1,
    delta: 0.006,
    alpha: 200
  },

  generate: async function *(params: Config) {

    const penWidthMain = Number(params.penWidthMain || 0.3);
    const penColorMain = params.penColorMain as string;
    
    await new Promise((res) => setTimeout(res, 0));
    yield 'generating lines...';

    const drawingPass: DrawingPass = {
      penWidth: penWidthMain,
      penColor: String(penColorMain).toLowerCase(),
      lines: []
    };

    const pageWidth = Number(params.pageWidth);
    const pageHeight = Number(params.pageHeight);
    const margin = Number(params.margin);
    const verticalSpacing = Number(params.verticalSpacing);
    const delta = Number(params.delta);
    const alpha = Number(params.alpha);

    const numLines = Math.round((pageHeight - (margin * 2)) / verticalSpacing);
    const lineWidth = ((pageWidth -  (margin * 4)) / 3);

    let left = margin;
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < numLines; y++) {
        const line: Vector2[] = [];
        let px = left;
        let py = margin + (y * verticalSpacing);
        for (let i = 0; i < lineWidth; i++) {
          const p = i / (lineWidth / 2);
          const n = (noise((px + i) * delta, (py * delta) * 2) - 0.5);
          line.push(
            new Vector2(
              px + i,
              py + ((p ** 2) * (n * alpha))
            )
          )
        }
        // [
        //   new Vector2(left, margin + (y * verticalSpacing)),
        //   new Vector2(left + lineWidth, margin + (y * verticalSpacing))
        // ]);

        drawingPass.lines.push(line);
      }
      left += lineWidth + margin;
    }


    yield [
      drawingPass
    ];
    
  }
}

export default generator;