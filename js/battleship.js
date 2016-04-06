//Global variables:
// Game status
var status = ['que', 'setup', 'started', 'done' ];

//User variables
//Ship currently selected by user
var selectedShip = undefined;

//Field containing placed ships and blocks
var field;

//All blocks
var blocks = [];

//Dock containing ships
var dock;

//Settings
var airCraftCarrierAmount = 1;
var battleshipAmount = 2;
var destroyerAmount = 4;
var patrolBoatAmount = 4;

//START GAME LOGIC
/*function getGameById($id) {
	$.get(base_url + "games/" + $id +"?token=" + api_key, function (data) {
		console.log("Game with id: " + $id + " found.");
		console.log(data);
	})
	.fail(function () {
		alert("Game with id: " + $id + " couldn't be found.");
	});
}

function getShips() {
	$.get(base_url + "ships?token=" + api_key, function (data) {
		console.log('Loaded ships');
		console.log(data);
	})
	.fail(function () {
		alert("Ships couldn't be retrieved from server.");
	});
}*/

//END GAME LOGIC

// Document.ready
$(function() {
	//Start using prototpye here
	//initializeJSBattleship();
});

// Catch clicks on a block, delegate
$(document).on('click', 'div.block', function() {
	// Call shotFired and send the clicked block as parameter
	bombFired($(this));
});

// Catch clicks on a ship in legend, delegate
$(document).on('click', 'div.acc-part', function() {
	//Check if we still have AirCraft Carriers at the docks
	if(dock.airCraftCarriers.length === 0) {
		alert('All AirCraft Carriers have been deployed already');
		return;
	}
	//Check if we still have another ship selected, if so: put it back at its dock
	deselectSelectedShip();
	//Play reload sound
	playReloadSound();
	//Set selectedship
	selectedShip = dock.airCraftCarriers.pop();
	refreshStocks();
});

$(document).on('click', '#accHorizontal', function() {
	//Get last ship in array and change it's horizontal state to the opposite
	dock.airCraftCarriers[dock.airCraftCarriers.length - 1].horizontal = !dock.airCraftCarriers[dock.airCraftCarriers.length - 1].horizontal;
	//Play switch sound
	playSwitchSound();
	//Turn text on button
	dock.airCraftCarriers[dock.airCraftCarriers.length - 1].horizontal ? $('#accHorizontal').html('---') : $('#accHorizontal').html('&nbsp;|&nbsp;');
});

$(document).on('click', 'div.bs-part', function() {
	if(dock.battleships.length === 0) {
		alert('All Battleships have been deployed already');
		return;
	}
	//Check if we still have another ship selected, if so: put it back at its dock
	deselectSelectedShip();
	//Play reload sound
	playReloadSound();
	//Set selectedship
	selectedShip = dock.battleships.pop();
	refreshStocks();
});

$(document).on('click', '#bsHorizontal', function() {
	//Get last ship in array and change it's horizontal state to the opposite
	dock.battleships[dock.battleships.length - 1].horizontal = !dock.battleships[dock.battleships.length - 1].horizontal;
	//Play switch sound
	playSwitchSound();
	//Turn text on button
	dock.battleships[dock.battleships.length - 1].horizontal ? $('#bsHorizontal').html('---') : $('#bsHorizontal').html('&nbsp;|&nbsp;');
});

$(document).on('click', 'div.ds-part', function() {
	if(dock.destroyers.length === 0) {
		alert('All Destroyers have been deployed already');
		return;	
	}
	//Check if we still have another ship selected, if so: put it back at its dock
	deselectSelectedShip();
	//Play reload sound
	playReloadSound();
	//Set selectedship
	selectedShip = dock.destroyers.pop();
	refreshStocks();
});

$(document).on('click', '#dsHorizontal', function() {
	//Get last ship in array and change it's horizontal state to the opposite
	dock.destroyers[dock.destroyers.length - 1].horizontal = !dock.destroyers[dock.destroyers.length - 1].horizontal;
	//Play switch sound
	playSwitchSound();
	//Turn text on button
	dock.destroyers[dock.destroyers.length - 1].horizontal ? $('#dsHorizontal').html('---') : $('#dsHorizontal').html('&nbsp;|&nbsp;');
});

