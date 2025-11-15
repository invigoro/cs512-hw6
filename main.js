// === Load shaders ===
async function loadShaderSource(url) {
  const res = await fetch(url);
  return await res.text();
}

// === Compile + link shader program ===
function createProgram(gl, vsSource, fsSource) {
  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Shader compile failed:", gl.getShaderInfoLog(shader));
      throw new Error("Shader compile failed");
    }
    return shader;
  }

  const vs = compile(gl.VERTEX_SHADER, vsSource);
  const fs = compile(gl.FRAGMENT_SHADER, fsSource);

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link failed:", gl.getProgramInfoLog(program));
    throw new Error("Program link failed");
  }

  return program;
}

// === Main entry point ===
(async function() {
  const canvas = document.getElementById("glcanvas");
  const gl = canvas.getContext("webgl2");
  if (!gl) {
    alert("WebGL2 not supported");
    return;
  }

  // Resize to full window
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  window.addEventListener("resize", resize);
  resize();

  // Load shader sources
  const vsSource = await loadShaderSource("vertex.glsl");
  const fsSource = await loadShaderSource("fragment.glsl");

  // Compile program
  const program = createProgram(gl, vsSource, fsSource);
  gl.useProgram(program);

  // Uniform locations
  const u_time = gl.getUniformLocation(program, "u_time");
  const u_resolution = gl.getUniformLocation(program, "u_resolution");

  // === Render loop ===
  let start = performance.now();
  function render() {
    let now = performance.now();
    let time = (now - start) * 0.001;

    gl.useProgram(program);
    gl.uniform1f(u_time, time);
    gl.uniform2f(u_resolution, canvas.width, canvas.height);

    // No VAO needed — full-screen triangle uses gl_VertexID
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
})();
