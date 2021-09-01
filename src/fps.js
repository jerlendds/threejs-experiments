import * as THREE from "three";

let createFpsElement = function() {
    let node = document.createElement("P");
    let textNode = document.createTextNode("FPS");
    node.style = "color: white; position: absolute; top: 0; left: 50px;"
    node.appendChild(textNode);
    document.body.appendChild(node)
    return node
}

// Storing this here to play with later
let materialBlueOrBlack = function() {
    let randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
    let color = parseInt(Number(randomColor.slice( 1, 8 )), 6)

    console.log(color)
    return new THREE.MeshPhongMaterial({
        color: color,
        specular: 0xffffff,
        shininess: 50,
    })
}

export default createFpsElement;










