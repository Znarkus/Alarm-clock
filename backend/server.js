
var util = require('util'),
	childProcess = require('child_process'),
	child = null, currentVolume = 80, stationPlaying = null,
	napInfo = { timer: null, end: null, station: null },
	alarmInfo = { timer: null, next: null, station: null };

var Stations = {
	p3: { cmd: 'mplayer -playlist http://sverigesradio.se/topsy/direkt/164-mp3.asx -volume %volume%' }
};

function log(text){
	util.puts('[' + (new Date()).toUTCString() + '] ' + text);
}

function mplayerCommand(cmd){
	if (child !== null && child.stdin.writable) {
		child.stdin.write(cmd + '\n');
		return true;
	} else {
		return false;
	}
}

function stations(){
	var data = [];
	
	Object.keys(Stations).forEach(function(station){
		data.push({
			station: station,
			playing: stationPlaying === station,
			napping: napInfo.station === station,
			alarmSet: alarmInfo.station === station
		});
	});
	
	return data;
}

function play(station){
	log('Starting playback of "' + station + '"...');
	
	if (child === null) {
		var cmd = Stations[station].cmd.replace('%volume%', currentVolume) + ' -slave -quiet > /dev/null';
		
		child = childProcess.exec(cmd, function(/*error, stdout, stderr*/){
			//util.puts('[CALLBACK]', error, stderr);
			child = null;
		});
	}
	
	stationPlaying = station;
}

function stop(){
	log('Stopping...');
	mplayerCommand('quit');
	stationPlaying = null;
}

function mute(){
	log('Muting...');
	mplayerCommand('mute 1');
}

function unmute(){
	log('Unmuting...');
	mplayerCommand('mute 0');
}

function volume(value){
	if (value === undefined) {
		return currentVolume;
	} else {
		value = value * 1;
		log('Setting volume to ' + value + '...');
		currentVolume = value;
		mplayerCommand('volume ' + value + ' 1');
	}
}

function cancel(what){
	switch (what) {
		case 'nap':
			clearTimeout(napInfo.timer);
			napInfo = { timer: null, end: null, station: null };
		break;
		
		case 'alarm':
			clearTimeout(alarmInfo.timer);
			alarmInfo = { timer: null, next: null, station: null };
		break;
	}
}

function nap(time, station){
	if (time === undefined) {
		return { end: napInfo.end, station: napInfo.station };
	} else {
		var m = time.match(/^([0-9\.]+)([smh])$/);
		
		switch (m[2]) {
			case 's':
				time = m[1] * 1;
				log('Napping for ' + m[1] + ' seconds...');
			break;
			
			case 'm':
				time = m[1] * 60;
				log('Napping for ' + m[1] + ' minutes...');
			break;
			
			case 'h':
				time = m[1] * 3600;
				log('Napping for ' + m[1] + ' hours...');
			break;
		}
		
		stop();
		
		cancel('nap');
		napInfo.end = (new Date()).getTime() + time * 1000;
		napInfo.station = station;
		napInfo.timer = setTimeout(function(){
			napInfo.timer = null;
			napInfo.end = null;
			napInfo.station = null;
			play(station);
		}, time * 1000);
	}
}

function _getTimestampFromTime(hh, mm){
	var d = new Date();
	
	d.setHours(hh);
	d.setMinutes(mm);
	d.setSeconds(0);
	
	if (d <= new Date()) {
		d.setDate(d.getDate() + 1);
	}
	
	return d.getTime();
}

function _alarm(timestamp, station){
	log('Alarm is set to go off ' + (new Date(timestamp)).toUTCString() + '');
	
	cancel('alarm');
	alarmInfo.next = timestamp;
	alarmInfo.station = station;
	alarmInfo.timer = setTimeout(function(){
		play(station);
		
		var next = new Date(timestamp);
		next.setDate(next.getDate() + 1);
		_alarm(next.getTime(), station);
	}, timestamp - (new Date()).getTime());
}

function alarm(time, station){
	if (time === undefined) {
		return { next: alarmInfo.next, station: alarmInfo.station };
	} else {
		var m = time.match(/^([0-9]{1,2}):([0-9]{1,2})$/);
		_alarm(_getTimestampFromTime(m[1], m[2]), station);
	}
}

exports.play = play;
exports.stop = stop;
exports.mute = mute;
exports.unmute = unmute;
exports.volume = volume;
exports.nap = nap;
exports.stations = stations;
exports.alarm = alarm;
exports.cancel = cancel;

util.puts('\n * Loading interfaces...\n');

var m = process.argv[process.argv.length - 1].match(/^interfaces=(.+)$/);

if (m !== null) {
	m[1].split(',').forEach(function(i){
		require('./interfaces/' + i + '.js');
	});
} else {
	require('./interfaces/commandline.js');
	require('./interfaces/http.js');
}

//command = 'mplayer -playlist http://sverigesradio.se/topsy/direkt/164-mp3.asx -slave -quiet';
//command = 'mplayer -playlist http://sverigesradio.se/topsy/direkt/164-mp3.asx > /dev/null';



/*util.pump(child.stdout, process.stdout);

setTimeout(function(){
	util.puts('MUTE');
	child.stdin.write('mute 1\n');
}, 4000);*/
/*child.stdout.on('data', function(){
	util.puts(arguments);
});*/
//console.log('[AFTER]', child);
