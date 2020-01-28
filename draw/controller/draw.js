// // 导入WebSocket模块:
// const WebSocket = require('ws');

// // 引用Server类:
// const WebSocketServer = WebSocket.Server;

// // 实例化:
// const wss = new WebSocketServer({
//     port: 3000
// });

// wss.on('connection', function (ws) {
//     console.log(`[SERVER] connection()`);
//     ws.on('message', function (message) {
//         console.log(`[SERVER] Received: ${message}`);
//         ws.send(`ECHO: ${message}`, (err) => {
//             if (err) {
//                 console.log(`[SERVER] error: ${err}`);
//             }
//         });
//     })
// });

//配置一些变量表达游戏状态
var LINE_SEGMENT = 0;
var CHAT_MESSAGE = 1;
var GAME_LOGIC = 2;
 
var WAITING_TO_START = 0;
var GAME_START = 1;
var GAME_OVER = 2;
var GAME_RESTART = 3;
 
var playerTurn = 0;
//配置游戏中使用的关键词
var wordsList = ["苹果", "西瓜", "鸡", "开心", "飞起", "兔兔兔兔"];
var currentGameState = WAITING_TO_START;
var gameOverTimeout;
 
//创建websocket连接
var WebSocketServer = require('ws').Server;
 
var wss = new WebSocketServer({ port: 8181 });
 
//定义广播函数
wss.broadcast = function broadcast(message) {
	wss.clients.forEach(function each(client) {
			client.send(message);
	});
};
 
const names = [ 'sss', 'dd', 'hh', 'yy', 'cc'];
//建立连接时向客户端发送一条msg
wss.on('connection', function (ws) { 
	var msg = "新人进入，当前房间人数" + wss.clients.size;    
    
    //定义发送数据的类型，并广播               
    var data = {};
	data.dataType = CHAT_MESSAGE;
	var nameIndex =  Math.floor(Math.random() * 5);
    data.name = names[nameIndex];
    data.message = msg;
    wss.broadcast(JSON.stringify(data));
 
    //定义控制游戏逻辑的数据类型，并广播
    var gameLogicData = {};
    gameLogicData.dataType = GAME_LOGIC;
    gameLogicData.gameState = WAITING_TO_START;
    wss.broadcast(JSON.stringify(gameLogicData));
 
    //开始游戏的条件
    if(currentGameState == WAITING_TO_START && wss.clients.size >=2){
    	startGame();
    }
 
 
    //广播接收到的客户端发来的消息，并广播
    ws.on('message', function (message) {
		var obj = eval('(' + message + ')');
    	wss.broadcast('{data: "服务端回传信息测试"}');
		return 
 
        //如果判断收到的消息是聊天消息
    	if(obj.dataType == CHAT_MESSAGE){
            //如果接收到的消息是正确答案，广播并改变当前游戏状态
    		if(currentGameState == GAME_START && obj.message == currentAnswer){
    			var gameLogicData = {};
    			gameLogicData.dataType = GAME_LOGIC;
    			gameLogicData.gameState = GAME_OVER;
    			gameLogicData.winner = obj.name;
    			gameLogicData.answer = currentAnswer;
    			wss.broadcast(JSON.stringify(gameLogicData));
 
    			currentGameState = WAITING_TO_START;
 
    			clearTimeout(gameOverTimeout);
    		}
    	}else if(obj.dataType == GAME_LOGIC && obj.gameState == GAME_RESTART){
    		startGame();
    	}     
	});
	
	ws.on('error', function () {
		wss.broadcast('{data: "服务端链接错误"}');
	});
 
});
 
//开始游戏函数，初始化答案，控制开始的用户是谁
function startGame(){
	playerTurn = (playerTurn +1) % wss.clients.size;
 
	var answerIndex = Math.floor(Math.random()* wordsList.length);
	currentAnswer = wordsList[answerIndex];
 
	var gameLogicData1 = {};
	gameLogicData1.dataType = GAME_LOGIC;
	gameLogicData1.gameState = GAME_START;
	gameLogicData1.isPlayerTurn = false;
	wss.broadcast(JSON.stringify(gameLogicData1));
 
 
	var index = 0;
	wss.clients.forEach(function each(client) {
        if(index == playerTurn){
        	var gameLogicData2 = {};
        	gameLogicData2.dataType = GAME_LOGIC;
			gameLogicData2.gameState = GAME_START;
			gameLogicData2.answer = currentAnswer;
			gameLogicData2.isPlayerTurn = true;
			wss.broadcast(JSON.stringify(gameLogicData2));
        }
        index ++;
  	});
 
  	gameOverTimeout = setTimeout(function(){
  		var gameLogicData = {};
		gameLogicData.dataType = GAME_LOGIC;
		gameLogicData.gameState = GAME_OVER;
		gameLogicData.winner = 'no-one';
		gameLogicData.answer = currentAnswer;
		wss.broadcast(JSON.stringify(gameLogicData)); 	
 
		currentGameState = WAITING_TO_START;	
  	},60*1000);
 
  	currentGameState = GAME_START;
 
 
}
 
console.log("Websocket server is running");