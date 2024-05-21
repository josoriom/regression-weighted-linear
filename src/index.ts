import type { NumberArray } from 'cheminfo-types';
import {
  BaseRegression,
  checkArrayLength,
  maybeToPrecision,
} from 'ml-regression-base';

type JsonType = ReturnType<WeightedLinearRegression['toJSON']>;

/**
 * Class representing weighted linear regression.
 * The regression uses OLS to calculate intercept and slope.
 */
export class WeightedLinearRegression extends BaseRegression {
  slope: number;
  intercept: number;
  coefficients: number[];

  /**
   * @param x - explanatory variable
   * @param y - response variable
   */
  constructor(x: NumberArray, y: NumberArray, s: NumberArray) {
    super();
    // @ts-expect-error internal use of the constructor, from `this.load`
    if (x === true) {
      // @ts-expect-error internal use of the constructor, from `this.load`
      const yObj = y as JsonType;
      this.slope = yObj.slope;
      this.intercept = yObj.intercept;
      this.coefficients = [yObj.intercept, yObj.slope];
    } else {
      checkArrayLength(x, y);
      const result = regress(x, y, s);
      this.slope = result.slope;
      this.intercept = result.intercept;
      this.coefficients = [result.intercept, result.slope];
    }
  }

  /**
   * Get the parameters and model name in JSON format
   * @returns
   */
  toJSON() {
    return {
      name: 'weightedLinearRegression',
      slope: this.slope,
      intercept: this.intercept,
    };
  }

  _predict(x: number): number {
    return this.slope * x + this.intercept;
  }
  /**
   * Finds x for the given y value.
   * @param y - response variable value
   * @returns - x value
   */
  computeX(y: number): number {
    return (y - this.intercept) / this.slope;
  }

  /**
   * Strings the linear function in the form 'f(x) = ax + b'
   * @param precision - number of significant figures.
   * @returns
   */
  toString(precision?: number): string {
    let result = 'f(x) = ';
    if (this.slope !== 0) {
      const xFactor = maybeToPrecision(this.slope, precision);
      result += `${xFactor === '1' ? '' : `${xFactor} * `}x`;
      if (this.intercept !== 0) {
        const absIntercept = Math.abs(this.intercept);
        const operator = absIntercept === this.intercept ? '+' : '-';
        result += ` ${operator} ${maybeToPrecision(absIntercept, precision)}`;
      }
    } else {
      result += maybeToPrecision(this.intercept, precision);
    }
    return result;
  }
  /**
   * Strings the linear function in the form 'f(x) = ax + b'
   * @param precision - number of significant figures.
   * @returns
   */
  toLaTeX(precision?: number): string {
    return this.toString(precision);
  }

  /**
   * Class instance from a JSON Object.
   * @param json
   * @returns
   */
  static load(json: JsonType): WeightedLinearRegression {
    if (json.name !== 'weightedLinearRegression') {
      throw new TypeError('not a WLR model');
    }
    // @ts-expect-error internal use of the constructor
    return new WeightedLinearRegression(true, json);
  }
}

/**
 * Weighted regression lines
 * @see Miller, J. N., & Miller, J. C. (2010). Statistics and Chemometrics for Analytical Chemistry (6th ed.). Pearson Education Limited
 * @param x - The independent variable
 * @param y - The response variable
 * @param s - The standard deviations of the response variable
 * @returns - slope and intercept of the best fit line
 */

function regress(x: NumberArray, y: NumberArray, s: NumberArray) {
  const n = x.length;
  let sumW = 0;
  let sumWx = 0;
  let sumWx2 = 0;
  let sumWy = 0;
  let sumWxy = 0;
  let sumInvS2 = 0;

  for (let i = 0; i < n; i++) {
    sumInvS2 += 1 / s[i] ** 2;
  }

  const si = sumInvS2 / n;

  for (let i = 0; i < n; i++) {
    const w = 1 / s[i] ** 2 / si;
    const wx = w * x[i];
    const wy = w * y[i];
    sumW += w;
    sumWx += wx;
    sumWx2 += wx * x[i];
    sumWy += wy;
    sumWxy += wy * x[i];
  }

  const xm = sumWx / sumW;
  const ym = sumWy / sumW;

  const slope = (sumWxy - xm * sumWy) / (sumWx2 - xm * sumWx);
  return {
    slope,
    intercept: ym - slope * xm,
  };
}
