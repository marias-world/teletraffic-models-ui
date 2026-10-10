export function blockingStateRange(capacity: number, bu: number) {
  return { first: Math.max(0, capacity - bu + 1), last: capacity };
}

export function timeAverageBlocking(
  q: number[],
  capacity: number,
  bu: number,
): number {
  const { first, last } = blockingStateRange(capacity, bu);
  let sum = 0;
  for (let j = first; j <= last; j++) sum += q[j];
  return sum;
}
