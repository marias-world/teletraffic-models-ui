export type ModelResult = {
  result: number;
  steps: string[];
};

export function recursiveErlangB(
  capacity: number,
  traffic: number,
  steps: string[] = [],
): ModelResult {
  if (capacity === 0) {
    steps.push(`B(0) = 1`);
    return { result: 1, steps };
  }

  const prev = recursiveErlangB(capacity - 1, traffic, steps).result;
  const B = (traffic * prev) / (capacity + traffic * prev);

  steps.push(
    `B(${capacity}) = \\frac{${traffic} \\cdot ${prev.toFixed(6)}}{${capacity} + ${traffic} \\cdot ${prev.toFixed(6)}} = ${B.toFixed(6)}`,
  );

  return { result: B, steps };
}
