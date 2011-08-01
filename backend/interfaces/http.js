
var util = require('util'),
	http = require('http'),
	url = require('url')
	server = require.main.exports;

var httpCommands = {
	info: function(p){
		return {
			stations: server.stations(),
			volume: server.volume(),
			nap: server.nap(),
			alarm: server.alarm()
		};
	},
	play: function(p){
		server.play(p.station);
	},
	stop: function(){
		server.stop();
	},
	mute: function(){
		server.mute();
	},
	unmute: function(){
		server.unmute();
	},
	volume: function(p){
		server.volume(p.volume);
	},
	nap: function(p){
		server.nap(p.time, p.station);
	},
	alarm: function(p){
		// encodeURI decodeURI
		server.alarm(p.time.replace('%3A', ':'), p.station);
	},
	cancel: function(p){
		server.cancel(p.what);
	}
};

var httpServer = http.createServer(function(request, response){
	var parsedUrl = url.parse(request.url),
		command = parsedUrl.pathname.substr(1);
	
	if (httpCommands[command] === undefined) {
		response.writeHead(404, { 'Content-Type' : 'text/plain' });
		response.end('No such command "' + command + '"');
	} else {
		var parameters = {};
		
		if (parsedUrl.query !== undefined) { 
			parsedUrl.query.split('&').forEach(function(part){
				part = part.split('=');
				parameters[part[0]] = part.slice(1).join('');
			});
		}
		
		var jsonpCallback = parameters.callback,
			returnValue = { success: true };
		
		delete parameters['callback'];
		delete parameters['_'];
		
		//response.writeHead(200, { 'Content-Type' : 'application/json' });
		response.writeHead(200, { 'Content-Type' : 'text/plain' });
		
		if (returnValue !== undefined) {
			returnValue.response = httpCommands[command](parameters);
		}
		
		response.write(jsonpCallback + '(' + JSON.stringify(returnValue) + ')');
		response.end();
	}
});

httpServer.listen(8000, function(){
	util.puts(' * HTTP interface loaded. Server started on port 8000.');
	util.puts('   Commands: /play?station=[station], /stop, /mute, /unmute, /volume?volume=[0-100].\n');
});

