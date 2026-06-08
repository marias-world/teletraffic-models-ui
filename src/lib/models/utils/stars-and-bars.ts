
import {binomialCoefficient} from './binomial-distribution';

export const starsAndBars = (nTotalItems: number, kBars: number): number => {
  const stars = nTotalItems;
  const bars = kBars - 1;
  return binomialCoefficient(stars + bars, stars);
};
