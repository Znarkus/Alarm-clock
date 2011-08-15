
(function(){
	
	var _info, _stationLookup = {}, lockUiUpdate = false;
	
	Config.server.httpAddress = 'http://' + Config.server.address + ':' + Config.server.port + '/';
	
	function _command(command, parameters, callback){
		if (typeof(parameters) === 'function') {
			callback = parameters;
			parameters = {};
		}
		
		callback = callback === undefined ? function(){} : callback;
		
		$.ajax({
			url: Config.server.httpAddress + command,
			data: parameters,
			dataType: 'jsonp',
			success: function(d){
				callback(d.response);
			},
			error: function(){
				alert('Failed');
			}
		});
	}
	
	function _play(station){
		_command('play', { station: station});
	}
	
	function _stop(){
		_command('stop');
	}
	
	function _nap(time, station, callback){
		_command('nap', { time: time, station: station }, callback);
	}
	
	function _alarm(time, station, callback){
		_command('alarm', { time: time, station: station }, callback);
	}
	
	function _volume(volume){
		_command('volume', { volume: volume });
	}
	
	function _cancel(what){
		_command('cancel', { what: what });
	}
	
	function _stationInfo(station){
		return _info.stations[_stationLookup[station]];
	}
	
	function _liByStation(station){
		return $('#station-' + station);
	}
	
	function _updateLi($li){
		var station = $li.data('station'),
			info = _stationInfo(station);
		
		$('#tmpl-station').tmpl({
			station: station,
			name: info.name,
			playing: info.playing,
			napping: info.napping,
			alarmSet: info.alarmSet
		}, { _info: _info }).replaceAll($li);
		
		$li = _liByStation(station);
		_bindPlaybackWrapper($li);
		_bindNapWrapper($li);
		_bindAlarmWrapper($li);
	}
	
	function _bindPlaybackWrapper($li){
		$('.playback-wrapper a', $li).unbind('click').click(function(){
			var $wrapper = $(this).closest('.playback-wrapper'),
				$li = $wrapper.closest('li'),
				station = $li.data('station'),
				info = _stationInfo(station);
			
			if (info.playing) {
				_stop();
			} else {
				_play(station);
			}
			
			info.playing = !info.playing;
			_updateLi($li);
		})
	}
	
	function _bindNapWrapper($li){
		$('.nap-wrapper a', $li).unbind('click').click(function(){
			var $wrapper = $(this).closest('.nap-wrapper'),
				$li = $wrapper.closest('li'),
				station = $li.data('station'),
				info = _stationInfo(station);
			
			if (info.napping) {
				info.napping = !info.napping;
				_cancel('nap');
				_updateLi($li);
			} else {
				var time = prompt('For how long? (30s = 30 seconds, 30m = 30 minutes)');
				
				if (time) {
					_nap(time, station, function(){
						_loadData(function(){
							_updateLi($li);
						});
					});
				}
			}
			
		});
	}
	
	function _bindAlarmWrapper($li){
		$('.alarm-wrapper a', $li).unbind('click').click(function(){
			var $wrapper = $(this).closest('.alarm-wrapper'),
				$li = $wrapper.closest('li'),
				station = $li.data('station'),
				info = _stationInfo(station);
			
			if (info.alarmSet) {
				info.alarmSet = !info.alarmSet;
				_cancel('alarm');
				_updateLi($li);
			} else {
				var now = new Date();
				var time = prompt('When should the alarm go off?', now.format('H:MM'));
				
				if (time) {
					_alarm(time, station, function(){
						_loadData(function(){
							_updateLi($li);
						});
					});
				}
			}
			
		});
	}
	
	function _loadData(callback){
		_command('info', function(info){
			_info = info;
			
			$.each(_info.stations, function(index, item){
				_stationLookup[item.station] = index;
			});
			
			if (_info.nap.end !== null) {
				_info.nap.endString = jQuery.timeago(new Date(_info.nap.end));
			}
			
			if (_info.alarm.next !== null) {
				var alarm = new Date(_info.alarm.next);
				_info.alarm.absString = alarm.format('H:MM');
				_info.alarm.relString = jQuery.timeago(alarm);
			}
			
			if (callback !== undefined) {
				callback();
			}
		});
	}
	
	function _updateUi(){
		if (lockUiUpdate) {
			return;
		}
		
		var $stations = $('#stations')/*.html('<li>Loading...</li>')*/,
			$volume = $('#volume');
		
		_loadData(function(){
			$stations.empty();
			$('#tmpl-station').tmpl(_info.stations, { _info: _info }).appendTo($stations);
			$volume.val(_info.volume);
			_bindPlaybackWrapper($('li', $stations));
			_bindNapWrapper($('li', $stations));
			_bindAlarmWrapper($('li', $stations));
		});
	}
	
	jQuery.timeago.settings.allowFuture = true;
	
	_updateUi();
	setInterval(_updateUi, 10*1000);
	
	$('#volume').change(function(){
		_volume($(this).val());
	}).focus(function(){
		lockUiUpdate = true;
	}).blur(function(){
		lockUiUpdate = false;
	});
	
})();