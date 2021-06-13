_autosplitter = (function () {
	var chestsInLevel = [1, 3, 2, 1, 2, 2, 3, 2, 2, 2, 2, 3, 2, 2, 2];

	var decimal_places_display = 3;
	
	var state = {
		level: NaN,
        in_menu: true,
        in_credits: false,
		in_level: false,
		in_transition: false,
		damselCount: 0,
		levelTime: null,
		speedrunTime: null,
		transitionTime: null,
		show_speedrun_stats: false,
		extra_speedrun_stats_visible: false,
    };
	
	/*
	Function to move between levels (for practice mode)
	*/
	var moveToLevel = function (level) {
		window.game.sr(window.game.Qc[level]);
	};
	
	/*
	Callback function after any sound file was played
	*/
	var onSound = function (soundName) {
		// Handling what happens when you collect chests
		if (soundName == "powerup") {
			state.damselCount += 1;

			// Check if the last chest of the level was collected
			if (
				state.in_level &&
				state.damselCount >= chestsInLevel[state.level - 1]
			) {
				state.in_transition = true;
				state.transitionTime = 0;
				$("#transition_timer").text(
					(0).toFixed(decimal_places_display)
				);

				// Track the time of the last level, before the transition started
				_speedrunStatsHandler.onLevelEnd(
					state.level,
					state.levelTime
				);
			}
		}

		// Track extra stats for sounds. Only sounds that happened during gameplay are counted.
		if (state.in_level && !state.in_transition) {
			_speedrunStatsHandler.onSound(soundName);
		}
	};

    /*
	Callback function after any level layout is changed (we refresh or enter or a new screen)
	*/
	var onScene = function (sceneName) {
		var previousLevel = state.level;
		var previousLevelTime = state.levelTime;
		var transitionEnded = state.in_transition;

        state.level = parseInt(sceneName.slice(5, 10));

		// Check where we are now, based on the new layout name
		state.in_menu = sceneName === "Menu";
		state.in_credits = sceneName === "End";
		state.in_level = !state.in_menu && !state.in_credits;
		state.in_transition = false;
        
		// If we entered a new level (or refreshed the current one)
		if (state.in_level) {
			state.damselCount = 0;

			// Set relevant data for the current level
			state.levelTime = 0;
			document.getElementById("level_timer").innerText = (0).toFixed(decimal_places_display);

			wrTimes = _wrs.getTimes();
			document.getElementById("level_wr_title").innerText = wrTimes.title;
			document.getElementById("level_wr").innerText = wrTimes.wrs[state.level - 1];

			// Start a timer for new speedrun, in case we entered or refreshed level 1
			if (state.level == 1) {
				state.speedrunTime = 0;
				$("#speedrun_timer").text((0).toFixed(decimal_places_display));
			}
		}

		if (state.in_credits){
			$("#level_timer").text("---");
			$("#level_wr").text("---");
		}

		$("#speedrun_mode_data").toggle(!state.in_menu);

		/*** Handling speedrun stats tracking ***/

		// Always start tracking a new speedrun on level 1
		if (state.level === 1) {
			_speedrunStatsHandler.onNewSpeedrun();
		}

		// Checking if a new level was loaded, or the player reached the credits screen.
		// The first level is ignored, because it will always start a new speedrun.
		if (state.level > 1 || state.in_credits) {
			// Check if a transition has ended. Will happen if the transition ended normally, or the player has reset during transition.
			if (transitionEnded) {
				// Track the time of the last transition
				_speedrunStatsHandler.onTransitionEnd(
					previousLevel,
					state.transitionTime
				);
			}
			// In case the player was not in transition. This will happen if the player dies or reset during a level.
			else {
				// Track the time of the last level
				_speedrunStatsHandler.onLevelEnd(
					previousLevel,
					previousLevelTime
				);
			}
		}

		if (state.in_credits) {
			// Display all the speedrun times after reaching the end screen
			state.show_speedrun_stats = true;
			_speedrunStatsHandler.displaySpeedrunStats();
		}

		// Show stats for the last speedrun on the menu or credits, hide them during gameplay
		$("#speedrun_stats").toggle(state.show_speedrun_stats && !state.in_level);

		if (state.in_level) {
			hideExtraStats();
		}
    }

    /*
	Callback function for every tick of the main loop function of the game. Each tick equals one frame of the game.
	The "frameTime" parameter is the time (in milliseconds) that elapsed since the last tick.
	*/
	var onUpdate = function (frameTime) {
		// Update the FPS counter for the current frame
		$("#fps_counter").text((1 / frameTime).toFixed());

		// Don't update timers on the menu or credits
		if (!state.in_level) return;

		// Update the level timer for the current frame if we are not in transition
		if (!state.in_transition) {
			state.levelTime += frameTime;
			$("#level_timer").text(
				state.levelTime.toFixed(decimal_places_display)
			);
		}

		// Update the speedrun and transition timers for the current frame
		state.speedrunTime += frameTime;
		$("#speedrun_timer").text(
			state.speedrunTime.toFixed(decimal_places_display)
		);

		if (state.in_transition) {
			state.transitionTime += frameTime;
			$("#transition_timer").text(
				state.transitionTime.toFixed(decimal_places_display)
			);
		}
	};

	/**********
	Window resize handling - organzing some of the custom HTML elements in case the window is resized, or full-screen mode is activated.
	***********/

	var onCanvasResize = function () {
		var $canvas = $("#c2canvasdiv");
		var canvas_w = $canvas.width();
		var canvas_marginTop = parseInt($canvas.css("margin-top"));
		var canvas_marginLeft = parseInt($canvas.css("margin-left"));

		$("#autosplitter_data")
			.width(canvas_w - 10)
			.css("left", canvas_marginLeft + "px")
			.css("bottom", canvas_marginTop + "px")
			.fitText(4);

		var autosplitter_bar_height = $("#autosplitter_data").height();

		$("#speedrun_stats")
			.css("right", canvas_marginLeft + 1 + "px")
			.css(
				"bottom",
				canvas_marginTop + autosplitter_bar_height + 10 + "px"
			)
			.width(canvas_w * (1 / 6))
			.fitText(1.25);

		var speedrun_stats_modal_width = $("#speedrun_stats").width();

		$("#extra_speedrun_stats")
			.css(
				"right",
				canvas_marginLeft + speedrun_stats_modal_width + 3 + "px"
			)
			.css(
				"bottom",
				canvas_marginTop + autosplitter_bar_height + 10 + "px"
			)
			.width(canvas_w * (1 / 2))
			.fitText(3);
	};

    /**********
	Screen movement handling - allowing to quit to main menu with Escape key
	***********/

	$(document).keydown(function (e) {
		if (!state.in_level) return;

		// ESC key, to move to main menu
		if (e.key === "Escape") {
			moveToLevel(0);
		}
	});
	
	/**********
	Speedrun stats modals handling
    ***********/

   	showExtraStats = function () {
		state.extra_speedrun_stats_visible = true;
		$("#extra_speedrun_stats").fadeIn();
		$("#extra_stats_button_arrow").text(">");
	};

	hideExtraStats = function () {
		state.extra_speedrun_stats_visible = false;
		$("#extra_speedrun_stats").fadeOut();
		$("#extra_stats_button_arrow").text("<");
	};

	$("#btn_extra_stats").mousedown(function (e) {
		e.stopPropagation();

		if (state.extra_speedrun_stats_visible) {
			hideExtraStats();
		} else {
			showExtraStats();
		}
	});
    
    return {
		onSound: onSound,
		onScene: onScene,
		onUpdate: onUpdate,
		onCanvasResize: onCanvasResize
	};
})();