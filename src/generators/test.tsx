import { Vector2 } from 'three';
import { Config, Generator } from '../types';

function map(number: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

function randomCords(startCoord: Vector2, endCoord: Vector2, amt: number) {
  const coords: Vector2[] = [];
  for (let i = 0; i < amt; i++) {
    if (Math.abs(startCoord.x - endCoord.x) > Math.abs(startCoord.y - endCoord.y)) {
      const x = startCoord.x + (Math.random() * (endCoord.x - startCoord.x));
      const y = map(x, startCoord.x, endCoord.x, startCoord.y, endCoord.y);
      coords.push(new Vector2(x, y));
    } else {
      const y = startCoord.y + (Math.random() * (endCoord.y - startCoord.y));
      const x = map(y, startCoord.y, endCoord.y, startCoord.x, endCoord.x);
      coords.push(new Vector2(x, y));
    }
  }
  return [startCoord, ...coords, endCoord];
}

const generator: Generator = {
  controls: () => null,
  
  defaultValues: {
  },

  generate: async function *(params: Config) {

    const line = [
      ...randomCords(
        new Vector2(100, 100), new Vector2(200, 100), 3
      ),
      ...randomCords(
        new Vector2(200, 100), new Vector2(200, 200), 3
      ),
      ...randomCords(
        new Vector2(200, 200), new Vector2(100, 200), 3
      ),
      ...randomCords(
        new Vector2(100, 200), new Vector2(100, 100), 3
      )
    ].map(
      (a) => a.add(
        new Vector2(-2 + (4 * Math.random()), -2 + (4 * Math.random()))
      )
    )
    yield 'generating test';
    yield [{
      penColor: 'black',
      penWidth: 0.2,
      lines: [line]
    }];
    
  }
}

export default generator;