var stationLookup = {
	southern_cross: { name: "Southern Cross", id: "southern_cross_circle" },
	flagstaff: { name: "Flagstaff", id: "flagstaff_circle" },
	melbourne_central: { name: "Melbourne Central", id: "melbourne_central_circle" },
	parliament: { name: "Parliament", id: "parliament_circle" },
	flinders_street: { name: "Flinders Street", id: "flinders_street_circle" },
	richmond: { name: "Richmond", id: "richmond_rect" },
	kooyong: { name: "Kooyong", id: "kooyong_circle" },
	tooronga: { name: "Tooronga", id: "tooronga_circle" },
	south_yarra: { name: "South Yarra", id: "south_yarra_circle" },
	prahran: { name: "Prahran", id: "prahran_circle" },
	windsor: { name: "Windsor", id: "windsor_circle" },
	east_richmond: { name: "East Richmond", id: "east_richmond_circle" },
	burnley: { name: "Burnley", id: "burnley_circle" },
	hawthorn: { name: "Hawthorn", id: "hawthorn_circle" },
	glenferrie: {name: "Glenferrie", id: "glenferrie_circle" }
}

var clickCount = 0;
var stationsSelected = {};

$(document).ready(function() {
	stationClickEvents();
})


function stationClickEvents() {
	$('.station_font').on('click', function(event) {
		var station = event.target;
		var rectangle
		if (clickCount === 0) {
			rectangle = $(event.target).parents(".station")[0].children[0];
			stationsSelected.start = { name: stationLookup[station.id].name, rectangle: rectangle };
			highlightStation("start");
			$('#origin span').text(stationLookup[station.id].name);
			clickCount++;
		} else if (clickCount === 1) {
			rectangle = $(event.target).parents(".station")[0].children[0];
			stationsSelected.end = { name: stationLookup[station.id].name, rectangle: rectangle };
			if (stationsSelected.start.name !== stationsSelected.end.name) {
				highlightStation("end");
				$('#destination span').text(stationLookup[station.id].name);
				clickCount++;
			} else {
				stationsSelected.end = {};
			}
		}
	})

	$('#submit').on('click', function() {
		if (clickCount === 2 && stationsSelected.start && stationsSelected.end) {
			actionStationClick(stationsSelected.start.name, stationsSelected.end.name)
		}
	})

	$('#reset').on('click', function() {
		reset();
	})
}

function highlightStation(position) {
	if (position === "start") {
		stationsSelected.start.rectangle.style.fill = "red";
		stationsSelected.start.rectangle.style.strokeDasharray = 500;
		stationsSelected.start.rectangle.style.strokeDashoffset = 0;
	}

	if (position === "end") {
		stationsSelected.end.rectangle.style.fill = "blue";
		stationsSelected.end.rectangle.style.strokeDasharray = 500;
		stationsSelected.end.rectangle.style.strokeDashoffset = 0;
	}
}

function removeHighlightStation() {
	if (stationsSelected.start) {
		stationsSelected.start.rectangle.style.fill = "";
		stationsSelected.start.rectangle.style.strokeDasharray = 1000;
		stationsSelected.start.rectangle.style.strokeDashoffset = 1000;
	}

	if (stationsSelected.end) {
		stationsSelected.end.rectangle.style.fill = "";
		stationsSelected.end.rectangle.style.strokeDasharray = 1000;
		stationsSelected.end.rectangle.style.strokeDashoffset = 1000;
	}

	$('#richmond_rect').removeClass('fill');
}

function resetStationEllipses() {
	var ellipseArray = $('ellipse');
	for (var station = 0; station < ellipseArray.length; station++) {
		ellipseArray[station].classList.remove('fill');
	}
}

function reset() {
	$('#origin span').text('');
	$('#destination span').text('');
	$('#num_stops').text('');
	$('#journey').text('');
	removeHighlightStation();
	stationsSelected = {};
	resetStationEllipses();
	clickCount = 0;
}

