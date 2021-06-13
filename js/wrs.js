_wrs = (function(){
    var wrs = [
		"1.819",    // 1
		"5.264",    // 2
		"4.424",    // 3
		"5.326",    // 4
		"9.486",    // 5
		"2.733",    // 6
		"7.070",    // 7
		"5.880",    // 8
		"7.959",    // 9
		"3.773",    // 10
		"12.396",   // 11
		"12.866",   // 12
		"21.778",   // 13
		"10.426",   // 14
		"17.734",   // 15
	];
	
	var decimal_places_display = 3;
	var customTimes = null;

    return {
		// Return the WR times, or return custom times if they were set by the user
        getTimes: function() {
			// Flag to check if at least one value in the custom times is valid
			var validFlag = false;

			// Check if there are custom times set by the user
			if (customTimes && Array.isArray(customTimes)) {
				wrs_copy = wrs.slice();
				// Run on all the level times (up to 15)
				for (var i = 0; i < wrs.length && i < customTimes.length; i++) {
					// If the current custom time value is valid, replace the WR time with it 
					if (customTimes[i]) {
						validFlag = true;
						wrs_copy[i] = customTimes[i];
					}
				}

				if (validFlag){
					return {"wrs": wrs_copy, "title": "Pace"};
				}
			}

			// There are no custom times, so just return the WR times instead
            return {"wrs": wrs, "title": "WR"};
		},
		// Set new custom level times 
		setCustomTimes: function(times) {
			// Check if the given object by the user is valid - must be array
			if (times && Array.isArray(times)) {
				// Copy only the first 15 elements, any more are irrelevant
				times = times.slice(0, 15);

				for (var i = 0; i < times.length; i++){
					levelTime = times[i];
					
					// check if the current level time is a valid number
					if (typeof(levelTime) === "number" && levelTime >= 0 && levelTime < 100)
						times[i] = levelTime.toFixed(decimal_places_display);
					else
						times[i] = null;
				}

				customTimes = times;
			}
			else
				customTimes = null;
		}
	};
})();