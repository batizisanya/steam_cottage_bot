const config = require('./config');
var fs = require('fs');
const Steam = require('steam');
const SteamTotp = require('steam-totp');
const SteamWebLogOn = require('steam-weblogon');
const cheerio = require('cheerio');
const request = require('request');
Steam.servers = [{host:'155.133.242.8', port: 27019}];
var total_account_count = Object.keys(config).length;
function loop(index) {
	if(config.length <= index ){
		console.log("all done!")
		process.exit(1);
		return;
	}
	var auth = config[index];
	var steamClient = new Steam.SteamClient(),
	    steamUser = new Steam.SteamUser(steamClient),
	    steamFriends = new Steam.SteamFriends(steamClient),
		steamWebLogOn = new SteamWebLogOn(steamClient, steamUser);
	steamClient.connect();
	steamClient.on('servers', function(server) {
		//console.log(server);
	});
	steamClient.on('connected', function() {
		console.log("Connected to Steam.");
		steamUser.logOn({
			account_name: auth.steam_user,
			password: auth.steam_pass,
			//auth_code: "NBMD8"
			two_factor_code: SteamTotp.getAuthCode(auth.sharedSecret)
		});
		console.log('['+index+'/'+total_account_count+'] '+auth.steam_user);
	});
	
	steamClient.on('logOnResponse', function onSteamLogOn(logonResp) {
		//console.log("logOnResponse");
		console.log('['+index+'/'+total_account_count+']'+auth.steam_user+': '+"logOnResponse", logonResp.eresult);
	    if (logonResp.eresult == Steam.EResult.OK) {
	    	//console.log("logOnResponse OK");
	        steamFriends.setPersonaState(Steam.EPersonaState.Busy);
	        websession(steamWebLogOn, index, auth, steamClient, steamUser, function (_requestCommunity, _requestStore, sessionID) {
				var date = new Date().toISOString().split('.')[0];
	        	open_door(0, date, index, auth,_requestStore, sessionID, function () {
					open_door(1, date, index, auth,_requestStore, sessionID, function () {
						open_door(2, date, index, auth, _requestStore, sessionID, function () {
							open_door(3, date, index, auth, _requestStore, sessionID, function () {
								open_door(4, date, index, auth, _requestStore, sessionID, function () {
									open_door(5, date, index, auth, _requestStore, sessionID, function () {
										open_door(6, date, index, auth, _requestStore, sessionID, function () {
											open_door(7, date, index, auth, _requestStore, sessionID, function () {
												open_door(8, date, index, auth, _requestStore, sessionID, function () {
													open_door(9, date, index, auth, _requestStore, sessionID, function () {
														open_door(10, date, index, auth, _requestStore, sessionID, function () {
															open_door(11, date,index,  auth, _requestStore, sessionID, function () {
																open_door(12, date, index, auth, _requestStore, sessionID, function () {
																	open_door(13, date, index, auth, _requestStore, sessionID, function () {
																			console.log('['+index+'/'+total_account_count+']'+auth.steam_user+': '+"done!");
																			setTimeout(function(){	
																				steamClient.disconnect();
																				loop(++index);
																			}, 500);
																	})
																})
															})
														})
													})
												})
											})
										})
									})
								})
							})
						})
					})
				})
	        })
	    }
	});
	steamClient.on('loggedOff', function onSteamLogOff(eresult) {
	    console.log("Logged off from Steam.");
	});

	steamClient.on('error', function onSteamError(error) {
	    console.log("Connection closed by server - ", error);
	});


// end 
}

loop(0);
function websession(steamWebLogOn, index, auth, steamClient, steamUser, callback) {	
	var _requestCommunity;
	var _j1;
	var _requestStore;
	var _j2;
	var defaultTimeout = 30000;
	var storeURL = 'https://store.steampowered.com';
	var communityURL = 'https://steamcommunity.com';
	console.log('['+index+'/'+total_account_count+']'+auth.steam_user+': '+"websession start");
	steamWebLogOn.webLogOn(function(sessionID, newCookie) {
		//console.log(sessionID, newCookie);  //UNCOMMENT FOR DEBUG
		//console.log(defaultTimeout);  //UNCOMMENT FOR DEBUG
		var requestWrapper1 = request.defaults({
			timeout: defaultTimeout
		});
		var requestWrapper2 = request.defaults({
			timeout: defaultTimeout
		});
        _j1 = request.jar();
        _j2 = request.jar();

		_requestCommunity = requestWrapper1.defaults({jar: _j1});
		_requestStore = requestWrapper2.defaults({jar: _j2});
		newCookie.forEach(function(name) {
			_j1.setCookie(request.cookie(name), communityURL);
			_j2.setCookie(request.cookie(name), storeURL);
		});
		console.log('['+index+'/'+total_account_count+']'+auth.steam_user+': '+"websession done");
		callback(_requestCommunity, _requestStore, sessionID);
	});
}

function open_door(door_id, time, index, auth, _request, sessionID, callback) {
	console.log('['+index+'/'+total_account_count+']'+auth.steam_user+': '+"open - " +door_id + " - start");
	_request.post({
		url: 'https://store.steampowered.com/promotion/opencottagedoorajax',
		form:{
			sessionid: sessionID,
			door_index: door_id,
			t: time,
			open_door: false
		},
		headers: {
			'Origin': 'https://store.steampowered.com',
			'Accept': '*/*',
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			'Referer': 'https://store.steampowered.com/promotion/cottage_2018'

		}
	}, function (error, response, body) {
		//console.log(error);
		//console.log(response);
		//console.log(body);
		console.log('['+index+'/'+total_account_count+']'+auth.steam_user+': '+"open - " +door_id + " - end");
		setTimeout(function(){
			callback();
		}, 500);
	});
}
