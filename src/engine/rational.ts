/** Exact fractions on bigint, so solver answers like 25/63 stay exact. */
export class Q {
  readonly n: bigint;
  readonly d: bigint;

  constructor(n: bigint | number, d: bigint | number = 1n) {
    let nn = BigInt(n);
    let dd = BigInt(d);
    if (dd === 0n) throw new Error('division by zero');
    if (dd < 0n) {
      nn = -nn;
      dd = -dd;
    }
    const g = gcd(nn < 0n ? -nn : nn, dd);
    this.n = g === 0n ? 0n : nn / g;
    this.d = g === 0n ? 1n : dd / g;
  }

  static parse(s: string): Q {
    const [a, b] = s.split('/');
    return new Q(BigInt(a.trim()), BigInt((b ?? '1').trim()));
  }

  static readonly ZERO = new Q(0n);
  static readonly ONE = new Q(1n);

  add(o: Q) { return new Q(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o: Q) { return new Q(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o: Q) { return new Q(this.n * o.n, this.d * o.d); }
  div(o: Q) { return new Q(this.n * o.d, this.d * o.n); }
  eq(o: Q) { return this.n === o.n && this.d === o.d; }
  cmp(o: Q) {
    const l = this.n * o.d;
    const r = o.n * this.d;
    return l < r ? -1 : l > r ? 1 : 0;
  }
  toNumber() { return Number(this.n) / Number(this.d); }
  toString() { return this.d === 1n ? `${this.n}` : `${this.n}/${this.d}`; }
}

function gcd(a: bigint, b: bigint): bigint {
  while (b) [a, b] = [b, a % b];
  return a;
}
