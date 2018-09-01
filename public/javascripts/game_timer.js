// import { stat } from "fs";
// import { Socket } from "net";

//Local server url
var main_server_url = `http://localhost:5001/`;

//room name
var room_name = 'ex_revenge'

//timer vars
var timer = new Timer();
var current_time;
var timer_on = false;

//Audio files
var main_audio = new Audio('../files/audio/Background music.mp3')
var congrats_sound = new Audio('../files/audio/congrats.mp3')
var end_lose_audio = new Audio('../files/audio/Game over.mp3')
var end_win_audio = new Audio('../files/audio/win_audio.mp3')
var room_3_audio = new Audio('../files/audio/room_3.mp3')
var hint_audio = new Audio('../files/audio/hint_audio.mp3')

//Videos
timer_start_delay = 105000
// var intro_video_src = '../files/video/intro.mp4'
// var static_video_src = '../files/video/static_small.mp4'

$(document).ready(function() {

    $.getJSON("config.json", function (data) {
        main_server_url = data.main_server_url
        room_name = data.room_name
    });

    var intro_video_src = $('#static_video').html()
    var static_video_src = $('#intro_video').html()    

    // $('#intro_video').css('display_none')
    //==============================
    //==== Easytimer.js ===========
    //=============================
    
    // begin_countdown_timer();

    $('#chronoExample .startButton').click(function () {
        timer.start();
        // cTimer.start();
        begin_countdown_timer()
        console.log(cTimer.getTimeValues().seconds)
    });

    $('#chronoExample .stopButton').click(function () {
        timer.stop();
        cTimer.stop();
        //do some flashing animation here.....
        console.log(current_time)
    });
    $('#chronoExample .resetButton').click(function () {
        timer.reset();
        begin_countdown_timer();
    });


}); //doc.rdy()

function timer_refresh(){
    // window.location.reload()
    window.location.href = window.location.href;
}

function timer_control(msg){
    if (msg == "start_timer"){
        // clock.start();
        begin_countdown_timer()
    }
    else if (msg == "stop_timer"){
        // clock.stop();
        // cTimer.stop();
        cTimer.pause()
        // socket.emit('time_update', current_time)
        console.log(current_time.toString())
    }
    else if (msg == "reset_timer"){
        begin_countdown_timer();
    }
}

function begin_countdown_timer(time = {hours:1, minutes:0, seconds:0}){

    //Reset the lose message
    $('#cdMessage').html('');
    time.hours = Number(time.hours)
    time.minutes = Number(time.minutes)
    time.seconds = Number(time.seconds)
    //Init new timer
    cTimer = new Timer();
    timer_on = true;
    // sec = Number(sec) //Need to cast to number, else == sec*10
    cTimer.start({countdown: true, startValues: {hours : time.hours, minutes : time.minutes, seconds: time.seconds}});
    $('#countdownExample .values').html(cTimer.getTimeValues().toString());
    
    //Update the time values, must be an event..
    cTimer.addEventListener('secondsUpdated', function (e) {
        $('#countdownExample .values').html(cTimer.getTimeValues().toString());
        
        //only send message if the time is diff from last
        if(current_time != cTimer.getTimeValues().toString()){
            console.log(current_time, cTimer.getTimeValues().toString())
            current_time = cTimer.getTimeValues().toString();
            $.get(`${main_server_url}gc_emit_time/${room_name}/${current_time}`, function(dat){
            })
        }
    });

    //On timer finished...
    cTimer.addEventListener('targetAchieved', function (e) {
        //do some animation or play video here...or whatever....
        $('#cdMessage').html('YOU LOSE.......');
        gt_end_lose_audio()
    });    
}

function get_time(){ //clock.getFaceValue not a function...... wtf...
    var time  = clock.getFaceValue();
    return time;
}

function display_message(msg){
    if(msg == '-clear-'){
        $('#cdMessage').html(' ') 
    }
    else{
        $('#cdMessage').css("font-size", "15em")
        if (msg.length > 15 && msg.length < 20){
            $('#cdMessage').css("font-size", "10em")
        }
        if (msg.length > 20 && msg.length < 25){
            $('#cdMessage').css("font-size", "7em")
        }
        if (msg.length > 25){
            $('#cdMessage').css("font-size", "5em")
        }
        $('#cdMessage').html(`${msg}`)
        $('.message').html(`${msg}`)
    }
}


//========================
//Video background stuff
//=======================
var static_video = document.getElementById("static_video");
var intro_video = document.getElementById("intro_video");

// Get the button
var btn = document.getElementById("myBtn");

// Pause and play the video, and change the button text
function myFunction() {
    if (video.paused) {
        video.play();
        btn.innerHTML = "Pause";
    } else {
        video.pause();
        btn.innerHTML = "Play";
    }
}

function play_video(vidId){
    
    // video.src = `${static_video}`
    // $('#myVideo').html(`<source src="${static_video}" type="video/mp4">`)
    $("#videoBg").html(`<video autoplay muted loop id="myVideo">
        <source src="${vid}" type="video/mp4">
    </video>`)
}

function play_intro_video(){

    if (timer_on){
        cTimer.pause()
    }
    $('#countdownExample .values').html("");
    $('#cdMessage').html('');
    $('#countdownExample .values').addClass("hidden_timer")
    $("#videoBg").html(`<video autoplay width="1280px" height="768px" id="static_video">
        <source src="/files/video/intro_small.mp4" type="video/mp4">
    </video>`)
    console.log("playing intro")

    
    setTimeout(play_static_video, timer_start_delay);
}

function play_static_video(){

    $('#countdownExample .values').removeClass("hidden_timer")

    $("#videoBg").html(`<video loop autoplay id="static_video">
        <source src="/files/video/static_small.mp4" type="video/mp4">
    </video>`)

    begin_countdown_timer()

}



//================
// Audio
//================

function gt_play_main_audio(){
    console.log("playing main audio")
    main_audio.play()
    main_audio.loop = true
    main_audio.volume = 0.3
    setTimeout(main_audio_volume, timer_start_delay)
}

function gt_play_congrats_audio(){
    congrats_sound.play()
}

function gt_room_3_audio(){
    main_audio.volume = 0.5
    room_3_audio.play()
}

function gt_play_hint_audio(){
    main_audio.volume = 0.2
    hint_audio.play()
    setTimeout(main_audio_volume, 1000)
}

function gt_end_win_audio(){
    console.log("stopping main audio, playing win audio")
    main_audio.pause()
    end_win_audio.play()
}

function gt_end_lose_audio(){
    end_lose_audio.play()
    main_audio.pause()
}

//return main audio to normal
function main_audio_volume(){
    main_audio.volume = 1.0
}




/////////////////////
////// Test sound //
///////////////////
function Sound(source,volume,loop)
{
    this.source=source;
    this.volume=volume;
    this.loop=loop;
    var son;
    this.son=son;
    this.finish=false;
    this.stop=function()
    {
        document.body.removeChild(this.son);
    }
    this.start=function()
    {
        if(this.finish)return false;
        this.son=document.createElement("embed");
        this.son.setAttribute("src",this.source);
        this.son.setAttribute("hidden","true");
        this.son.setAttribute("volume",this.volume);
        this.son.setAttribute("autostart","true");
        this.son.setAttribute("loop",this.loop);
        document.body.appendChild(this.son);
    }
    this.remove=function()
    {
        document.body.removeChild(this.son);
        this.finish=true;
    }
    this.init=function(volume,loop)
    {
        this.finish=false;
        this.volume=volume;
        this.loop=loop;
    }
}