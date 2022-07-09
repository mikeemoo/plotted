import Form from 'rsuite/Form';
import InputNumber from 'rsuite/InputNumber';
import Input from 'rsuite/Input';
import { Config, DrawingPass } from '../types';
import { Vector2 } from 'three';
import { Generator } from '../types';
import { noise } from '@chriscourses/perlin-noise';
import Toggle from 'rsuite/Toggle';
import InputPicker from 'rsuite/InputPicker';
import Slider from 'rsuite/Slider';
import QuadTree from 'simple-quadtree';

const generator: Generator = {
  controls: ({ params }) => {

    return (
      <>
        <Form.Group controlId="colorMode">
          <Form.ControlLabel>Color mode:</Form.ControlLabel>
          <Form.Control
            accepter={InputPicker}
            name="colorMode"
            cleanable={false}
            data={[
              { value: "random", label: "Random" }
            ]}
          />
        </Form.Group>
        <Form.Group controlId="numPens">
          <Form.ControlLabel>Number of pens:</Form.ControlLabel>
          <Form.Control
            accepter={Slider}
            name="numPens"
            min={1}
            max={5}
            style={{width: 200, marginTop: 10, marginLeft: 10}}
          />
        </Form.Group>
        {[...Array(params.numPens as number)].map((a, i) => (
          <Form.Group controlId={`pen${i + 1}`} key={`pen${i + 1}`}>
            <Form.ControlLabel>Pen {i + 1}:</Form.ControlLabel>
            <Form.Control
              accepter={InputNumber}
              name={`penWidth${i + 1}`}
              step={0.1}
              style={{width: 75}}
            />
            <Form.Control
              accepter={Input}
              name={`penColor${i + 1}`}
              style={{width: 120}}
            />
          </Form.Group>
        ))}
        <Form.Group controlId="numLines">
          <Form.ControlLabel>Number of lines:</Form.ControlLabel>
          <Form.Control
            accepter={InputNumber}
            name="numLines"
            step={100}
            style={{width: 100}}
          />
        </Form.Group>
        <Form.Group controlId="noiseSpread">
          <Form.ControlLabel>Noise spread:</Form.ControlLabel>
          <Form.Control
            accepter={InputNumber}
            name="noiseSpread"
            step={10}
            style={{width: 75}}
          />
        </Form.Group>
        <Form.Group controlId="folds">
          <Form.ControlLabel>Folds:</Form.ControlLabel>
          <Form.Control
            accepter={InputNumber}
            name="folds"
            step={1}
            style={{width: 75}}
          />
        </Form.Group>
        <Form.Group controlId="destroyOnCollision">
          <Form.ControlLabel>Destroy on collision:</Form.ControlLabel>
          <Form.Control
            accepter={Toggle}
            name="destroyOnCollision"
            defaultChecked={params.destroyOnCollision as boolean}
          />
        </Form.Group>
      </>
    );
  },
  
  defaultValues: {
    numPens: 1,
    penWidth1: 0.2,
    penColor1: '#000000',
    penWidth2: 0.2,
    penColor2: '#000000',
    penWidth3: 0.2,
    penColor3: '#000000',
    penWidth4: 0.2,
    penColor4: '#000000',
    penWidth5: 0.2,
    penColor5: '#000000',
    colorMode: 'random',
    numLines: 1000,
    noiseSpread: 100,
    folds: 4,
    destroyOnCollision: false
  },

  generate: async function *(params: Config) {

    const numLines = params.numLines as number;
    const numPens = params.numPens as number;
    const pageWidth = params.pageWidth as number;
    const pageHeight = params.pageHeight as number;
    const noiseSpread = params.noiseSpread as number;
    const folds = params.folds as number;
    const destroyOnCollision = params.destroyOnCollision as boolean;

    const qt = QuadTree(0, 0, pageWidth, pageHeight);

    const fromAngle = (angle: number) => new Vector2(Math.cos(angle), Math.sin(angle));

    const isParticleDead = (particle: Vector2) => {
      return particle.x >= pageWidth || particle.x < 0 || particle.y >= pageHeight || particle.y < 0
        || (destroyOnCollision && qt.get({
          x: particle.x - 1,
          y: particle.y - 1,
          w: 2,
          h: 2
        }).some((point: { x: number, y: number }) => ((point.x - particle.x) ** 2) + ((point.y - particle.y) ** 2) < 0.2 ** 2))
    }

    const drawingPasses: DrawingPass[] = [...Array(numPens)].map((_, i) => ({
      penColor: params[`penColor${i + 1}`] as string,
      penWidth: params[`penWidth${i + 1}`] as number,
      lines: []
    }));
    
    await new Promise((res) => setTimeout(res, 0));
    yield `0 / ${numLines}`;

    let lastYield: number = Date.now();
    const shouldYield = () => {
      const now = Date.now();
      if (now - lastYield > 500) {
        lastYield = now;
        return true;
      }
      return false;
    }

    for (let i = 0; i < numLines; i++) {

      const pen = Math.floor(Math.random() * numPens);
      const line: Vector2[] = [];
      const startX = Math.random() * pageWidth;
      const startY = Math.random() * pageHeight;
      const particle = new Vector2(startX, startY);

      let bail = 1000;
      while (bail--) {
        const dirVector = fromAngle(noise(particle.x / noiseSpread, particle.y / noiseSpread) * Math.PI * folds).normalize();
        particle.add(dirVector);
        if (isParticleDead(particle)) {
          break;
        }
        line.push(particle.clone());
      }
  
      if (line.length === 0) {
        continue;
      }

      particle.set(line[0].x, line[0].y);
      line.reverse();

      bail = 1000;
      while (bail--) {
        const dirVector = fromAngle(noise(particle.x / noiseSpread, particle.y / noiseSpread) * Math.PI * folds).normalize();
        particle.sub(dirVector);
        if (isParticleDead(particle)) {
          break;
        }
        line.push(particle.clone());
      }

      drawingPasses[pen].lines.push(line);
      line.forEach((point) => {
        qt.put({
          x: point.x,
          y: point.y,
          w: 0,
          h: 0
        })
      })
      if (shouldYield()) {
        await new Promise((res) => setTimeout(res, 0));
        yield `${i} / ${numLines}`;
      }
    }
    
    yield drawingPasses;
  }
}

export default generator;