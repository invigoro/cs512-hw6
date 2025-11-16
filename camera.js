export class Camera {
    constructor() {
        this.pos = [0, 1.5, 6];
        this.yaw = -90;
        this.pitch = 0;
        this.speed = 0.05;
        this.sensitivity = 0.1;

        this.forward = [0,0,-1];
        this.right   = [1,0, 0];
    }

    updateVectors() {
        const rad = Math.PI / 180;
        const cy = Math.cos(this.yaw * rad);
        const sy = Math.sin(this.yaw * rad);
        const cp = Math.cos(this.pitch * rad);
        const sp = Math.sin(this.pitch * rad);

        this.forward = [cy*cp, sp, sy*cp];
        const f = this.forward;
        const worldUp = [0,1,0];

        // right = normalize(cross(f, up))
        this.right = normalize(cross(f, worldUp));
    }

    handleKeyboard(keys) {
        const f = this.forward;
        const r = this.right;

        if (keys["w"]) this.pos = add(this.pos, scale(f, this.speed));
        if (keys["s"]) this.pos = add(this.pos, scale(f, -this.speed));
        if (keys["a"]) this.pos = add(this.pos, scale(r, -this.speed));
        if (keys["d"]) this.pos = add(this.pos, scale(r, this.speed));
    }

    handleMouse(dx, dy) {
        this.yaw   += dx * this.sensitivity;
        this.pitch += dy * this.sensitivity;

        this.pitch = Math.max(-89, Math.min(89, this.pitch));
        this.updateVectors();
    }
}

// vector utils
function add(a,b){ return [a[0]+b[0], a[1]+b[1], a[2]+b[2]];}
function scale(a,s){ return [a[0]*s, a[1]*s, a[2]*s];}
function cross(a,b){return [
    a[1]*b[2]-a[2]*b[1],
    a[2]*b[0]-a[0]*b[2],
    a[0]*b[1]-a[1]*b[0]
];}
function normalize(a){
    const l = Math.hypot(a[0],a[1],a[2]);
    return [a[0]/l, a[1]/l, a[2]/l];
}