$(document).on('click', 'div.pb-part', function() {
	if(dock.patrolBoats.length === 0) {
		alert('All Patrol boats have been deployed already');
		return;	
	}
	//Check if we still have another ship selected, if so: put it back at its dock
	deselectSelectedShip();
	//Play reload sound
	playReloadSound();
	//Set selectedship
	selectedShip = dock.patrolBoats.pop();
	refreshStocks();
});

$(document).on('click', '#pbHorizontal', function() {
	//Get last ship in array and change it's horizontal state to the opposite
	dock.patrolBoats[dock.patrolBoats.length - 1].horizontal = !dock.patrolBoats[dock.patrolBoats.length - 1].horizontal;
	//Play switch sound
	playSwitchSound();
	//Turn text on button
	dock.patrolBoats[dock.patrolBoats.length - 1].horizontal ? $('#pbHorizontal').html('---') : $('#pbHorizontal').html('&nbsp;|&nbsp;');
});

function deselectSelectedShip() {
	// Check if the user had selected a ship
	if (typeof selectedShip === "undefined") {
		return;
	}
	//Assign the ship to its old list, so a new ship can be selected
	switch(selectedShip.name) {
		case 'AirCraft Carrier':
			dock.airCraftCarriers.push(selectedShip);
		break;
		case 'Battleship':
			dock.battleships.push(selectedShip);
		break;
		case 'Destroyer':
			dock.destroyers.push(selectedShip);
		break;
		case 'Patrol Boat':
			dock.patrolBoats.push(selectedShip);
		break;
		default:
		break;
	}
}

// Function for all initializing that has to be done after document read
function initializeJSBattleship() {
	// Create Ships
	console.log('Start creating Ships');
	createShips();
	console.log('Ships created');
	console.log('Dock filled');
	// Create Grid
	console.log('Start creating Grid');
	createGrid(10, 10);
	console.log('Grid created');
	console.log('Field filled');
	// Show playground
	var $playground = $("#playground");
	$playground.show();
}

function createShips() {
	// Create airCraftCarriers
	var airCraftCarriers = [];
	for(var i = 0; i < airCraftCarrierAmount; i++) {
		airCraftCarriers.push(createShip('AirCraft Carrier', 5, false, true));
	}
	// Create battleships
	var battleships = [];
	for(var i = 0; i < battleshipAmount; i++) {
		battleships.push(createShip('Battleship', 4, false, true));
	}
	// Create destroyers
	var destroyers = [];
	for(var i = 0; i < destroyerAmount; i++) {
		destroyers.push(createShip('Destroyer', 3, false, true))
	}
	// Create patrolBoats
	var patrolBoats = [];
	for(var i = 0; i < patrolBoatAmount; i++) {
		patrolBoats.push(createShip('Patrol Boat', 2, false, true));
	}
	//Initialize dock with created ships
	initializeDock(airCraftCarriers, battleships, destroyers, patrolBoats);
}

//Function for initializing the docks with given parameters
function initializeDock(airCraftCarriers, battleships, destroyers, patrolBoats) {
	dock = {
		airCraftCarriers: airCraftCarriers,
		battleships: battleships,
		destroyers: destroyers,
		patrolBoats: patrolBoats
	};
	refreshStocks();	
}

//Function for initializing the field with given parameters
function initializeField(blocks) {
	field = {
		blocks: blocks
	};
}

//Refresh ship stocks that are presented to the player
function refreshStocks() {
	//Check if we need to disable some turn buttons
	dock.airCraftCarriers.length === 0 ? $('#accHorizontal').prop('disabled', true) : $('#accHorizontal').prop('disabled', false);
	dock.battleships.length === 0 ? $('#bsHorizontal').prop('disabled', true) : $('#bsHorizontal').prop('disabled', false);	
	dock.destroyers.length === 0 ? $('#dsHorizontal').prop('disabled', true) : $('#dsHorizontal').prop('disabled', false);		
	dock.patrolBoats.length === 0 ? $('#pbHorizontal').prop('disabled', true) : $('#pbHorizontal').prop('disabled', false);
	//Set stocks
	$('#accStock').text(dock.airCraftCarriers.length);
	$('#bsStock').text(dock.battleships.length);
	$('#dsStock').text(dock.destroyers.length);
	$('#pbStock').text(dock.patrolBoats.length);
}

