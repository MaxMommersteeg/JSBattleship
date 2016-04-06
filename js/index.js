/**
 * Custom JavaScript for the index page.
 */

// Global variables
var gameList;

// Current game
var game;

//Ship is Vertical
var isVertical = false;

/**
 * Document ready function.
 * Shows all the games.
 * Add functions to buttons.
 * implements the socket
 */
$(function() {
    gameList = new GameList();
    gameList.showGames();
    $(document).on('click', '#refreshGames', gameList.showGames);
    $(document).on('click', '#startGameAI', gameList.startGameAI);
    $(document).on('click', '#startGamePlayer', gameList.startGamePlayer);
    $(document).on('click', '#deleteGames', gameList.deleteGames);
    $(document).on('click', '#showGamelist', function() {
        location.reload(true);
    });
	$(document).on('click', '#turnShip', function() {
		isVertical = !isVertical;
		$('#turnShip').text(isVertical ? 'Ship vertical' : 'ship horizontal');
	});
	
    // Implementing the socket
    //var server = base_url;
    //var options = {
    //    query: "token=" + api_key,
    //};
    //
    //var connection = io.connect(server, options);
    //
    //connection.on('update', function(gameId) {
    //    alert('game '+gameId+'updated');
    //    gameList.showGames();
    //});

});
