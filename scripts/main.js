'use strict';
import * as THREE from "/build/three.module.js";

//Variables globales
var container;
var sceneWidth, sceneHeight;
var scene;
var renderer;
var camera;

//Valores del tablero
var juegoBuscar;
var juegoTiempo;
var juegoRonda;
var juegoPuntos;
var juegoReiniciarBoton;
var juegoSalirBoton;

var roundTime;
var gameScore = 0;
var currentRound = 0;
var url = document.location.href;
var dificultadJuego = url.split('?')[1];


var tiempoRonda;
var cantidadFiguras;
var timeScore = 0;
var bonus;
var tiempoRondaId;

//Objetivo del juego
var formas;
var colores;
var coloresm;
var estado;
var buscar = {};

// Geometrias

var geometry0= {};
var geometry1= {};
var geometry2= {};
var geometry3= {};
var geometry4= {};

var rendererSize;
var sceneSize;



var figuras = [];
var objetivoEstablecido = [];

init();

function init() {
    createScene();
    render();
}

function createScene() {
    sceneWidth = window.innerWidth;
    sceneHeight = window.innerHeight;

    sceneSize = {
        x: 1920,
        y: 730,
        ratio: 0.0
    }
    sceneSize.ratio = sceneSize.x / sceneSize.y;
    rendererSize = {
        x: window.innerWidth,
        y: window.innerWidth / sceneSize.ratio
    }

    //Escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x00000);
    camera = new THREE.OrthographicCamera(sceneSize.x / -2, sceneSize.x / 2, sceneSize.y / 2, sceneSize.y / -2, 0, 1000);
    camera.position.z = 100;

    // Luz: direccional    
    const lightColor = 0xffffff;
    const lightIntensity = 1;
    var light = new THREE.DirectionalLight(lightColor, lightIntensity);
    light.position.set(0, 0, 500);
    light.target.position.set(0, 0, -500);
    scene.add(light);
    scene.add(light.target);   

    //Obtener elementos HTML
    getterHtml();

    //Render
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(sceneWidth, sceneHeight);
    document.body.appendChild(renderer.domElement);
    document.addEventListener('click', posicionMouse);
    juegoReiniciarBoton.addEventListener('click', restartGame);
    juegoSalirBoton.addEventListener('click', quitGame);
    window.addEventListener('resize', onWindowResize, false);

    // Condiciones de juego
    dificultad(dificultadJuego);

    // Generar Atributos, colores y Figuras
    atributosFiguras();    
    generarFiguras(figuras);

    //Generar el conjunto de elementos a encontrar
    objetivos();
    objetivo();       

    tiempoRondaId = setInterval(roundTimer, 100);
    for (var i = 0; i < cantidadFiguras; i++) scene.add(figuras[i].tipo);

    //Canvas
    /*container = document.getElementById('container');
    container.appendChild(renderer.domElement);
    container.addEventListener("click", posicionMouse);
    juegoBotonReiniciar.addEventListener('click', restartGame);
    juegoSalirBoton.addEventListener('click', quitGame);
    */
}

// Dibuja en un loop, llamandose asi mismo
function update() {
    requestAnimationFrame(update);
    render();
}

