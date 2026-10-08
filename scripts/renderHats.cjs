const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const baseDir = '/Users/artemsimakov/Downloads/Somies-variable-hats-1.14-1.19_1/assets/minecraft/optifine/cit/hats';

// 17 hats from crate
const hats = [
  { id: 'sombrero', json: 'sombrero/rus/sombrero.json', png: 'sombrero/rus/sombrero.png' },
  { id: 'mushroom_hat', json: 'mushroom_hat/rus/mushroom_hat.json', png: 'mushroom_hat/rus/mushroom_hat.png' },
  { id: 'frog', json: 'frog/rus/frog.json', png: 'frog/rus/frog.png' },
  { id: 'guzzler_helmet', json: 'guzzler_helmet/rus/guzzler_helmet.json', png: 'guzzler_helmet/rus/guzzler_helmet.png' },
  { id: 'crown', json: 'crown/rus/crown.json', png: 'crown/rus/crown.png' },
  { id: 'ushanka', json: 'ushanka/rus/ushanka.json', png: 'ushanka/rus/ushanka.png' },
  { id: 'welder_helmet', json: 'welder_helmet/rus/welder_helmet.json', png: 'welder_helmet/rus/welder_helmet.png' },
  { id: 'altyn_helmet', json: 'altyn_helmet/rus/altyn_helmet.json', png: 'altyn_helmet/rus/altyn_helmet.png' },
  { id: 'fire', json: 'fire/rus/fire.json', png: 'fire/rus/fire.png' },
  { id: 'soul_fire', json: 'soul_fire/rus/soul_fire.json', png: 'soul_fire/rus/soul_fire.png' },
  { id: 'bear_hat', json: 'bear_hat/rus/bear_hat.json', png: 'bear_hat/rus/bear_hat.png' },
  { id: 'fox_hat', json: 'fox&racoon_hat/rus/foxhat.json', png: 'fox&racoon_hat/rus/foxhat.png' },
  { id: 'propeller_hat', json: 'propeller_hat/rus/propeller_hat.json', png: 'propeller_hat/rus/propeller_hat.png' },
  { id: 'kabuto', json: 'kabuto_helmet/rus/kabuto.json', png: 'kabuto_helmet/rus/kabuto.png' },
  { id: 'nimbus', json: 'nimbus/rus/nimbus.json', png: 'nimbus/rus/nimbus.png' },
  { id: 'cigarette', json: 'cigarette/rus/cigarette.json', png: 'cigarette/rus/cigarette.png' },
  { id: 'mlgglasses', json: 'mlgglasses/rus/mlgglasses.json', png: 'mlgglasses/rus/mlgglasses.png' }
];

const threeJsSource = fs.readFileSync(path.join(__dirname, '../scratch_three.js'), 'utf8');

const hatsData = hats.map(h => {
  const modelJson = JSON.parse(fs.readFileSync(path.join(baseDir, h.json), 'utf8'));
  const pngBuf = fs.readFileSync(path.join(baseDir, h.png));
  return {
    id: h.id,
    model: modelJson,
    image: 'data:image/png;base64,' + pngBuf.toString('base64')
  };
});

const htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Hat Renderer</title>
<script>${threeJsSource}<\/script>
</head>
<body>
<canvas id="cv" width="256" height="256" style="display:none;"></canvas>
<div id="status">INITIALIZING</div>
<div id="output" style="display:none;"></div>
<script>
const hats = ${JSON.stringify(hatsData)};

const vertexMaps = {
    west: [0, 1, 2, 3],
    east: [4, 5, 6, 7],
    down: [0, 3, 4, 7],
    up: [2, 1, 6, 5],
    north: [7, 6, 1, 0],
    south: [3, 2, 5, 4]
};

function applyVertexMapRotation(rotation, a) {
    return (rotation === 0 ? a :
        rotation === 90 ? [a[1], a[2], a[3], a[0]] :
        rotation === 180 ? [a[2], a[3], a[0], a[1]] :
        [a[3], a[0], a[1], a[2]]);
}

function buildMatrix(angle, scale, axis) {
    const a = Math.cos(angle) * scale;
    const b = Math.sin(angle) * scale;
    const matrix = new THREE.Matrix3();
    if (axis === 'x') {
        matrix.set(1, 0, 0, 0, a, -b, 0, b, a);
    } else if (axis === 'y') {
        matrix.set(a, 0, b, 0, 1, 0, -b, 0, a);
    } else {
        matrix.set(a, -b, 0, b, a, 0, 0, 0, 1);
    }
    return matrix;
}

function rotateCubeCorners(corners, rotation) {
    const origin = new THREE.Vector3().fromArray(rotation.origin).subScalar(8);
    const angle = rotation.angle / 180 * Math.PI;
    const scale = rotation.rescale ? Math.SQRT2 / Math.sqrt(Math.pow(Math.cos(angle || Math.PI / 4), 2) * 2) : 1;
    const matrix = buildMatrix(angle, scale, rotation.axis);
    return corners.map(vertex => new THREE.Vector3()
        .fromArray(vertex)
        .sub(origin)
        .applyMatrix3(matrix)
        .add(origin)
        .toArray());
}

