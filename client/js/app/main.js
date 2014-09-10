$(document).ready(function() {
	$.getJSON('http://192.168.0.104:8082/date',function(data) {
		var html = '';
		var i;
		$('#times').text(data.total);
		console.log(data);
		if (data.data.length > 5){
			for (i = data.data.length - 1; i > data.data.length - 5 ; i--) {
				html += '<li>' + data.data[i].data.datetime + '</li>';
			}
			$('#list-time ul').append(html);
		}
		if (data.data.length > 0 && data.data.length <= 5){
			for (i = 1 ; i <= data.data.length ; i++) {
				html += '<li>' + data.data[data.data.length - i].data.datetime + '</li>';
			}
			$('#list-time ul').append(html);
		}
	});
	$.getJSON('http://192.168.0.104:8082/temperature',function(data) {
		console.log(data);
		//Temperature code here
		var collectedTemperatureData = [],
			timeTemperatureData = [];
		for (var i = 0; i < data.data.length; i++) {
			collectedTemperatureData.push(data.data[i].data.temperature);
			timeTemperatureData.push(i + ' min(s)');
		}

		var lineChartData = {
			labels : timeTemperatureData,
			datasets : [
				{
					label: 'Temperature Dataset',
					fillColor : 'rgba(220,220,220,0.2)',
					strokeColor : 'rgba(220,220,220,1)',
					pointColor : 'rgba(220,220,220,1)',
					pointStrokeColor : '#fff',
					pointHighlightFill : '#fff',
					pointHighlightStroke : 'rgba(220,220,220,1)',
					data : collectedTemperatureData
				}
			]

		};
		var ctx = document.getElementById('canvas-temp-chart').getContext('2d');
		window.myLine = new Chart(ctx).Line(lineChartData, {
			responsive: true
		});
	});
	$.getJSON('https://api.spark.io/v1/devices/55ff6d065075555335341887/temperature?access_token=5a4501e8e5d6ab780731274e000a5894657f9d10',function(data) {
		$('#temparature').text(data.result);
		$('#last-time-temp').text((new Date(data.coreInfo.last_heard)).toGMTString());
	});
});