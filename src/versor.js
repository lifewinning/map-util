import * as d3 from 'd3';

var acos = Math.acos,
    asin = Math.asin,
    atan2 = Math.atan2,
    cos = Math.cos,
    hypot = Math.hypot,
    max = Math.max,
    min = Math.min,
    PI = Math.PI,
    sin = Math.sin,
    radians = PI / 180,
    degrees = 180 / PI;

export class Versor {
  static fromCartesian([x, y, z]) {
    return [0, z, -y, x];
  }
  static fromAngles([l, p, g]) {
    l *= radians / 2;
    p *= radians / 2;
    g = (g||0) * radians / 2;
    const sl = sin(l), cl = cos(l);
    const sp = sin(p), cp = cos(p);
    const sg = sin(g), cg = cos(g);
    return [
      cl * cp * cg + sl * sp * sg,
      sl * cp * cg - cl * sp * sg,
      cl * sp * cg + sl * cp * sg,
      cl * cp * sg - sl * sp * cg
    ];
  }
  static toAngles([a, b, c, d]) {
    return [
      atan2(2 * (a * b + c * d), 1 - 2 * (b * b + c * c)) * degrees,
      asin(max(-1, min(1, 2 * (a * c - d * b)))) * degrees,
      atan2(2 * (a * d + b * c), 1 - 2 * (c * c + d * d)) * degrees
    ];
  }
  static interpolateAngles(a, b) {
    const i = Versor.interpolate(Versor.fromAngles(a), Versor.fromAngles(b));
    return t => Versor.toAngles(i(t));
  }
  static interpolateLinear([a1, b1, c1, d1], [a2, b2, c2, d2]) {
    a2 -= a1, b2 -= b1, c2 -= c1, d2 -= d1;
    const x = new Array(4);
    return t => {
      const l = hypot(x[0] = a1 + a2 * t, x[1] = b1 + b2 * t, x[2] = c1 + c2 * t, x[3] = d1 + d2 * t);
      x[0] /= l, x[1] /= l, x[2] /= l, x[3] /= l;
      return x;
    };
  }
  static interpolate([a1, b1, c1, d1], [a2, b2, c2, d2]) {
    let dot = Versor.dot([a1, b1, c1, d1], [a2, b2, c2, d2]);
    if (dot < 0) a2 = -a2, b2 = -b2, c2 = -c2, d2 = -d2, dot = -dot;
    if (dot > 0.9995) return Versor.interpolateLinear([a1, b1, c1, d1], [a2, b2, c2, d2]); 
    const theta0 = acos(max(-1, min(1, dot)));
    const x = new Array(4);
    const l = hypot(a2 -= a1 * dot, b2 -= b1 * dot, c2 -= c1 * dot, d2 -= d1 * dot);
    a2 /= l, b2 /= l, c2 /= l, d2 /= l;
    return t => {
      const theta = theta0 * t;
      const s = sin(theta);
      const c = cos(theta);
      x[0] = a1 * c + a2 * s;
      x[1] = b1 * c + b2 * s;
      x[2] = c1 * c + c2 * s;
      x[3] = d1 * c + d2 * s;
      return x;
    };
  }
  static dot([a1, b1, c1, d1], [a2, b2, c2, d2]) {
    return a1 * a2 + b1 * b2 + c1 * c2 + d1 * d2;
  }
  static multiply([a1, b1, c1, d1], [a2, b2, c2, d2]) {
    return [
      a1 * a2 - b1 * b2 - c1 * c2 - d1 * d2,
      a1 * b2 + b1 * a2 + c1 * d2 - d1 * c2,
      a1 * c2 - b1 * d2 + c1 * a2 + d1 * b2,
      a1 * d2 + b1 * c2 - c1 * b2 + d1 * a2
    ];
  }
}

/*
 * Old API
 */

// Returns the unit quaternion for the given Euler rotation angles [λ, φ, γ].
var versor = Versor.fromAngles;

// Returns the quaternion that represents q0 * q1.
versor.multiply = Versor.multiply;

// Returns the Euler rotation angles [λ, φ, γ] for the given quaternion.
versor.rotation = Versor.toAngles;

// interpolate angles
versor.interpolate = Versor.interpolateAngles;

// Returns Cartesian coordinates [x, y, z] given spherical coordinates [λ, φ].
versor.cartesian = function(e) {
  var l = e[0] * radians, p = e[1] * radians, cp = cos(p);
  return [cp * cos(l), cp * sin(l), sin(p)];
};

