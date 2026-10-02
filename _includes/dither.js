// Animated Bayer-dithering background behind the banner (_includes/banner.html).
// Click/tap the banner to make ripples.
//
// banner.html writes this script into the page as the banner's first child, so
// the canvas exists before the photo, name and menu, and the ResizeObserver
// below draws it again just before every paint as they arrive: the banner is
// never shown without its dots. Jekyll reads the file as a Liquid template, so
// it must not contain two opening braces in a row, nor an opening brace
// followed by a percent sign.
//
// Adapted from https://github.com/zavalit/bayer-dithering-webgl-demo, rewritten
// in plain WebGL2 so the site needs no build step and no Three.js. The look is
// set by attributes on the banner element:
//   data-ink         colour of the dots, as #rrggbb
//   data-shape       square, circle, triangle or diamond
//   data-pixel-size  size of one dot, in CSS pixels
//   data-density     roughly the share of the banner covered by dots, 0 to 1
//   data-opacity     opacity of the dots, 0 to 1
(function () {
  const host = document.querySelector('[data-dither]');
  if (!host) return;

  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2', { antialias: false });
  if (!gl) return; // no WebGL2: the banner just stays plain
  host.prepend(canvas);

  const SHAPES = { square: 0, circle: 1, triangle: 2, diamond: 3 };
  const MAX_CLICKS = 10;
  // Length (CSS px) that the noise and the ripples are scaled to. The original
  // demo used the window height; a fixed value keeps the clouds the same size
  // in a short banner.
  const SCALE = 700;

  const num = (name, fallback) => {
    const v = parseFloat(host.dataset[name]);
    return Number.isFinite(v) ? v : fallback;
  };
  const shape = SHAPES[host.dataset.shape] ?? 0;
  const pixelSize = num('pixelSize', 4);
  const ink = (host.dataset.ink || '#1772d0').match(/[0-9a-f]{2}/gi).map(h => parseInt(h, 16) / 255);
  const density = num('density', 0.3);
  const opacity = num('opacity', 1);

  const vertexSrc = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

  const fragmentSrc = `#version 300 es
precision highp float;

uniform vec3  uColor;
uniform vec2  uResolution;   // canvas size, device pixels
uniform float uTime;
uniform float uPixelSize;    // device pixels
uniform float uScale;        // device pixels per noise/ripple unit
uniform int   uShapeType;    // 0=square 1=circle 2=triangle 3=diamond
uniform float uDensity;      // average share of dots switched on
uniform float uOpacity;

const int MAX_CLICKS = ${MAX_CLICKS};
uniform vec2  uClickPos[MAX_CLICKS];
uniform float uClickTimes[MAX_CLICKS];

out vec4 fragColor;

// Bayer matrix helpers (ordered dithering thresholds)
float Bayer2(vec2 a) {
    a = floor(a);
    return fract(a.x / 2. + a.y * a.y * .75);
}
#define Bayer4(a) (Bayer2(.5*(a))*0.25 + Bayer2(a))
#define Bayer8(a) (Bayer4(.5*(a))*0.25 + Bayer2(a))

#define FBM_OCTAVES     5
#define FBM_LACUNARITY  1.25
#define FBM_GAIN        1.
#define FBM_SCALE       4.0

// 1-D hash and 3-D value noise
float hash11(float n) { return fract(sin(n)*43758.5453); }

float vnoise(vec3 p) {
    vec3 ip = floor(p);
    vec3 fp = fract(p);
    const vec3 k = vec3(1.0, 57.0, 113.0);

    float n000 = hash11(dot(ip + vec3(0.0,0.0,0.0), k));
    float n100 = hash11(dot(ip + vec3(1.0,0.0,0.0), k));
    float n010 = hash11(dot(ip + vec3(0.0,1.0,0.0), k));
    float n110 = hash11(dot(ip + vec3(1.0,1.0,0.0), k));
    float n001 = hash11(dot(ip + vec3(0.0,0.0,1.0), k));
    float n101 = hash11(dot(ip + vec3(1.0,0.0,1.0), k));
    float n011 = hash11(dot(ip + vec3(0.0,1.0,1.0), k));
    float n111 = hash11(dot(ip + vec3(1.0,1.0,1.0), k));

    vec3 w = fp*fp*fp*(fp*(fp*6.0-15.0)+10.0);   // smootherstep

    float x00 = mix(n000, n100, w.x);
    float x10 = mix(n010, n110, w.x);
    float x01 = mix(n001, n101, w.x);
    float x11 = mix(n011, n111, w.x);
    float y0  = mix(x00, x10, w.y);
    float y1  = mix(x01, x11, w.y);
    return mix(y0, y1, w.z) * 2.0 - 1.0;         // [-1,1]
}

float fbm2(vec2 uv, float t) {
    vec3 p = vec3(uv * FBM_SCALE, t);
    float amp = 1.;
    float freq = 1.;
    float sum = 1.;
    for (int i = 0; i < FBM_OCTAVES; ++i) {
        sum  += amp * vnoise(p * freq);
        freq *= FBM_LACUNARITY;
        amp  *= FBM_GAIN;
    }
    return sum * 0.5 + 0.5;
}

// Dot shapes
float maskCircle(vec2 p, float cov) {
    float r = sqrt(cov) * .25;
    float d = length(p - 0.5) - r;
    float aa = 0.5 * fwidth(d);
    return cov * (1.0 - smoothstep(-aa, aa, d * 2.));
}
float maskTriangle(vec2 p, vec2 id, float cov) {
    bool flip = mod(id.x + id.y, 2.0) > 0.5;
    if (flip) p.x = 1.0 - p.x;
    float r = sqrt(cov);
    float d = p.y - r*(1.0 - p.x);
    float aa = fwidth(d);
    return cov * clamp(0.5 - d/aa, 0.0, 1.0);
}
float maskDiamond(vec2 p, float cov) {
    float r = sqrt(cov) * 0.564;
    return step(abs(p.x - 0.49) + abs(p.y - 0.49), r);
}

void main() {
    vec2 fragCoord = gl_FragCoord.xy - uResolution * .5;

    vec2 pixelId = floor(fragCoord / uPixelSize);
    vec2 pixelUV = fract(fragCoord / uPixelSize);

    float cellPixelSize = 8. * uPixelSize;   // 8x8 Bayer matrix
    vec2 cellCoord = floor(fragCoord / cellPixelSize) * cellPixelSize;
    vec2 uv = cellCoord / uScale;

    // Animated fBm feed: the share of dots switched on in each cell
    float feed = fbm2(uv, uTime * 0.05);
    feed = (feed - 1.0) * 0.5 + uDensity;

    // Click ripples
    const float speed     = 0.30;
    const float thickness = 0.10;
    const float dampT     = 1.0;
    const float dampR     = 10.0;

    for (int i = 0; i < MAX_CLICKS; ++i) {
        vec2 pos = uClickPos[i];
        if (pos.x < 0.0) continue;           // empty slot

        vec2 cuv = (pos - uResolution * .5 - cellPixelSize * .5) / uScale;
        float t = max(uTime - uClickTimes[i], 0.0);
        float r = distance(uv, cuv);

        float ring  = exp(-pow((r - speed * t) / thickness, 2.0));
        float atten = exp(-dampT * t) * exp(-dampR * r);
        feed = max(feed, ring * atten);
    }

    float bayer = Bayer8(fragCoord / uPixelSize) - 0.5;
    float bw    = step(0.5, feed + bayer);   // ordered-dither output

    float M;
    if      (uShapeType == 1) M = maskCircle(pixelUV, bw);
    else if (uShapeType == 2) M = maskTriangle(pixelUV, pixelId, bw);
    else if (uShapeType == 3) M = maskDiamond(pixelUV, bw);
    else                      M = bw;

    M *= uOpacity;
    fragColor = vec4(uColor * M, M);         // premultiplied alpha
}`;

  /* ---------- program -------------------------------------- */
  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSrc));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSrc));
  gl.bindAttribLocation(program, 0, 'position');
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);

  const u = {};
  for (const name of ['uColor', 'uResolution', 'uTime', 'uPixelSize', 'uScale', 'uShapeType',
    'uDensity', 'uOpacity', 'uClickPos', 'uClickTimes']) {
    u[name] = gl.getUniformLocation(program, name);
  }
  gl.uniform3fv(u.uColor, ink);
  gl.uniform1i(u.uShapeType, shape);
  gl.uniform1f(u.uDensity, density);
  gl.uniform1f(u.uOpacity, opacity);

  // One triangle that covers the whole canvas
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  /* ---------- drawing -------------------------------------- */
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // The animation's clock carries on from page to page (within a tab), so the
  // new page shows the same dots as the one just left instead of jumping back
  // to the first frame. It restarts after an hour: the noise in the shader
  // breaks up when the time gets very large.
  const clock = () => performance.timeOrigin + performance.now();
  let start = clock();
  try {
    const saved = Number(sessionStorage.getItem('dither-start'));
    if (saved > start - 3600e3 && saved <= start) start = saved;
    else sessionStorage.setItem('dither-start', start);
  } catch (e) { /* storage blocked: start from the first frame */ }
  const now = () => (clock() - start) / 1000;

  const clickPos = new Float32Array(MAX_CLICKS * 2).fill(-1);
  const clickTimes = new Float32Array(MAX_CLICKS);
  let clickIx = 0;

  function draw() {
    gl.uniform1f(u.uTime, still ? 0 : now());
    gl.uniform2fv(u.uClickPos, clickPos);
    gl.uniform1fv(u.uClickTimes, clickTimes);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function resize() {
    // Render at the screen's resolution so the dots stay crisp
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(host.clientWidth * dpr);
    canvas.height = Math.round(host.clientHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(u.uResolution, canvas.width, canvas.height);
    gl.uniform1f(u.uPixelSize, pixelSize * dpr);
    gl.uniform1f(u.uScale, SCALE * dpr);
    draw();
  }
  resize();
  // Resize observers run after layout and before paint, so whenever more of
  // the banner arrives the canvas is resized and drawn in the same frame
  new ResizeObserver(resize).observe(host);

  if (still) return; // prefers-reduced-motion: keep a single still frame

  host.addEventListener('pointerdown', e => {
    const rect = canvas.getBoundingClientRect();
    clickPos[2 * clickIx] = (e.clientX - rect.left) * canvas.width / rect.width;
    clickPos[2 * clickIx + 1] = (rect.bottom - e.clientY) * canvas.height / rect.height;
    clickTimes[clickIx] = now();
    clickIx = (clickIx + 1) % MAX_CLICKS;
  });

  // Only animate while the banner is on screen
  let frame = 0;
  function loop() {
    draw();
    frame = requestAnimationFrame(loop);
  }
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !frame) loop();
    if (!entry.isIntersecting && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }).observe(host);
})();
