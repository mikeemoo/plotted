import { Vector2 } from 'three';

export type Config =  {
  generator?: string;
  pageWidth?: number;
  pageHeight?: number;
  pageColor?: string;
  [k: string]: number | string | boolean | undefined;
};

export type Generator = {
  controls: (props: { params: Config }) => JSX.Element | null;
  generate: (params: Config) => AsyncGenerator<string | DrawingPass[]>;
  defaultValues: Config;
}

export type DrawingPass = {
  lines: Vector2[][];
  penWidth: number;
  penColor: string;
}