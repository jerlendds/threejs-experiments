import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from 'three';

import createFpsElement from "./fps";
import Stats from 'stats.js'

document.body.style = "margin: 0;";


// https://threejsfundamentals.org/threejs/lessons/threejs-picking.html
// https://developer.mozilla.org/en-US/docs/Games/Techniques/Tilemaps/Square_tilemaps_implementation:_Scrolling_maps


let randomMat = function() {
    let randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);

    let setColor;
    if (Math.floor(Math.random()*52) % 2) {
        setColor = 0x121214;
    } else {
        setColor = randomColor
    }

    return new THREE.MeshPhongMaterial({
        color: setColor,
        specular: 0xffffff,
        shininess: 50,
    })
}

let grassMat = function() {
    let colors = [ 0x0D4523, 0x11572D, 0x0B4D25]
    let idx = Math.floor(Math.random()*colors.length)
    return new THREE.MeshPhongMaterial({
        color: colors[idx],
        specular: 0xffffff,
        shininess: 50,
    })
}

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
let planeGeometry = function(width, height) {
    return new THREE.PlaneGeometry( width, height, width * 5, height * 5 )
}
let planeBufGeometry = function(width, height) {
    return new THREE.PlaneBufferGeometry( width, height )
}
let cubeBufGeometry = function(width, height, depth) {
    return new THREE.BoxBufferGeometry( width, height, depth )
}
let createOrthographic = function( width=WIDTH, height=HEIGHT, aspect, D ) {
    return new THREE.OrthographicCamera(-D*aspect, D*aspect, D, -D, 1, 1000)
}
let createRenderer = function(width, height) {
    let renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.autoClear = false;

    return renderer;
}
let createLight = function(x = 10, y= 80, z =20) {
    let light = new THREE.PointLight(0xffffff, 20, 90)
    light.position.set(x, y, z)
    scene.add(light)
}
let calculateVisibleArea = function() {
}

let renderer = createRenderer(WIDTH, HEIGHT)
let camera = createOrthographic(WIDTH, HEIGHT,
    WIDTH / HEIGHT, 1)
document.body.appendChild(renderer.domElement)

// Scene panning controls
const orbit = new OrbitControls( camera, renderer.domElement )
orbit.enableRotate = false;
orbit.enablePan = true;
orbit.mouseButtons = { LEFT: THREE.MOUSE.PAN };

// Creating scene with gray background
let scene = new THREE.Scene()
scene.background = new THREE.Color(0x87CEEB)

// Setting up scene camera and lighting
camera.position.set(250, 250, 250)
camera.lookAt(scene.position)
scene.add( new THREE.AmbientLight(0x4000ff) )

console.log(camera)
function random_unit_vector(){
    let theta = Math.random() * 2 * Math.PI;
    return {
        x: Math.cos(theta),
        y: Math.sin(theta),
        z: Math.tan(theta)
    };

}

let addNoise = function(nodes=100) {
    let grd = [];

    for (let i = 0; i < nodes; i++) {
        let row = [];
        for (let j = 0; j < nodes; j++) {
            row.push(random_unit_vector());
        }
        grd.push(row);
    }

    return grd
}


