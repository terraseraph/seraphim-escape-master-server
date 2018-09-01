"use strict"
/**
 * Used to display the screen in the escape room
 */
const db_functions = require("./db_functions")
const sqlite3 = require('sqlite3').verbose();
const request = require('request');
const device_controller = require('./deviceController')
const game_config = require("../config/config.json");

var c_time
var c_message
var game_state = [] //need to support multiple games....
var c_team_id
var c_team_name = "test team"
var c_room_name = "ex-revenge"
var team_details = {}

//this needs to be better, in a config file or from the databse when creating rooms.
var game_started = {
    "ex-revenge"    : "false",
    "dragon"        : "false",
    "time-machine"  : "false"
}

exports.gc_game_config = function(req, res){
    console.log("sending game config", game_config)
    res.send(game_config)
}

exports.gc_get_current_time = function(){
    return c_time
}

exports.gc_get_current_message = function(){
    return c_message
}

exports.gc_get_current_game_state = function(){
    return game_state
}

exports.gc_get_current_team = function(){
    return team_details
}

exports.start_timer = function(req, res){
    console.log("game_controller.start_timer()")
    var socket = req.app.get('io');
    socket.emit("general_update", changes)
    console.log("updated")
}

exports.gc_current_game_state = function(req, res){
    var socket = req.app.get('io');
    var evt = JSON.parse(req.params.event)
    switch (evt.state) {
        case "start_game":
            socket.emit("gc_play_main_audio", "playing main audio")
            socket.emit("gs_start_game", "starting game from event")
            game_state.length = 0
            break;
        case "end_game":
            console.log("============End game==========")
            socket.emit('gs_end_game', "Game ending")
            socket.emit("gc_play_win_audio", "playing win audio")
            break;
        default:
            socket.emit("gc_play_congrats_audio", "playing congrats audio")
            break;
    }
    var dat = {
        room_name   : req.params.event,
        event       : evt,
        time        : c_time
    }
    console.log("CURRENT GAME STATE", dat)
    game_state.push(dat)
    socket.emit('gc_game_state_updated', dat)
    res.send(dat)
}

exports.gc_save_team_details = function(req,res){
    var p = req.params
    team_details.team_name  = p.team_name
    team_details.members    = p.members
    team_details.email      = p.email
}

//begin the game here
exports.gc_start_game = function(req, res){
    // game_started.req.params.room_name = "true"
    //Reset game states and stuff..
    game_state = [];
    team_details = {}
    res.send('game started')
}

//end game here.
exports.gc_end_game = function(req, res){
    // game_started.req.params.room_name = "false"
    //save game stats to database.
    let db = new sqlite3.Database('database/se.db');
    var socket = req.app.get('io');
        db_functions.db_insert(`INSERT INTO teams (team_name, room_name) VALUES ('${c_team_name}', '${c_room_name}')`, function(action_params, t_id){
            console.log("inserted:", action_params)
            //foreach event in time insert a row
            for(var i = 0;i < game_state.length ; i ++){
                var puzzle_name = game_state[i].event.name
                var time = game_state[i].time
                var team_id = t_id
                db_functions.db_insert(`INSERT INTO team_times (puzzle_name, time, team_id) VALUES ('${puzzle_name}','${time}','${team_id}')`, function(data, insert_id){
                    console.log("Inserted: ", data)
                })
            }
            // socket.emit("game_progress", row)
        })
   db.close();
   res.send('game ended')
   game_state = [];
   team_details = {}
   socket.emit("gc_play_congrats_audio", "playing congrats audio")
}


//gets the details of the device, displays it in "device_details" template with data
exports.render_game_screen = function(req, res){  
    res.render('templates/game_timer')
}

exports.gc_stop_timer = function(req, res){  
    var socket = req.app.get('io');
    socket.emit('gc_timer_control', "stop_timer");
    res.send('timer stopped')
}

exports.gc_start_timer = function(req, res){  
    var socket = req.app.get('io');
    socket.emit('gc_timer_control', "start_timer");
    res.send('timer started')
}

exports.gs_start_game = function(req, res){
    var socket = req.app.get('io');
    game_state.length = 0;
    team_details = {}
    socket.emit('gs_start_game', "start game and play video")
    console.log("====Starting Game======")
    res.send("start game and play video")
}

exports.gc_start_custom_timer = function(req,res){
    var time = {
        hours : req.params.hours,
        minutes : req.params.minutes,
        seconds : req.params.seconds
    }
    console.log(time)
    var socket = req.app.get('io');
    socket.emit('gc_start_custom_timer', time);
    res.send(time)
}

exports.gc_reset_timer = function(req, res){  
    var socket = req.app.get('io');
    socket.emit('gc_timer_control', "reset_timer");
    res.send('timer reset')
}


exports.gc_display_message = function(req, res){  
    var socket = req.app.get('io');
    socket.emit('gc_display_message', req.params.message);
    c_message = req.params.message;
    res.send('timer started')
}

exports.gc_emit_time = function(req, res){
    var socket = req.app.get('io');
    var time  = req.params.time
    var room_name = req.params.room_name
    var msg = {
        room_name : room_name,
        time      : time
    }
    socket.emit('gc_emit_time', msg);
    c_time = time;
    console.log(c_time)
    res.send(msg)
}

exports.gc_play_main_audio = function(req, res){
    var socket = req.app.get('io');
    socket.emit('gc_play_main_audio', "huehue");
    res.send('Playing Main Audio')
}

exports.gc_play_congrats_audio = function(req, res){
    var socket = req.app.get('io');
    socket.emit('gc_play_congrats_audio', "huehue");
    res.send('Playing congrats Audio')
}

exports.gc_play_hint_audio = function(req, res){
    var socket = req.app.get('io');
    socket.emit('gc_play_hint_audio', "huehue");
    res.send('Playing hint Audio')
}

exports.gc_refresh_window = function(req, res){
    var socket = req.app.get('io');
    socket.emit("gc_refresh_window", "Reloading window")
    console.log("Reloading game timer window")
    res.send("Reloading game screen...")
}

exports.gc_current_time = function(req, res){
    let db = new sqlite3.Database('database/se.db');
    var socket = req.app.get('io');
    var room_name = req.params.room_name;
    var time = req.params.time;
    db_functions.db_insert("INSERT INTO rooms (name, address) VALUES('"+room_name+"','"+room_address+"')", function(changes){
        console.log("create_puzzle changes:"+changes)
        socket.emit("general_update", changes)
        
    })
    console.log("success: ", room_name)
}