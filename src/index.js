
var IOTA = require('iota.lib.js');
var fs = require('fs');

var iota = new IOTA({
	'host': 'http://node.lukaseder.de',
	'port': 14265
});


function makeSeed() {
	var text = "";
	for (i = 1; i <= 81; i++) {
		var dez = Math.floor(Math.random() * 27) + 64;
		if (dez == 64) {
			text += "9";
		}
		else {
			text += String.fromCharCode(dez);
		}
	}
	return text;
}

function makeSeedAndCheck() {
	var seed = makeSeed();
	iota.api.getAccountData(seed, function(error, result) {
		if (result == null) {
			makeSeedAndCheck();
			return;
		}

		if (result.balance > 0 || result.addresses.length > 0 || result.inputs.length > 0) {
			//console.log("Balance: "+result.balance+ "    Seed: "+ seed);
			addNonEmptySeed(seed);
		}
		//console.log("NO Balance: "+result.balance+ "    Seed: "+ seed);
		updateCounter();
		makeSeedAndCheck();
	});
}


var counter = 0;
var foundAddresses = [];

function updateCounter() {
	counter++;
	fs.writeFileSync("counter.txt", counter+"");
}

function addNonEmptySeed(seed) {
	foundAddresses.push(seed);
	fs.writeFileSync("seeds.txt", JSON.stringify(foundAddresses));
}

function initCounter() {
	var data = fs.readFileSync('counter.txt', 'utf8');
	counter = parseInt(data);
	if (isNaN(counter)) {
		counter = 0;
	}
}

function initSeeds() {
	var data = fs.readFileSync('seeds.txt', 'utf8');
	foundAddresses = JSON.parse(data);
}

function init() {
	
	initCounter();
	initSeeds()
	makeSeedAndCheck();
}

init();

function counterObject() {
	var object = {};
	object.counter = counter;
	object.collisions = foundAddresses.length;
	return object;
}


const express = require('express')
const app = express()

app.get('/iotabruteforce', function (req, res) {
	var object = counterObject();
	var string = "Generated seeds: " + object.counter + " Collisions: " + object.collisions;
	var data = fs.readFileSync('public/index.html', 'utf8');
	data = data.replace('%iota_string%', string)
	res.send(data);
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})


