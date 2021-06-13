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
			}
		}

		// Stop the timer on death, by entering an artificial transition
		if (soundName == "playerdie") {
			state.in_transition = true;
		}
	};

    /*
	Callback function after any level layout is changed (we refresh or enter or a new screen)
	*/
	var onScene = function (sceneName) {
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
		}

		$("#practice_mode_data").toggle(state.in_level);
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
	};

    /**********
	Level movement handling - allowing to move between levels with the keyboard
	***********/

	$(document).keypress(function (e) {
		// Level movement is only allowed during gameplay in practice mode
		if (!state.in_level) return;

		// "+" or "=" key, to move to the next level
		if ((e.which == 43 || e.which == 61) && state.level < 15) {
			moveToLevel(state.level + 1);
		}

		// "-" key, to move to the previous level
		if (e.which == 45 && state.level > 1) {
			moveToLevel(state.level - 1);
		}
	});

	$(document).keydown(function (e) {
		if (!state.in_level) return;

		// ESC key, to move to main menu
		if (e.key === "Escape") {
			moveToLevel(0);
		}
    });
    
    return {
		onSound: onSound,
		onScene: onScene,
		onUpdate: onUpdate,
		onCanvasResize: onCanvasResize,
		moveToLevel: moveToLevel,
	};
})();