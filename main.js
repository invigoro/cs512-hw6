import { createProgram, createVAO } from "./gl.js";
import { Camera } from "./camera.js";
import { createCube, createSphere, createCylinder } from "./shapes.js";

export async function start() {
    const canvas = document.getElementById("glcanvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) throw "WebGL2 not supported";

    const vsSrc = await fetch("./vertex.glsl").then(r=>r.text());
    const fsSrc = await fetch("./fragment.glsl").then(r=>r.text());
    const program = createProgram(gl, vsSrc, fsSrc);

    gl.useProgram(program);

    // load shapes
    const cube  = createCube();
    const sphere = createSphere();
    const cyl = createCylinder();

    function setupShape(shape) {
        shape.vao = createVAO(gl, program, {
            a_position: { data: shape.vertices, size: 3 },
            a_normal:   { data: shape.normals, size: 3 }
        });

        shape.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(shape.indices), gl.STATIC_DRAW);

        shape.indexCount = shape.indices.length;
    }

    setupShape(cube);
    setupShape(sphere);
    setupShape(cyl);

    // camera setup
    const cam = new Camera();
    cam.updateVectors();

    let keys = {};
    document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
    document.addEventListener("keyup",   e => keys[e.key.toLowerCase()] = false);

    let lastX = 0, lastY = 0;
    let first = true;
    canvas.addEventListener("mousemove", e => {
        if (first) { lastX=e.clientX; lastY=e.clientY; first=false; return; }
        cam.handleMouse(e.clientX - lastX, lastY - e.clientY);
        lastX = e.clientX;
        lastY = e.clientY;
    });

    gl.enable(gl.DEPTH_TEST);

    const u_model = gl.getUniformLocation(program, "u_model");
    const u_view  = gl.getUniformLocation(program, "u_view");
    const u_projection  = gl.getUniformLocation(program, "u_projection");
    const u_light = gl.getUniformLocation(program, "u_lightPos");
    const u_cam   = gl.getUniformLocation(program, "u_camPos");

    function mat4Identity() {
        return new Float32Array([
            1,0,0,0,
            0,1,0,0,
            0,0,1,0,
            0,0,0,1
        ]);
    }

    function mat4Translate(x,y,z) {
        let m = mat4Identity();
        m[12]=x; m[13]=y; m[14]=z;
        return m;
    }

    function getViewMatrix() {
        const eye = cam.pos;
        const f = cam.forward;
        const c = [eye[0]+f[0], eye[1]+f[1], eye[2]+f[2]];
        return lookAt(eye, c, [0,1,0]);
    }

    function getProj() {
        const fov = Math.PI/4, aspect = canvas.width/canvas.height;
        const near=0.1, far=100.0;
        return perspective(fov, aspect, near, far);
    }

    // --- minimal matrix math (inline) ---
    function lookAt(eye,center,up){
        const f = normalize(sub(center,eye));
        const s = normalize(cross(f,up));
        const u = cross(s,f);

        return new Float32Array([
            s[0], u[0], -f[0], 0,
            s[1], u[1], -f[1], 0,
            s[2], u[2], -f[2], 0,
            -dot(s,eye), -dot(u,eye), dot(f,eye), 1
        ]);
    }
    function perspective(fovy,aspect,n,f){
        const t = Math.tan(fovy/2);
        return new Float32Array([
            1/(aspect*t),0,0,0,
            0,1/t,0,0,
            0,0,(n+f)/(n-f),-1,
            0,0,(2*n*f)/(n-f),0
        ]);
    }
    function sub(a,b){return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];}
    function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
    function cross(a,b){return [
        a[1]*b[2]-a[2]*b[1],
        a[2]*b[0]-a[0]*b[2],
        a[0]*b[1]-a[1]*b[0]
    ];}
    function normalize(a){
        const l=Math.hypot(a[0],a[1],a[2]);
        return [a[0]/l,a[1]/l,a[2]/l];
    }

function resizeCanvasToDisplaySize(canvas) {
    const realW = canvas.clientWidth * window.devicePixelRatio;
    const realH = canvas.clientHeight * window.devicePixelRatio;

    if (canvas.width !== realW || canvas.height !== realH) {
        canvas.width = realW;
        canvas.height = realH;
        return true;
    }
    return false;
}

    function render() {
    resizeCanvasToDisplaySize(canvas);

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

        cam.handleKeyboard(keys);

        gl.clearColor(0.05,0.05,0.08,1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.uniform3fv(u_light, [2,5,2]);
        gl.uniform3fv(u_cam, cam.pos);

        gl.uniformMatrix4fv(u_view, false, getViewMatrix());
        gl.uniformMatrix4fv(u_projection, false, getProj());

        // draw cube
        gl.uniformMatrix4fv(u_model, false, mat4Translate(-2,0,0));
        draw(cube);

        // draw sphere
        gl.uniformMatrix4fv(u_model, false, mat4Translate(0,0,0));
        draw(sphere);

        // draw cylinder
        gl.uniformMatrix4fv(u_model, false, mat4Translate(2,0,0));
        draw(cyl);

        requestAnimationFrame(render);
    }

    function draw(shape) {
        gl.bindVertexArray(shape.vao);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape.indexBuffer);
        gl.drawElements(gl.TRIANGLES, shape.indexCount, gl.UNSIGNED_INT, 0);
    }

    render();
}