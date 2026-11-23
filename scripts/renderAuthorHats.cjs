const fs = require('fs');
const path = require('path');
const http = require('http');
const { exec } = require('child_process');

const baseDir = '/tmp/hats_pack/assets/minecraft';
const outputDir = path.join(__dirname, '../public/hats');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const threeJsSource = fs.readFileSync('/tmp/three.min.js', 'utf8');

const authorHats = [
  { id: 'leaf_mask', model: 'models/item/hats/leaf_mask.json' },
  { id: 'horns_mask', model: 'models/item/hats/horns_mask.json' },
  { id: 'pumpkin_mask', model: 'models/item/hats/pumpkin_mask.json' },
  { id: 'zombie_mask', model: 'models/item/hats/zombie_mask.json' },
  { id: 'skeleton_mask', model: 'models/item/hats/skeleton_mask.json' },
  { id: 'creeper_mask', model: 'models/item/hats/creeper_mask.json' },
  { id: 'glowing_nimbus', model: 'models/item/hats/glowing_nimbus.json' },
  { id: 'demon_horns', model: 'models/item/hats/demon_horns.json' },
  { id: 'black_bunny_hat', model: 'models/item/hats/black_bunny_hat.json' },
  { id: 'bunny_hat', model: 'models/item/hats/bunny_hat.json' },
  { id: 'black_headphones', model: 'models/item/hats/black_headphones.json' },
  { id: 'viking_helmet', model: 'models/item/hats/viking_helmet.json' },
  { id: 'white_bunny_ears', model: 'models/item/hats/white_bunny_ears.json' },
  { id: 'black_bunny_ears', model: 'models/item/hats/black_bunny_ears.json' },
  { id: 'cat_in_hat', model: 'models/item/hats/cat_in_hat.json' },
  { id: 'killer_bunny_hat', model: 'models/item/hats/killer_bunny_hat.json' },
  { id: 'cat_headphones', model: 'models/item/hats/cat_headphones.json' },
  { id: 'greek_wreath', model: 'models/item/hats/greek_wreath.json' },
  { id: 'spider_hat', model: 'models/item/hats/spider_hat.json' },
  { id: 'earflap_cap', model: 'models/item/hats/earflap_cap.json' },
  { id: 'white_cat_ears', model: 'models/item/hats/white_cat_ears.json' },
  { id: 'black_cat_ears', model: 'models/item/hats/black_cat_ears.json' },
  { id: 'bird_nest', model: 'models/item/hats/bird_nest.json' },
  { id: 'censor_bar', model: 'models/item/hats/censor_bar.json' },
  { id: 'solar_system', model: 'models/item/hats/solar_system.json' },
  { id: 'ascension_nimbus', model: 'models/item/hats/ascension_nimbus.json' },
  // Also render elite_box
  { id: 'elite_box', model: 'models/item/elite_crate.json', isBox: true }
];

// Helper to resolve texture paths
function resolveTextures(modelJson) {
  const texturesMap = {};
  const texDef = modelJson.textures || {};
  for (const [key, val] of Object.entries(texDef)) {
    if (key === 'particle') continue;
    let clean = val.replace('minecraft:', '');
    let fullPng = path.join(baseDir, 'textures', clean + '.png');
    if (!fs.existsSync(fullPng)) {
      fullPng = path.join(baseDir, 'textures', clean);
    }
    if (fs.existsSync(fullPng)) {
      texturesMap[key] = 'data:image/png;base64,' + fs.readFileSync(fullPng).toString('base64');
    }
  }
  return texturesMap;
}

const itemsData = authorHats.map(item => {
  const modelPath = path.join(baseDir, item.model);
  const modelJson = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
  const textures = resolveTextures(modelJson);
  return {
    id: item.id,
    model: modelJson,
    textures: textures,
    isBox: !!item.isBox
  };
});

