
// Prototypes
function GameList() {
    var self = this;

    // Shows the game list
    self.showGamelist = function() {
        $('#gameboard').fadeOut("fast", function() {
            $('#title').text("Battleship gamelist");
            $('#gamelist').fadeIn("fast");
        });
    };

    // Shows all the games
    self.showGames = function() {
        $("#gameTable").slideUp("fast", function() {

            $("#gameTable").find("tbody").empty();
            $.get(base_url + "users/me/games?token=" + api_key, function (data) {
                var table_row = "";
                var game;
                for (var i = 0; i < data.length; i++) {
                    table_row += '<tr id="row' + data[i]._id + '" class="invisible">';
                    table_row += '<td>' + data[i]._id + '</td>';
                    table_row += '<td>' + data[i].status + '</td>';
                    table_row += '<td>' + data[i].enemyId + '</td>';
                    table_row += '<td>' + data[i].enemyName + '</td>';
					if(data[i].status !== 'done') {
						table_row += '<td><button type="button" onclick="gameList.getGame(\'' + data[i]._id + '\')">Play</button></td>';
					} else {
						table_row += '<td>Finished</td>';
					}
                    table_row += '</tr>';

                    $("#gameTable").find("tbody").append(table_row);
                    $("#row" + data[i]._id).fadeIn(1200);
                    table_row = "";
                }
                $("#gameTable").slideDown("fast");
            })
            .fail(function () {
                alert("Games could not be loaded");
            });
        })
    };

    // Starts a game against the computer
    self.startGameAI = function() {
        $.get(base_url+"games/AI?token="+api_key, function() {
            self.showGames();
        }).fail(function() {
            alert("Couldn't start a new game with the AI")
        });
    };

    // Starts a game against a player
    self.startGamePlayer = function() {
        $.get(base_url+"games?token="+api_key, function() {
            self.showGames();
        }).fail(function() {
            alert("Couldn't start a new game with a player");
        });
    };

    // Deletes all games
    self.deleteGames = function() {
		$.ajax({
			url: base_url + "users/me/games?token=" + api_key,
			type: 'DELETE',
			success: function (data) {
				alert(data.msg);
				self.showGames();
			},
			fail: function () {
				alert("Can't delete games");
			}
		})
	};

    // Find a game by id
    self.getGame = function(id) {
		$.get(base_url+"games/"+id+"?token="+api_key, function(data){
            if (data['yourTurn'] && data['yourTurn'] !== true) {
                alert("It is not your turn");
                return;
            }
			$('#gamelist').fadeOut("fast", function() {
				$('#title').text("Battleship game "+id);
				$('#gameboard').fadeIn("fast");

				//Initialize game
				//Load game
				game = new Game(data._id, data.status, data.yourTurn, data.enemyId, 
				data.enemyName, data.myGameboard, data.enemyGameboard);

				switch(game.status) {
					case "que":
					break;
					case "setup":
						$("#submitBoard").show();
						$("#turnShip").show();
						game.createGameStats();
						game.createDock();
                        var board = new Board();
                        board.getShips();
                        board.constructBoard('playerGrid', game.status);
                        $(document).on('click', '#submitBoard', function() {
                            board.postBoard(game._id, board.placedShips);
                        });
					break;
					case "started":
						game.createGameStats();
                        game.myGameboard.constructBoard('playerGrid', game.status);
                        game.myGameboard.updateBoard('playerGrid');
                        game.enemyGameboard.constructBoard('enemyGrid', game.status);
                        game.enemyGameboard.updateBoard('enemyGrid');
                        if (game.yourTurn) {
                                      alert("It's your turn!");
                                  }
                                  else {
                                      alert("It's the opponent's turn!");
                                  }
                        $("#enemyGrid").show();
                        $("#dock").hide();
                        $("#refreshGame").show();
                        console.log(game.myGameboard);
                        $(document).on('click', '#refreshGame', function() {
                              $.get(base_url+"games/"+id+"?token="+api_key, function(gameData) {
                                  game = new Game(gameData._id, gameData.status, gameData.yourTurn, gameData.enemyId,
				                    gameData.enemyName, gameData.myGameboard, gameData.enemyGameboard);
                                  if (gameData.yourTurn) {
                                      alert("It's your turn!");
                                  }
                                  else {
                                      alert("It's the opponent's turn!");
                                  }
                                  game.myGameboard.updateBoard('playerGrid');
                                  game.enemyGameboard.updateBoard('enemyGrid');
                              })
                        });
					break;
				}
			})
		})
		.fail(function() {
			alert("Couldn't load game"+id);
		});
	};
}

