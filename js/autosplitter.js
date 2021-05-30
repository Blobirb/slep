_autosplitter = (function () {
    var state = {
		level: NaN,
        in_menu: true,
        in_credits: false,
		in_level: false
    };
    
    /*
	Function to move between levels (for practice mode)
	*/
	var moveToLevel = function (level) {
		window.game.sr(window.game.Qc[level]);
    };
	
	var onSound = function (soundName) {}

    /*
	Callback function after any level layout is changed (we refresh or enter or a new screen)
	*/
	var onScene = function (sceneName) {
        state.level = parseInt(sceneName.slice(5, 10));

		// Check where we are now, based on the new layout name
		state.in_menu = sceneName === "Menu";
		state.in_credits = sceneName === "End";
        state.in_level = !state.in_menu && !state.in_credits;
        
        $("#practice_mode_data").toggle(state.in_level);
    }

    /*
	Callback function for every tick of the main loop function of the game. Each tick equals one frame of the game.
	The "frameTime" parameter is the time (in milliseconds) that elapsed since the last tick.
	*/
	var onUpdate = function (frameTime) {
		// Update the FPS counter for the current frame
		$("#fps_counter").text((1 / frameTime).toFixed());
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