// Create HTML content
const htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Author Hats Renderer</title>
<script>${threeJsSource}<\/script>
</head>
<body>
<canvas id="cv" width="256" height="256" style="display:none;"></canvas>
<div id="status">RENDERING...</div>
<script>
const items = ${JSON.stringify(itemsData)};

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
    if (!rotation) return corners;
    if (rotation.axis) {
        const origin = new THREE.Vector3().fromArray(rotation.origin || [8, 8, 8]).subScalar(8);
        const angle = ((rotation.angle || 0) / 180) * Math.PI;
        const scale = rotation.rescale ? Math.SQRT2 / Math.sqrt(Math.pow(Math.cos(angle || Math.PI / 4), 2) * 2) : 1;
        const matrix = buildMatrix(angle, scale, rotation.axis);
        return corners.map(vertex => new THREE.Vector3()
            .fromArray(vertex)
            .sub(origin)
            .applyMatrix3(matrix)
            .add(origin)
            .toArray());
    }
    if (rotation.x !== undefined || rotation.y !== undefined || rotation.z !== undefined) {
        const origin = new THREE.Vector3().fromArray(rotation.origin || [8, 8, 8]).subScalar(8);
        const rx = ((rotation.x || 0) * Math.PI) / 180;
        const ry = ((rotation.y || 0) * Math.PI) / 180;
        const rz = ((rotation.z || 0) * Math.PI) / 180;
        const euler = new THREE.Euler(rx, ry, rz, 'XYZ');
        return corners.map(vertex => new THREE.Vector3()
            .fromArray(vertex)
            .sub(origin)
            .applyEuler(euler)
            .add(origin)
            .toArray());
    }
    return corners;
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
        img.onerror = () => resolve(null);
        img.src = src;
    });
}

