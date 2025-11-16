precision highp float;

varying vec3 v_normal;
varying vec3 v_worldPos;

uniform vec3 u_lightPos;
uniform vec3 u_camPos;

void main() {
    vec3 N = normalize(v_normal);
    vec3 L = normalize(u_lightPos - v_worldPos);
    vec3 V = normalize(u_camPos - v_worldPos);
    vec3 R = reflect(-L, N);

    float diff = max(dot(N,L), 0.0);
    float spec = pow(max(dot(R,V), 0.0), 32.0);

    vec3 color = vec3(0.2) + 0.7*diff + 0.5*spec;

    gl_FragColor = vec4(color, 1.0);
}