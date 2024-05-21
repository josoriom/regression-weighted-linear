import { expect, describe, it } from 'vitest';

import { WeightedLinearRegression as WLR } from '..';

describe('Weighted Linear Regression', () => {
  it('WLR1', () => {
    const input = [0, 2, 4, 6, 8, 10];
    const output = [0.009, 0.158, 0.301, 0.472, 0.577, 0.739];
    const std = [0.001, 0.004, 0.01, 0.013, 0.017, 0.022];

    const regression = new WLR(input, output, std);

    expect(regression.slope).toBe(regression.coefficients[1]);
    expect(regression.intercept).toBe(regression.coefficients[0]);

    expect(regression.slope).toBeCloseTo(0.0738, 4);
    expect(regression.intercept).toBeCloseTo(0.0091, 4);

    expect(regression.computeX(0.1)).toBeCloseTo(1.23, 2);
    expect(regression.computeX(0.6)).toBeCloseTo(8.01, 2);

    expect(regression.toString(3)).toBe('f(x) = 0.0738 * x + 0.00908');
  });
});
