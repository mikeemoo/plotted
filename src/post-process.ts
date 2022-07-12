import { Vector2 } from 'three';
import { DrawingPass } from "./types";
import { intersection } from './utils';


export default (overdraw: string, passes: DrawingPass[], pageWidth: number, pageHeight: number) => {

  const borders: [Vector2, Vector2][] = [
    [ new Vector2(0, 0),                  new Vector2(0, pageHeight) ],
    [ new Vector2(0, pageHeight),         new Vector2(pageWidth, pageHeight) ],
    [ new Vector2(pageWidth, pageHeight), new Vector2(pageWidth, 0) ],
    [ new Vector2(pageWidth, 0),          new Vector2(0, 0) ],
  ]

  if (overdraw === 'destroy') {
    return passes.map((pass) => {

      const newLines: Vector2[][] = [];

      pass.lines.forEach((line) => {
        if (line.some((point) => point.x < 0 || point.y < 0 || point.x > pageWidth || point.y > pageHeight)) {
          return;
        }
        newLines.push(line);
      });
      
      return {
        ...pass,
        lines: newLines
      }
    });
  }

  if (overdraw === 'trim') {
    return passes.map((pass) => {
      const newLines: Vector2[][] = [];
      pass.lines.forEach((line) => {
        let newLine: Vector2[] = [];
        let wasInsideImage = true;
        line.forEach((point, j) => {
          if (point.x < 0 || point.y < 0 || point.x > pageWidth || point.y > pageHeight) {
            if (j > 0) {
              const prevPoint = line[j - 1];
              const intersections: Vector2[] = borders.map((border) => intersection([prevPoint, point], border)).filter((i) => i !== null) as Vector2[];

              if (intersections.length === 0) {
                return;
              }
              
              if (wasInsideImage) {
                newLine.push(intersections[0]);
                newLines.push(newLine);
                newLine = [];
              } else {
                
                if (intersections.length === 1) {
                  newLine.push(intersections[0]);
                  newLine.push(point);
                } else {
                  newLines.push(intersections);
                }
              }
            } else {
              const nextPoint = line[j + 1];
              const intersections: Vector2[] = borders.map((border) => intersection([nextPoint, point], border)).filter((i) => i !== null) as Vector2[];
              if (intersections.length === 1) {
                newLine.push(intersections[0]);
              }

            }
            wasInsideImage = false;
          } else {
            newLine.push(point);
            wasInsideImage = true;
          }
        });
        if (newLine.length > 1) {
          newLines.push(newLine);
        }
      });

      return {
        ...pass,
        lines: newLines
      }
    });

  }

  return passes;
}