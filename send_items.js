const config = require('./config');
const SteamUser = require('steam-user');
const SteamCommunity = require('steamcommunity');
const SteamTotp = require('steam-totp');
const TradeOfferManager = require('steam-tradeoffer-manager');
const FS = require('fs');



//###################       !IMPORTANT!
var owner_trade_url = 'https://steamcommunity.com/tradeoffer/new/?partner=xxxxxxxxxx&token=xxxxxxx';
//###################       !IMPORTANT!



var total_account_count = Object.keys(config).length;
function loop(index) {
	if(config.length <= index ){
		console.log("all done!");
		process.exit(1);
		return;
	}
	var auth = config[index];
	let client = new SteamUser();
	let manager = new TradeOfferManager({
		"steam": client, // Polling every 30 seconds is fine since we get notifications from Steam
		"domain": "example.com", // Our domain is example.com
		"language": "en" // We want English item descriptions
	});
	let community = new SteamCommunity();
	
	let logOnOptions = {
		"accountName": auth.steam_user,
		"password": auth.steam_pass,
		"twoFactorCode": SteamTotp.getAuthCode(auth.sharedSecret)
	};

	client.logOn(logOnOptions);
	console.log('['+index+'/'+total_account_count+'] '+auth.steam_user);
	
	client.on('loggedOn', function() {
		client.on('webSession', function(sessionID, cookies) {
		manager.setCookies(cookies, function(err) {
			if (err) {
				console.log(err);
				process.exit(1); // Fatal error since we couldn't get our API key
				return;
			}

			//console.log("Got API key: " + manager.apiKey);

			// Get our inventory
			manager.getInventoryContents(753, 6, true, function(err, inventory) { //https://dev.doctormckay.com/topic/1325-how-can-i-get-the-contextid/
				if (err) {
					console.log(err);
					return;
				}

				if (inventory.length == 0) {
					// Inventory empty
					console.log('['+index+'/'+total_account_count+']'+auth.steam_user+': '+"STEAM inventory is empty");
					console.log('['+index+'/'+total_account_count+']'+auth.steam_user+': '+"done!");
								setTimeout(function(){	
									client.logOff();
									loop(++index);
								}, 500);
					return;
				}

				console.log('['+index+'/'+total_account_count+']'+auth.steam_user+': '+"Found " + inventory.length + " STEAM items");

				// Create and send the offer
				let offer = manager.createOffer(owner_trade_url);
				offer.addMyItems(inventory);
				offer.setMessage("Here, have some items!");
				offer.send(function(err, status) {
					if (err) {
						console.log(err);
						return;
					}

					if (status == 'pending') {
						// We need to confirm it
						console.log('['+index+'/'+total_account_count+']'+auth.steam_user+': '+`Offer #${offer.id} sent, but requires confirmation`);
						community.acceptConfirmationForObject(auth.identity_secret, offer.id, function(err) {
							if (err) {
								console.log(err);
							} else {
								console.log('['+index+'/'+total_account_count+']'+auth.steam_user+': '+"Offer confirmed");
								console.log('['+index+'/'+total_account_count+']'+auth.steam_user+': '+"done!");
								setTimeout(function(){	
									client.logOff();
									loop(++index);
								}, 500);
							}
						});
					} else {
						console.log('['+index+'/'+total_account_count+']'+auth.steam_user+': '+`Offer #${offer.id} sent successfully`);
					}
				});
			});
		});

		community.setCookies(cookies);
	});
	});
	client.on('error', function onSteamError(error) {
	    console.log("Connection closed by server - ", error);
	});

}

loop(0);