"use strict"
/**
 * Used to display the screen in the escape room
 */
const db_functions = require("./db_functions")
const sqlite3 = require('sqlite3').verbose();
const request = require('request');
const device_controller = require('./deviceController')


exports.start_timer = function(req, res){
    console.log("game_controller.start_timer()")
    var socket = req.app.get('io');
    socket.emit("general_update", changes)
    console.log("updated")
}


exports.sc_get_team_times = function(req, res){
    var socket = req.app.get('io');
    socket.emit('socket_console', "device_controller.get_device_details()")
    console.log("device_controller.get_device_details()")
    let db = new sqlite3.Database('database/se.db');
    db_functions.db_select(`SELECT * FROM teams, team_times WHERE teams.id = team_times.team_id ORDER BY id desc`, function(data){
        res.render('templates/team_history', {teams : data})
        console.log(data)
    })
}