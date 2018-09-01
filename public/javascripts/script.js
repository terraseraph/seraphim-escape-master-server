/*global $*/
// REFACTOR ALL DOM APPENDS TO USE MUSTACHE TEMPLATES..(ones that are big and loop)
var local_url = `http://localhost:5001/`
var pi_server = "http://192.168.0.50:5002/"
var temp_room_name
var temp_event_count
var temp_action_count


$(document).ready(function() {
    console.log("doc ready")
        
    $.getJSON("config.json", function (data) {
        room_name = data.room_name
        pi_server = data.server_url
        console.log("Got game config", data)
    });

})


function menu_load(page){
    $.get("/"+page+"", function(data, status){
        $("#content").html(data)
        console.log(page, status)
    });
}



//device_controller.status_updates()
function get_all_status(){
    $.get("/status/updates", function(data, status){
        $('#game_status').html(data)
        // console.log(data, status)
        
    })
}

//device_controller.get_devices()
function get_all_devices(){
    console.log("getting devices")
    $.get('/get/devices', function(data, status){
        data.forEach(function(dat){
            $("#all_devices").append($('<button>').addClass('btn btn-default').attr('id', 'device_'+dat.id).text(dat.name+":"+dat.type))
            $("#all_devices").append($("<br>"))
            console.log("devices: ", data)
        })
    })
}

//Make this a route through a controller or something...
function send_device_action(fromId, toId, action, actionType, event, eventType, data, name){
    var acknowledge = {
      fromId: fromId,
      toId : toId,
      action : action,
      actionType : actionType,
      event : event,
      eventType : eventType,
      data : data,
      name : name
    }
    console.log("====SENDING DEVICE MESSAGE=====", acknowledge)
    var dat = JSON.stringify(acknowledge)
    $.get(pi_server+"force_action/"+acknowledge, function(data, status){
        console.log(status)
        console.log(data)
    })
    console.log("sent:"+ JSON.stringify(acknowledge))
}


function send_device_event(name){
    console.log("sending")
    console.log("====SENDING DEVICE MESSAGE=====", name)
    $.get(pi_server+"force_event/"+name, function(data, status){
        console.log(status)
        console.log(data)
    })
    console.log("sent:"+ JSON.stringify(name))
}



function create_room(){
    var room_name = $('#add_room_name').val();
    var room_address = $('#add_room_address').val();
    $.post(
        '/save/room',
        {
            room_name : room_name,
            room_address: room_address
        },
        function(res){
            console.log(res)
        }
        
    )
}

//populates the options field in create puzzle
function create_puzzle_select_room(){
    $.get("/get/rooms", function(data, status){
        data.forEach(function(dat){
            var id = dat.id
            var name = dat.name
            console.log(dat.name)
            var option = "<option value="+dat.id+" room-id='"+id+"'>"+dat.name+"</option>";
            $("#create_puzzle_select_room").append(option)
        })
    })
}

function create_puzzle_save(){
    var create_puzzle_name = $("#create_puzzle_name").val();
    var create_puzzle_type =$("#create_puzzle_type").val();
    var create_puzzle_location =$("#create_puzzle_location").val();
    var create_puzzle_select_room = $("#create_puzzle_select_room").val();
    // var create_puzzle_select_room = 1 //TODO make this popualted later
    var data = {
        name : create_puzzle_name,
        type : create_puzzle_type,
        room_id : create_puzzle_select_room,
        location : create_puzzle_location
    }
    $.post(
        "/save/create_arduino",
        data,
        function(res){
            console.log(res)
        },
        "json"
        )
    
}

function create_component_save(){
    var create_component_name = $("#create_component_name").val();
    var create_component_select_arduino =$("#create_component_select_arduino").val();
    var create_component_action_or_event =$("#create_component_action_or_event").val();
    var create_component_action_event_type = $("#create_component_action_event_type").val();
    var create_component_action_event = $("#create_component_action_event").val();
    var create_component_data = $("#create_component_data").val();
    var data = {
        name                : create_component_name,
        arduino             : create_component_select_arduino,
        action_or_event     : create_component_action_or_event,
        action_event_type   : create_component_action_event_type,
        action_event        : create_component_action_event,
        data                : create_component_data
    }
    $.post(
        "/save/create_component",
        data,
        function(res){
            console.log(res)
        },
        "json"
        )
    
}


//---------------------------------------
// ---------GAME SCRIPT------------------
//---------------------------------------
//=======================================

//Depricated
function get_rooms_from_game_script(){
    $.get('/gs_rooms', function(data){
        $("#room_list").append($('<button>').addClass('btn btn-span').attr('id', 'room_'+data).attr('onclick', "get_event_action_from_game_script()").text(data))
        $("#room_list").append($("<br>"))  
    })
}