function getCornerVertices(from, to) {
    const [x1, y1, z1, x2, y2, z2] = from.concat(to).map(c => c - 8);
    return [
        [x1, y1, z1],
        [x1, y2, z1],
        [x1, y2, z2],
        [x1, y1, z2],
        [x2, y1, z2],
        [x2, y2, z2],
        [x2, y2, z1],
        [x2, y1, z1]
    ];
}

function generateDefaultUvs(faceName, from, to) {
    const [x1, y1, z1] = from;
    const [x2, y2, z2] = to;
    return (faceName === 'west' ? [z1, 16 - y2, z2, 16 - y1] :
        faceName === 'east' ? [16 - z2, 16 - y2, 16 - z1, 16 - y1] :
        faceName === 'down' ? [x1, 16 - z2, x2, 16 - z1] :
        faceName === 'up' ? [x1, z1, x2, z2] :
        faceName === 'north' ? [16 - x2, 16 - y2, 16 - x1, 16 - y1] :
        [x1, 16 - y2, x2, 16 - y1]);
}

function computeNormalizedUvs(uvs) {
    return uvs.map((coordinate, i) => (i % 2 ? 16 - coordinate : coordinate) / 16);
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

async function renderAll() {
    const canvas = document.getElementById('cv');
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(256, 256);
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0);

    const results = {};

    for (const item of hats) {
        const img = await loadImage(item.image);
        
        // Handle animated textures: if height > width, crop top square (width x width)
        let textureCanvas = document.createElement('canvas');
        const size = img.width;
        textureCanvas.width = size;
        textureCanvas.height = size;
        const ctx = textureCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0, size, size, 0, 0, size, size);

        const texture = new THREE.CanvasTexture(textureCanvas);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.generateMipmaps = false;

        const scene = new THREE.Scene();
        
        // Isometric lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
        scene.add(ambientLight);
        
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.65);
        dirLight.position.set(20, 30, 20);
        scene.add(dirLight);

        const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.35);
        dirLight2.position.set(-20, 15, -15);
        scene.add(dirLight2);

        // Build geometry
        const vertices = [];
        const uvs = [];
        const indices = [];

        for (const element of item.model.elements || []) {
            const from = element.from;
            const to = element.to;
            const rotation = element.rotation;
            const cornerVertices = getCornerVertices(from, to);
            const rotatedVertices = rotation ? rotateCubeCorners(cornerVertices, rotation) : cornerVertices;
            
            for (const faceName in element.faces) {
                const face = element.faces[faceName];
                const i = vertices.length / 3;
                indices.push(i, i + 2, i + 1);
                indices.push(i, i + 3, i + 2);
                
                const mappedIndices = applyVertexMapRotation(face.rotation || 0, vertexMaps[faceName]);
                for (const idx of mappedIndices) {
                    vertices.push(...rotatedVertices[idx]);
                }
                
                const faceUvs = face.uv || generateDefaultUvs(faceName, from, to);
                const [u1, v1, u2, v2] = computeNormalizedUvs(faceUvs);
                uvs.push(u1, v2);
                uvs.push(u1, v1);
                uvs.push(u2, v1);
                uvs.push(u2, v2);
            }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();

        const material = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.05,
            roughness: 0.85,
            metalness: 0.1,
            side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geometry, material);
        
        // Center model
        geometry.computeBoundingBox();
        const bbox = geometry.boundingBox;
        const center = new THREE.Vector3();
        bbox.getCenter(center);
        mesh.position.sub(center);

        const root = new THREE.Group();
        root.add(mesh);
        scene.add(root);

        // GUI display rotation
        const guiRot = (item.model.display && item.model.display.gui && item.model.display.gui.rotation) || [30, 225, 0];
        root.rotation.order = 'ZYX';
        root.rotation.x = -guiRot[0] * Math.PI / 180;
        root.rotation.y = guiRot[1] * Math.PI / 180;
        root.rotation.z = (guiRot[2] || 0) * Math.PI / 180;

        // Custom tweaks for optimal presentation
        if (item.id === 'cigarette') {
            root.rotation.x = -20 * Math.PI / 180;
            root.rotation.y = 45 * Math.PI / 180;
        }

        const bSize = new THREE.Vector3();
        bbox.getSize(bSize);
        const maxDim = Math.max(bSize.x, bSize.y, bSize.z);
        const frustum = Math.max(maxDim * 0.9, 4.0);

        const camera = new THREE.OrthographicCamera(-frustum, frustum, frustum, -frustum, 0.1, 1000);
        camera.position.set(0, 0, 100);
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
        results[item.id] = canvas.toDataURL('image/png');
    }

    document.getElementById('output').innerText = JSON.stringify(results);
    document.getElementById('status').innerText = 'COMPLETE';
    document.title = 'RENDER_DONE';
}

window.onload = renderAll;
<\/script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'renderer.html'), htmlContent);
console.log('renderer.html generated successfully.');
