"use strict"
const db_functions = require("./db_functions")
const sqlite3 = require('sqlite3').verbose();
const request = require('request');
const jsonfile = require('jsonfile')
const fs = require('fs')

const game_script_dir = './public/javascripts/game_scripts/'
var game_script_list = []
/**
 * Read Json file
 */
var game_script_json = jsonfile.readFileSync(game_script_dir+'ex-revenge.json')
get_all_scripts()

exports.gs_add_to_script = function(req, res){
    var script = req.body
    var room_name = req.body.room_name
    append_to_existing_script(script, room_name)
}

exports.gs_edit_script = function(req, res){
    console.log("====EDITING SCRIPT====")
    var data = req.body
    var filename = req.body.room_name
    var evt_act = req.body.evt_act
    console.log(data)
    edit_existing_script(data, filename, evt_act, function(dat){
        res.send(dat)
    })
}


exports.get_rooms = function(req, res){
    res.send(game_script_json.name)
}


exports.get_event_action = function(req, res){
    var room_name = req.params.room_name
    console.log("Room", room_name)
    populate_event_action(room_name, function(result){
        res.send(result)
    })
}

exports.edit_event_action = function(req, res){
    console.log("edit_event_action()")
    var name = req.params.name
    var event_action = req.params.event_action
    var room_name = req.params.room_name
    console.log(name, event_action)
    lo_get_event_action(name, event_action, room_name, function(result){
        result.event_action = event_action
        //add action edit and event edit to make differing pages
        if(event_action == 'events'){
            res.render('templates/sub_templates/script_edit_events', {data : result})
        }
        else{
            res.render('templates/sub_templates/script_edit_actions', {data : result})
        }
    })
}

exports.get_json = function(req, res){
    //put a param to get the room name
    res.send(game_script_json)
}


exports.get_script = function(name = 'ex-revenge'){
    for(var i=0; i<game_script_list.length; i++){
        if (game_script_list[i].name == name){
            return game_script_json
        }
    }
}

exports.get_all_scripts = function(){
    return game_script_list
}

function get_all_scripts(){
    fs.readdir(game_script_dir, function(err, items) {
        for (var i=0; i<items.length; i++) {
            game_script_list.push(jsonfile.readFileSync(game_script_dir+items[i]))
        }
        console.log("COUNT GAME SCRIPTS", game_script_list.length)
    });
}


function populate_rooms(script, callback){
    var game_list = new Array
    for (var i = 0; i < game_script_json.length; i++){
        game_list.push(game_script_json[i].name)
    }
    callback(game_list)
}

function populate_event_action(room_name, callback){
    var script = jsonfile.readFileSync(game_script_dir+room_name+'.json')
    var events_arr = new Array
    var actions_arr = new Array
    var res_arr = new Array
    for (var i = 0; i < script.events.length;i++){
        events_arr.push(script.events[i].name)
    }
    for (var i = 0; i < script.actions.length;i++){
        actions_arr.push(script.actions[i].name)
    }
    console.log("==events===",events_arr)
    res_arr.push(events_arr)
    res_arr.push(actions_arr)
    callback(res_arr)
}

//save a new script
function save_new_script(script_to_save, filename){
    var file = game_script_dir+filename+'.json'
    jsonfile.writeFileSync(filename, script_to_save, {spaces: 2})
}

//append to existing script
function append_to_existing_script(data, filename){
    var file = game_script_dir+filename+'.json'
    jsonfile.writeFile(filename, data, {flag: 'a', spaces: 2}, function (err) {
    console.error(err)
    })
}

//edit an existing script
function edit_existing_script(data, filename, evt_act, callback){
    var file_str = game_script_dir+filename+'.json'
    console.log("EDITING EXISTING", file_str, data)
    // var file = require(file_str);
    var file = jsonfile.readFileSync(game_script_dir+filename+'.json')
    // console.log(file)
        for (var i = 0; i < file[`${evt_act}`].length;i++){
            console.log(data.id)
            if(file[`${evt_act}`][i].id == data.id){
                file[`${evt_act}`][i].name = data.name
                file[`${evt_act}`][i].event = data.event
                file[`${evt_act}`][i].eventType = data.eventType
                file[`${evt_act}`][i].action = data.action
                file[`${evt_act}`][i].actionType = data.actionType
                file[`${evt_act}`][i].data = data.data
                file[`${evt_act}`][i].description = data.description
                file[`${evt_act}`][i].can_toggle = data.can_toggle
                file[`${evt_act}`][i].message = data.message
                file[`${evt_act}`][i].actions = data.actions
                file[`${evt_act}`][i].dependencies = data.dependencies
                console.log(file)
            }
        }
    jsonfile.writeFile(file_str, file, {spaces: 2}, function (err) {
        console.error(err)
        console.log("written")
        // callback("Edited: ", filename, JSON.stringify(file, null, 2))
    })
    // fs.writeFile(file_str, JSON.stringify(file, null, 2), function (err) {
    // if (err) return console.log(err);
    // console.log(JSON.stringify(file));
    // // console.log('writing to ' + filename);
    // });
}


function lo_get_event_action(name, event_action, room_name, callback){
    var res_arr = new Array
    var script = jsonfile.readFileSync(game_script_dir+room_name+'.json')
    console.log(script)
    console.log("=====================", name, event_action, room_name)
    if(event_action == "actions"){
        for(var i = 0; i < script.actions.length;i++){
            console.log(i)
            if (script.actions[i].name == name){
                console.log("lo_get_event_action", name, event_action)
                res_arr.push(script.actions[i])
                callback(res_arr)
            }
        }
    }
    else{
        for(var i = 0; i < script.events.length;i++){
            if (script.events[i].name == name){
                console.log("lo_get_event_action", name, event_action)
                res_arr.push(script.events[i])
                console.log("lo_get_v_a()",res_arr)
                callback(res_arr)
            }
        }
    }
}