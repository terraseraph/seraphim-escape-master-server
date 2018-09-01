/*global $, io*/
		//All of these emits should come from the controller
		var local_url = `http://localhost:5001/`;

	  $(function () {
	    var socket = io();
	    
	    //-----------------------------------
	    //--------SOCKET EMIT----------------
	    //-----------------------------------
	    
	    //to be used to communicate with room? might actually have to be an ajax get to the pi's
	    $('form').submit(function(){
	      socket.emit('chat message', $('#m').val());
	      $('#m').val('');
	      return false;
	    });
	    
	    //-----------------------------------
	    //--------SOCKET RECEIVE-------------
	    //-----------------------------------
	    
	    //incoming message
	    socket.on('chat message', function(msg){
	      $('#messages').append($('<li>').text(msg));
	    });
	    
	    //sidebar update message
	    socket.on('general_update', function(msg){
	      $('#db_updates').append($('<li>').text(msg));
	    });
	    
	    //update feed
	    socket.on('update', function(msg){
	      $('#updates').append($('<li>').text(msg));
	    });
	    
	    //console log
	    socket.on('socket_console', function(msg){
	      console.log("socketscript: ", msg)
	    });
	    
	    socket.on('game_progress', function(msg){
				console.log(msg)
	    	var room_name = msg.room_name;
	    	var device_id = msg.device_id;
	    	var status = msg.status;
	    	var device_name = msg.device_name;
	    	$("#device_id"+device_id).html("<p>"+device_name+" : "+status+"</p>")
	    })
	    
	    //device or game status, thinking for letting me know if the device has been activated
	    socket.on("game_progress", function(msg){
	    	var device_id = msg.device_id;
	    	var status = msg.status;
	    	console.log("socket.game_progress: ", device_id, status)
	    	//some get req here to fetch updated junk and display
	    	$('#game_status').empty()
	    	msg.forEach(function(row){
	    		row = JSON.stringify(row)
	    		//change this to request a mustache template
	    		$('#game_status').append($('<button>').addClass('btn btn-lg btn-success').text('device '+ row))
	    		$('#game_status').append($('<br>'))
	    	})
			})
			
			
			//-----------------------------------
	    //--------GAME OVERVIEW EVENTS-------
			//-----------------------------------

			socket.on('gc_game_state_updated', function(game_states){
				console.log("Game States: ", game_states)
				$('#event_status_'+game_states.event.id).html('Complete')
        $('#time_completed_'+game_states.event.id).html(game_states.time)
			})


			//-----------------------------------
	    //--------GAME SCREEN EVENTS---------
			//-----------------------------------
			socket.on('gc_timer_control', function(msg){
	      timer_control(msg)
	    });

			socket.on('gc_display_message', function(msg){
	      display_message(msg)
			});			
			
			socket.on('gc_start_custom_timer', function(msg){
				console.log(msg)
				// play_intro_video();
	      begin_countdown_timer(msg)
			});	

			socket.on('gc_emit_time', function(msg){
				$('#overview_timer').html("<h4>Time remaining: </h4>"+msg.time)
			})

			socket.on('gc_play_main_audio', function(msg){
				console.log(msg)
				gt_play_main_audio()
			})

			socket.on('gc_play_congrats_audio', function(msg){
				console.log(msg)
				gt_play_congrats_audio()
			})
			
			socket.on('gc_play_hint_audio', function(msg){
				console.log(msg)
				gt_play_hint_audio()
			})

			socket.on('gc_play_win_audio', function(msg){
				console.log(msg)
				gt_end_win_audio()
			})

			socket.on('gs_start_game', function(msg){
				console.log(msg)
				play_intro_video();
			})
			
			socket.on('gs_end_game', function(msg){
				console.log("======ENDING GAME=====")
				console.log(msg)
				gt_end_win_audio()
				gc_end_game();
			})

			socket.on('gc_refresh_window', function(msg){
				timer_refresh()
				console.log(msg)
			})
	  });