function actionStationClick(origin, destination) {
	var ptv = {	
		alamein: ['Flinders Street', 'Richmond', 'East Richmond', 'Burnley', 'Hawthorn', 'Glenferrie'],
		glen_waverly: ['Flagstaff', 'Melbourne Central', 'Parliament', 'Richmond', 'Kooyong', 'Tooronga'],
		sandringham: ['Southern Cross', 'Richmond', 'South Yarra', 'Prahran', 'Windsor']
	}

	var start_train_line = '';
	var end_train_line = '';

	// if (origin !== destination) {
		// Find the lines which the origin and destination are on
		for (var line in ptv) {
			// Find the origin line
			if (ptv[line].includes(origin)) {
				start_train_line = line;
				if (destination === 'Richmond') {
					end_train_line = line;
					break;
				}
			}

			// Find th destination line
			if (ptv[line].includes(destination)) {
				end_train_line = line;
				if (origin === 'Richmond') {
					start_train_line = line;
					break;
				}
			}
		}

		// Get start and end indices of stops
		var start_index = ptv[start_train_line].indexOf(origin);
		var end_index = ptv[end_train_line].indexOf(destination);
		var journeyArr = [];

		// If the origin and destination are on the same line
		if (start_train_line === end_train_line) {
			// If travelling from right to left
			if (start_index > end_index) {
				journeyArr.push(ptv[start_train_line].slice(end_index, start_index + 1).reverse());
			} else {
				journeyArr.push(ptv[start_train_line].slice(start_index, end_index + 1));
			}
		} else {
			// Get the index of the Richmond stops on the lines
			var line1_richmond_index = ptv[start_train_line].indexOf('Richmond');
			var line2_richmond_index = ptv[end_train_line].indexOf('Richmond');
			var path1;
			var path2;

			// Slice the sections of the lines
			if ((start_index < line1_richmond_index) && (line2_richmond_index < end_index)) {
				// Right Right
				path1 = ptv[start_train_line].slice(start_index, line1_richmond_index);
				path2 = ptv[end_train_line].slice(line2_richmond_index, end_index + 1);
			} else if ((start_index < line1_richmond_index) && (end_index < line2_richmond_index)) {
				// Right Left
				path1 = ptv[start_train_line].slice(start_index, line1_richmond_index + 1);
				path2 = ptv[end_train_line].slice(end_index, line2_richmond_index);
			} else if ((line1_richmond_index < start_index) && (end_index < line2_richmond_index)) {
				// Left Left
				path1 = ptv[start_train_line].slice(line1_richmond_index, start_index + 1);
				path2 = ptv[end_train_line].slice(end_index, line2_richmond_index);
			} else if ((line1_richmond_index < start_index) && (line2_richmond_index < end_index)) {
				// Left Right
				path1 = ptv[start_train_line].slice(line1_richmond_index + 1, start_index + 1);
				path2 = ptv[end_train_line].slice(line2_richmond_index, end_index + 1);
			}

			// If the lines are going backwards then reverse the order
			if (start_index > line1_richmond_index) { path1.reverse() }
			if (end_index < line2_richmond_index) { path2.reverse() }

			journeyArr.push(path1);
			journeyArr.push(path2);
		}

		// Reduces the array of arrays into a single level array
		journeyArr = journeyArr.reduce((prev,curr) => prev.concat(curr));

		createJourney(journeyArr, start_train_line, end_train_line);

		// DEBUG
		// console.log('start line', start_train_line);
		// console.log('end line', end_train_line);

		// console.log('start index', start_index);
		// console.log('end index', end_index);

		// console.log('line1_richmond_index', line1_richmond_index);
		// console.log('line2_richmond_index', line2_richmond_index);

		// console.log('path1', path1);
		// console.log('path2', path2);

		// console.log('origin: ' + origin);
		// console.log('destination: ' + destination);

		// console.log('journeyArr', journeyArr);
		// console.log(numStops + ' stops total');

		// console.log(journeyArr.join(' -----> '));

		if (start_train_line === end_train_line) {
			var numStops = Math.abs(end_index - start_index);
		} else {
			var line1_stops = Math.abs(start_index - line1_richmond_index);
			var line2_stops = Math.abs(end_index - line2_richmond_index);
			var numStops = line1_stops + line2_stops;
		}

		$('#num_stops').text(numStops + ' stops total');
		$('#journey').text(journeyArr.join(' -----> '));

	// } else {
	// 	console.log('Your origin and destination are the same!');
	// }
}

function createJourney(journeyArray, startLine, endLine) {
	var stationElementArray = journeyArray.map(function(station) {
		for (var key in stationLookup) {
			if (stationLookup[key].name === station) {
				return stationLookup[key].id
			}
		}	
	})

	var stopCount = 0;
	(function plotJourney() {
		setTimeout(function() {
			$("#" + stationElementArray[stopCount]).addClass("fill");
			stopCount++;
			if (stopCount < stationElementArray.length) {
				plotJourney();
			}
		}, 500)
	})()

	console.log('stationElementArray', stationElementArray);
}

function stationInterchange(stationsArray) {
	stationsArray.map(function(station) {

	})
}

// function createPath(pathArr, startLine, endLine) {
	// console.log((startLine !== endLine));
	// console.log((pathArr.length === 2) && (pathArr.includes('Richmond')) && (startLine !== endLine));
	// if (pathArr.length > 2) {
	// 	pathArr.shift();
	// 	pathArr.pop();
	// 	var stop = 0;
	// 	// self invoking, recursive call on plotPath function while counting up pathArr, this loops through each element with a 500ms delay
	// 	(function plotPath() {
	// 		setTimeout(function() {
	// 			console.log(pathArr[stop]);
	// 			$('#' + startLine + ' ul li button').filter(function() { 
	// 				return $(this).text() === pathArr[stop];
	// 			}).addClass('highlight');
	// 			$('#' + endLine + ' ul li button').filter(function() { 
	// 				return $(this).text() === pathArr[stop];
	// 			}).addClass('highlight');
	// 			stop++;
	// 			if (stop < pathArr.length) {
	// 				plotPath(stop, pathArr, startLine);
	// 			}
	// 		}, 500)
	// 	})()
	// }
	// } else if ((pathArr.length === 2) && (pathArr.includes('Richmond')) && (startLine === endLine)) {
	// 	console.log('here');
	// 	$('#' + startLine + 'ul li button').filter(function() {
	// 		return $(this).text() === 'Richmond';
	// 	}).removeClass('start');
	// 	$('#' + endLine + 'ul li button').filter(function() {
	// 		return $(this).text() === 'Richmond';
	// 	}).addClass('start');
	// }
// }










