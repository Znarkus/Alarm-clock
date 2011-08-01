<?php

require('top.php');

?>
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<title>Music Web Remote 2</title>
	<meta name="viewport" content="width=device-width" />
	<link href="resource/css/main.css" rel="stylesheet" media="all" />
</head>
<body>

<h1>Music Web Remote 2</h1>
<h2>Radio</h2>

<div id="global-controllers">
	<label>
		Volume:
		
		<select id="volume">
			<? foreach (array_fill(0, 10, '') as $i => $t): ?>
				<? $v = 100 - $i * 10 ?>
				<option value="<?= $v ?>"><?= $v ?></option>
			<? endforeach ?>
		</select>
	</label>
</div>


<ul class="not-loaded" id="stations">
	<li>Stations not loaded</li>
</ul>


<!-- Templates -->

<script id="tmpl-station" type="text/x-jquery-tmpl">
    <li data-station="${station}" id="station-${station}" {{if playing}}class="playing"{{/if}}>
    	${station}
    	
    	(
    		<span class="playback-wrapper">
    			{{if playing}}
    				Playing... <a href="javascript:;">Stop</a>
    			{{else}}
    				<a href="javascript:;">Play</a>
    			{{/if}}
    		</span>,
    		<span class="nap-wrapper">
    			{{if napping}}
    				Napping until ${$item._info.nap.endString}... <a href="javascript:;">Cancel nap</a>
    			{{else}}
    				<a href="javascript:;">Nap</a>
    			{{/if}}
    		</span>,
    		<span class="alarm-wrapper">
    			{{if alarmSet}}
    				Alarm set to go off in ${$item._info.alarm.relString} (${$item._info.alarm.absString})... <a href="javascript:;">Cancel alarm</a>
    			{{else}}
    				<a href="javascript:;">Alarm</a>
    			{{/if}}
    		</span>
    	)
    </li>
</script>


<script type="text/javascript"> var Config = <?= json_encode($config) ?>; </script>
<script type="text/javascript" src="resource/js/jquery-1.6.2.min.js"></script>
<script type="text/javascript" src="resource/js/jquery.tmpl.min.js"></script>
<script type="text/javascript" src="resource/js/jquery.timeago.js"></script>
<script type="text/javascript" src="resource/js/main.js"></script>

</body>
</html>