function get_event_action_from_game_script(room_name){
    $.get('/gs_event_action/'+room_name, function(data){
        $("#device_list").html('')
        temp_event_count = data[0].length
        temp_action_count = data[1].length
        console.log(data)
        $("#device_list").append('<h3>Events:</h3>')
        data[0].forEach(function(dat){
            $("#device_list").append($('<button>').addClass('btn btn-block').attr('id', "device_"+dat).attr(`onclick`, `edit_event_action('${dat}', 'events', '${room_name}')`).text(`${dat}`))
            $("#device_list").append($("<br>"))
        })
        $("#device_list").append($("<hr>"))
        $("#device_list").append('<h3>Actions:</h3>')
        data[1].forEach(function(dat){
            $("#device_list").append($('<button>').addClass('btn btn-block').attr('id', "device_"+dat).attr(`onclick`, `edit_event_action('${dat}', 'actions', '${room_name}')`).text(dat))
            $("#device_list").append($("<br>"))
        }) 
    })
}

function edit_event_action(name, event_action, room_name){
    temp_room_name = room_name
    console.log(`/gs_edit_event_action/${name}/event_action/${event_action}/${room_name}`)
    $.get(`/gs_edit_event_action/${name}/${event_action}/${room_name}`, function(data){
        console.log("returned the data")
        $("#device_details").empty();
        $("#device_details").html(data)

        ///below seems not needed, going into template....
        console.log("data.data = ", data.data)
        if(event_action == 'actions'){
            $("#gs_event_action_type").attr("value", `${data.actionType}`)
        }
        else{
            $("#gs_event_action_type").attr("value", `${data.eventType}`)
        }
        /////////////////
        if(event_action == 'actions'){
            $("#gs_event_action").attr("value", `${data.action}`)
        }
        else{
            $("#gs_event_action").attr("value", `${data.event}`)
        }
        $("#gs_event_action_name").attr("value", data.name)
        $("#gs_data").attr("value", data.data)
    })
}

function add_to_game_script(event_action){
    script_builder_helper(event_action, null, function(data){
        $.ajax({
            url: `${local_url}gs_add_to_script`, 
            type: 'POST', 
            contentType: 'application/json',
            data: data,
            success : console.log
        })        
    })
    $.get(`${local_url}gs_add_script/${script}`)
}

function edit_game_script(event_action, e_a_id){
    script_builder_helper(event_action, e_a_id, function(dat){
        $.ajax({
            url: `${local_url}gs_edit_script`, 
            type: 'POST', 
            contentType: 'application/json',
            data: dat,
            success : console.log
        })
    })

}

function script_builder_helper(event_action, add_edit_id = null, callback){
    var id
    var event, eventType, action, actionType
    if(event_action == 'events'){
        if(add_edit_id == null){
            id = temp_event_count+1
        }
        else{
            id = add_edit_id
        }
        event = $('#gs_event_type_event').val().split('/')[1]
        eventType = $('#gs_event_type_event').val().split('/')[0]
        action = "noneA"
        actionType = "noneAT"
    }
    else{   
        if(add_edit_id == null){
            id = temp_action_count+1
        }
        else{
            id = add_edit_id
        }
        action = $('#gs_action_type_action').val().split('/')[1]
        actionType = $('#gs_action_type_action').val().split('/')[0]
        event = "noneE"
        eventType = "noneET"
    }
    var dependencies = $('#gs_dependencies').val()
    dependencies = dependencies.replace(" ", "")
    dependencies  = dependencies.split(',')

    var actions = $('#gs_actions').val()
    actions = actions.replace(' ', '')
    actions = actions.split(',')
    
    var data = $('#gs_data').val()
    data = data.replace(' ', '')
    data = data.split(',')

    console.log(action, actionType, event, eventType)

    var data = {
        "id"            :   id,
        "name"          :   $('#gs_event_action_name').val(),
        "device_id"     :   $('#gs_device_id').val(),
        "event"         :   event,
        "eventType"     :   eventType,
        "action"        :   action,
        "actionType"    :   actionType,
        "data"          :   data,
        "description"   :   $('#gs_description').val(),
        "dependencies"  :   dependencies,
        "actions"       :   actions,
        "can_toggle"    :   $('#gs_can_toggle').val(),
        "message"       :   $('#gs_select_room_name').val(),
        "state"         :   $('#gs_state').val(),
        "room_name"     :   temp_room_name,
        "evt_act"       :   event_action
    }
    data = JSON.stringify(data)
    callback(data)
}


//---------------------------------------
// ---------GAME OVERVIEW----------------
//---------------------------------------
//=======================================