function Game(id, status, yourTurn, enemyId, enemyName, myGameboard, enemyGameboard) {
	var self = this;
	
	self._id = id;
	self.status = status;
	self.yourTurn = yourTurn;
	self.enemyId = enemyId;
	self.enemyName = enemyName;
	
	self.defaultShips = [];
	
	// Map
    self.map = [];
	
	if(typeof myGameboard !== "undefined") {
		self.myGameboard = new Board(myGameboard._id, myGameboard.__v, myGameboard.ships, myGameboard.shots);
	} else {
		self.myGameboard = new Board(undefined, undefined);
	}
	if(typeof enemyGameboard !== "undefined") {
		self.enemyGameboard = new Board(enemyGameboard._id, enemyGameboard.__v, enemyGameboard.ships, enemyGameboard.shots, self._id);
	} else {
		self.enemyGameboard = undefined;
	}
	
	self.createGameStats = function() {
		//Default always hide component
		var $gameStats = $("#gameStats");
		//Clear previous data
		$gameStats.find("tr").remove();
		//Generate data
		var table_row = "";		
		table_row += '<tr><td><b>State</b></td><td>'+ self.status +'</td></tr>';
		table_row += '<tr><td><b>Enemy</b></td><td>'+ self.enemyName +'</td></tr>';
		$gameStats.find("tbody").append(table_row);
	};
	
	self.createDock = function() {
            self.myGameboard.getShips();
		    $.get(base_url + "ships?token=" + api_key, function (data) {

		    	var $dock = $("#dock");
				//Remove old data
				$dock.find("tr").remove();
		    	//Add properties
		    	$dock.find("tbody").append('<tr><td><b>Name</b></td><td><b>Length</b></td></tr>');
            for (var i = 0; i < data.length; i++) {
        		$dock.find("tbody").append('<tr><td id="'+ data[i]._id +'">'+data[i].name+'</td><td>'+data[i].length+'</td></tr>');
                self.defaultShips.push(new Ship(data[i]._id, data[i].length, data[i].name, data[i].__v))
            }
        })
        .fail(function () {
            alert("Ships couldn't be loaded")
        });
	};
	
	self.removeCurrentShipFromDock = function() {
		$("#dock tr:eq(1)").remove();
		if($("#dock tr").length === 1) {
			$("#dock").hide();
		}
	}
}

