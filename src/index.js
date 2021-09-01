import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from 'three';

import createFpsElement from "./fps";
import Stats from 'stats.js'

document.body.style = "margin: 0;";
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;


let material = function() {
    let randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);

    return new THREE.MeshPhongMaterial({
        color: randomColor,
        specular: 0xffffff,
        shininess: 50,
    })
}
let planeGeometry = function(width, height) {
    return new THREE.PlaneGeometry( width, height )
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
let create_light = function(x = 10, y= 20, z =15) {
    let light = new THREE.PointLight(0xffffff, 6, 40)
    light.position.set(x, y, z)
    scene.add(light)
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
scene.background = new THREE.Color(0x363635)

// Setting up scene camera and lighting
create_light()
camera.position.set(20, 20, 20)
camera.lookAt(scene.position)
scene.add( new THREE.AmbientLight(0x4000ff) )

// Creating tile array
let createMap = function(SIZE = 10, plane_length = 0.5, camera) {
    let tileMap = [];
    for (let x = 0; x < SIZE; x++) {
        for (let y = 0; y < SIZE; y++) {
            let tile = new THREE.Mesh(
                planeGeometry(plane_length, plane_length),
                material()
            );
            tile.position.y = y / 2 + camera.left * 2;
            tile.position.x = x / 2 + camera.left * 2;
            tile.rotation.x = -1.5708
            tileMap.push([tile])
            scene.add(tile)
        }
    }
    let target = new THREE.Vector3();
    tileMap[0][0].getWorldPosition( target )
    console.log('first tile', tileMap[0][0])
    console.log('first tile target world position', target)
    return tileMap
}
console.log(createMap(70, 0.5, camera ))


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
var plane = new THREE.Mesh(
    new THREE.PlaneGeometry( WIDTH, HEIGHT ),
    hudMaterial );
let sceneHUD = new THREE.Scene({ alpha: true });

sceneHUD.add( plane );


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