// Renderizar el contenido
function render() {
    processFigures(figuras);
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

function getterHtml(){
    juegoBuscar = document.getElementById('juegoBuscar');
    juegoTiempo = document.getElementById('juegoTiempo');
    juegoRonda = document.getElementById('juegoRonda');
    juegoPuntos = document.getElementById('juegoPuntos');
    juegoReiniciarBoton = document.getElementById('juegoBotonReiniciar');
    juegoSalirBoton = document.getElementById('juegoSalirBoton');
}

function dificultad(multiplicador) {
    cantidadFiguras = 5;
    tiempoRonda = 150.0;
    bonus = 20;

    cantidadFiguras = cantidadFiguras * multiplicador;
    tiempoRonda = tiempoRonda / multiplicador;
    bonus = bonus * multiplicador;

    tiempoRondaId = setInterval(roundTimer, 100);
}

function atributosFiguras() {
    // Atributos

    formas = [
        'cuadrado',
        'círculo',
        'cubo',
        'triángulo',
        'rombo'
    ];
    colores = [
        'rojo', //b9ff00
        'verde', //00b900
        'gris', //8c8c8c
        'azul', //3399ff
        'amarillo',//ffff66
        'naranja' //ff8000
    ];
    estado = [
        'quieto',
        'saltando',
        'volando'
    ];
    coloresm = [  
            0xff0000,
            0x00ff00,
            0xffffff,
            0x0000ff,
            0xffff00,
            0xff8000
        ];


    // Geometrias

    geometry0 = new THREE.CircleGeometry(50, 30);    
    geometry1 = new THREE.BoxGeometry(80, 80, 80);    
    geometry2 = new THREE.CircleGeometry(60, 3);
    geometry3 = new THREE.Geometry();    
    geometry4 = new THREE.Geometry();

    geometry3.vertices.push(new THREE.Vector3(-50, -50, 0));
    geometry3.vertices.push(new THREE.Vector3(-50, 50, 0));
    geometry3.vertices.push(new THREE.Vector3(50, 50, 0));
    geometry3.vertices.push(new THREE.Vector3(50, -50, 0));
    geometry3.faces.push(new THREE.Face3(0, 3, 2));
    geometry3.faces.push(new THREE.Face3(0, 2, 1));

    geometry4.vertices.push(new THREE.Vector3(0, -70, 0));
    geometry4.vertices.push(new THREE.Vector3(-40, 0, 0));
    geometry4.vertices.push(new THREE.Vector3(0, 70, 0));
    geometry4.vertices.push(new THREE.Vector3(40, 0, 0));
    geometry4.faces.push(new THREE.Face3(0, 3, 2));
    geometry4.faces.push(new THREE.Face3(0, 2, 1));
}

function generarFiguras(figuras) {

    var coordenadaY, coordenadaX, coordenadaX2;

    if (cantidadFiguras <= 12) {
        coordenadaX = 75 - (cantidadFiguras * 150 / 2);
        coordenadaY = 0;
    } else {
        coordenadaX = 75 - (12 * 150 / 2);
        coordenadaX2 = 75 - ((cantidadFiguras - 12) * 150 / 2);
        coordenadaY = 175;
    }

    for (var j = 0; j < cantidadFiguras; j++) {
        figuras[j] = {
            x: 0,
            y: 0,
            forma: 0,
            color: 0,
            movimiento: 0,
            velocidad: 0.0,
            angle: 0,
            material: 0,
            tipo: 0
        };
    }

    for(var i = 0; i < cantidadFiguras; i++) {
        if (i > 11) coordenadaY = -175;
        figuras[i].x = coordenadaX;
        figuras[i].forma = Math.floor(Math.random()*(5-1) +1);
        figuras[i].color= Math.floor(Math.random()*6);
        figuras[i].movimiento = Math.floor(Math.random()*3);

        switch(figuras[i].forma){
            case 0:
                figuras[i].tipo = new THREE.Mesh(geometry3, new THREE.MeshBasicMaterial({
                color: coloresm[figuras[i].color]
            }));
            case 1: figuras[i].tipo = new THREE.Mesh(geometry0, new THREE.MeshBasicMaterial({
                color: coloresm[figuras[i].color]
            }));
            break;
            case 2: figuras[i].tipo = new THREE.Mesh(geometry1, new THREE.MeshPhongMaterial({
                color: coloresm[figuras[i].color]
            }));
            figuras[i].tipo.rotation.x = Math.PI / 4;
            figuras[i].tipo.rotation.y = Math.PI / 8;
            break;
            case 3: figuras[i].tipo = new THREE.Mesh(geometry2, new THREE.MeshBasicMaterial({
                color: coloresm[figuras[i].color]
            }));
            figuras[i].tipo.rotation.z = -Math.PI / 6;
            break;
            case 4: figuras[i].tipo = new THREE.Mesh(geometry4, new THREE.MeshBasicMaterial({
                color: coloresm[figuras[i].color]
            }));
            break;
        } 
        
        coordenadaX += 150;
        if (coordenadaX >= 960) coordenadaX = coordenadaX2;
        figuras[i].tipo.position.x = figuras[i].x;
    }

    for(var i = 0; i < figuras.length; i++) {      
        switch(figuras[i].movimiento){
            case 0:
                figuras[i].y = coordenadaY;
                break;
            case 1:
                figuras[i].y = getRandomInt(coordenadaY, coordenadaY + 100);
                figuras[i].velocidad = -1;
                break;
            case 2:
                figuras[i].y = coordenadaY + 100;
                figuras[i].angle = getRandomFloat(0, Math.PI);
                break;
        }
        figuras[i].tipo.position.y = figuras[i].y;
    }      

}

function objetivo() {
    buscar = {
        movimiento: 0,
        color: 0,
        forma: 0
    }
    var currentFigure = objetivoEstablecido[currentRound].figureNumber; //getRandomInt(0, cantidadFiguras - 1);
    buscar.forma = figuras[currentFigure].forma;
    buscar.color = figuras[currentFigure].color;
    buscar.movimiento = figuras[currentFigure].movimiento;

    roundTime = tiempoRonda;
    juegoBuscar.innerHTML = 'Encuentra el ' +  formas[buscar.forma] + ' de color '  + colores[buscar.color]+ ' que está ' +  estado[buscar.movimiento];
    var timerText = roundTime / 10;
    juegoTiempo.innerHTML = 'Tiempo restante: ' + timerText.toFixed(1);
    juegoTiempo.style.color = '#00ff00';
    juegoRonda.innerHTML = 'Ronda: ' + (currentRound + 1) + '/5';
    juegoPuntos.innerHTML = 'Puntuación: ' + gameScore;
}

function posicionMouse(event) {
    var sMouseX = ((event.pageX) / rendererSize.x - 0.5) * sceneSize.x;
    var sMouseY = -((event.pageY - 100) / rendererSize.y - 0.5) * sceneSize.y;

    for (var i = 0; i < cantidadFiguras; i++) {
        if (sMouseX >= (figuras[i].x - 80) && sMouseX <= (figuras[i].x + 80) && sMouseY >= (figuras[i].y - 80) && sMouseY <= (figuras[i].y + 80)) {
            if (buscar.forma == figuras[i].forma && buscar.color == figuras[i].color && buscar.movimiento == figuras[i].movimiento) {
                timeScore += bonus * roundTime / tiempoRonda;
                objetivoEstablecido[currentRound].complete = true;
            }

            if (currentRound < 4) {
                currentRound++;
                objetivo();
            } else stopGame();
        }

    }
}

function rescaleTextInfo() {
    juegoBuscar.style.width = window.innerWidth;
    juegoBuscar.style.height = 50;
    juegoBuscar.style.fontSize = 50 + 'px';
    juegoBuscar.style.top = 125 + rendererSize.y + 'px';
    juegoBuscar.style.left = 0 + 'px';

    juegoTiempo.style.width = window.innerWidth;
    juegoTiempo.style.height = 50;
    juegoTiempo.style.fontSize = 50 + 'px';
    juegoTiempo.style.top = 25 + 'px'; //800 + 'px';
    juegoTiempo.style.left = 0 + 'px';

    juegoRonda.style.width = window.innerWidth;
    juegoRonda.style.height = 50;
    juegoRonda.style.fontSize = 50 + 'px';
    juegoRonda.style.top = 25 + 'px'; //800 + 'px';
    juegoRonda.style.left = 0 + 'px';

    juegoPuntos.style.width = window.innerWidth;
    juegoPuntos.style.height = 50;
    juegoPuntos.style.fontSize = 50 + 'px';
    juegoPuntos.style.top = 25 + 'px'; //800 + 'px';
    juegoPuntos.style.left = 0 + 'px';

}

function objetivos() {
    for(var i=0; i<5; i++){
        objetivoEstablecido[i] = {
            figureNumber: i,
            complete: false
        };
    }
    objetivoEstablecido=objetivoEstablecido.sort(function() {return Math.random() - 0.5});
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function processFigures(figuras) {
    var coordenadaY;

    if (cantidadFiguras <= 12) coordenadaY = 0;
    else coordenadaY = 175;

    for (var i = 0; i < cantidadFiguras; i++) {
        if (i > 11) coordenadaY = -175;

        switch (figuras[i].movimiento) {
            case 0:
                break;
            case 1:
                figuras[i].y += figuras[i].velocidad;
                //~ figuras[i].y = Math.floor(figuras[i].y);

                figuras[i].velocidad -= 0.5;
                if (figuras[i].y < (coordenadaY - 100)) {
                    figuras[i].velocidad = -(figuras[i].velocidad + 0.5);
                }
                figuras[i].tipo.position.y = figuras[i].y;
                break;
            case 2:
                figuras[i].y = coordenadaY + 100 + Math.sin(figuras[i].angle) * 10;
                figuras[i].angle += 0.1;
                figuras[i].tipo.position.y = figuras[i].y;
                break;
            case 3:
                if (figuras[i].forma == 2) {
                    figuras[i].tipo.rotation.x += 0.02 * figuras[i].velocidad;
                    figuras[i].tipo.rotation.y += 0.04 * figuras[i].velocidad;
                    figuras[i].tipo.rotation.x += 0.06 * figuras[i].velocidad;
                } else figuras[i].tipo.rotation.z += 0.05 * figuras[i].velocidad;
                break;
        }
    }
}

function restartGame() {

    for (var i = 0; i < cantidadFiguras; i++) {
        temp = false;
        for (var j = 0; j < 5; j++)
            if (objetivoEstablecido[j].figureNumber == i) temp = true;
        if (temp) scene.remove(figuras[i].tipo);
    }

    gameScore = 0;
    timeScore = 0;
    currentRound = 0;
    juegoTiempo.style.color = '#00ff00';
    objetivos();
    generarFiguras(figuras);
    for (var i = 0; i < cantidadFiguras; i++) scene.add(figuras[i].tipo);
    objetivo();

    document.addEventListener('click', posicionMouse);
    juegoTiempo.style.visibility = 'visible';
    juegoBotonReiniciar.style.visibility = 'hidden';
    juegoSalirBoton.style.visibility = 'hidden';

}

function quitGame() {
    window.location = "/index.html";
}

function roundTimer() {
    roundTime -= 1;
    var timerText = roundTime / 10;
    juegoTiempo.innerHTML = 'Tiempo restante: ' + timerText.toFixed(1);
    if (roundTime <= 30) juegoTiempo.style.color = '#ff0000';
    else if (roundTime <= 60) juegoTiempo.style.color = '#ffff00';
    if (roundTime <= 0) {
        objetivo();
        currentRound++;
        if (currentRound <= 4) objetivo();
        else stopGame();
    }
}

function stopGame() {
    clearInterval(tiempoRondaId);
    document.removeEventListener('click', posicionMouse);
    var temp;

    juegoBuscar.innerHTML = '';
    juegoTiempo.style.visibility = 'hidden';
    juegoBotonReiniciar.style.visibility = 'visible';
    juegoSalirBoton.style.visibility = 'visible';

    for (var i = 0; i < cantidadFiguras; i++) {
        temp = false;
        for (var j = 0; j < 5; j++)
            if (objetivoEstablecido[j].figureNumber == i) temp = true;
        if (!temp) scene.remove(figuras[i].tipo);

    }

    for (var i = 0; i < 5; i++)
        if (objetivoEstablecido[i].complete) {
            gameScore += bonus;
        }

    timeScore = Math.floor(timeScore / 10) * 10;
    gameScore += timeScore;
    juegoPuntos.innerHTML = 'Puntuación: ' + gameScore;

}