function Board(id, v, ships, shots, gameId) {
	var self = this;

    self.gameId = gameId;

    // Board attributes
    self._id = id;
    self.__v = v;

    // Array of default ships
    self.ships = [];

    self.myShips = ships;
	
	//Array of placed ships
	self.placedShips = [];

    // Array of shots
    self.shots = shots;

	// Array of squares
	self.squares = [];

    // get the ships
    self.getShips = function() {
        $.get(base_url + "ships?token=" + api_key, function (data) {
            for (var i = 0; i < data.length; i++) {
                self.ships.push(new Ship(data[i]._id, data[i].length, data[i].name, data[i].__v))
            }
        })
        .fail(function () {
			alert("Ships could not be loaded");
        });
    };
	
    // construct the board as model and view
	self.constructBoard = function(boardName, status) {
        //Get board
        var $board = $('#' + boardName);
        $board.find('tr').remove();

        var lastChar = 'a';
        // Creates the board (model)
        for (var i = 0; i < 10; i++) {
            self.squares.push(i);
            self.squares[i] = [];
            for (var j = 0; j < 10; j++) {
                self.squares[i].push(new Square(lastChar, (j + 1)));
            }
            lastChar = nextChar(lastChar);
        }
        // Creates the board (view)
        var table_row = '';

        //Start with coordination lines
        lastChar = 'A';
        table_row += '<tr>';
        for (var h = 0; h < 11; h++) {
            table_row += '<td><h2 class="white-text text-center">';
            //Top left corner is no actual coordinate
            if (h === 0) {
                table_row += '#';
                continue;
            }
            table_row += lastChar + '</h2></td>';
            lastChar = nextChar(lastChar);
        }
        table_row += '</tr>';
        //Add generated header coordinates
        $board.append(table_row);
        //clear table row
        table_row = '';

        for (var y = 0; y < 10; y++) {
            table_row += '<tr><td><h2 class="white-text">' + (y + 1) + '</h2></td>';
            for (var l = 0; l < 10; l++) {
                if (boardName === 'playerGrid' && status === 'setup') {
                    table_row += '<td id="' + self.squares[l][y].x + self.squares[l][y].y + '" class="block">';
                }
                else if (boardName === 'enemyGrid' && status === 'started') {
                    table_row += '<td id="' + self.squares[l][y].x + self.squares[l][y].y + '" class="block">';
                }
                else {
                    table_row += '<td id="P' + self.squares[l][y].x + self.squares[l][y].y + '" class="block">';
                }
                table_row += '</td>';
            }
            table_row += '</tr>';
            $board.find('tbody').append(table_row);
            table_row = '';
        }

        // Adds the logic between the model and view
        for (var m = 0; m < self.squares.length; m++) {
            for (var n = 0; n < self.squares[m].length; n++) {
                if (boardName === 'playerGrid' && status === 'setup') {
                    $(document).on('click', '#' + self.squares[m][n].x + self.squares[m][n].y, function (data) {
                        if (data.currentTarget.id[2] !== undefined) {
                            self.placeShips(data.currentTarget.id[0], data.currentTarget.id[1] + data.currentTarget.id[2]);
                        }
                        else {
                            self.placeShips(data.currentTarget.id[0], data.currentTarget.id[1]);
                        }
                    })
                }
                else if (boardName === 'enemyGrid' && status === 'started') {
                    $(document).on('click', '#' + self.squares[m][n].x + self.squares[m][n].y,function (data) {
                        if (data.currentTarget.id[2] !== undefined) {
                            self.shoot(self.gameId, data.currentTarget.id[0], data.currentTarget.id[1] + data.currentTarget.id[2]);
                        }
                        else {
                            self.shoot(self.gameId, data.currentTarget.id[0], data.currentTarget.id[1]);
                        }
                    });
                }
            }
        }
    };

    self.shoot = function(id, x, y) {
        var shot = new Shot(x,y);
        shot.postShot(id);
    };

     self.updateBoard = function (boardName) {
        if (boardName === 'playerGrid') {
            for (var a = 0; a < self.myShips.length; a++) {
                console.log(self.myShips[a]['startCell']['x']);
                var x = self.myShips[a]['startCell']['x'];
                var y = self.myShips[a]['startCell']['y'];
                for (var b = 0; b < self.myShips[a].length; b++) {
                    $('#P' + x + y).css('background-color', 'green');
                    if (!self.myShips[a]['isVertical']) {
                        x = nextChar(x);
                    } else {
                        y++;
                    }
                }
            }
        }

        for (var i = 0; i < self.shots.length; i++) {
            if (boardName === 'enemyGrid') {
                if (self.shots[i]['isHit']) {
                    $('#' + self.shots[i]['x'] + self.shots[i]['y']).css('background-color', 'red');
                } else {
                    $('#' + self.shots[i]['x'] + self.shots[i]['y']).css('background-color', 'yellow');
                }
            } else {
                if (self.shots[i]['isHit']) {
                    $('#P' + self.shots[i]['x'] + self.shots[i]['y']).css('background-color', 'red');
                } else {
                    $('#P' + self.shots[i]['x'] + self.shots[i]['y']).css('background-color', 'yellow');
                }
            }
        }
     };


	//Function for adding ships to the battlefield
	self.placeShips = function(x, y) {
		// Model
        if (self.ships.length === 0) {
            alert('No ships to place');
            return;
        }

        var ship = self.ships[0];
		//reset ship coordinates
		ship.xCoordinates = [];
		ship.yCoordinates = [];
		//set state
		ship.isVertical = isVertical;

		var xas = x;
		var yas = y;
		
		//Calculate full coordinates for ship we are willing to place
		if(ship.isVertical) {
			for(var i = 0; i < ship.length; i++) {
				ship.xCoordinates.push(xas.toString());
				ship.yCoordinates.push(yas.toString());
				yas++;
			}
		} else {
			for(var i = 0; i < ship.length; i++) {
				ship.xCoordinates.push(xas.toString());
				ship.yCoordinates.push(yas.toString());
				xas = nextChar(xas.toString());
			}
		}

        var char = x;
        var int = y;
        var placeShip = true;

        for (var a = 0; a < ship.length; a++) {
            if (!ship.isVertical) {
                if(char == 'k') {
                    placeShip = false;
                    alert("Ship can't be placed here");
                    return;
                }
                char = nextChar(char);
            } else {
                if(int >= 11) {
                    placeShip = false;
                    alert("Ship can't be placed here");
                    return;
                }
                int++;
            }
        }
		
		var $placingSquare;
		//Iterate over too place ship coordinates
		for(var i = 0; i < ship.length; i++) {
			//Get block
			$placingSquare = $('#' + ship.xCoordinates[i] + ship.yCoordinates[i]);
			if($placingSquare.css('background-color') == 'rgb(0, 204, 0)') {
				alert("Ship can't be placed here");
				return;
			}
		}
		
		//play sound effect
		playReloadSound();
		
        ship.startCell = { "x": x, "y": y };
        self.placedShips.push(ship);
        self.ships.shift();
		
		//Remove table row in dock
		game.removeCurrentShipFromDock();

		// View
        for (var i = 0; i < ship.length; i++) {
			$('#' + x + y).css('background-color', 'rgb(0, 204, 0)');
            if (!ship.isVertical) {
                x = nextChar(x);
            }
            else {
                y++;
            }
        }
	};
	
	// Post board
    self.postBoard = function(id,placedShips) {
		//Check if the user added exaclty 5 ships
		if(placedShips.length !== 5) {
			alert('Place ALL your ships on the board.');
			return;
		}
		
        $.post(base_url + "games/" + id + "/gameboards?token=" + api_key,
            { "ships": [{
                    "_id": self.placedShips[0]._id,
                    "length": self.placedShips[0].length,
                    "name": self.placedShips[0].name,
                    "startCell": { "x": self.placedShips[0].startCell.x, "y": self.placedShips[0].startCell.y },
                    "isVertical": self.placedShips[0].isVertical,
                    "__v": self.placedShips[0].__v
                },
                {
                    "_id": self.placedShips[1]._id,
                    "length": self.placedShips[1].length,
                    "name": self.placedShips[1].name,
                    "startCell": { "x": self.placedShips[1].startCell.x, "y": self.placedShips[1].startCell.y },
                    "isVertical": self.placedShips[1].isVertical,
                    "__v": self.placedShips[1].__v
                },
                {
                    "_id": self.placedShips[2]._id,
                    "length": self.placedShips[2].length,
                    "name": self.placedShips[2].name,
                    "startCell": { "x": self.placedShips[2].startCell.x, "y": self.placedShips[2].startCell.y },
                    "isVertical": self.placedShips[2].isVertical,
                    "__v": self.placedShips[2].__v
                },
                {
                    "_id": self.placedShips[3]._id,
                    "length": self.placedShips[3].length,
                    "name": self.placedShips[3].name,
                    "startCell": { "x": self.placedShips[3].startCell.x, "y": self.placedShips[3].startCell.y },
                    "isVertical": self.placedShips[3].isVertical,
                    "__v": self.placedShips[3].__v
                },
                {
                    "_id": self.placedShips[4]._id,
                    "length": self.placedShips[4].length,
                    "name": self.placedShips[4].name,
                    "startCell": { "x": self.placedShips[4].startCell.x, "y": self.placedShips[4].startCell.y },
                    "isVertical": self.placedShips[4].isVertical,
                    "__v": self.placedShips[4].__v
                }]
            }
            , function(result) {
                alert(result['msg'] + ", " + result['status']);
                location.reload(true);
        })
        .fail(function () {
            alert("Gameboard couldn't be posted");
        });
    };
}

