export const NOISE = `
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);float a=hash(i),b=hash(i+vec2(1.,0.)),c=hash(i+vec2(0.,1.)),d=hash(i+vec2(1.,1.));vec2 u=f*f*(3.-2.*f);return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*vn(p);p*=2.;a*=.5;}return v;}
`;

export const BG_VERT = `
  varying vec2 vP;
  void main(){
    vP = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
  }
`;

export const BG_FRAG = `
  varying vec2 vP;
  uniform float uTime;
  ${NOISE}
  void main(){
    vec2 p = vP * 0.045;
    float t = uTime * 0.025;
    vec2 g = p + 0.18 * vec2(fbm(p * 1.3 + t), fbm(p * 1.3 - t));
    vec3 vermilion = vec3(.86, .21, .12);
    vec3 deep      = vec3(.62, .11, .10);
    vec3 maroon    = vec3(.36, .07, .10);
    vec3 orange    = vec3(.90, .40, .13);
    float bx = smoothstep(-.06, .06, sin(g.x * 1.25));
    float by = smoothstep(-.06, .06, sin(g.y * 1.05 + .6));
    vec3 col = mix(mix(maroon, deep, bx), mix(vermilion, orange, bx), by);
    col *= 1.0 + (fbm(vP * 2.8) - .5) * 0.10;
    col *= 0.93 + 0.07 * fbm(vP * 0.4);
    gl_FragColor = vec4(col, 1.);
  }
`;

export const SHAPE_VERT = `
  varying vec2 vP;
  void main(){
    vP = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
  }
`;

export const SHAPE_FRAG = `
  varying vec2 vP;
  uniform vec3 uColor;
  uniform float uSeed;
  uniform float uOpacity;
  ${NOISE}
  void main(){
    vec3 col = uColor;
    float streak = fbm(vP * vec2(0.7, 3.2) + uSeed);
    float mottle = fbm(vP * 2.2 + uSeed * 2.0 + 5.0);
    col *= 1.0 + (streak - 0.5) * 0.13 + (mottle - 0.5) * 0.06;
    gl_FragColor = vec4(col, uOpacity);
  }
`;
