
var websocketGame = {
    isDrawing:false,
    startX:0,
    startY:0,
	
    LINE_SEGMENT : 0,
    CHAT_MESSAGE : 1,
    GAME_LOGIC:2,
    
    WAITING_TO_START:0,
    GAME_START:1,
    GAME_OVER:2,
    GAME_RESTART:3,
    isTurnToDraw:false
}
 
 
var canvas = document.getElementById("drawing-pad");
var ctx = canvas.getContext('2d');
 
function drawLine(ctx,x1,y1,x2,y2,thickness){
	ctx.beginPath();
	ctx.moveTo(x1,y1);
	ctx.lineTo(x2,y2);
	ctx.lineWidth = thickness;
	ctx.strokeStyle = "#444";
	ctx.stroke();
}
 
 
$(document).ready(function(){
 
	$('#drawing-pad').mousedown(function(e){
		var canvasPosition = $(this).offset();
		var mouseX = (e.pageX - canvasPosition.left) || 0;
		var mouseY = (e.pageY - canvasPosition.top) || 0;
 
		websocketGame.startX = mouseX;
		websocketGame.startY = mouseY;
		websocketGame.isDrawing = true;
	});
 
	$('#drawing-pad').mousemove(function(e){
		if(websocketGame.isDrawing){
			var canvasPosition = $(this).offset();
			var mouseX = (e.pageX - canvasPosition.left) || 0;
			var mouseY = (e.pageY - canvasPosition.top) || 0;
		}
 
		if(!(mouseX == websocketGame.startX && mouseY == websocketGame.startY)){
			drawLine(ctx,websocketGame.startX,websocketGame.startY,mouseX,mouseY,1);
 
			var data = {};
			data.dataType = websocketGame.LINE_SEGMENT;
			
			data.startX = websocketGame.startX;
			data.startY = websocketGame.startY;
			data.endX = mouseX;
			data.endY = mouseY;
			ws.send(JSON.stringify(data));
 
			
			websocketGame.startX = mouseX;
			websocketGame.startY = mouseY;
		}
	});
 
	$('#drawing-pad').mouseup(function(e){
		websocketGame.isDrawing = false;
	});
 
})