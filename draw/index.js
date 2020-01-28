
var websocketGame = {
	isDrawing: false,
	startX: 0,
	startY: 0,

	LINE_SEGMENT: 0,
	CHAT_MESSAGE: 1,
	GAME_LOGIC: 2,

	WAITING_TO_START: 0,
	GAME_START: 1,
	GAME_OVER: 2,
	GAME_RESTART: 3,
	isTurnToDraw: false
}


var canvas = document.getElementById("drawing-pad");
var ctx = canvas.getContext('2d');

canvas.style.height = document.documentElement.offsetHeight / 3 * 2 + 'px';

function drawLine(ctx, x1, y1, x2, y2, thickness) {
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.lineWidth = thickness;
	ctx.strokeStyle = "#fff";
	ctx.stroke();
}


$(document).ready(function () {
	var pad = document.getElementById('drawing-pad');
	pad.addEventListener('touchstart', function (e) {
		var touchPort = e.touches[0];

		var mouseX = touchPort.pageX;
		var mouseY = touchPort.pageY

		websocketGame.startX = mouseX;
		websocketGame.startY = mouseY;
		websocketGame.isDrawing = true;
	}, false);

	let mv_x = 0,
		mv_y = 0,
		mv_touchPort = { pageX: 0, pageY: 0 };
	pad.addEventListener('touchmove', function (e) {
		
		if (websocketGame.isDrawing) {
			mv_touchPort = e.touches[0];
			mv_x = mv_touchPort.pageX;
			mv_y = mv_touchPort.pageY;
			
			drawLine(ctx, websocketGame.startX, websocketGame.startY, mv_x, mv_y, 1);
			var data = {};
			data.dataType = websocketGame.LINE_SEGMENT;

			data.startX = websocketGame.startX;
			data.startY = websocketGame.startY;
			data.endX = mv_x;
			data.endY = mv_y;
			ws.send(JSON.stringify(data));

			websocketGame.startX = mv_x;
			websocketGame.startY = mv_y;
		}


	});

	pad.addEventListener('touchend', function (e) {
		websocketGame.isDrawing = false;
	});

})