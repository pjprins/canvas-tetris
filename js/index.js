var canvas = document.getElementById("mycanvas");
var ctx = canvas.getContext("2d");
var scoreText = document.getElementById("score_text");
var levelText = document.getElementById("level_text");
var lineText = document.getElementById("line_text");
var pauseButton = document.getElementById("pause_button");

var grid = [];
var gridSize = 14;
canvas.width = 10*20;
canvas.height = 20*20;
var game_over = false;
var bgColor = "#262626";
var score = 0;
var level = 0;
var linesCleared = 0;
var fallSpeed = 800;
var basePoints = [40, 100, 300, 1200];
var currentBlock = null;
var gameInterval = null;
init();

function Block(blocks, color, rotOffset){
    this.blocks = blocks;
    this.color = color;
    this.rotOffset = rotOffset;
    
    this.update = function(){
        
        for(var i = 0; i< this.blocks.length; i++){
            if(this.blocks[i][1] == 21 || grid[this.blocks[i][1]+1][this.blocks[i][0]] !== bgColor){
                this.addToGrid();
                return true;
            }
        }
        for(var i = 0; i< this.blocks.length; i++){
            this.blocks[i][1]++;
        }
        this.rotOffset[1]++;
    }
    
    this.addToGrid = function(){
        for(var i = 0; i< this.blocks.length; i++){
            grid[this.blocks[i][1]][this.blocks[i][0]] = this.color;
        }
    }
    
    this.draw = function(){
        for(var i = 0; i< this.blocks.length; i++){
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.fillRect(this.blocks[i][0]*20+1, (this.blocks[i][1]-2)*20, 18, 18);
            ctx.closePath();
        }
    }
    
    this.shiftLeft = function(){
        for(var i = 0; i< this.blocks.length; i++){
            if(this.blocks[i][0] == 0 || grid[this.blocks[i][1]][this.blocks[i][0]-1] !== bgColor){
                return;
            }
        }
        for(var i = 0; i< this.blocks.length; i++){
            this.blocks[i][0]--;
        }
        this.rotOffset[0]--;
    }
    
    this.shiftRight = function(){
        for(var i = 0; i< this.blocks.length; i++){
            if(this.blocks[i][0] == 9 || grid[this.blocks[i][1]][this.blocks[i][0]+1] !== bgColor){
                return;
            }
        }
        for(var i = 0; i< this.blocks.length; i++){
            this.blocks[i][0]++;
        }
        this.rotOffset[0]++;
    }
    
    this.copyBlocks = function(){
        var newBlocks = [];
        for(var i= 0; i < this.blocks.length; i++){
            newBlocks[i] = this.blocks[i].slice();
        }
        return newBlocks;
    }
    
    this.checkInvalid = function(block){
        return block[0] < 0 || block[0] > 9 || block[1] > 21 || grid[block[1]][block[0]] !== bgColor;
    }
    
    this.rotateCounterClockwise = function(){
        var newBlocks = this.copyBlocks();
        for(var i = 0; i< newBlocks.length; i++){
            newBlocks[i][0] -= this.rotOffset[0];
            var temp = -1*newBlocks[i][0];
            newBlocks[i][1] -= this.rotOffset[1];
            newBlocks[i][0] = newBlocks[i][1] + this.rotOffset[0];
            newBlocks[i][1] = temp +this.rotOffset[1];
            if(this.checkInvalid(newBlocks[i])){
                return;
            }
        }
        this.blocks = newBlocks;
        
    }
    
    this.rotateClockwise = function(){
        var newBlocks = this.copyBlocks();
        for(var i = 0; i< newBlocks.length; i++){
            newBlocks[i][0] -= this.rotOffset[0];
            var temp = newBlocks[i][0];
            newBlocks[i][1] -= this.rotOffset[1];
            newBlocks[i][0] = -1*newBlocks[i][1] + this.rotOffset[0];
            newBlocks[i][1] = temp +this.rotOffset[1];
            if(this.checkInvalid(newBlocks[i])){
                return;
            }
        }
        this.blocks = newBlocks;
        
    }
    
}

function createRow(){
    var row = [];
    for(var j = 0; j<10;j++){
        row.push(bgColor);
    } 
    return row;
}