// Creating tile array
let createMap = function(SIZE = 100, plane_length = 1) {
    let tileMap = [];
    let rotation = -1.5708
    let tile, tileOne, geometry, mat, offset;

    for (let x = 0; x < SIZE / 1.5; x++) {

        for (let y = 0; y < SIZE; y++) {
            let z_offset = grid[x][y].z
            let x_offset = grid[x][y].x
            let y_offset = grid[x][y].y
            offset = x_offset
            if (z_offset < 1) {
                offset = x_offset * 1.2
            }  else if (x_offset < 1) {
                offset = x_offset * 0.5
            } else  if (z_offset > 1) {
                offset = z_offset * 0.5
            }// else {
                // offset = (y_offset * x_offset * z_offset) * 2
            // }
            if (offset < 0) {
                offset = Math.abs(offset)
            }

            mat = grassMat()
            geometry = cubeBufGeometry(plane_length, plane_length, offset)


            tile = new THREE.Mesh(
                geometry,
                mat
            )
            tileOne = new THREE.Mesh(
                geometry,
                mat
            )

            tile.position.z = x - y ;
            tile.position.x = x + x;
            tileOne.position.z = x - y + 1;
            tileOne.position.x = x + x + 1;
            // tile.position.y = z_offset
            // tileOne.position.y = z_offset
            tile.rotation.x = rotation;
            tileOne.rotation.x = rotation;
            // tile.rotation.x = Math.PI * -0.5
            // tileOne.rotation.x = Math.PI * -0.5
            tileMap.push(tile)
            tileMap.push(tileOne)
            scene.add(tile)
            scene.add(tileOne)
        }
    }
    return tileMap
}

let grid = addNoise()
let map = createMap()
createLight(map[1000].x, map[1000].y, map[1000].z)


console.log("Tile Count: " + map.length)

let unloadMap = function(tileMap) {
    for (let i=0; i < tileMap.length; i++) {
        scene.remove(tileMap[i])
    }
}


// let fps_node = createFpsElement()
// Now using stats.js to measure performance
let useStats = function() {
    let stats = new Stats();
    stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild( stats.dom );
    return stats;
}
let stats = useStats()


let createOverlayCanvasElement = function(width=WIDTH, height=HEIGHT) {
    let hudCanvas = document.createElement('canvas');
    hudCanvas.style = "position: absolute; top: 0; left: 0; pointer-events: none; visibility:hidden; display: none;"
    hudCanvas.width = WIDTH;
    hudCanvas.height = HEIGHT;
    document.body.appendChild(hudCanvas)
    return hudCanvas
}


let createHudBitmap = function(canvas, text='rtsplx threejs',
                               x=WIDTH / 6,
                               y=HEIGHT - HEIGHT * 0.05) {
    let bitmap = canvas.getContext('2d');
    bitmap.font = "Normal 40px Arial";
    bitmap.textAlign = 'center';
    bitmap.fillStyle = "rgba(245,245,245,0.75)";
    bitmap.fillText( text, x, y );
    return bitmap
}

let HUD = createOverlayCanvasElement()
let hudTitle = createHudBitmap(HUD)
let hudCamera = new THREE.OrthographicCamera(-WIDTH/2, WIDTH/2, HEIGHT/2, -HEIGHT/2, 0, 30 );

let hudTexture = new THREE.Texture(HUD)
hudTexture.needsUpdate = true;
let hudMaterial = new THREE.MeshBasicMaterial( {map: hudTexture, transparent: true } );

// Create plane to render the HUD. This plane fill the whole screen.
let plane = new THREE.Mesh(
    new THREE.PlaneGeometry( WIDTH, HEIGHT ),
    hudMaterial );
let sceneHUD = new THREE.Scene({ alpha: true });

sceneHUD.add( plane );

let firstTile = new THREE.BoxHelper(map[0], 0xff0000);
let secondTile = new THREE.BoxHelper(map[1], 0xff0000);
let lastTile = new THREE.BoxHelper(map[map.length - 1], 0xff0000);

firstTile.update();
secondTile.update()
lastTile.update()

// visible bounding box
scene.add(firstTile);
scene.add(secondTile);
scene.add(lastTile);

function animate() {
    requestAnimationFrame( animate );

    stats.begin();
    orbit.update()
    // Comments represent the old/broken? fps measuring approach
    // let time1 = performance.now()

    hudTexture.needsUpdate = true;
    renderer.render(scene, camera);
    renderer.render(sceneHUD, hudCamera);
    // let time2 = performance.now()
    // let fps = time2 - time1
    // fps_node.innerText = fps + " FPS";
    stats.end()
}

animate()
