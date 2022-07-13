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
      <Form.Group controlId="photoUrl">
        <Form.ControlLabel>Photo url:</Form.ControlLabel>
        <Form.Control
          accepter={Input}
          name={`photoUrl`}
          style={{width: 200}}
        />
      </Form.Group>
      <Form.Group controlId="cmyk">
        <Form.ControlLabel>CMYK:</Form.ControlLabel>
        <Form.Control
          accepter={Toggle}
          name={`cmyk`}
          defaultChecked={params.cmyk as boolean}
        />
      </Form.Group>
      {params.cmyk ? (
        <>
          <Form.Group controlId="penMain">
            <Form.ControlLabel>Pen width:</Form.ControlLabel>
            <Form.Control
              accepter={InputNumber}
              name="penWidthMain"
              key="penWidthMain"
              step={0.1}
              style={{width: 75}}
            />
          </Form.Group>
          <Form.Group controlId="rotationCyan">
            <Form.ControlLabel>Cyan rotation:</Form.ControlLabel>
            <Form.Control
              accepter={InputNumber}
              name="rotationCyan"
              step={10}
              key="rotationCyan"
              style={{width: 75}}
            />
          </Form.Group>
          <Form.Group controlId="modifierCyan">
            <Form.ControlLabel>Cyan modifier (-1 to 1):</Form.ControlLabel>
            <Form.Control
              accepter={InputNumber}
              name="modifierCyan"
              key="modifierCyan"
              step={0.05}
              min={-1}
              max={1}
              style={{width: 75}}
            />
          </Form.Group>
          <Form.Group controlId="rotationMagenta">
            <Form.ControlLabel>Magenta rotation:</Form.ControlLabel>
            <Form.Control
              accepter={InputNumber}
              name="rotationMagenta"
              key="rotationMagenta"
              step={10}
              style={{width: 75}}
            />
          </Form.Group>
          <Form.Group controlId="modifierMagenta">
            <Form.ControlLabel>Magenta modifier (-1 to 1):</Form.ControlLabel>
            <Form.Control
              accepter={InputNumber}
              name="modifierMagenta"
              key="modifierMagenta"
              step={0.05}
              min={-1}
              max={1}
              style={{width: 75}}
            />
          </Form.Group>
          <Form.Group controlId="rotationYellow">
            <Form.ControlLabel>Yellow rotation:</Form.ControlLabel>
            <Form.Control
              accepter={InputNumber}
              name="rotationYellow"
              key="rotationYellow"
              step={10}
              style={{width: 75}}
            />
          </Form.Group>
          <Form.Group controlId="modifierYellow">
            <Form.ControlLabel>Yellow modifier (-1 to 1):</Form.ControlLabel>
            <Form.Control
              accepter={InputNumber}
              name="modifierYellow"
              key="modifierYellow"
              step={0.05}
              min={-1}
              max={1}
              style={{width: 75}}
            />
          </Form.Group>
          <Form.Group controlId="rotation">
            <Form.ControlLabel>Black rotation:</Form.ControlLabel>
            <Form.Control
              accepter={InputNumber}
              name="rotation"
              key="rotation"
              step={10}
              style={{width: 75}}
            />
          </Form.Group>
          <Form.Group controlId="modifierBlack">
            <Form.ControlLabel>Black modifier (-1 to 1):</Form.ControlLabel>
            <Form.Control
              accepter={InputNumber}
              name="modifierBlack"
              key="modifierBlack"
              step={0.05}
              min={-1}
              max={1}
              style={{width: 75}}
            />
          </Form.Group>
        </>
      ) : (
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
          <Form.Group controlId="rotation">
            <Form.ControlLabel>Rotation degrees:</Form.ControlLabel>
            <Form.Control
              accepter={InputNumber}
              name="rotation"
              key="rotation"
              step={10}
              style={{width: 75}}
            />
          </Form.Group>
          <Form.Group controlId="modifierBlack">
            <Form.ControlLabel>Modifier (-1 to 1):</Form.ControlLabel>
            <Form.Control
              accepter={InputNumber}
              name="modifierBlack"
              key="modifierBlack"
              step={0.05}
              min={-1}
              max={1}
              style={{width: 75}}
            />
          </Form.Group>
          <Form.Group controlId="inverted">
            <Form.ControlLabel>Inverted:</Form.ControlLabel>
            <Form.Control
              accepter={Toggle}
              name={`inverted`}
              key="inverted"
              defaultChecked={params.inverted as boolean}
            />
          </Form.Group>
        </>
      )}
      <Form.Group controlId="spiralRadius">
        <Form.ControlLabel>Spiral radius:</Form.ControlLabel>
        <Form.Control
          accepter={InputNumber}
          name={`spiralRadius`}
          step={0.1}
          style={{width: 120}}
        />
      </Form.Group>
      <Form.Group controlId="spiralGap">
        <Form.ControlLabel>Spiral gap:</Form.ControlLabel>
        <Form.Control
          accepter={InputNumber}
          name={`spiralGap`}
          step={0.1}
          style={{width: 120}}
        />
      </Form.Group>
    </>
  ),
  
  defaultValues: {
    photoUrl: 'https://m.media-amazon.com/images/I/61LBhkJzZWL._AC_SY606_.jpg',
    penWidthMain: 0.3,
    penColorMain: 'black',
    spiralRadius: 1.5,
    rotation: 11,
    rotationCyan: 22,
    rotationMagenta: 33,
    rotationYellow: 44,
    modifierBlack: 0,
    modifierCyan: 0,
    modifierYellow: 0,
    modifierMagenta: 0,
    spiralGap: 0.5,
    inverted: false,
    cmyk: true
  },

  generate: async function *(params: Config) {

    const spiralRadius = Number(params.spiralRadius || 1);
    const spiralGap = Number(params.spiralGap || 0.1);
    const penWidthMain = Number(params.penWidthMain || 0.3);
    const rotation = Number(params.rotation || 0);
    const penColorMain = params.penColorMain as string;
    const photoUrl = params.photoUrl as string;
    const inverted = !!params.inverted;
    
    const drawingPasses: DrawingPass[] = [];

    await new Promise((res) => setTimeout(res, 0));
    yield 'generating spirals';

    await new Promise((res) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const pageWidth = Number(params.pageWidth);
        const pageHeight = Number(params.pageHeight);
        const offscreen = new OffscreenCanvas(pageWidth, pageHeight);

        const hRatio = offscreen.width / img.width;
        const vRatio =  offscreen.height / img.height;

        const ratio = Math.max (hRatio, vRatio);

        const centerShiftX = ( offscreen.width - img.width * ratio ) / 2;
        const centerShiftY = ( offscreen.height - img.height * ratio ) / 2;

        const ctx = offscreen.getContext('2d') as OffscreenCanvasRenderingContext2D;
        ctx.clearRect(0, 0, offscreen.width, offscreen.height);
        ctx.drawImage(img, 0,0, img.width, img.height,
                      centerShiftX,centerShiftY,img.width*ratio, img.height*ratio);
        const imgData = ctx.getImageData(0, 0, pageWidth, pageHeight);

        const maximumSize = Math.sqrt((pageWidth ** 2) + (pageHeight ** 2));

        const radius = spiralRadius;
        const penWidth = penWidthMain + spiralGap;
        const loops = radius / penWidth;
        const segments = 20;
        const steps = segments * loops;

        const startX = (pageWidth - maximumSize) / 2;
        const startY = (pageHeight - maximumSize) / 2;
        const centerX = pageWidth / 2;
        const centerY = pageHeight / 2;

        const drawSpiralAt = (x: number, y: number, color: string, colorModifier: number): Vector2[] => {

          const index = (Math.round(y) * pageWidth + Math.round(x)) * 4;
          const line: Vector2[] = [];
          let r = 0;

          if (params.cmyk) {
            let cyan = 1 - (imgData.data[index] / 255);
            let magenta = 1 - (imgData.data[index + 1] / 255);
            let yellow = 1 - (imgData.data[index + 2] / 255);
            let black = Math.min(cyan, Math.min(magenta, yellow));
            cyan = (cyan - black) / (1 - black);
            magenta = (magenta - black) / (1 - black);
            yellow = (yellow - black) / (1 - black);
            cyan = isNaN(cyan) ? 0 : cyan;
            magenta = isNaN(magenta) ? 0 : magenta;
            yellow = isNaN(yellow) ? 0 : yellow;
            black = isNaN(black) ? 0 : black;
            if (color == 'Cyan') {
              r = cyan;
            } else if (color === 'Magenta') {
              r = magenta;
            } else if (color === 'Yellow') {
              r = yellow;
            } else {
              r = black;
            }
          } else {
            const g = 0.2125 * imgData.data[index] + 0.7154 * imgData.data[index + 1] + 0.0721 * imgData.data[index + 2];
            r = g / 255;
            if (!inverted) {
              r = 1 - r;
            }
          }

          r = r * colorModifier + (1 - colorModifier);
          
          let angle = (noise(x / 200, y / 200) * 2 * Math.PI);
          for (let i = 0; i <= (steps * r); i++) {
            const rr = (i / steps) * radius;
            angle += (Math.PI * 2) / segments;

            line.push(new Vector2(
              x + rr * Math.cos(angle),
              y + rr * Math.sin(angle),
            ));
          }

          return line;
        }
        

        if (params.cmyk) {
          ['Cyan', 'Magenta', 'Yellow', 'Black'].forEach((colorPass) => {
            const angleModifier = (colorPass === 'Black' ? rotation : Number(params[`rotation${colorPass}`])) * (Math.PI / 180);
            const colorModifier = 2 - (Number(params[`modifier${colorPass}`]) + 1);


            const drawingPass: DrawingPass = {
              penWidth: penWidthMain,
              penColor: String(colorPass || penColorMain).toLowerCase(),
              lines: []
            }
       
            const cos = Math.cos(angleModifier);
            const sin = Math.sin(angleModifier);
  
            for (let y = startY; y < pageHeight - startY; y += radius * 2) {
              for (let x = startX; x < pageWidth - startX; x += radius * 2) {
  
                const pX = ((x - centerX) * cos) - ((y - centerY) * sin) + centerX;
                const pY = ((x - centerX) * sin) + ((y - centerY) * cos) + centerY;
                if (pX < 0 || pY < 0 || pX > pageWidth || pY > pageHeight) {
                  continue;
                }
  
                const spiral = drawSpiralAt(pX, pY, colorPass, colorModifier);
                if (spiral.length > 1) {
                  drawingPass.lines.push(spiral);
                }
              }
            }
            drawingPasses.push(drawingPass);
          });

        } else {

          const drawingPass: DrawingPass = {
            penWidth: penWidthMain,
            penColor: penColorMain,
            lines: []
          }

          const rotRad = rotation * (Math.PI / 180);
     
          const cos = Math.cos(rotRad);
          const sin = Math.sin(rotRad);

          for (let y = startY; y < pageHeight - startY; y += radius * 2) {
            for (let x = startX; x < pageWidth - startX; x += radius * 2) {

              const pX = ((x - centerX) * cos) - ((y - centerY) * sin) + centerX;
              const pY = ((x - centerX) * sin) + ((y - centerY) * cos) + centerY;
              if (pX < 0 || pY < 0 || pX > pageWidth || pY > pageHeight) {
                continue;
              }
              const spiral = drawSpiralAt(pX, pY, 'grey', 2 - (Number(params.modifierBlack) + 1));
              if (spiral.length > 1) {
                drawingPass.lines.push(spiral);
              }
            }
          }
          drawingPasses.push(drawingPass);
        }

        res(null);

      };
      img.src = photoUrl;
    });
    

    yield drawingPasses;
    
  }
}

export default generator;