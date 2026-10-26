/**
 * A tiny builder for drawing branches in polar space around a fixed center.
 * Everything is expressed as "go to a radius" (radial segment) or "sweep to an
 * angle" (arc that follows the circle), which keeps every branch on the same
 * set of concentric levels and gives the layout its circuit/maze look.
 *
 * Angles: 0 = top, increasing clockwise (matches the graph's polar()).
 */
export class PolarPath {
  private d = "";
  private r = 0;
  private a = 0;

  constructor(
    private cx: number,
    private cy: number,
  ) {}

  private point(r: number, a: number) {
    return { x: this.cx + r * Math.sin(a), y: this.cy - r * Math.cos(a) };
  }

  moveTo(radius: number, angle: number): this {
    const p = this.point(radius, angle);
    this.d += `M ${p.x.toFixed(2)} ${p.y.toFixed(2)} `;
    this.r = radius;
    this.a = angle;
    return this;
  }

  /** Straight radial segment to a new distance from the center. */
  radialTo(radius: number): this {
    const p = this.point(radius, this.a);
    this.d += `L ${p.x.toFixed(2)} ${p.y.toFixed(2)} `;
    this.r = radius;
    return this;
  }

  /** Arc that follows the current level (constant radius) to a new angle. */
  arcTo(angle: number): this {
    const p = this.point(this.r, angle);
    const delta = angle - this.a;
    const large = Math.abs(delta) > Math.PI ? 1 : 0;
    const sweep = delta >= 0 ? 1 : 0;
    this.d += `A ${this.r.toFixed(2)} ${this.r.toFixed(2)} 0 ${large} ${sweep} ${p.x.toFixed(2)} ${p.y.toFixed(2)} `;
    this.a = angle;
    return this;
  }

  toString(): string {
    return this.d.trim();
  }
}
