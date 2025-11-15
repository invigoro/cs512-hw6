#version 300 es
precision highp float;

out vec4 outColor;

uniform float u_time;
uniform vec2 u_resolution;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    outColor = vec4(uv, 0.5 + 0.5 * sin(u_time), 1.0);
}