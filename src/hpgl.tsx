import React from 'react';
import { DrawingPass } from './types';
import List from 'rsuite/List';
import Panel from 'rsuite/Panel';
import Button from 'rsuite/Button';
import { Vector2 } from 'three';
import { saveAs } from 'file-saver';
import { kdTree as KDTree } from 'kd-tree-javascript';

type Props = {
  passes: DrawingPass[];
  unitsPerMM: number;
}

const compile = (unitsPerMM: number, lines: Vector2[][], uid: string, part: number) => {

  const kdTree = new KDTree([], (a: Vector2, b: Vector2) => ((a.x - b.x) ** 2) + ((a.y - b.y) ** 2), ['x','y']);
  const lineMap = new Map<string, { x: number, y: number, lines: Vector2[][]}>();
  lines.filter((line) => line.length > 1)
    .slice(1)
    .forEach((line) => {
      const firstPoint = line[0];
      const lastPoint = line[line.length - 1];
      [firstPoint, lastPoint].forEach((point) => {
        const key = `${point.x}/${point.y}`;
        let arr = lineMap.get(key);
        if (!arr) {
          arr = { x: point.x, y: point.y, lines: [] };
          kdTree.insert(arr);
        }
        arr.lines.push(line);
        lineMap.set(key, arr);
      });
    });

  const orderedLines: Vector2[][] = [lines[0]];

  while (true) {
    const latestLine = orderedLines[orderedLines.length - 1];
    const latestPoint = latestLine[latestLine.length - 1];
    const res = kdTree.nearest(latestPoint, 1);
    if (res.length === 0) {
      break;
    }
    const [ nearest ] = res[0];
    const nextLine = nearest.lines.pop();
    const needsReversing = nextLine[0].x !== nearest.x || nextLine[0].y !== nearest.y;
    if (needsReversing) {
      nextLine.reverse();
    }
    orderedLines.push(nextLine);
    if (nearest.lines.length === 0) {
      kdTree.remove(nearest);
    }
    const lineEnd = nextLine[nextLine.length - 1];
    const endPoint = lineMap.get(`${lineEnd.x}/${lineEnd.y}`);
    endPoint?.lines.splice(endPoint?.lines.indexOf(nextLine), 1);
    if (endPoint?.lines.length === 0) {
      kdTree.remove(endPoint);
    }
  }

  let minX: number | null = null;
  let minY: number | null = null;
  let maxX: number | null = null;
  let maxY: number | null = null;

  let output = 'IN;';
  orderedLines.forEach((line) => {
    line.forEach((point, i) => {
      const rx = Math.round(point.x * unitsPerMM);
      const ry = Math.round(point.y * unitsPerMM);
      minX = minX === null || rx < minX ? rx : minX;
      minY = minY === null || ry < minY ? ry : minY;
      maxX = maxX === null || rx > maxX ? rx : maxX;
      maxY = maxY === null || ry > maxY ? ry : maxY;

      const coord = `${ry},${rx}`;
      if (i === 0) {
        output += `PU${coord};PD`;
      } else {
        output += `${coord},`;
      }
    });
    output = output.slice(0, -1);
    output += ';';
  });
  output += 'PU0,0;';

  if (minX === null || minY === null || maxX === null || maxY === null) {
    return;
  }

  console.log(`IN;PU${minY},${minX},${minY},${maxX},${maxY},${maxX},${maxY},${minX},${minY},${minX};`);

  saveAs(new Blob([output], {type: "text/plain;charset=utf-8"}), `plot-${uid}-${part + 1}.plt`);
}

function generateUID() {
  const firstPart = (Math.random() * 46656) | 0;
  const secondPart = (Math.random() * 46656) | 0;
  const firstPartStr = ("000" + firstPart.toString(36)).slice(-3);
  const secondPartStr = ("000" + secondPart.toString(36)).slice(-3);
  return firstPartStr + secondPartStr;
}

export default ({ passes, unitsPerMM }: Props) => {
  const uid = generateUID();
  return (
    <Panel header="HPGL" bordered>
      <List>
        {passes.map((pass, i) => (
          <List.Item key={i}>
            <Button appearance="ghost" style={{ borderColor: pass.penColor }} onClick={() => compile(unitsPerMM, pass.lines, uid, i)}>Download pass {i + 1}</Button>
          </List.Item>
        ))}
      </List>
    </Panel>
  );
};