export function createShader(gl, type, src) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        throw "Shader compilation failed";
    }
    return shader;
}

export function createProgram(gl, vsSrc, fsSrc) {
    const vs = createShader(gl, gl.VERTEX_SHADER, vsSrc);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSrc);

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(prog));
        throw "Program link failed";
    }

    return prog;
}

export function createVAO(gl, program, attributes) {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    for (let attribName in attributes) {
        const info = attributes[attribName];
        const loc = gl.getAttribLocation(program, attribName);

        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(info.data), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, info.size, gl.FLOAT, false, 0, 0);

        info.buffer = buf;
    }

    gl.bindVertexArray(null);
    return vao;
}