// Function for creating the grid
function createGrid(gridWidth, gridHeight) {
	// Will be appended to the table after a full iteration
	var tableRowHtml;
	// Will be filled with the div
	var blockDiv;
	
	// Start value for horizontal coordinates
	var lastChar = 'A';
	tableRowHtml += '<tr>';
	for(var h = 0; h < gridWidth +1; h++) {
		tableRowHtml += '<td><h2 class="white-text text-center">';
		if(h === 0) {
			tableRowHtml += '#';
			continue;
		}
		tableRowHtml += lastChar;
		lastChar = nextChar(lastChar);
		tableRowHtml += '</h2></td>';
	}
	tableRowHtml += '</tr>';
	// Add generated data to last
	$('#grid > tbody:last').append(tableRowHtml);
	tableRowHtml = '';
	
	for(var y = 0; y < gridHeight; y++) {
		// Open table row element and draw vertical coordinates
		tableRowHtml += '<tr><td><h2 class="white-text">'+(y+1)+'</h2></td>';
		for(var x = 0; x < gridWidth; x++) {
			// Append block object to array blocks
			blocks.push(createBlock(x, y, false, false));
			// Draw table data and fill with 2 hidden fields, containing coordinates
			blockDiv = '<div class="block"><input type="hidden" name="x-location" value="'+x+'"><input type="hidden" name="y-location" value="'+y+'"></div>';
			// Combine div with opening and closing table data element
			tableRowHtml += '<td>'+blockDiv+'</td>';
		}
		// Close table row element
		tableRowHtml += '</tr>';
		// Add generated data to last
		$('#grid > tbody:last').append(tableRowHtml);
		// Clear tableRowHtml
		tableRowHtml = '';
	}
	//Grid has been created, assisn blocks to field
	initializeField(blocks);
}

// Fuction when a block has been clicked
function bombFired(clickedBlock) {
	// Get locations and parse them to Int
	var $xLocation = parseInt($(clickedBlock).find('[name=x-location]').val());
	var $yLocation = parseInt($(clickedBlock).find('[name=y-location]').val());
	
	// Validate received coordinates
	if(isNaN($xLocation)) { throw 'Error: xLocation for clicked Div is NaN'; }
	if(isNaN($yLocation)) { throw 'Error: yLocation for clicked Div is NaN'; }
	
	// Check if this block was bombed already
	if(isBombedAlready($xLocation, $yLocation)) {
		alert('This block was already bombed');
		return;
	}
	
	// Mark block bombed and check if the result of marking succeeded
	if(!markBlockBombed(getBlockByLocation($xLocation, $yLocation))) { throw 'Error: The block was not found in the blocks array'; }
	
	// play 
	if(containsAShip($xLocation, $yLocation)) {
		//Change background-color to red
		$(clickedBlock).css('background-color', '#FF0000');
		//We hit a ship, play explosion sound effect
		playExplosionSound();
	} else {
		//Change background-color to yellow
		$(clickedBlock).css('background-color', '#FFFF66');
		//We hit the water, play splash sound effect
		playSplashSound();
	}
	
	// Animate impact
	impactAnimation(clickedBlock);
	
	// Show location of block to user
	alert('('+$xLocation+','+$yLocation+')');
}

// Function for creating a block
function createBlock(xLocation, yLocation, bombed, hasShip) {
	// The xLocation and yLocation combined make the Block unique
	return {
        xLocation: xLocation,
        yLocation: yLocation,
        bombed: bombed,
		hasShip: hasShip
    };
}

// Function for creating a ship
function createShip(name, size, deployed, horizontal) {
	return {
		name: name,
		size: size,
		deployed: deployed,
		horizontal: horizontal
	};
}

