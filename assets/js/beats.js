(function () {
	
	var player = new Tone.Players(
		{
			snare: './assets/audio/505/snare.mp3',
			hh: './assets/audio/505/hh.mp3',
			hho: './assets/audio/505/hho.mp3',
			bongoLo: './assets/audio/jazz/MTBongoLow.wav',
			bongoHi: './assets/audio/jazz/MTBongoHigh.wav',
			congaLo: './assets/audio/jazz/MTCongaLow.wav',
			congaHi: './assets/audio/jazz/MTCongaHigh.wav',
			congaMuteHigh: './assets/audio/jazz/MTCongaMutHi.wav',
			brush1: './assets/audio/jazz/R8Brush01.wav',
			brush2: './assets/audio/jazz/R8Brush02.wav',
			brush3: './assets/audio/jazz/R8Brush04.wav',
			rim: './assets/audio/jazz/snare-rim.wav',
			ride: './assets/audio/jazz/ride-bell.wav',
			tomLo: './assets/audio/jazz/DR220Tom_Lo.wav',
			tomHi: './assets/audio/jazz/DR220Tom_Hi.wav',
			kick: './assets/audio/505/kick.mp3',
			
			cowbell: './assets/audio/jazz/cowbell.wav',
			bellHi: './assets/audio/jazz/hi-bell.wav',
			clave: './assets/audio/jazz/clave.wav',
			rakeLo: './assets/audio/jazz/rakeHigh.wav',
			rakeHi: './assets/audio/jazz/rakeLow.wav',
			clap: './assets/audio/jazz/RX21Clap.wav',
			shakerLo: './assets/audio/jazz/shakerLow.wav',
			shakerHi: './assets/audio/jazz/shakerHigh.wav',
			timbale: './assets/audio/jazz/timbale.wav',
			streetDrumLo: './assets/audio/jazz/streetDrumLo.wav',
			streetDrumHi: './assets/audio/jazz/streetDrumHi.wav',
			whistle: './assets/audio/jazz/whistle.wav',
			clap: './assets/audio/jazz/RX21Clap.wav'
		},
		{
			volume: 5
		}
	).toMaster();
	
	// Set display names for UI
	player.get('cowbell').displayName = 'Cowbell';
	player.get('clave').displayName = 'Clave';
	player.get('rim').displayName = 'Snare Rim';
	player.get('cowbell').displayName = 'Cowbell';
	player.get('bellHi').displayName = 'Bell';
	player.get('tomLo').displayName = 'Tom Low';
	player.get('tomHi').displayName = 'Tom High';
	player.get('snare').displayName = 'Snare';
	player.get('kick').displayName = 'Kick';
	player.get('hh').displayName = 'Hi-hat Closed';
	player.get('hho').displayName = 'Hi-hat Off';
	player.get('bongoLo').displayName = 'Bongo Low';
	player.get('bongoHi').displayName = 'Bongo High';
	player.get('congaLo').displayName = 'Conga Low';
	player.get('congaHi').displayName = 'Conga High';
	player.get('congaMuteHigh').displayName = 'Conga Mute High';
	player.get('ride').displayName = 'Ride Bell';
	player.get('rakeLo').displayName = 'Gü&uuml;iro Low';
	player.get('rakeHi').displayName = 'Gü&uuml;iro High';
	player.get('clap').displayName = 'Clap';
	player.get('shakerLo').displayName = 'Shaker Low';
	player.get('shakerHi').displayName = 'Shaker High';
	player.get('timbale').displayName = 'Timabale High';
	player.get('streetDrumLo').displayName = 'Timbale Low';
	player.get('streetDrumHi').displayName = 'Street Drum High';
	player.get('whistle').displayName = 'Whistle';
	
	// Set volume to equalize instrument volumes
	player.get('cowbell').volume.value = -5;
	player.get('ride').volume.value = -3;
	player.get('tomLo').volume.value = -12;
	player.get('tomHi').volume.value = -12;
	player.get('kick').volume.value = -8;
	player.get('streetDrumHi').volume.value = -5;
	player.get('whistle').volume.value = -10;
	
	var defaultInstruments = [
		player.get('kick'),
		player.get('snare'),
		player.get('hh'),
		player.get('hho'),
		player.get('tomLo'),
		player.get('tomHi'),
		player.get('cowbell'),
		player.get('ride')
	];

	//[null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
	
	window.beats = (function() {
		
		return {
			
			allInstruments: player,
			
			instrumentSets: {
				bongos: {
					length: 16,
					bpm: 120,
					instruments: [
						player.get('bongoLo'),
						player.get('bongoHi'),
						player.get('congaLo'),
						player.get('congaHi'),
						player.get('congaMuteHigh')
					]
				},
				
				rockDrumSet: {
					length: 16,
					bpm: 115,
					instruments: [
						player.get('kick'),
						player.get('snare'),
						player.get('hh'),
						player.get('hho'),
						player.get('tomLo'),
						player.get('tomHi'),
						player.get('cowbell'),
						player.get('ride')
					]
				},
				
				parade: {
					length: 16,
					bpm: 115,
					instruments: [
						player.get('cowbell'),
						player.get('bellHi'),
						player.get('clave'),
						player.get('rakeLo'),
						player.get('rakeHi'),
						player.get('clap'),
						player.get('shakerLo'),
						player.get('shakerHi'),
						player.get('timbale'),
						player.get('streetDrumLo'),
						player.get('whistle')
					]
				}
			},
			
			empty: {
				beat1: new Array(defaultInstruments.length),
				beat2: new Array(defaultInstruments.length),
				length: 16,
				bpm: 100,
				instruments: defaultInstruments
			},
			
			experiment1: {
				beat1: [
					[null, null, null, null, null, null, null, null, "snare", "snare", null, null, null, null, null, null], 
					["hh", null, null, null, "hh", null, null, null, "hh", null, null, null, "hh", null, null, null], 
					[null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], 
					[null, null, 'tomLo', null, null, null, 'tomLo', null, null, null, 'tomLo', null, null, null, 'tomLo', null], 
					[null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], 
					[null, null, null, null, null, null, null, 'cowbell', null, null, null, null, null, null, null, 'cowbell'], 
					[null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]	
				],
				beat2: [
					[null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], 
					['hh', null, null, null, 'hh', null, null, null, 'hh', null, null, null, 'hh', null, null, null], 
					[null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], 
					[null, null, 'tomLo', null, null, null, 'tomLo', null, null, null, 'tomLo', null, null, null, 'tomLo', null], 
					[null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], 
					[null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], 
					[null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
				],
				length: 16,
				bpm: 120,
				instruments: [
					player.get('snare'),
					player.get('hh'),
					player.get('hho'),
					player.get('tomLo'),
					player.get('tomHi'),
					player.get('cowbell'),
					player.get('ride')
				]
			},
			
			experiment2: {
				beat1: [
					[null, null, null, null, null, null, null, null, 'hh', 'hh', 'hh', 'hh', 'hh', 'hh', 'hh', 'hh']
				],
				beat2: [
					['hh', 'hh', 'hh', 'hh', 'hh', 'hh', 'hh', 'hh', null, null, null, null, null, null, null, null]
				],
				length: 16,
				bpm: 100,
				instruments: [
					player.get('hh'),
				]
			},
			
			experiment3: {
				beat1: [
					['hh', null, 'hh', null, 'hh', null, 'hh', null, 'hh', null, 'hh', null, 'hh', null, 'hh', null]
				],
				beat2: [
					['hh', null, 'hh', null, 'hh', null, 'hh', null, 'hh', null, 'hh', null, 'hh', null, 'hh', null]
				],
				length: 16,
				bpm: 100,
				instruments: [
					player.get('hh'),
				]
			},
			
			experiment3: {
				beat1: [
					[null, null, null, null, null, null,'cowbell', null, null, null, null, null, null, null,'cowbell', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
					[null,'bellHi','bellHi', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
					[null, null, null, null, null, null, null, null, null, null, 'clave', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
					[null, null, null, null, null, null, null, null, null, null, null, null, 'rakeLo', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
				],
				beat2: [
					[null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
					[null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
					[null, null,'clave', null, null, null,'clave','clave', null, null, null, null, null, null,'clave', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
					[null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
				],
				length: 16,
				bpm: 100,
				instruments: [
					player.get('cowbell'),
					player.get('bellHi'),
					player.get('clave'),
					player.get('rakeLo'),
				]
			}
		};
	})();
	module.exports = window.beats;
})();