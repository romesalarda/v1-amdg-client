import { ref, onMounted, onUnmounted, type Ref } from 'vue'

const VERT = `
  attribute vec2 a_pos;
  void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`

const FRAG = `
  precision highp float;
  uniform vec2 u_res;
  uniform float u_time;
  uniform float u_speed;
  uniform float u_soft;
  uniform int u_palette;

  vec3 ca, cb, cc, cd;

  void setPalette(int p) {
    if(p==1){ ca=vec3(0.12,0.02,0.22); cb=vec3(0.7,0.1,0.35);  cc=vec3(0.9,0.4,0.6);   cd=vec3(0.25,0.05,0.45); }
    else if(p==2){ ca=vec3(0.02,0.12,0.18); cb=vec3(0.0,0.6,0.5); cc=vec3(0.35,0.85,0.55); cd=vec3(0.0,0.3,0.4); }
    else if(p==3){ ca=vec3(0.08,0.01,0.01); cb=vec3(0.75,0.2,0.02); cc=vec3(0.95,0.65,0.1); cd=vec3(0.3,0.06,0.0); }
    else if(p==4){ ca=vec3(0.0,0.05,0.2);  cb=vec3(0.0,0.4,0.7);  cc=vec3(0.1,0.75,0.85); cd=vec3(0.0,0.15,0.35); }
    else{ ca=vec3(0.03,0.18,0.22); cb=vec3(0.6,0.28,0.04); cc=vec3(0.85,0.55,0.1); cd=vec3(0.0,0.35,0.4); }
  }

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }

  float smoothNoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f*f*f*(f*(f*6.0-15.0)+10.0);
    float a=hash(i), b=hash(i+vec2(1,0)), c=hash(i+vec2(0,1)), d=hash(i+vec2(1,1));
    return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
  }

  float fbm(vec2 p) {
    float v=0.0, a=0.5;
    for(int i=0;i<4;i++){ v+=a*smoothNoise(p); p=p*1.9+vec2(1.7,9.2); a*=0.55; }
    return v;
  }

  void main() {
    setPalette(u_palette);
    vec2 uv = gl_FragCoord.xy / u_res;
    float asp = u_res.x / u_res.y;
    float t = u_time * u_speed * 0.00004;
    float s = 1.4 + u_soft * 0.12;
    vec2 p = vec2(uv.x * asp, uv.y);

    vec2 q = vec2(
      fbm(p*s + vec2(t*0.3, t*0.25)),
      fbm(p*s + vec2(5.2,1.3) + vec2(t*0.2, t*0.35))
    );
    vec2 r = vec2(
      fbm(p*s + 4.0*q + vec2(1.7,9.2) + t*0.15),
      fbm(p*s + 4.0*q + vec2(8.3,2.8) + t*0.12)
    );
    float f = fbm(p*s + 4.0*r + t*0.08);
    f = smoothstep(0.0, 1.0, f);

    vec3 col = mix(ca, cb, clamp(f*2.0, 0.0, 1.0));
    col = mix(col, cc, clamp(f*f*2.5 - 0.5, 0.0, 1.0));
    col = mix(col, cd, clamp(1.0 - f*1.8, 0.0, 1.0) * 0.6);
    col = pow(max(col, vec3(0.0)), vec3(1.05));

    gl_FragColor = vec4(col, 1.0);
  }
`

function compileShader(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader error:', gl.getShaderInfoLog(shader))
  }
  return shader
}

export interface FlowingGradientOptions {
  speed?: Ref<number>   // 1–10, default 3
  soft?: Ref<number>    // 1–10, default 7
  palette?: Ref<number> // 0–4, default 0
}

export function useFlowingGradient(options: FlowingGradientOptions = {}) {
  const canvas = ref<HTMLCanvasElement | null>(null)
  let rafId: number
  let gl: WebGLRenderingContext | null = null

  function init() {
    if (!canvas.value) return
    gl = canvas.value.getContext('webgl')
    if (!gl) { console.error('WebGL not supported'); return }

    const prog = gl.createProgram()!
    gl.attachShader(prog, compileShader(gl, gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compileShader(gl, gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    // Fullscreen quad
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]),
      gl.STATIC_DRAW
    )
    const aPos = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uRes     = gl.getUniformLocation(prog, 'u_res')
    const uTime    = gl.getUniformLocation(prog, 'u_time')
    const uSpeed   = gl.getUniformLocation(prog, 'u_speed')
    const uSoft    = gl.getUniformLocation(prog, 'u_soft')
    const uPalette = gl.getUniformLocation(prog, 'u_palette')

    const resize = () => {
      if (!canvas.value || !gl) return
      const { width, height } = canvas.value.getBoundingClientRect()
      canvas.value.width  = width  * devicePixelRatio
      canvas.value.height = height * devicePixelRatio
      gl.viewport(0, 0, canvas.value.width, canvas.value.height)
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = (t: number) => {
      if (!gl || !canvas.value) return
      gl.uniform2f(uRes, canvas.value.width, canvas.value.height)
      gl.uniform1f(uTime, t)
      gl.uniform1f(uSpeed,   options.speed?.value   ?? 3)
      gl.uniform1f(uSoft,    options.soft?.value     ?? 7)
      gl.uniform1i(uPalette, options.palette?.value  ?? 0)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      rafId = requestAnimationFrame(draw)
    }
    rafId = requestAnimationFrame(draw)
  }

  onMounted(init)
  onUnmounted(() => {
    cancelAnimationFrame(rafId)
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  })

  return { canvas }
}