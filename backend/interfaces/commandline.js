
var util = require('util'),
	stdin = process.openStdin(),
	server = require.main.exports;

util.puts(' * Command-line interface loaded.');
util.puts('   Commands: stations, play [station], stop, mute, unmute, volume [0-100], nap [0-9]+[smh] [station], alarm [HH:MM] [station], cancel [nap/alarm], quit/exit.\n');

stdin.on('data', function(buffer){
	var m = buffer.toString().match(/^([a-z]+)(.*)\n$/);
	
	if (m !== null) {
		var args = m[2].trim().split(' ');
		switch (m[1]) {
			case 'stations':
				util.puts(server.stations());;
			break;
			
			case 'play':
				server.play(args[0]);
			break;
			
			case 'stop':
				server.stop();
			break;
			
			case 'mute':
				server.mute();
			break;
			
			case 'unmute':
				server.unmute();
			break;
			
			case 'volume':
				server.volume(args[0])
			break;
			
			case 'nap':
				server.nap(args[0], args[1]);
			break;
			
			case 'alarm':
				server.alarm(args[0], args[1]);
			break;
			
			case 'cancel':
				server.cancel(args[0]);
			break;
			
			case 'quit':
			case 'exit':
				//process.stdin.removeAllListeners('data');
				process.exit();
			break;
			
			default:
				util.puts('Invalid command');
			break;
		}
	}
});