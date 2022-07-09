import React from 'react';
import { Config, DrawingPass } from "./types"

type Props = {
  parameters: Config;
  passes: DrawingPass[];
}

export default ({ parameters, passes }: Props) => {

  const scale = 1000 / (parameters.pageWidth as number);

  const canvasRef = React.useRef(null);
  
  React.useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current as HTMLCanvasElement;
      canvas.width = 1000;
      canvas.height = 1000 * (parameters.pageHeight as number / (parameters.pageWidth as number));
      const context = canvas.getContext('2d') as CanvasRenderingContext2D;
      //Our first draw
      context.fillStyle = parameters.pageColor as string;
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);
      passes.forEach(({ penColor, penWidth, lines }) => {
        context.beginPath();
        context.strokeStyle = penColor;
        context.lineWidth = penWidth * scale;
        lines.forEach((line) => {
          line.forEach((point, i) => {
            if (i === 0) {
              context.moveTo(point.x * scale, point.y * scale);
            } else {
              context.lineTo(point.x * scale, point.y * scale);
            }
          })
        });
        context.stroke();
      });
    }
  }, [parameters])

  return (<canvas ref={canvasRef} style={{
    width: 1000,
    height: 1000,
    border: '1px solid black',
    boxShadow: '-3px 3px 10px 2px #888888'
  }}></canvas>);

}