function go_save_team_details(){
    var team_name = $('#team_details_team_name').val();
    var members = $('#team_details_members').val();
    var email = $('#team_details_email').val();
    $.get(`${local_url}gc_save_team_details/${team_name}/${members}/${email}`)
}

//send a message to the game timer screen TODO: add param for room name
function send_game_message(){
    var msg = $('#message_input').val();
    console.log($('#message_input').val())
    $.get(`${local_url}gc_display_message/${msg}`)
    $('#overview_message').html("<h4>Message displayed: </h4>"+msg);
}

function clear_game_message(){
    $.get(`${local_url}gc_display_message/-clear-`)
    $('#message_input').val('');
    $('#overview_message').html('');
}

function gs_start_game(){
    $.get(`${local_url}gs_start_game`, function(data){
        console.log(data)
    })
}

function gc_end_game(){
    console.log("====ENDING GAME=====")
    gc_stop_timer()
    $.get(`${local_url}end_game`)
}

function gc_start_custom_timer(){
    var hours = $('#timer_duration_hours').val()
    var minutes = $('#timer_duration_minutes').val()
    var seconds = $('#timer_duration_seconds').val()
    if(hours == '') {hours = 0}
    if(minutes == '') {minutes = 0}
    if(seconds == '') {seconds = 0}
    $.get(`${local_url}gc_start_custom_timer/${hours}/${minutes}/${seconds}`)
}

//Loads the game states when the game pverview screen is on, called from game_overview.mustache
function go_check_game_state(game_states){
    console.log("game_states: ", game_states)
    for (var i = 0 ; i < game_states.length ; i++){
        $('#event_status_'+game_states[i].event.id).html('Complete')
        $('#time_completed_'+game_states[i].event.id).html(game_states[i].time)
    }
}

function new_game_state(game_states){
    var evts_class = $(".evt_status")
    console.log("game_states: ", game_states)
    for (var i = 0 ; i < evts_class.length ; i++){
        $('#event_status_'+game_states[i].event.id).html('INCOMPLETE')
        $('#time_completed_'+game_states[i].event.id).html('--')
    }
}

function gc_stop_timer(){
    $.get(`${local_url}gc_stop_timer`)
}


function gc_refresh_window(){
    $.get(`${local_url}gc_refresh_window`, console.log)
}
//=================
//==== AUDIO ======
//=================

function gc_play_main_audio(){
    $.get(`${local_url}gc_play_main_audio`)
}

function gc_play_congrats_audio(){
    $.get(`${local_url}gc_play_congrats_audio`)
}

function gc_play_hint_audio(){
    $.get(`${local_url}gc_play_hint_audio`)
}
//---------------------------------------
// ---------CONFIG PAGE------------------
//---------------------------------------
//=======================================

//populates the rooms on the config page
//NEED TO CHANGE THE SEARCH FROM NAME TO ID
function get_rooms_config(){
    console.log("get_rooms_config()")
    $.get("/get/rooms", function(data, status){
        data.forEach(function(dat){
            var id = dat.id
            var name = dat.name
            console.log(dat.name)
            $("#room_list").append($('<button>').addClass('btn btn-span').attr('id', 'room_'+id).attr('onclick', "get_room_devices('"+id+"')").text(name))
            $("#room_list").append($("<br>"))
        })
    })
}

//device_controller.get_room_arduinos(room_name)
// populates config page for selected room CHANGE TO ARDUINO
function get_room_devices(room_id){
    $("#device_list").empty(); //maybe fix this later, if you click fast enough it combines queries.
    console.log("get_room_devices('"+room_id+"')")
    $.get("/get/devices/"+room_id+"", function(data, status){
        data.forEach(function(dat){
            $("#device_list").append($('<button>').addClass('btn btn-default').attr('id', "device_"+dat.id).attr("onclick", "get_device_details('"+dat.id+"')").text(dat.name+":"+dat.type))
            $("#device_list").append($("<br>"))
        })
    })
}

// populates the config page device details col
function get_device_details(id){
    console.log("get_all_devices("+id+")")
    console.log("get_device_details("+id+")")
    $("#device_details").empty();
    $.get("/get/device_details/"+id+"", function (data, status){
        $("#device_details").html(data)
    })
}

function update_device(){
    $.post(
        "/update/device",
        {
            id : $("#device_id").text(),
            name : $("#update_name").val(),
            room_name : $("#update_room").val(),
            type : $("#update_type").val(),
            input : $("#update_input").val(),
            output : $("#update_output").val()
        },
        function(res){
            console.log("success: "+ res) //add here a socket "device updated" message
        },
        "json"
        )
}


//---------------------------------------
// ---------EVENTS-----------------------
//---------------------------------------
//=======================================