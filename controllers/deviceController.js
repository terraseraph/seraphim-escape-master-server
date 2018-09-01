"use strict"
const db_functions = require("./db_functions")
const sqlite3 = require('sqlite3').verbose();
const request = require('request');

//TODO: make a socket.io.emit(console.log(function names and results) for borwser..


//====================================================
//====================================================
//==============PI Requests===========================
//====================================================
//====================================================

////////////////////////////////
/// Parse message from rPi ////
//////////////////////////////

exports.parse_message = function(req, res){
    console.log(JSON.parse(req.params.message))
    let db = new sqlite3.Database('database/se.db');
    var message        = JSON.parse(req.params.message)
    var fromId      = message.fromId
    var toId        = message.toId
    var action      = message.action
    var actionType  = message.actionType
    var event       = message.event
    var eventType   = message.eventType
    var time        = new Date()                        //Have the db reflect datetime
    var packetNo    = "null";
    var data = message.data
    var query = (`INSERT INTO message_log (fromId, toId, action, actionType, event, eventType, data, time, packetNo) `+
                 `VALUES  (${fromId},${toId},'${action}','${actionType}','${event}','${eventType}','${data}','${time}','${packetNo}')`)
    db_functions.db_insert(query, function(changes){
        var socket = req.app.get('io');
        console.log("parse_message Insert:"+changes)
        socket.emit('general_update', changes);
        res.send("_+_+_+_+_+_+_++_gotit")  
    })
}

exports.send_action = function(req, response){
    // var data = req.params.data
    var dat = req.body.data
    console.log(dat)
    var socket = req.app.get('io');
    // request({
    //     url: 'http://localhost:3000/force_action',
    //     method: 'POST',
    //     body: dat,
    //     json: true
    //   }, function(error, res, body){
    //     socket.emit('socket_console', res)
    //     console.log("======== Sent to Server ========");
    //   });
    request.get('http://192.168.0.50:5002/force_action/'+JSON.stringify(dat), { json: true }, (err, res, body) => {
        response.send(res)
        socket.emit('socket_console', res)
        if (err) { return console.log(err); }
        console.log("======== Sent to Server ========");
      });
}


//====================================================
//====================================================
//==============Room Config===========================
//====================================================
//====================================================


////////////////////////////////
/// Add room //////////////////
//////////////////////////////

exports.room_add = function(req, res){
    let db = new sqlite3.Database('database/se.db');
    var socket = req.app.get('io');
    var room_name = req.body.room_name;
    var room_address = req.body.room_address;
    db_functions.db_insert("INSERT INTO rooms (name, address) VALUES('"+room_name+"','"+room_address+"')", function(changes){
        console.log("create_puzzle changes:"+changes)
        socket.emit("general_update", changes)
        
    })
    console.log("success: ", room_name)
}


////////////////////////////////
/// Create a puzzle ///////////
//////////////////////////////

exports.create_arduino = function(req, res){
    let db = new sqlite3.Database('database/se.db');
    var socket = req.app.get('io');
    var name = req.body.name;
    var type = req.body.type;
    var location = req.body.location;
    var room_id = req.body.room_id;
    var room_name = req.body.room;
    console.log("device_controller.create_puzzle()", req.body)
    db_functions.db_insert("INSERT INTO arduino ('name', 'type', 'location', 'room_id') VALUES('"+name+"','"+type+"','"+location+"','"+room_id+"')", function(changes){
        console.log("create_puzzle changes:"+changes)
        socket.emit("general_update", changes)
        
    })
    console.log("success: ", name, type, room_name);
}


////////////////////////////////
/// Create a component ////////
//////////////////////////////

exports.create_component = function(req, res){
    console.log("deviceController.create_component()")
    let db = new sqlite3.Database('database/se.db');
    var socket = req.app.get('io');
    var name = req.body.name;
    var arduino = req.body.arduino;
    var action_or_event = req.body.action_or_event;
    var action_event_type = req.body.action_event_type;
    var action_event = req.body.action_event;
    var data = req.body.data;
    db_functions.db_select(`SELECT id FROM arduino WHERE name = '${name}'`, function(arduino_id){
        db_functions.db_insert(`INSERT INTO component (component_type) VALUES ('${action_or_event}'`, function(result, component_id){
            db_functions.db_insert(`INSERT INTO arduino_component (arduino_id, component_id) VALUES ('${arduino_id}', '${component_id}'`, function(result, arduino_component_id){
                console.log(result, arduino_component_id)
            })
            if(action_or_event == 'action'){
                db_functions.db_select(`SELECT id FROM actions where name = '${action_event}'`, function(actions_id){
                    db_functions.db_select(`SELECT id FROM action_types where name = '${action_event_type}'`, function(action_type_id){
                        db_functions.db_insert(`INSERT INTO action_params (action_type_id, action_id, component_id) VALUES ('${action_type_id}', '${actions_id}', '${component_id}')`, function(action_params, a_p_id){
                            console.log("inserted:", action_params)
                        })
                    })
                })
            }
            else if(action_or_event == 'event'){
                db_functions.db_select(`SELECT id FROM events where name = '${action_event}'`, function(event_id){
                    db_functions.db_select(`SELECT id FROM event_types where name = '${action_event_type}'`, function(event_type_id){
                        db_functions.db_insert(`INSERT INTO event_params (event_type_id, event, component_id) VALUES ('${event_type_id}', '${event_id}', '${component_id}')`, function(event_params, e_p_id){
                            console.log("inserted:", event_params)
                        })
                    })
                })
            }
            else{
                console.log("No action or event selected....")
                socket.emit('general_update', "=======No action or event selected======")
            }
        })
    })
    
    console.log("success: ", name, arduino, action_event, data);
}


