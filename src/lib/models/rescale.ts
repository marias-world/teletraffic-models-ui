const SCALE_LIMIT = 1e200;

export const rescaleIfLarge = (q: number[], upTo: number): boolean => {
  const largest = q[upTo];
  if (!(largest > SCALE_LIMIT)) return false;
  for (let i = 0; i <= upTo; i++) q[i] /= largest;
  return true;
};
