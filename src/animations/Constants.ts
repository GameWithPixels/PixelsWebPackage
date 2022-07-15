const faceIndices = [
  17, 1, 19, 13, 3, 10, 8, 5, 15, 7, 9, 11, 14, 4, 12, 0, 18, 2, 16, 6,
];

export function getFaceIndex(faceValue: number): number {
  return faceIndices[Math.floor(faceValue)];
}

export const MaxLedsCount = 20;

export const PaletteColorFromFace = 127;

export const PaletteColorFromRandom = 126;

export const FaceMaskAllLeds = 0xfffff;
