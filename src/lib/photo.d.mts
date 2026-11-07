export type PropertyPhoto = {
  url: string;
  sourceUrl: string;
  alt: string;
  credit: string;
  width: number;
  height: number;
  allowCropping: boolean;
  variants: { url: string; width: number }[];
};
export function parsePhoto(input: unknown): PropertyPhoto | undefined;
