var Mongo = require('mongodb');
var express = require('express');
var bodyParser = require('body-parser');
//var fs = require('fs');
var app = express();
//App config



var	port = process.env.PORT || 8082; // set our port


var connectSetting = {
	uri_decode_auth: true
};
var MongoClient = Mongo.MongoClient;
var db;
var mongoclient = new MongoClient( /*server, {native_parser: true}*/ );




// Connecting with MongoDB
mongoclient.connect('mongodb://localhost:27017', connectSetting, function(msg/*, returnedDb*/) {
	if ( msg ){
		console.log('Connected to database with ' + (msg));
	}else {
		console.log('Connected to database ');
	}
	db = mongoclient.db('test');
	getNaucoreData();

});

function getNaucoreData() {
	db.collection('naucore', function (error, collection) {
		db.naucore = collection;
	});
	db.collection('naucoreTemperature', function (error, collection) {
		db.naucoreTemperature = collection;
	});
}


// Create API
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var ArrayData = [],ArrayDataTemperature = [];

app.use(function (req, res, next) {
	res.set('Access-Control-Allow-Origin', '*');
	res.set('Access-Control-Allow-Methods', 'POST, GET, DELETE, PUT, OPTIONS');
	res.set('Access-Control-Allow-Headers', 'origin, x-csrftoken, content-type, accept');
	next();
});

app.get('/dates/:datetime',function(req, res) {
	ArrayData.length = 0;
	db.naucore.find({datetime : decodeURI(req.params.datetime)},function(err,items) {
		items.toArray(function(err, items ) {
			for (var i = 0; i < items.length; i++ ) {
				ArrayData.push(items[i]);
			}
			res.json({ data: ArrayData });
		});
	});
});

app.get('/date',function(req, res) {
	var today = new Date();
	var todayString = today.toDateString();
	todayString = new RegExp(todayString);
	ArrayData.length = 0;
	db.naucore.find({ 'data.datetime' : todayString }, function(err,items) {
		console.log(todayString);
		items.toArray(function(err, items ) {
			for (var i = 0; i < items.length; i++ ) {
				ArrayData.push(items[i]);
			}
			res.json({
				data: ArrayData,
				total: ArrayData.length
			});
		});
	});
});

app.get('/temperature',function(req, res) {
	var today = new Date();
	var todayString = today.toDateString();
	todayString = new RegExp(todayString);
	ArrayDataTemperature.length = 0;
	db.naucoreTemperature.find({ 'data.datetime' : todayString }, function(err,items) {
		console.log(todayString);
		items.toArray(function(err, items ) {
			for (var i = 0; i < items.length; i++ ) {
				ArrayDataTemperature.push(items[i]);
			}
			res.json({
				data: ArrayDataTemperature
			});
			//console.log(ArrayDataTemperature);
		});
	});
});

app.listen(port);
console.log('Magic happens on port ' + port);