// Function for marking a block as bombed
function markBlockBombed(blockObject) {
	//blockObject doesn't need to be checked.
	//It is called like markBlockBombed(getBlockByLocation(x,y), getBlockByLocation checks if the object is valid
	// Mark the block as bombed
	blockObject.bombed = true;
	return true;
}

// Function for checking if a block was already bombed
function isBombedAlready(x,y) {
	// Iterate over all blocks
	for (var i = 0; i < $(blocks).length; i++) {
		// Check for the block
		if (blocks[i].xLocation === x && blocks[i].yLocation === y) {
			// Check if the matching block was bombed already
			if(blocks[i].bombed === true) { 
				return true; 
			} else {
				return false;
			}
		}
	}
	throw 'Error: The block was not found in the blocks array';
}

// Function for checking if a block contains a ship part
function containsAShip(x,y) {
	// Iterate over all blocks
	for (var i = 0; i < $(blocks).length; i++) {
		// Check for the block
		if (blocks[i].xLocation === x && blocks[i].yLocation === y) {
			// Check if the matching block contains a ship
			if(blocks[i].hasShip === true) { 
				return true; 
			} else {
				return false;
			}
		}
	}
	throw 'Error: The block was not found in the blocks array';
}

// Function get block from blocks array, by checking for coordinates
function getBlockByLocation(x,y) {
	var block;
	for (var i = 0; i < $(blocks).length; i++) {
		// Check if blocks can be found by primary key (x and y location combined)
		if (blocks[i].xLocation === x && blocks[i].yLocation === y) { 
			block =  blocks[i]; 
			break;
		}
	}
	// Validate if we received 1 block object
	if ($(block).length == 0) {
		// not found
		throw 'Error: Zero blocks were found for the coordinate';
	} 
	if ($(block).length > 1) { 
		// multiple items found
		throw 'Error: Multiple blocks were found for a single coordinate';
	}
	// Block is valid and 1
	return block;
}

// Function for playing an Explosion sound, when hitting a ship
function playExplosionSound() {
	if(canPlaySoundType('audio/mp3')) {
		var explosionSound = new Audio('sounds/explosion_sound.mp3');
		explosionSound.play();
	}
}

// Function for playing a Splash sound, when hitting the water
function playSplashSound() {
	if(canPlaySoundType('audio/mp3')) {
		var splashSound = new Audio('sounds/splash_sound.mp3'); 
		splashSound.play();
	}
}

// Function for playing a Reload sound, when selecting a ship
function playReloadSound() {
	if(canPlaySoundType('audio/mp3')) {
		var reloadSound = new Audio('sounds/reload_sound.mp3');
		reloadSound.play();
	}
}

// Function for playing a switch sound, when turning a ship
function playSwitchSound() {
	if(canPlaySoundType('audio/mp3')) {
		var switchSound = new Audio('sounds/switch_sound.mp3');
		switchSound.play();
	}
}

// Function for checking whether the browser is able to play sound of specified type
function canPlaySoundType(soundType) {
	if(new Audio().canPlayType(soundType)) {
		return true;
	}
	return false;
}

// Function for animating a click impact
function impactAnimation(block, optDistance, optTimes, optInterval) {
	// Declare optional Parameters
	var optDistance, optTimes, optInterval;
	// Our way to enable optional parameters in Javascript
	if (typeof optDistance === 'undefined') { optDistance = 5; }
	if (typeof optTimes === 'undefined') { optTimes = 4; }
	if (typeof optInterval === 'undefined') { optInterval = 100; }
	
	$(block).css('position', 'relative');
	// Iterate over times given
	 for(var i = 0; i < (optTimes+1); i++){                                                                              
		//Execute animation
        $(block).animate({ 
            left:((i%2==0 ? optDistance : optDistance*-1))
            },optInterval);                                   
    }
    $(block).animate({ left: 0},optInterval);     
}

// Function nextChar, little trick to get the character after the given one
function nextChar(c) {
    return String.fromCharCode(c.charCodeAt(0) + 1);
}