async function renderAll() {
    const canvas = document.getElementById('cv');
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0);

    const results = {};

    for (const item of items) {
        const renderSize = item.isBox ? 512 : 256;
        canvas.width = renderSize;
        canvas.height = renderSize;
        renderer.setSize(renderSize, renderSize);

        // Preload all textures for this item
        const loadedTextures = {};
        for (const [key, dataUrl] of Object.entries(item.textures)) {
            const img = await loadImage(dataUrl);
            if (!img) continue;
            let texCanvas = document.createElement('canvas');
            const size = img.width;
            texCanvas.width = size;
            texCanvas.height = size;
            const ctx = texCanvas.getContext('2d');
            ctx.drawImage(img, 0, 0, size, size, 0, 0, size, size);

            const tex = new THREE.CanvasTexture(texCanvas);
            tex.magFilter = THREE.NearestFilter;
            tex.minFilter = THREE.NearestFilter;
            tex.generateMipmaps = false;
            loadedTextures[key] = tex;
        }

        const scene = new THREE.Scene();
        const ambientLight = new THREE.AmbientLight(0xffffff, item.isBox ? 0.9 : 0.8);
        scene.add(ambientLight);
        
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
        dirLight.position.set(20, 30, 20);
        scene.add(dirLight);

        const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
        dirLight2.position.set(-20, 15, -15);
        scene.add(dirLight2);

        // Build elements grouped by texture
        const groups = {}; // key -> { vertices: [], uvs: [], indices: [] }

        // If block cube_all (like elite_crate)
        let elements = item.model.elements;
        if (!elements || elements.length === 0) {
            elements = [{
                from: [0, 0, 0],
                to: [16, 16, 16],
                faces: {
                    down:  { uv: [0, 0, 16, 16], texture: "#all" },
                    up:    { uv: [0, 0, 16, 16], texture: "#all" },
                    north: { uv: [0, 0, 16, 16], texture: "#all" },
                    south: { uv: [0, 0, 16, 16], texture: "#all" },
                    west:  { uv: [0, 0, 16, 16], texture: "#all" },
                    east:  { uv: [0, 0, 16, 16], texture: "#all" }
                }
            }];
        }

        for (const element of elements) {
            const from = element.from;
            const to = element.to;
            const rotation = element.rotation;
            const cornerVertices = getCornerVertices(from, to);
            const rotatedVertices = rotation ? rotateCubeCorners(cornerVertices, rotation) : cornerVertices;
            
            for (const faceName in element.faces) {
                const face = element.faces[faceName];
                let texKey = (face.texture || '').replace('#', '');
                if (!loadedTextures[texKey]) {
                    // Fallback to first available texture
                    texKey = Object.keys(loadedTextures)[0] || 'default';
                }

                if (!groups[texKey]) {
                    groups[texKey] = { vertices: [], uvs: [], indices: [] };
                }

                const grp = groups[texKey];
                const i = grp.vertices.length / 3;
                grp.indices.push(i, i + 2, i + 1);
                grp.indices.push(i, i + 3, i + 2);
                
                const mappedIndices = applyVertexMapRotation(face.rotation || 0, vertexMaps[faceName]);
                for (const idx of mappedIndices) {
                    grp.vertices.push(...rotatedVertices[idx]);
                }
                
                const faceUvs = face.uv || generateDefaultUvs(faceName, from, to);
                const [u1, v1, u2, v2] = computeNormalizedUvs(faceUvs);
                grp.uvs.push(u1, v2);
                grp.uvs.push(u1, v1);
                grp.uvs.push(u2, v1);
                grp.uvs.push(u2, v2);
            }
        }

        const root = new THREE.Group();
        const bbox = new THREE.Box3();

        for (const [texKey, grp] of Object.entries(groups)) {
            if (grp.vertices.length === 0) continue;
            const geom = new THREE.BufferGeometry();
            geom.setAttribute('position', new THREE.Float32BufferAttribute(grp.vertices, 3));
            geom.setAttribute('uv', new THREE.Float32BufferAttribute(grp.uvs, 2));
            geom.setIndex(grp.indices);
            geom.computeVertexNormals();

            const mat = new THREE.MeshStandardMaterial({
                map: loadedTextures[texKey] || null,
                transparent: true,
                alphaTest: 0.05,
                roughness: 0.85,
                metalness: 0.1,
                side: THREE.DoubleSide
            });

            const mesh = new THREE.Mesh(geom, mat);
            root.add(mesh);
            geom.computeBoundingBox();
            bbox.union(geom.boundingBox);
        }

        // Center
        const center = new THREE.Vector3();
        bbox.getCenter(center);
        root.position.sub(center);

        const worldGroup = new THREE.Group();
        worldGroup.add(root);
        scene.add(worldGroup);

        // Rotation
        if (item.isBox) {
            worldGroup.rotation.order = 'YXZ';
            worldGroup.rotation.y = -Math.PI / 4;
            worldGroup.rotation.x = Math.atan(1 / Math.sqrt(2));
        } else {
            const guiRot = (item.model.display && item.model.display.gui && item.model.display.gui.rotation) || [30, 225, 0];
            worldGroup.rotation.order = 'ZYX';
            worldGroup.rotation.x = -guiRot[0] * Math.PI / 180;
            worldGroup.rotation.y = guiRot[1] * Math.PI / 180;
            worldGroup.rotation.z = (guiRot[2] || 0) * Math.PI / 180;
        }

        const bSize = new THREE.Vector3();
        bbox.getSize(bSize);
        const maxDim = Math.max(bSize.x, bSize.y, bSize.z);
        const frustum = Math.max(maxDim * (item.isBox ? 0.95 : 0.9), 4.0);

        const camera = new THREE.OrthographicCamera(-frustum, frustum, frustum, -frustum, 0.1, 1000);
        camera.position.set(0, 0, 100);
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
        results[item.id] = canvas.toDataURL('image/png');
    }

    document.getElementById('status').innerText = 'COMPLETE';

    // POST results back to local server
    await fetch('http://localhost:38829/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(results)
    });
}

window.onload = renderAll;
<\/script>
</body>
</html>`;

// Local server on port 38829
const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(htmlContent);
  } else if (req.method === 'POST' && req.url === '/submit') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('OK');

      try {
        const data = JSON.parse(body);
        let count = 0;
        for (const [id, dataUrl] of Object.entries(data)) {
          const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
          if (id === 'elite_box') {
            fs.writeFileSync(path.join(__dirname, '../public/elite_box.png'), base64Data, 'base64');
            console.log('Saved public/elite_box.png');
          } else {
            fs.writeFileSync(path.join(outputDir, `${id}.png`), base64Data, 'base64');
            count++;
          }
        }
        console.log(`Successfully saved ${count} author hats to ${outputDir}!`);
      } catch (err) {
        console.error('Error saving rendered images:', err);
      }

      setTimeout(() => {
        server.close();
        process.exit(0);
      }, 500);
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(38829, () => {
  console.log('Server listening on 38829, launching headless Chrome on same origin...');
  const chromeCmd = `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --use-gl=angle --disable-web-security "http://localhost:38829/index.html"`;
  exec(chromeCmd, (err, stdout, stderr) => {
    if (err) {
      console.error('Chrome execution notice:', err.message);
    }
  });
});
