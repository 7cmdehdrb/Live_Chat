const express = require('express');
const socket = require('socket.io');
const http = require('http');

const fs = require('fs');

const app = express();

const server = http.createServer(app);

const io = socket(server);
        
var oracledb = require("oracledb");
oracledb.autoCommit = true;
var conn;

app.use('/css', express.static('./static/css'));
app.use('/js', express.static('./static/js'));
app.use('/sound', express.static('./static/sound'));

oracledb.getConnection({
    user:"hr",
    password:"hr",
    connectString:"localhost/XE"
    // connectString:"110.10.227.103/XE"
},function(err,con){
    if(err){
        console.log("접속이 실패했습니다.",err);
    } else{
        console.log("DB CONNECT");
    }
    conn = con;
});

app.get('/', function(request, response){
    fs.readFile('./static/index.html', function(err, data){
        if(err){    
            response.send("ERROR");
        } else {
            console.log(`IP ADDRESS : ${request.ip}`);
            response.writeHead(200, {'Content-Type' : 'text/html'});
            response.write(data);
            response.end();
        }
    });
});

io.sockets.on('connection', function(socket){

    socket.on('newuser', function(name){
        console.log(`${name} : LOGIN`); 

        socket.name = name;

        io.sockets.emit('update', {type : 'connect', name : '알림', message : `${name}님이 접속하셨습니다!`});

    });
    
    socket.on('message', function(data){
        
        data.name = socket.name;
        
        socket.broadcast.emit('update', data);
        
        console.log(data);

        const date = new Date();

        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var hour = date.getHours(); 
        var minute = date.getMinutes(); 
        var second = date.getSeconds();
        
        conn.execute(`INSERT INTO HR.JSCHAT (USERNAME, MESSAGE, CHATTIME) VALUES('${data.name}', '${data.message}', 
        TO_DATE('${year}-${month}-${day} ${hour}:${minute}:${second}', 'YYYY-MM-DD HH24:MI:SS'))`);

    });

    socket.on('lastchat', function(data){

        conn.execute("SELECT * FROM HR.JSCHAT ORDER BY CHATTIME", [], function (err, result){

            var rs = result.rows;
            
            if(rs.length < 100) {
                for(i = 0; i < rs.length; i++){
                    socket.emit('update', {type : 'message', name : rs[i][0], message : rs[i][1]})
                }
            } else {
                    for(i = 100; i < rs.length; i++){
                        socket.emit('update', {type : 'message', name : rs[i][0], message : rs[i][1]})
                    }
            }
            
        });

    });

    socket.on('disconnect', function(){
        console.log(`${socket.name} : LOGOUT`);

        socket.broadcast.emit('update', {type : 'disconnect', name : '알림', message : `${socket.name}님이 나가셨습니다!`})
    });

});

server.listen(8082, function(){
    console.log("SERVER START WITH PORT 8089");
});


function doRelease(connection) {
    connection.release(function (err) {
        if (err) {
            console.error(err.message);
        }
    });
}