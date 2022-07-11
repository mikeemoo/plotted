import Form from 'rsuite/Form';
import InputNumber from 'rsuite/InputNumber';
import Input from 'rsuite/Input';
import { Config, DrawingPass, LineBounds } from '../types';
import { Vector2 } from 'three';
import { Generator } from '../types';
import { noise, noiseSeed as setNoiseSeed } from '@chriscourses/perlin-noise';
import Toggle from 'rsuite/Toggle';
import InputPicker from 'rsuite/InputPicker';
import Slider from 'rsuite/Slider';
import QuadTree from 'simple-quadtree';
import SimplexNoise from 'simplex-noise';
import simplify from 'simplify-js';
import { rectangulate, lineLength, split, pointsEvery} from '../utils';

const generator: Generator = {
  controls: ({ params }) => {

    return (
      <>
        <Form.Group controlId="noiseGenerator">
          <Form.ControlLabel>Noise generator:</Form.ControlLabel>
          <Form.Control
            accepter={InputPicker}
            name="noiseGenerator"
            cleanable={false}
            data={[
              { value: "perlin", label: "Perlin" },
              { value: "simplex", label: "Simplex" },
            ]}
          />
        </Form.Group>
        <Form.Group controlId="noiseSeed">
          <Form.ControlLabel>Noise seed:</Form.ControlLabel>
          <Form.Control
            accepter={InputNumber}
            name="noiseSeed"
            step={1}
            style={{width: 100}}
          />
        </Form.Group>
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
        <Form.Group controlId="form">
          <Form.ControlLabel>Form:</Form.ControlLabel>
          <Form.Control
            accepter={InputPicker}
            name="form"
            cleanable={false}
            data={[
              { value: "lines", label: "Lines" },
              { value: "rectangles", label: "Rectangles" },
            ]}
          />
        </Form.Group>
          {params.form === 'rectangles' && 
          <>
          <Form.Group controlId="rectangleMargin">
            <Form.ControlLabel>Rectangle margin:</Form.ControlLabel>
            <Form.Control
              accepter={InputNumber}
              name="rectangleMargin"
              step={1}
              style={{width: 120}}
            />
          </Form.Group>
          <Form.Group controlId="rectangleWidth">
            <Form.ControlLabel>Rectangle width:</Form.ControlLabel>
            Min: &nbsp;
            <Form.Control
              accepter={InputNumber}
              name="minRectangleWidth"
              step={1}
              style={{width: 80}}
            />
            &nbsp;Max: &nbsp;
            <Form.Control
              accepter={InputNumber}
              name="maxRectangleWidth"
              step={1}
              style={{width: 80}}
            />
          </Form.Group>
          <Form.Group controlId="form">
            <Form.ControlLabel>Fill style:</Form.ControlLabel>
            <Form.Control
              accepter={InputPicker}
              name="fillStyle"
              cleanable={false}
              data={[
                { value: "none", label: "None" },
                { value: "tangent", label: "Tangent" },
                { value: "random", label: "Random" },
              ]}
            />
          </Form.Group>
          {(params.fillStyle === 'tangent' || params.fillStyle === 'random') && 
              <Form.Group controlId="fillSpacing">
                <Form.ControlLabel>Fill spacing:</Form.ControlLabel>
                Min:&nbsp;
                <Form.Control
                  accepter={InputNumber}
                  name="fillSpacingMin"
                  step={1}
                  style={{width: 80}}
                />
                &nbsp;Max:&nbsp;
                <Form.Control
                  accepter={InputNumber}
                  name="fillSpacingMax"
                  step={1}
                  style={{width: 80}}
                />
              </Form.Group>
            }
          </>
        }
        <Form.Group controlId="numLines">
          <Form.ControlLabel>Number of lines (attempts):</Form.ControlLabel>
          <Form.Control
            accepter={InputNumber}
            name="numLines"
            step={100}
            style={{width: 100}}
          />
        </Form.Group>
        <Form.Group controlId="maxLineLength">
          <Form.ControlLabel>Max line length:</Form.ControlLabel>
          <Form.Control
            accepter={InputNumber}
            name="maxLineLength"
            step={10}
            style={{width: 100}}
          />
        </Form.Group>
        <Form.Group controlId="amplitude">
          <Form.ControlLabel>Amplitude:</Form.ControlLabel>
          <Form.Control
            accepter={InputNumber}
            name="amplitude"
            step={10}
            style={{width: 75}}
          />
        </Form.Group>
        <Form.Group controlId="frequency">
          <Form.ControlLabel>Frequency:</Form.ControlLabel>
          <Form.Control
            accepter={InputNumber}
            name="frequency"
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
    noiseSeed: 1234567,
    noiseGenerator: 'simplex',
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
    form: 'lines',
    numLines: 1000,
    maxLineLength: 1000,
    amplitude: 2,
    fillStyle: 'none',
    fillSpacingMin: 2,
    fillSpacingMax: 2,
    rectangleMargin: 2,
    minRectangleWidth: 3,
    maxRectangleWidth: 30,
    frequency: 2,
    destroyOnCollision: false
  },

  generate: async function *(params: Config) {


    const numLines = Number(params.numLines);
    const numPens = Number(params.numPens);
    const pageWidth = Number(params.pageWidth);
    const pageHeight = Number(params.pageHeight);
    const form = params.form as string;
    const frequency = (params.frequency as number / 1000);
    const noiseGenerator = params.noiseGenerator as string;
    const amplitude = Number(params.amplitude);
    const noiseSeed = Number(params.noiseSeed);
    const destroyOnCollision = params.destroyOnCollision as boolean;
    const fillStyle = params.fillStyle;
    const fillSpacingMin = Math.max(0.1, Number(params.fillSpacingMin));
    const fillSpacingMax = Math.max(fillSpacingMin, Number(params.fillSpacingMax));

    const rectangleMargin = Number(params.rectangleMargin || 0);
    const maxLineLength = Number(params.maxLineLength || 10);
    const minRectangleWidth = Number(params.minRectangleWidth || 0.1);
    const maxRectangleWidth = Number(params.maxRectangleWidth || 0.1);

    const qt = QuadTree(0, 0, pageWidth, pageHeight);
    const simplex = new SimplexNoise(noiseSeed);

    setNoiseSeed(noiseSeed);

    const fromAngle = (angle: number) => new Vector2(Math.cos(angle), Math.sin(angle));

    const isParticleDead = (particle: Vector2, line: Vector2[]): boolean => {
      if (particle.x >= pageWidth || particle.x < 0 || particle.y >= pageHeight || particle.y < 0) {
        return true;
      }

      if (lineLength([...line, particle]) > maxLineLength) {
        return true;
      }

      if (destroyOnCollision) {
        return qt.get({
          x: particle.x - 1,
          y: particle.y - 1,
          w: 2,
          h: 2
        }).some(
          (point: { x: number, y: number }) => ((point.x - particle.x) ** 2) + ((point.y - particle.y) ** 2) < 0.2 ** 2
        )
      }
      return false;
    }

    const isRectangleDead = (particle: Vector2, line: Vector2[], rectangleWidth: number): boolean => {
      if (particle.x >= pageWidth || particle.x < 0 || particle.y >= pageHeight || particle.y < 0) {
        return true;
      }

      if (lineLength([...line, particle]) > maxLineLength) {
        return true;
      }

      if (destroyOnCollision) {
        return qt.get({
          x: particle.x - (rectangleWidth + rectangleMargin),
          y: particle.y - (rectangleWidth + rectangleMargin),
          w: rectangleMargin + (rectangleWidth * 2),
          h: rectangleMargin + (rectangleWidth * 2)
        }).some(
          (point: { x: number, y: number, w: number }) => (((point.x + (point.w / 2)) - particle.x) ** 2) + (((point.y + (point.w / 2)) - particle.y) ** 2) < ((point.w + rectangleWidth + rectangleMargin) / 2) ** 2
        )
      }
      return false;
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

    const getDirVector = (particle: Vector2) => {
      if (noiseGenerator === 'perlin') {
        return fromAngle(noise(particle.x * frequency, particle.y * frequency) * Math.PI * amplitude).normalize();
      } else {
        return fromAngle(((simplex.noise2D(particle.x * frequency, particle.y * frequency) + 1) / 4) * Math.PI * amplitude).normalize();
      }
    }

    for (let i = 0; i < numLines; i++) {

      const rectangleWidth = minRectangleWidth + (Math.random() * (maxRectangleWidth - minRectangleWidth));
      const pen = Math.floor(Math.random() * numPens);
      const penWidth = drawingPasses[pen].penWidth;
      const line: Vector2[] = [];
      const startX = Math.random() * pageWidth;
      const startY = Math.random() * pageHeight;
      const particle = new Vector2(startX, startY);
      const fillSpacing = fillSpacingMin + (Math.random() * (fillSpacingMax - fillSpacingMin));

      let bail = 1000;
      while (bail--) {
        const dirVector = getDirVector(particle);
        particle.add(dirVector);
        if (form === 'lines' && isParticleDead(particle, line)) {
          break;
        } else if (form === 'rectangles' && isRectangleDead(particle, line, rectangleWidth)) {
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
        const dirVector = getDirVector(particle);
        particle.sub(dirVector);
        if (form === 'lines' && isParticleDead(particle, line)) {
          break;
        } else if (form === 'rectangles' && isRectangleDead(particle, line, rectangleWidth)) {
          break;
        }
        line.push(particle.clone());
      }

      if (line.length < 2) {
        continue;
      }

      const simplified = simplify(line.map((point) => ({ x: point.x, y: point.y })), 0.02, true).map(({ x, y }) => new Vector2(x, y));

      if (form === 'rectangles') {
        if (fillStyle === 'none' || (fillStyle === 'random' && Math.random() < 0.5)) {
          const rectangle = rectangulate(simplified, penWidth, rectangleWidth);
          drawingPasses[pen].lines.push(rectangle);
        } else if (fillStyle === 'tangent' || fillStyle === 'random') {

          pointsEvery(simplified, fillSpacing).forEach(({ coord, direction }) => {
            const tangentFrom = new Vector2(-direction.y, direction.x).multiplyScalar(rectangleWidth / 2);
            const tangentTo = new Vector2(-direction.y, direction.x).multiplyScalar(-rectangleWidth / 2);
            
            drawingPasses[pen].lines.push([
              coord.clone().add(tangentFrom),
              coord.clone().add(tangentTo)
            ]);
          });
        }
        const halfRectangleWidth = rectangleWidth / 2;

        split(line, 1).forEach((point) => {
          qt.put({
            x: point.x - halfRectangleWidth,
            y: point.y - halfRectangleWidth,
            w: rectangleWidth,
            h: rectangleWidth
          })
        });
      } else {
        drawingPasses[pen].lines.push(simplified);
        line.forEach((point) => {
          qt.put({
            x: point.x,
            y: point.y,
            w: 0,
            h: 0
          })
        })
      }


      if (shouldYield()) {
        await new Promise((res) => setTimeout(res, 0));
        yield `${i} / ${numLines}`;
      }
    }
    
    yield drawingPasses;
  }
}

export default generator;