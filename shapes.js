export function createCube() {
    const v = [
        // front
        -1,-1, 1,  1,-1, 1,  1, 1, 1,  -1, 1, 1,
        // back
        -1,-1,-1, -1, 1,-1,  1, 1,-1,  1,-1,-1
    ];

    const n = [
        // same for each face, repeat to match index count
        0,0,1, 0,0,1, 0,0,1, 0,0,1,
        0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1
    ];

    const idx = [
        // front
        0,1,2, 0,2,3,
        // back
        4,5,6, 4,6,7,
        // left
        4,0,3, 4,3,5,
        // right
        1,7,6, 1,6,2,
        // top
        3,2,6, 3,6,5,
        // bottom
        4,7,1, 4,1,0
    ];

    return { vertices: v, normals: n, indices: idx };
}

/* ---------- SPHERE ---------- */
export function createSphere(latBands=32, lonBands=32) {
    let verts = [], norms = [], idx = [];

    for (let lat=0; lat<=latBands; lat++) {
        const t = lat*Math.PI/latBands;
        const st = Math.sin(t), ct = Math.cos(t);

        for (let lon=0; lon<=lonBands; lon++) {
            const p = 2*Math.PI * lon/lonBands;
            const sp = Math.sin(p), cp = Math.cos(p);

            const x = cp*st;
            const y = ct;
            const z = sp*st;

            verts.push(x, y, z);
            norms.push(x, y, z);
        }
    }

    for (let lat=0; lat<latBands; lat++) {
        for (let lon=0; lon<lonBands; lon++) {
            const a = lat*(lonBands+1) + lon;
            const b = a + lonBands+1;

            idx.push(a, b, a+1);
            idx.push(b, b+1, a+1);
        }
    }

    return { vertices: verts, normals: norms, indices: idx };
}

/* ---------- CYLINDER ---------- */
export function createCylinder(segments=32) {
    let verts=[], norms=[], idx=[];

    // side vertices
    for (let i=0; i<=segments; i++) {
        const a = 2*Math.PI*i/segments;
        const x = Math.cos(a), z = Math.sin(a);
        verts.push(x,-1,z,  x,1,z);
        norms.push(x,0,z,    x,0,z);
    }

    for (let i=0; i<segments; i++) {
        const a = 2*i, b = a+2;
        idx.push(a,a+1,b+1);
        idx.push(a,b+1,b);
    }

    return { vertices: verts, normals: norms, indices: idx };
}