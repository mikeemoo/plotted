import { Vector2 } from 'three';
import { Config, DrawingPass, Generator } from '../types';
import Form from 'rsuite/Form';
import InputNumber from 'rsuite/InputNumber';
import Input from 'rsuite/Input';
import { Delaunay } from 'd3-delaunay';
import SimpleQuadtree from 'simple-quadtree';
import { CurveInterpolator } from 'curve-interpolator';
import simplify from 'simplify-js';

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
      <Form.Group controlId="photoUrl">
        <Form.ControlLabel>Photo url:</Form.ControlLabel>
        <Form.Control
          accepter={Input}
          name={`photoUrl`}
          style={{width: 200}}
        />
      </Form.Group>
      <Form.Group controlId="numPoints">
        <Form.ControlLabel>Num points:</Form.ControlLabel>
        <Form.Control
          accepter={InputNumber}
          name={`numPoints`}
          step={1000}
          style={{width: 200}}
        />
      </Form.Group>
      <Form.Group controlId="tension">
        <Form.ControlLabel>Tension:</Form.ControlLabel>
        <Form.Control
          accepter={InputNumber}
          name={`tension`}
          step={0.01}
          style={{width: 120}}
        />
      </Form.Group>
      <Form.Group controlId="alpha">
        <Form.ControlLabel>Alpha:</Form.ControlLabel>
        <Form.Control
          accepter={InputNumber}
          name={`alpha`}
          step={0.1}
          style={{width: 120}}
        />
      </Form.Group>
      <Form.Group controlId="connectionDist">
        <Form.ControlLabel>Connection dist:</Form.ControlLabel>
        <Form.Control
          accepter={InputNumber}
          name={`connectionDist`}
          step={5}
          style={{width: 120}}
        />
      </Form.Group>
    </>
  ),
  
  defaultValues: {
    penWidthMain: 0.1,
    penColorMain: 'black',
    photoUrl: 'https://i.imgur.com/gm8UVmd.png',
    numPoints: 50000,
    tension: 0.1,
    alpha: 1,
    connectionDist: 20
  },

  generate: async function *(params: Config) {

    const penWidthMain = Number(params.penWidthMain || 0.3);
    const penColorMain = params.penColorMain as string;
    const photoUrl = params.photoUrl as string;
    const pageWidth = Number(params.pageWidth);
    const pageHeight = Number(params.pageHeight);
    const tension = Number(params.tension);
    const alpha = Number(params.alpha);
    const connectionDist = Number(params.connectionDist);

    const total = Number(params.numPoints);
    const brightnessCache: number[] = [];

    const points = new Float64Array(total * 2);
    const closest = new Float64Array(total * 2);
    const weights = new Float64Array(total);
    
    yield 'Loading image...';
    await new Promise((res) => setTimeout(res, 0));

    try {
        await new Promise((res, rej) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
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

                var i = 0;
                while (i < total){
                    var x = Math.round(Math.random() * pageWidth);
                    var y = Math.round(Math.random() * pageHeight);
                    const r = imgData.data[(y * pageWidth + x) * 4 + 0];
                    const g = imgData.data[(y * pageWidth + x) * 4 + 1];
                    const b = imgData.data[(y * pageWidth + x) * 4 + 2];
                    const brightness = 255 - (((r*299)+(g*587)+(b*114))/1000);
                    brightnessCache[i] = brightness;
                    if (Math.random() < (brightness / 254) ** 2){
                        points[i * 2 + 0] = x;
                        points[i * 2 + 1] = y;
                        i++;
                    }
                }
                
                res(false);
            }
            img.onerror = rej;
            img.src = photoUrl;
        });
    } catch (e) {
        yield 'Unable to load image';
        await new Promise((res) => setTimeout(res, 60e3));
    }

    yield 'Generating voronoi...';
    await new Promise((res) => setTimeout(res, 0));

    const delaunay = new Delaunay(points);
    const voronoi = delaunay.voronoi([0, 0, pageWidth, pageHeight]);
    closest.fill(0);
	weights.fill(0);
	for (let y = 0, i = 0; y < pageHeight; ++y) {
		for (let x = 0; x < pageWidth; ++x) {
			const w = brightnessCache[y * pageWidth + x];
			i = delaunay.find(x + 0.5, y + 0.5, i);
			weights[i] += w;
			closest[i * 2] += w * (x + 0.5);
			closest[i * 2 + 1] += w * (y + 0.5);
		}
	}

    yield 'Finding center points...';
    await new Promise((res) => setTimeout(res, 0));

	const w = Math.pow(10 + 1, -0.8) * 10;
	for (let i = 0; i < total; ++i) {
		const x0 = points[i * 2];
		const y0 = points[i * 2 + 1];
		const x1 = weights[i] ? closest[i * 2] / weights[i] : x0;
		const y1 = weights[i] ? closest[i * 2 + 1] / weights[i] : y0;
		points[i * 2] = x0 + (x1 - x0) * 1.8 + (Math.random() - 0.5) * w;
		points[i * 2 + 1] = y0 + (y1 - y0) * 1.8 + (Math.random() - 0.5) * w;
	}
	
	voronoi.update();

    const lines: Vector2[][] = [];

    yield 'Building quad tree...';
    await new Promise((res) => setTimeout(res, 0));

    const tree = new SimpleQuadtree(0, 0, pageWidth, pageHeight, { maxchildren: 1000 });
    const ps: any[] = [];
	
	for(let i = 0; i < total; i++){
        const point = { x: points[i * 2], y: points[i * 2 + 1], w: 0, h: 0 };
        ps.push(point);
        tree.put(point);

        if (i % 1000 === 0) {

            yield `Building quad tree (${i}/${total})...`;
            await new Promise((res) => setTimeout(res, 0));
        }
	}

    yield 'Connecting neighbours...';
    await new Promise((res) => setTimeout(res, 0));

    const dist = connectionDist;
    const startDist = dist < 10 ? dist : 10;
    
    for (let i = 0; i < ps.length; i++) {
        const p = ps[i];

        for (let j = startDist; j <= dist; j+=10) {

            
            const result = tree.get({ x: p.x - j, y: p.y - j, w: j * 2, h: j * 2 }).filter((r: any) => r !== p && !r.used);

            if (result.length === 0) {
                continue;
            }

            const r = result[Math.floor(Math.random() * result.length)];
            r.used = true;
            p.join = r;
            break;
        }


        if (i % 1000 === 0) {

            yield `Connecting neighbours (${i}/${ps.length})...`;
            await new Promise((res) => setTimeout(res, 0));
        }
    }

    yield 'Building paths...';
    await new Promise((res) => setTimeout(res, 0));

    const startNodes = ps.filter((r: any) => r.join && !r.used);

    for (let j = 0; j < startNodes.length; j++) {
        const n = startNodes[j];
        const l: number[][] = [];
        let node = n;
        while (node) {
            l.push([node.x, node.y]);
            node = node.join;
        }
        const interp = new CurveInterpolator(l, { tension, alpha });
        const pts = interp.getPoints(20000).map((a: [number, number]) => ({ x: a[0], y: a[1]}));

        const simplified = simplify(pts, 0.01, true).map(({ x, y }) => new Vector2(x, y));
        lines.push(simplified);

        if (j % 10 === 0) {
            yield `Building paths (${j}/${startNodes.length})...`;
            await new Promise((res) => setTimeout(res, 0));
        }
    }


    const drawingPass: DrawingPass = {
      penWidth: penWidthMain,
      penColor: String(penColorMain).toLowerCase(),
      lines
    };
    yield [
      drawingPass
    ];
    
  }
}

export default generator;