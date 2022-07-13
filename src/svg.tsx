import { DrawingPass, Config } from "./types";
import Panel from 'rsuite/Panel';
import Button from 'rsuite/Button';
import List from 'rsuite/List';
import { saveAs } from 'file-saver';
import { renderToString } from 'react-dom/server'

type Props = {
  passes: DrawingPass[];
  width: number;
  height: number;
  scale: number;
}

export const SVGPreview = ({ passes, width, height, scale  }: Props) => {
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} version="1.1" xmlns="http://www.w3.org/2000/svg">
      {passes.map(({ penColor, penWidth, lines }, i) => 
        <path fill="none" key={`pass-${i}`} stroke={penColor} strokeWidth={penWidth * scale} d={lines.map((line) => line.map((point, i) => {
          return `${i === 0 ? 'M' : i === 1 ? 'L' : ''}${(point.x * scale).toFixed(2)} ${(point.y * scale).toFixed(2)}`;
        }).join(' ')).join(' ')}
        />
      )}
    </svg>
  );
}

const downloadSVG = (passes: DrawingPass[], params: Config) => {
  const width = params.pageWidth as number;
  const height = params.pageHeight as number;

  const output = renderToString(<SVGPreview passes={passes} width={width} height={height} scale={1} />);

  saveAs(new Blob([output], {type: "text/plain;charset=utf-8"}), `plot.svg`);
}

export default ({ passes, params }: { passes: DrawingPass[], params: Config }) => {
  

  return (
    <Panel header="SVG" bordered>
      <List>
        <List.Item>
          <Button onClick={() => downloadSVG(passes, params)}>Download SVG</Button>
        </List.Item>
      </List>
    </Panel>
  );
};