// Returns the quaternion to rotate between two cartesian points on the sphere.
// alpha for tweening [0,1]
// see https://github.com/Fil/versor/issues/8
versor.delta = function(v0, v1, alpha) {
  if (arguments.length == 2) alpha = 1;

  const sqrt = Math.sqrt;
  function cross(v0, v1) {
    return  [v0[1] * v1[2] - v0[2] * v1[1], v0[2] * v1[0] - v0[0] * v1[2], v0[0] * v1[1] - v0[1] * v1[0]];
  }
  function dot(v0, v1) {
    return v0[0] * v1[0] + v0[1] * v1[1] + v0[2] * v1[2];
  }

  var w = cross(v0, v1), l = sqrt(dot(w, w));
  if (!l) return [1, 0, 0, 0];
  var t = alpha * acos(max(-1, min(1, dot(v0, v1)))) / 2, s = sin(t); // t = θ / 2
  return [cos(t), w[2] / l * s, -w[1] / l * s, w[0] / l * s];
};

export default versor;

export let zoom = (projection, {
    // Capture the projection’s original scale, before any zooming.
    scale = projection._scale === undefined
      ? (projection._scale = projection.scale()) 
      : projection._scale,
    scaleExtent = [0.1, 2]
  } = {}) => {
    let v0, q0, r0, a0, tl;
  
    const zoom = d3.zoom()
        .scaleExtent(scaleExtent.map(x => x * scale))
        .on("start", zoomstarted)
        .on("zoom", zoomed);
  
    function point(event, that) {
      const t = d3.pointers(event, that);
  
      if (t.length !== tl) {
        tl = t.length;
        if (tl > 1) a0 = Math.atan2(t[1][1] - t[0][1], t[1][0] - t[0][0]);
        zoomstarted.call(that, event);
      }
  
      return tl > 1
        ? [
            d3.mean(t, p => p[0]),
            d3.mean(t, p => p[1]),
            Math.atan2(t[1][1] - t[0][1], t[1][0] - t[0][0])
          ]
        : t[0];
    }
  
    function zoomstarted(event) {
      v0 = versor.cartesian(projection.invert(point(event, this)));
      q0 = versor((r0 = projection.rotate()));
    }
  
    function zoomed(event) {
      projection.scale(event.transform.k);
      const pt = point(event, this);
      const v1 = versor.cartesian(projection.rotate(r0).invert(pt));
      const delta = versor.delta(v0, v1);
      let q1 = versor.multiply(q0, delta);
  
      // For multitouch, compose with a rotation around the axis.
      if (pt[2]) {
        const d = (pt[2] - a0) / 2;
        const s = -Math.sin(d);
        const c = Math.sign(Math.cos(d));
        q1 = versor.multiply([Math.sqrt(1 - s * s), 0, 0, c * s], q1);
      }
  
      projection.rotate(versor.rotation(q1));
      
      // In vicinity of the antipode (unstable) of q0, restart.
      if (delta[0] < 0.7) zoomstarted.call(this, event);
    }
  
    return Object.assign(selection => selection
        .property("__zoom", d3.zoomIdentity.scale(projection.scale()))
        .call(zoom), {
      on(type, ...options) {
        return options.length
            ? (zoom.on(type, ...options), this)
            : zoom.on(type);
      }
    });
  }

export let drag = (projection) => {
    let v0, q0, r0, a0, l;
  
    function pointer(event, that) {
      console.log(event)
      console.log(that)
      const t = d3.pointers(event, that);
      console.log(t)
      if (t.length !== l) {
        l = t.length;
        if (l > 1) a0 = Math.atan2(t[1][1] - t[0][1], t[1][0] - t[0][0]);
        dragstarted.apply(that, [event, that]);
      }
  
      // For multitouch, average positions and compute rotation.
      if (l > 1) {
        const x = d3.mean(t, p => p[0]);
        const y = d3.mean(t, p => p[1]);
        const a = Math.atan2(t[1][1] - t[0][1], t[1][0] - t[0][0]);
        return [x, y, a];
      }
  
      return t[0];
    }
  
    function dragstarted(event) {
      v0 = versor.cartesian(projection.invert(pointer(event, this)));
      q0 = versor(r0 = projection.rotate());
      console.log(v0, q0)
    }
  
    function dragged(event) {
      const p = pointer(event, this);
      console.log(p)
      const v1 = versor.cartesian(projection.rotate(r0).invert(p));
      console.log(v1)
      const delta = versor.delta(v0, v1);
      let q1 = versor.multiply(q0, delta);
  
      // For multitouch, compose with a rotation around the axis.
      if (p[2]) {
        const d = (p[2] - a0) / 2;
        const s = -Math.sin(d);
        const c = Math.sign(Math.cos(d));
        q1 = versor.multiply([Math.sqrt(1 - s * s), 0, 0, c * s], q1);
      }
  
      projection.rotate(versor.rotation(q1));
  
      // In vicinity of the antipode (unstable) of q0, restart.
      if (delta[0] < 0.7) dragstarted.apply(this, [event, this]);
    }
  
    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged);
  }