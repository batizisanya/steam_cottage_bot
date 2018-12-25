# Steam cottage event - Automatical farming bot
You need Node.js v4.1.1 or higher to use this bot, and need to know shared_secret and identity_secret from maFile.

### Installation and running
1. Copy all files into folder
2. run `npm install`
3. Edit config file. You can add infinity account, pasting this, before the `module.exports = config;` line.
```
config.push({
	steam_user: "..",
	steam_pass: "..",
	sharedSecret: "..",
	identity_secret: ".."
});
```
4. Start the bot with `nodejs cottage` command, and wait until its end.


5. (optional) Edit trade url in send_items.js, if you want the bots send items to you. (WARN: this script will send ALL items from your steam subinventory. (Backgrounds, emoticons, trading cards, etc...)
6. (optional) Start the trading script with `nodejs send_items` command, and wait until the end. 



### Credits
Thanks quer for the base of the code.    [https://github.com/quer/the-steam-awards](https://github.com/quer/the-steam-awards)
