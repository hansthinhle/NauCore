var EventSource = require('eventsource');
var Mongo = require('mongodb');
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
//var fs = require('fs');
var app = express();
//App config



var	port = process.env.PORT || 8082; // set our port


var es = new EventSource('https://api.spark.io/v1/events/motion-detected?access_token=5a4501e8e5d6ab780731274e000a5894657f9d10');

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

app.get('/list',function(req, res) {
	db.naucore.find(function(err,items) {
		items.toArray(function(err, items ) {
			res.writeHead(200, {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				'Connection': 'keep-alive'
			});
			for (var i = 0; i < items.length; i++ ) {
				ArrayData.push(items[i]);
				res.write('data : { data : ' + JSON.stringify(items[i]) + '}\n\n');
			}
		});
	});
});

es.on('motion-detected', function(e) {
	var objData;
	eval('objData = ' + e.data);
	var obj = {
		data : {
			core_id : objData.coreid,
			datetime : new Date(objData.published_at).toString(),
			total_times : objData.data,
			time_to_live : objData.ttl
		}
	};
	db.naucore.insert(obj,function(/*err,items*/) {
	});
});

app.get('/dates',function(req, res) {
	db.naucore.find(function(err,items) {
		items.toArray(function(err, items ) {
			res.writeHead(200, {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				'Connection': 'keep-alive'
			});
			for (var i = 0; i < items.length; i++ ) {
				ArrayData.push(items[i]);
				res.write('data : { data : ' + JSON.stringify(items[i]) + '}\n\n');
			}
		});
	});
});

function getTemperature() {
	request({
		url: 'https://api.spark.io/v1/devices/55ff6d065075555335341887/temperature?access_token=5a4501e8e5d6ab780731274e000a5894657f9d10',
		json: true
	}, function(error, response, objData) {
		if (!error && response.statusCode === 200) {
			var obj = {
				data : {
					core_id : objData.coreInfo.deviceID,
					datetime : (new Date()).toString(),
					last_checked : (new Date(objData.coreInfo.last_heard)).toString(),
					temperature : objData.result
				}
			};
			db.naucoreTemperature.insert(obj,function(/*err,items*/) {
				console.log(obj);
			});
		}
	});
}
setInterval(function() {
	getTemperature();
},300000);


app.listen(port);
console.log('Magic happens on port ' + port);