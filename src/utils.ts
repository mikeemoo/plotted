import { Vector2 } from 'three';
import { LineBounds } from './types';
import segseg from 'segseg';
import Polygon from 'polygon';

export const offsetLine = (line: Vector2[], distance: number) => {
  const p1: Vector2[] = [];
  const p2: Vector2[] = [];
  let direction: Vector2 | null = null;
  const newLine = [...line];
  for (let i = 0; i < line.length - 1; i++) {

    direction = line[i + 1].clone().sub(line[i]).normalize();

    p1.push(
      new Vector2(-direction.y, direction.x)
        .multiplyScalar(distance)
        .add(line[i])
    );
    
    p2.push(
      new Vector2(-direction.y, direction.x)
        .multiplyScalar(distance)
        .add(line[i + 1])
    );
  }

  newLine[0] = p1[0].clone();
  newLine[newLine.length - 1] = p2[p2.length - 1].clone();

  for (let i = 1; i < p1.length; i++) {
    const r = p2[i - 1].clone().sub(p1[i - 1]);
    const s = p2[i].clone().sub(p1[i]);
    const cross = r.cross(s);
    if (cross === 0) {
      break;
    }

    const p = p1[i - 1].clone();
    const q = p1[i].clone();

    const qmp = q.sub(p);
    const num = qmp.cross(s);
    const t = num / cross;
    const m = r.multiplyScalar(t);
    newLine[i] = p.add(m);
  }
  return newLine;
}

export const rectangulate = (line: Vector2[], lineWidth: number, targetWidth: number): Vector2[] => {
  const numLines = Math.ceil(targetWidth / lineWidth);
  if (numLines === 1) {
    return line;
  }
  const width = -(targetWidth / 2) + lineWidth / 2;
  const leftSide = offsetLine(line, -width);
  const rightSide = offsetLine(line, width);
  return [
    ...leftSide,
    ...rightSide.reverse(),
    leftSide[0]
  ];
};

export const thicken = (line: Vector2[], lineWidth: number, targetWidth: number): Vector2[][] => {
  const numLines = Math.ceil(targetWidth / lineWidth);
  if (numLines === 1) {
    return [ line ];
  }
  const start = -(targetWidth / 2) + lineWidth / 2;
  const end = -start;
  const offsets = [start];
  const spacing = (end - start) / (numLines - 1);
  let offset = start;
  for (let i = 0; i < numLines - 2; i++) {
    offset += spacing;
    offsets.push(offset);
  }
  offsets.push(end);

  return offsets.map((offset) => offsetLine(line, offset));
};

export const lineBounds = (line: Vector2[]): LineBounds => {
  let minX: number | null = line[0].x;
  let minY: number | null = line[0].y;
  let maxX: number | null = line[0].x;
  let maxY: number | null = line[0].y;
  line.forEach((point) => {
    minX = minX === null || point.x < minX ? point.x : minX;
    minY = minY === null || point.y < minY ? point.y : minY;
    maxX = maxX === null || point.x > maxX ? point.x : maxX;
    maxY = maxY === null || point.y > maxY ? point.y : maxY;
  });

  return {
    x: minX,
    y: minY,
    w: maxX - minX,
    h: maxY - minY,
    maxX,
    maxY,
    line
  };
}

export const intersection = ([ p, p2 ]: [ Vector2, Vector2 ], [ q, q2 ]: [Vector2, Vector2]): Vector2 | null => {
  const r = p2.clone().sub(p);
  const s = q2.clone().sub(q);
  const rxs = r.cross(s);
  const rxsIsZero = Math.abs(rxs) < 0.00000001;
  if (rxsIsZero) {
    return null;
  }
  const t = q.clone().sub(p).cross(s) / rxs;
  const u = q.clone().sub(p).cross(r) / rxs;
  if ((0 <= t && t <= 1) && (0 <= u && u <= 1)) {
    return p.clone().add(r.multiplyScalar(t));
  }
  return null;
}

export const polygonsIntersect = (polygon1: Vector2[], polygon2: Vector2[]) => {
  const p1 = new Polygon(polygon1);
  const p2 = new Polygon(polygon2);
  if (p1.containsPolygon(p2) || p2.containsPolygon(p1)) {
    return true;
  }
  for (let i = 1; i < polygon1.length; i++) {
    for (let j = 1; j < polygon2.length; j++) {
      const isect = intersection(
        [polygon1[i-1], polygon1[i]],
        [polygon2[j-1], polygon2[j]]
      );
      if (isect) {
        return true;
      }
    }
    return false;
  }
}


export const split = (line: Vector2[], maxLength: number): Vector2[] => {
  const points = pointsEvery(line, maxLength).map(({ coord }) => coord);
  points.push(line[line.length - 1]);
  return points;
}

export const lineLength = (line: Vector2[]): number => {
  return line.reduce((acc, point, i) => {
    if (i !== 0) {
      acc += line[i - 1].distanceTo(point);
    };
    return acc;
  }, 0);
}

export const pointsEvery = (line: Vector2[], distance: number) => {
  const lengths: number[] = [];
  let prevLen = 0;
  for (let i = 0; i < line.length - 1; i++) {
    const len = line[i].distanceTo(line[i + 1]);
    const nextLen = prevLen + len;
    prevLen = nextLen;
    lengths.push(nextLen);
  }

  const points: { coord: Vector2, direction: Vector2 }[] = [];
  let sI = 0;

  for (let d = 0; d < lengths[lengths.length - 1]; d += distance) {
    for (let i = sI; i < lengths.length; i++) {
      if (d < lengths[i]) {
        const pFrom = line[i];
        const pTo = line[i + 1];
        const pD = lengths[i - 1] || 0;
        const f = (d - pD) / (lengths[i] - pD);
        const x = pFrom.x + (pTo.x - pFrom.x) * f;
        const y = pFrom.y + (pTo.y - pFrom.y) * f;
        sI = i;
        const aX = pTo.x - pFrom.x;
        const aY = pTo.y - pFrom.y;
        const len = Math.sqrt(aX * aX + aY * aY) || 1;
        points.push({
          coord: new Vector2(x, y),
          direction: new Vector2(aX / len, aY / len )
        });
        break;
      }
    }
  }
  return points;
}