"use strict"
var express     = require('express');
var router      = express.Router();
var app         = express();
var sqlite3     = require('sqlite3').verbose();
var http        = require('http').Server(app);
var server      = require("../app.js").app;
var db          = new sqlite3.Database('database/se.db');

//Controllers
var device_controller   = require('../controllers/deviceController');
var navigation          = require('../controllers/navigation');
var game_script         = require('../controllers/game_script')
var game_controller     = require('../controllers/game_controller')
var stats_controller    = require('../controllers/stats_controller')

var lusers=[
             { name: 'sdsdsds', so: 'sadsad' },
             { name: 'asdasd asdasdasd', so: 'asdasdweee dde' }
            ];

// -------------------------
// -----Controller routes --
// -------------------------

//get requests are working, stringify on other end then parse for values here.....
router.get('/messages/:message', device_controller.parse_message)

router.get('/device/:data', device_controller.device_control);

router.get("/status/all", device_controller.get_status);

router.get('/get/rooms', device_controller.get_rooms);

router.get("/status/game_state/:event", game_controller.gc_current_game_state);

router.get('/get/devices', device_controller.get_arduinos);

router.get('/start_game', game_controller.gc_start_game)

router.get('/end_game', game_controller.gc_end_game)

router.get('/gc_get_config', game_controller.gc_game_config)

router.post("/update/device", device_controller.update_device);

router.post('/send_action', device_controller.send_action);

//----

router.post('/gc_current_time/:room_name/:time', game_controller.gc_current_time)

// --------------------------
// ----- Device info routes -
// --------------------------

router.get('/get/devices/:room_id', device_controller.get_room_arduinos)

router.get('/get/device_details/:id', device_controller.get_device_details);


// --------------------------
// ----- Game screen Routes -
// --------------------------
 router.get('/render_game_screen', game_controller.render_game_screen)
 
 router.get('/gc_stop_timer', game_controller.gc_stop_timer)
 
 router.get('/gc_start_timer', game_controller.gc_start_timer)

 router.get('/gc_reset_timer', game_controller.gc_reset_timer)

 router.get('/gc_display_message/:message', game_controller.gc_display_message)

 router.get('/gc_start_custom_timer/:hours/:minutes/:seconds', game_controller.gc_start_custom_timer)

 router.get('/gc_emit_time/:room_name/:time', game_controller.gc_emit_time)

 router.get('/gs_start_game', game_controller.gs_start_game)

 router.get('/gc_play_main_audio', game_controller.gc_play_main_audio)

 router.get('/gc_play_congrats_audio', game_controller.gc_play_congrats_audio)

 router.get('/gc_play_hint_audio', game_controller.gc_play_hint_audio)

 router.get('/gc_refresh_window', game_controller.gc_refresh_window)



 // --------------------------
// ----- Game Overview -------
// --------------------------

router.get('/gc_save_team_details/:team_name/:members/:email', game_controller.gc_save_team_details)



// -------------------------
// ----- Save data routes --
// -------------------------
router.post('/save/create_component', device_controller.create_component)

router.post('/save/create_arduino', device_controller.create_arduino)

router.post('/save/room', device_controller.room_add);



// -------------------------
// -----Menu Routes --------
// -------------------------
router.get('/settings', navigation.settings)

router.get('/home', navigation.home)

router.get('/configure_games', navigation.configure_games)

router.get('/message_log', navigation.message_log)

router.get('/game_overview', navigation.game_overview)

router.get('/game_script', navigation.game_script)


// --------------------------
// ----- Game Script Routs --
// --------------------------

router.get('/gs_rooms', game_script.get_rooms)

router.get('/gs_event_action/:room_name', game_script.get_event_action)

router.get('/gs_edit_event_action/:name/:event_action/:room_name', game_script.edit_event_action)

router.get('/gs_json', game_script.get_json)

// router.get('/gs_add_script/:script', game_script.gs_add_script)

router.post('/gs_edit_script', game_script.gs_edit_script)

router.post('/gs_add_to_script', game_script.gs_add_to_script)

// ------------------------
// ----- Stats Controller --
// ------------------------
router.get('/sc_get_team_stats', stats_controller.sc_get_team_times)



// -------------------------
// -----Old Routes ---------
// -------------------------
//test route, returns id value after '/'.
router.get('/', function (req, res, next) {
  res.render('index', {title: 'ppsss', lusers: lusers})
})

router.get('/:id', function (req, res, next) {
    var id = req.params.id;
    console.log("id: "+id)
  res.render('index', {title: 'ppsss', lusers: lusers, vals: id})
})



router.get('/game/start', function(req, res){
    var data = {
        start : "start game"
    }
    res.json(data);
})

router.post('/device/', function(req, res){
    var data = {
    name: req.body.name + " faget",
    time: req.body.time + " slow!",
    other: req.body.other
    }
    console.log("dat rec parse: " + JSON.parse(data));
    console.log("dat rec : " + data);
    res.send(data);
    var socket = req.app.get('io');
    socket.emit('update', data);
    
})

router.post('/about', function (req, res) {
    var dat = req.body;
    console.log("dat: "+res);
    res.send('About this wiki');
    server.update_send(req + "rec")
})


module.exports = router;