function Ship(id, length, name, startCell, isVertical, v) {
	var self = this;

    // Ship attributes
    self._id = id;
    self.length = length;
    self.name = name;
    self.startCell = startCell;
    self.isVertical = isVertical;
    self.__v = v;
	
	// Additional attributes, only used locally
	self.xCoordinates = [];
	self.yCoordinates = [];
}

function Square(x, y) {
	var self = this;
	self.y = y;
	self.x = x;
    self.hasShip = false;
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

function Shot(x, y) {
    var self = this;

    // Shot attributes
    self.x = x;
    self.y = y;

    self.postShot = function(id) {
        $.post(base_url + "games/" + id + "/shots?token=" + api_key, {
                "x": self.x,
                "y": self.y
        }
        , function(result) {
			switch(result) {
				case 'BOOM':
                    impactAnimation($('#' + x + y));
					playExplosionSound();
                    break;
				case 'SPLASH':
					playSplashSound();
					impactAnimation($('#' + x + y));
                    break;
				case 'FAIL':
					alert(result);
                    break;
                default:
                    alert(result);
                    break;
			}
            $("#refreshGame").trigger('click');
        })
        .fail(function () {
            alert("Shot couldn't be posted");
        });
    }
}

// Function for checking whether the browser is able to play sound of specified type
function canPlaySoundType(soundType) {
	if(new Audio().canPlayType(soundType)) {
		return true;
	}
	return false;
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

