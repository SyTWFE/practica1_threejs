function login(){
    var difficulty = document.getElementById('dificultad');
    var url = './views/game.html?' + difficulty.options[difficulty.selectedIndex].value;
    console.log(difficulty.options[difficulty.selectedIndex].value);
    document.location.href = url;
}

function active(){
    var active = document.getElementById('startbutton');
    active.disabled=false;
}