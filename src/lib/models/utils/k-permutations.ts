import { factorial } from './factorial';
export const kPermutation = (
  nNumberOfObjects: number,
  kNumberOfSelectedObjects: number
): number => {
  const nFactorial = factorial(nNumberOfObjects);
  const nMinusKFactorial = factorial(nNumberOfObjects - kNumberOfSelectedObjects);
  return nFactorial / nMinusKFactorial;
};