function init(){
    currentBlock = null;
    score = 0;
    level = 0;
    linesCleared = 0;
    fallSpeed = 800;
    scoreText.innerHTML = "Score: 0";
    levelText.innerHTML = "Level: 0";
    lineText.innerHTML = "Lines: 0";
    pauseButton.innerHTML = "Pause";
    grid = [];
    for(var i = 0; i< 22;i++){
        grid.push(createRow());
    }
    clearInterval(gameInterval);
    gameInterval = setInterval(playGame, fallSpeed);
}

function checkTetris(){
    var lines = 0;
    for(var i = 0; i < grid.length;i++){
        for(var j = 0; j< grid[i].length;j++){
            if(grid[i][j] === bgColor){
                break;
            }
            if(j == grid[i].length-1){
                lines ++;
                grid.splice(i, 1);
                grid.splice(0, 0, createRow());
            }
        }
    }
    
    if (lines > 0){
        score += basePoints[lines -1]*(level+1);
        scoreText.innerHTML = "Score: "+score;
        linesCleared += lines;
        if(linesCleared >= 10){
            level++;
            levelText.innerHTML = "Level: "+level;
            linesCleared = 0;
            clearInterval(gameInterval);
            fallSpeed *= .9;
            gameInterval = setInterval(playGame,fallSpeed);
        }
        lineText.innerHTML = "Lines: "+ linesCleared;
    }
}

function checkGameOver(){
    for(var i=0; i<2; i++){
        for (var j = 0; j < 10; j++){
            if(grid[i][j] !== bgColor){
                return true;
            }
        }
    }
    return false;
}

function drawTile(x, y, color){
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.fillRect(x*20+1, (y-2)*20, 18, 18);
    ctx.closePath();
}

function drawGrid(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(var i = 0; i< 22;i++){
        var row = [];
        for(var j = 0; j<10;j++){
            drawTile(j, i, grid[i][j]);
        }
    }
}

function playGame(){
    drawGrid();
    if(currentBlock == null || currentBlock.update()){
        checkTetris();
        drawGrid();
        if(checkGameOver()){
            clearInterval(gameInterval);
            ctx.font = "35px Arial";
            ctx.fillStyle = "white";
            ctx.fillText("Game Over", 10, canvas.height/2);
        }
        switch(Math.floor(Math.random()*7)){
            case 0:
                //Z block
                currentBlock = new Block([[3, 0], [4, 0],[4,1], [5,1]],"lime", [4, 1]);
                break;
            case 1:
                //Straight line block
                currentBlock = new Block([[3, 0], [4, 0],[5,0], [6,0]],"red", [4.5, 0.5]);
                break;
            case 2:
                //T block
                currentBlock = new Block([[3, 0], [4, 0],[5,0], [4,1]],"#80ffff", [4, 0]);
                break;
            case 3:
                //L block
                currentBlock = new Block([[3, 0], [3, 1],[4,0], [5,0]],"orange", [4, 0]);
                break;
            case 4:
                //J block
                currentBlock = new Block([[3, 0], [4, 0],[5,0], [5,1]],"#1a53ff", [4, 0]);
                break;
            case 5:
                //S block
                currentBlock = new Block([[3, 1], [4, 0],[4,1], [5,0]],"purple", [4, 1]);
                break;
            case 6:
                //Square block
                currentBlock = new Block([[4, 0], [5, 0],[4,1], [5,1]],"yellow", [4.5, 0.5]);
                break;
                    
        }
        
    }else{
        currentBlock.draw();
    }
}

document.onkeypress = function(e){
    //console.log(e.keyCode);
    if (pauseButton.innerHTML === "Pause"){
        switch (e.keyCode) {
            
            case 97:
                currentBlock.shiftLeft();
                drawGrid();
                currentBlock.draw();
                break;
            case 100:
                currentBlock.shiftRight();
                drawGrid();
                currentBlock.draw();
                break;
            case 115:
                currentBlock.rotateClockwise();
                drawGrid();
                currentBlock.draw();
                break;
            case 119:
                currentBlock.rotateCounterClockwise();
                drawGrid();
                currentBlock.draw();
                break;
            case 120:
                playGame();
                break;
        }
    }
}

function pause(){
    if (pauseButton.innerHTML === "Pause"){
        pauseButton.innerHTML = "Play";
        clearInterval(gameInterval)
    }else{
        pauseButton.innerHTML = "Pause";
        gameInterval = setInterval(playGame,fallSpeed);
    }
        
}