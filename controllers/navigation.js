"use strict"
const db_functions = require("./db_functions")
const sqlite3 = require('sqlite3').verbose();
const game_controller = require('./game_controller')
const game_script_controller = require('./game_script')
const $ = require('jquery')


//Use param to get the room name in future
var game_script = game_script_controller.get_script()


exports.message_log = function(req, res){
    let db = new sqlite3.Database('database/se.db');
    var socket = req.app.get('io');
    var query = (`SELECT * FROM message_log ORDER BY id desc`)
    db_functions.db_select(query, function(result){
        res.render('templates/message_log', {message_log : result})
    })
}

exports.settings = function(req, res){
    res.render('settings');
}

exports.configure_games = function(req, res){
    res.render('configure_games');
}

exports.home = function(req, res){
    res.render('home');
}

exports.game_overview = function(req, res, next){
    let lo_game_state = JSON.stringify(game_controller.gc_get_current_game_state())
    let lo_current_team = JSON.stringify(game_controller.gc_get_current_team())
    console.log('==== GAME OVERVIEW ====')
    create_overview(function(events){
        console.log("===== Game state ==== ", lo_game_state)
        res.render("templates/game_overview",
        {
            events : events, 
            time : game_controller.gc_get_current_time,
            message : game_controller.gc_get_current_message,
            game_state : lo_game_state,
            team_details : lo_current_team
        })
    })
}

exports.game_script = function(req, res){
    var rooms = game_script_controller.get_all_scripts()
    //put the mustache logic here, its onstead going to a script
    res.render('game_script',{rooms:rooms})
}

function create_overview(callback){
    var events = new Array()
        var script = game_script_controller.get_script()
        var evts = game_script_controller.get_script().events
        console.log(evts, "EVENTS", evts.length)
            for (var j = 0 ; j < evts.length ; j++){
                let evt = evts[j]
                var evt_arr = {
                    "masterId"      : script.masterId,
                    "event_id"      : evt.id,
                    "name"          : evt.name,
                    "device_id"     : evt.device_id,
                    "event"         : evt.event,
                    "eventType"     : evt.eventType,
                    "data"          : evt.data,
                    "description"   : evt.description,
                    "dependencies"  : evt.dependencies,
                    "act_arr"       : []
                }
                console.log(evt_arr)
                console.log(evt)
                for (var k = 0; k < evt.actions.length; k++){
                    // console.log(evt.actions)
                    for(var x = 0; x < script.actions.length;x++){
                        if (script.actions[x].name == evt.actions[k]){
                            // console.log("ACTION FOUND====", game_script.actions[x].name)
                            let act = script.actions[x]
                            evt_arr.act_arr.push(act)
                            // console.log("=== action arr == ", act)
                        }
                    }
                }
                // evt_arr.act_str = JSON.stringify(act_arr)
                events.push(evt_arr)
            }
    callback(events)
}