////////////////////////////////
/// Update a puzzle ///////////
//////////////////////////////
exports.update_device = function(req, res){
    console.log("device_controller.update_device()")
    var socket = req.app.get('io');
    let db = new sqlite3.Database('database/se.db');
    var query = ("UPDATE game_devices "+
                "SET "+
                "name = '"+req.body.name+"', "+
                "type = '"+req.body.type+"', "+
                "room_name = '"+req.body.room_name+"', "+
                "input = '"+req.body.input+"', "+
                "output = '"+req.body.output+"'"+
                "WHERE "+
                "id = "+req.body.id+"")
    console.log("QUERY: ", query)
    db_functions.db_update(query, function(changes){
        socket.emit("general_update", changes)
        console.log("update_device update:"+changes)
    })
    console.log("updated")
}



//gets the details of the device, displays it in "device_details" template with data
exports.get_device_details = function(req, res){
    var socket = req.app.get('io');
    socket.emit('socket_console', "device_controller.get_device_details()")
    console.log("device_controller.get_device_details()")
    let db = new sqlite3.Database('database/se.db');
    let components = [{
        "name" : "test comp name",
        "type" : "test type",
        "ae_type" : "test event",
        "data" : "test data"
    },
    {
        "name" : "test name 22222",
        "type" : "test type 2222",
        "ae_type" : "test action",
        "data" : "data fssierfseifn"
    }]
    db_functions.db_select("SELECT * FROM arduino WHERE id ="+req.params.id+"", function(data){
        res.render('templates/device_details', {device : data[0], components : components})
    })
}


////////////////////////////////////////////////////
//////////REFACTOR BELOW //////////////////////////
//////////////////////////////////////////////////

//for config page currently a get req, probs should be a post...
exports.get_room_arduinos = function(req, res){
    console.log('device_controller.get_room_devices()')
    // var room_name = req.params.room_name;
    var room_id = req.params.room_id;
    console.log("room_id",room_id)
    let db = new sqlite3.Database('database/se.db');
    var devices = []
    var query = ("SELECT * FROM arduino WHERE room_id = "+room_id+"")
    db_functions.db_select(query, function(row){
        row.forEach(function(r){
            devices.push(r)
        })
        console.log(devices)
        res.send(devices)
    })
}

exports.get_rooms = function(req, res){
    console.log("getting rooms..")
    let db = new sqlite3.Database('database/se.db');
    var query = ("SELECT * FROM rooms")
    var rooms =[]
    db_functions.db_select(query, function(row){
        row.forEach(function(r){
            rooms.push(r)
        })
        console.log(rooms)
        res.send(rooms)
    })
    db.close();
}

exports.get_arduinos = function(req, res){
    console.log('getting devices');
    let db = new sqlite3.Database('database/se.db');
    var query = ("SELECT * FROM arduino")
    var devices = []
    db_functions.db_select(query, function(row) {
        row.forEach(function(r){
            devices.push(r)
        })
        console.log(devices)
        res.send(devices)
    })
}


//SOCKET.EMIT SHOULD BE CALLED ON socketScript.js USING JQUERY
exports.device_control = function(req, res) {
    var data        = JSON.parse(req.params.data)
    var fromId      = data.fromId
    var toId        = data.toId
    var action      = data.action
    var actionType  = data.actionType
    var event       = data.event
    var eventType   = data.eventType
    var device_data = data.data;
    console.log(data)
    // var id = data.device_id;
    // var type = data.type;
    // var state = data.state;
    var socket = req.app.get('io');
    var msg = ("device_id: " + fromId + " to id: " + toId + " action: " + action + " aT: " + actionType + " event: " + event + " eventType: " + eventType + " data: " + device_data)
    db_functions.db_insert("INSERT INTO game_status ('device_id', 'status') VALUES("+fromId+", '"+event+"')", function(changes){
        console.log("device_control changes:"+changes)
        socket.emit('general_update', changes);
    });
    console.log("JSON PARSED DATA: "+data);
    console.log("separated values: "+msg);
    
    socket.emit('update', msg);
    socket.emit('game_progress', fromId + " " + event)
    
    res.send("success on server");
};



exports.get_status = function(req, res) {
    let db = new sqlite3.Database('database/se.db');
    var socket = req.app.get('io');
    var query = ("SELECT game_status.device_id, game_status.status, game_devices.name, game_devices.room_name FROM game_status, game_devices WHERE game_status.device_id = game_devices.id")
    var status = []
    db_functions.db_select(query, function(row){
        row.forEach(function(r){
            console.log(r)
        })
        socket.emit("game_progress", row)
        // res.render('templates/sub_templates/game_status_table_body', {device : row})
    })
db.close();
}

//Dump function

function dump(arr,level) {
	var dumped_text = "";
	if(!level) level = 0;

	//The padding given at the beginning of the line.
	var level_padding = "";
	for(var j=0;j<level+1;j++) level_padding += "    ";

	if(typeof(arr) == 'object') { //Array/Hashes/Objects
		for(var item in arr) {
			var value = arr[item];

			if(typeof(value) == 'object') { //If it is an array,
				dumped_text += level_padding + "'" + item + "' ...\n";
				dumped_text += dump(value,level+1);
			} else {
				dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
			}
		}
	} else { //Stings/Chars/Numbers etc.
		dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
	}
	return dumped_text;
}
