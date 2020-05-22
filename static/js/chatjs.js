// """ FOR DEFAULT """

window.addEventListener('keypress', function(ev){
    if(ev.keyCode === 13){
        send();
    }
});

var userlist = new Array();
const colors = ["silver", "Aquamarine", "Coral", "Cornflowerblue", "Darkkhaki", "Darksalmon", "Deepskyblue", "Khaki", "Peachpuff", "Thistle"];

var autos = true;
var notice = false;


// """ FOR SERVER """

var socket = io();

socket.on('connect', function(){

    var name = localStorage["myname"];

    if(!name){

        while(true){

            name = prompt("이름을 입력하세요");

            if(!name){
                alert("이름은 필수입니다");
            } else {
                if(name.length < 6){
                    localStorage["myname"] = name;
                    break;
                } else {
                    alert("이름은 최대 6글자입니다");
                }
            }
        }

    } 

    socket.emit('newuser', name);

});

socket.on('update', function(data){

    var sound  = document.getElementById("sound");
    var chat = document.querySelector(".mainbox");
    
    if(userlist.indexOf(`${data.name}`) === -1){
        userlist.push(data.name);
    }
    
    const idx = userlist.indexOf(data.name, 0);

    if(data.name === "알림"){
        var style = `style = "background-color: salmon";`;
    } else {
        var style = `style = "background-color: ${colors[idx]}";`;
    }

    chat.innerHTML += `<div class="syschat" ${style}>${data.name}: ${data.message} 
    <span style="font-size: small;">(${(data.time === undefined ? "NO TIME DATA" : data.time)})</span></div>`;
    
    if(notice === true){
        sound.currentTime = 0;
        sound.play();   
    }

    if(autos === true){
        $(document).scrollTop($(document).height());
    }

});

function send() {

    const date = new Date();

    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours(); 
    var minute = date.getMinutes();

    var message = document.getElementById("text").value;
    document.getElementById("text").value = "";

    if(message === ""){
        ;
    } else {
        if(message.length <= 30){
            if(message.search("'") != -1){
                alert("\' 는 사용하실수 없습니다");
            } else {
                var chat = document.querySelector(".mainbox");
                chat.innerHTML += `<div class="mychat">나: ${message} <span style="font-size: small;">(${month}/${day} ${hour}:${minute})</span></div>`;
                socket.emit('message', {type : 'message', message : message, time : `${month}/${day} ${hour}:${minute}`});
            }
        } else {
            alert("메세지는 최대 30자입니다");
        }
    }

    if(autos === true){
        $(document).scrollTop($(document).height());
    }

}

function autoscroll() {

    const autosc = document.getElementById("autoscrollbtn");

    if(autos === true) {
        autosc.className = "far fa-eye";
        autos = false;
    } else {
        autosc.className = "fas fa-eye";
        autos = true;
    }

}

function alter() {

    while(true){

        var newname = prompt("새 이름을 입력하세요\n단, 기존 체팅 내역이 소멸합니다");

        if(newname === ""){
            alert("이름은 필수입니다");
        } else if(newname === false){
            break;
        } else {
            if(newname.length <= 6){
                localStorage["myname"] = newname;
                window.location.reload();
                break;
            } else {
                alert("이름은 최대 6글자입니다");
            }
        }
    }


}

function notification() {

    const noticebtn = document.getElementById("noticebtn");

    if(notice === true) {
        notice = false;
        noticebtn.className = "far fa-bell";
    } else {
        notice = true;
        noticebtn.className = "fas fa-bell";
    }

}

var listopen = false;

function list() {

    const nav = document.querySelector(".nav");
    const scrollnav = document.getElementById("autoscroll");
    const noticenav = document.getElementById("notice");
    const alternav = document.getElementById("alter");
    const chatnav = document.getElementById("chatload");

    if(listopen === false){
        nav.style.width = "300px";

        noticenav.style.transitionDelay = "500ms";
        noticenav.style.opacity = "100%";

        scrollnav.style.transitionDelay = "500ms"
        scrollnav.style.opacity = "100%";

        alternav.style.transitionDelay = "500ms"
        alternav.style.opacity = "100%";

        chatnav.style.transitionDelay = "500ms"
        chatnav.style.opacity = "100%";

        listopen = true;
    } else if(listopen === true){
        nav.style.width = "50px";

        noticenav.style.transitionDelay = "0ms";
        noticenav.style.opacity = "0%";

        scrollnav.style.transitionDelay = "0ms"
        scrollnav.style.opacity = "0%";

        alternav.style.transitionDelay = "0ms"
        alternav.style.opacity = "0%";

        chatnav.style.transitionDelay = "0ms"
        chatnav.style.opacity = "0%";

        listopen = false;
    }

}


function lastchat() {

    var loading = confirm("최대 최근 100개의 체팅을 불러올 수 있습니다\n불러오시겠습니까?");

    if(loading != 0){
        socket.emit('lastchat');
    }

}