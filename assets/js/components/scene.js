var StartAudioContext = require('startaudiocontext');

module.exports = function() {
	
	var renderer, scene, camera, controls, floor;
	var raycaster = new THREE.Raycaster();
	var mouse = new THREE.Vector2();
	var wireframeMaterial = new THREE.MeshBasicMaterial({ wireframe: true, color: new THREE.Color('black'), opacity: 0.25, transparent: true });
	var invisibleMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color('white'), opacity: 0, transparent: true });
	var distinctColors = [
		new THREE.Color('#2F72CA'),
		new THREE.Color('#A82F2F'),
		new THREE.Color('#18995B'),
		new THREE.Color('#F2B233'), 
		new THREE.Color('#543459'), 
		new THREE.Color('#f58231'), 
		new THREE.Color('#6EC2ED'), 
		new THREE.Color('#B898B9'), 
		new THREE.Color('#BA2B06'), 
		new THREE.Color('#123546'),
		new THREE.Color('#D5638A') 

		
	];
	var textColors = ['white', 'white', 'white', 'black', 'white', 'black', 'black', 'black', 'white', 'white', 'white'];
	
	var black = new THREE.Color('black');
	var timeCursor, timeCursor2;
	var playing = false;
	var targetList = [];
	var rhythmWheelMesh, rhythmWheelMesh2, wireframeMesh, wireframeMesh2;
	var tracks = [], tracks2 = [];
	var rhythmCount = 0, rhythmCount2 = 0;
	var scope;
	var loop1, loop2;
	var clearWheel1, clearWheel2, copyWheel, muteWheel, muted = false, muteLabel;

	var preset = beats.empty;
	
	return {
		
		settings: {
			defaultCameraLocation: {
				x: 0,
				y: 12,
				z: 0
			},
			axesHelper: {
				activateAxesHelper: false,
				axisLength: 10
			},
			font: {
				enable: true,
				fontStyle: {
					font: null,
					size: 0.5,
					height: 0,
					curveSegments: 1
				},
			},
			smallFont: {
				fontStyle: {
					font: null,
					size: 0.2,
					height: 0,
					curveSegments: 1
				},
			},
			messageDuration: 2000,
			zBufferOffset: 0.01,
			colors: {
				worldColor: new THREE.Color('white'),
				gridColor: black,
				arrowColor: black
			},
			floorSize: 100,
			rhythmWheel: {
				innerRadius: utils.mobile() ? .5 : 1,
				outerRadius: 5,
				beats: preset.length,
				tracks: preset.instruments.length
			}
		},
		
		init: function() {

			let self = this;
			self.loadFont();
		},
		
		begin: function() {
			
			let self = this;
			
			scene = gfx.setUpScene(scene);
			renderer = gfx.setUpRenderer(renderer);
			camera = gfx.setUpCamera(camera);
			//controls = gfx.enableControls(controls, renderer, camera);
			gfx.resizeRendererOnWindowResize(renderer, camera);
			self.bindUIEvents();
			gfx.setUpLights(scene);
			gfx.setCameraLocation(camera, self.settings.defaultCameraLocation);
			if (utils.mobile()) gfx.setCameraLocation(camera, new THREE.Vector3(self.settings.defaultCameraLocation.x, self.settings.defaultCameraLocation.y + 5, self.settings.defaultCameraLocation.z));
			camera.lookAt(new THREE.Vector3(0, 0, 0));
			self.addGeometries();
			self.addWheelLabels(rhythmWheelMesh);
			self.addWheelLabels(rhythmWheelMesh2);
			self.addUILabels();
			self.setUpRhythm();
			
			var animate = function() {

				requestAnimationFrame(animate);
				renderer.render(scene, camera);
				if (controls) controls.update();
				
				rhythmWheelMesh.geometry.colorsNeedUpdate = true;
			};
			
			animate();
		},
		
		initEmptyTracks: function() {
			
			for (let i = 0; i < this.settings.rhythmWheel.tracks; i++) { // init empty beats
				tracks.push([]);
				tracks2.push([]);
				for (let j = 0; j < this.settings.rhythmWheel.beats; j++) {
					tracks[i].push(null);
					tracks2[i].push(null);
				}
			}
		},
		
		setUpRhythm: function() {
			
			let self = this;
			
			let bpm = 120;
			if (preset) {
				bpm = preset.bpm;
			}
			Tone.Transport.bpm.value = bpm;
			document.querySelector('#bpm').value = preset.bpm.toString();
			document.querySelector('#wheelLength').value = self.settings.rhythmWheel.beats.toString();
			Tone.Transport.timeSignature = [2, 4];
			
			self.initEmptyTracks();
			
			if (typeof preset.beat1[0] !== 'undefined') tracks = preset.beat1;
			if (typeof preset.beat2[0] !== 'undefined') tracks2 = preset.beat2;
			
			for (let track = 0; track < tracks.length; track++) {
				
				for (let beat = 0; beat < tracks[track].length; beat++) {
					
					if (tracks[track][beat]) this.setNoteOn(rhythmWheelMesh, beat, track);
					if (tracks2[track][beat]) this.setNoteOn(rhythmWheelMesh2, beat, track);
				}
			}

			loop1 = new Tone.Loop(function(time) {
				
				triggerBeats(time, timeCursor, tracks, rhythmCount);
				rhythmCount++;
			}, '16n');
			//loop1.start(0);
			
			loop2 = new Tone.Loop(function(time) {
				
				triggerBeats(time, timeCursor2, tracks2, rhythmCount2);
				rhythmCount2++;
			}, '16n');
			//loop2.start(0);
			
			loop2.playbackRate = .985;
			
			scope = self;
			function triggerBeats(time, timeCursor, tracks, rhythmCount) {
				
				timeCursor.rotation.y += -2*Math.PI/scope.settings.rhythmWheel.beats;
				let beat = rhythmCount % scope.settings.rhythmWheel.beats;

				for (let i = 0; i < scope.settings.rhythmWheel.tracks; i++) {
					
					if (tracks[i]) { // an instrument added but no notes for that instrument in preset.beat[]
						
						if (tracks[i][beat] !== null) {
							preset.instruments[i].start(time, 0);
						}
					}
				}
			}
		},
		
		addGeometries: function() {
			
			let self = this;
			
			floor = gfx.addFloor(this.settings.floorSize, scene, this.settings.colors.worldColor, this.settings.colors.gridColor);
			
			let rhythmWheel = new THREE.RingGeometry(self.settings.rhythmWheel.innerRadius, self.settings.rhythmWheel.outerRadius, self.settings.rhythmWheel.beats, self.settings.rhythmWheel.tracks);
			rhythmWheel.rotateX(-Math.PI/2);
			rhythmWheel.rotateY(Math.PI/2);
			rhythmWheel.translate(0, this.settings.zBufferOffset, 0);
			let rhythmWheel2 = new THREE.RingGeometry(self.settings.rhythmWheel.innerRadius, self.settings.rhythmWheel.outerRadius, self.settings.rhythmWheel.beats, self.settings.rhythmWheel.tracks);
			rhythmWheel2.rotateX(-Math.PI/2);
			rhythmWheel2.rotateY(Math.PI/2);
			rhythmWheel2.translate(0, this.settings.zBufferOffset, 0);
			
			let solidFaceMaterial = new THREE.MeshBasicMaterial({
				color: new THREE.Color('white'),
				vertexColors: THREE.FaceColors,
				transparent: false
			});
			let translucentFaceMaterial = new THREE.MeshBasicMaterial({
				color: new THREE.Color('white'),
				vertexColors: THREE.FaceColors,
				transparent: true,
				opacity: 0.14
			});
			
			let materials = [translucentFaceMaterial, solidFaceMaterial];
			rhythmWheelMesh = new THREE.Mesh(rhythmWheel, materials);
			rhythmWheelMesh2 = new THREE.Mesh(rhythmWheel2, materials);
			
			rhythmWheelMesh.position.x -= 7;
			rhythmWheelMesh2.position.x += 7;
			self.setEmptyFaceColors(rhythmWheelMesh);
			self.setEmptyFaceColors(rhythmWheelMesh2);
			
			wireframeMesh = new THREE.Mesh(rhythmWheel, wireframeMaterial);
			wireframeMesh2 = new THREE.Mesh(rhythmWheel2, wireframeMaterial);
			wireframeMesh.position.y += this.settings.zBufferOffset * 2;
			wireframeMesh2.position.y += this.settings.zBufferOffset * 2;
			wireframeMesh.position.x -= 7;
			wireframeMesh2.position.x += 7;
			targetList.push(rhythmWheelMesh);
			targetList.push(rhythmWheelMesh2);
			scene.add(rhythmWheelMesh);
			scene.add(rhythmWheelMesh2);
			scene.add(wireframeMesh);
			scene.add(wireframeMesh2);
			
			var geometry = new THREE.BoxGeometry(1.35, .01, 1.35);
			clearWheel1 = new THREE.Mesh(geometry, invisibleMaterial);
			clearWheel1.position.set(rhythmWheelMesh.position.x, rhythmWheelMesh.position.y, rhythmWheelMesh.position.z);
			targetList.push(clearWheel1);
			scene.add(clearWheel1);
			
			clearWheel2 = new THREE.Mesh(geometry, invisibleMaterial);
			clearWheel2.position.set(rhythmWheelMesh2.position.x, rhythmWheelMesh2.position.y, rhythmWheelMesh2.position.z);
			targetList.push(clearWheel2);
			scene.add(clearWheel2);
			
			copyWheel = new THREE.Mesh(geometry, invisibleMaterial);
			copyWheel.position.set((rhythmWheelMesh.position.x + rhythmWheelMesh2.position.x) / 2, (rhythmWheelMesh.position.y + rhythmWheelMesh2.position.y) / 2, (rhythmWheelMesh.position.z + rhythmWheelMesh2.position.z) / 2);
			targetList.push(copyWheel);
			scene.add(copyWheel);
			
			geometry = new THREE.BoxGeometry(2, .01, .8);
			muteWheel = new THREE.Mesh(geometry, invisibleMaterial);
			muteWheel.position.set(clearWheel2.position.x, clearWheel2.position.y, clearWheel2.position.z + 6.5);
			targetList.push(muteWheel);
			//scene.add(muteWheel);
			
			geometry = new THREE.BoxGeometry(0.1, 0.01, this.settings.rhythmWheel.outerRadius - this.settings.rhythmWheel.innerRadius);
			var material = new THREE.MeshBasicMaterial({color: black, transparent: true, opacity: 0.75});
			timeCursor = new THREE.Mesh(geometry, material);
			timeCursor2 = new THREE.Mesh(geometry, material);
			
			geometry.translate(0, .01, -(this.settings.rhythmWheel.outerRadius - this.settings.rhythmWheel.innerRadius)/2 - this.settings.rhythmWheel.innerRadius);
			timeCursor.position.set(rhythmWheelMesh.position.x, this.settings.zBufferOffset * 2, 0);
			timeCursor2.position.set(rhythmWheelMesh2.position.x, this.settings.zBufferOffset * 2, 0);
			scene.add(timeCursor);
			scene.add(timeCursor2);
		},
		
		setEmptyFaceColors: function(mesh) {
			
			let self = this;
			mesh.geometry.faces.forEach(function (face, i) { // set default color tracks
				let trackIndex = Math.floor(i / (self.settings.rhythmWheel.beats * 2));
				face.materialIndex = 0;
				face.color = distinctColors[trackIndex];
			});
		},
		
		setNoteOn: function(mesh, beatIndex, trackIndex) {
			
			let track = trackIndex + 1;
			beatIndex = beatIndex % this.settings.rhythmWheel.beats;
			let facesPerRow = this.settings.rhythmWheel.beats * 2;
			let faceIndex = (facesPerRow * track - 1) - (beatIndex * 2);

			this.setFaceColorByIndex(mesh, faceIndex, distinctColors[trackIndex], 1);
			this.setFaceColorByIndex(mesh, faceIndex - 1, distinctColors[trackIndex], 1);
			mesh.geometry.faces[faceIndex].selected = true;
			mesh.geometry.faces[faceIndex - 1].selected = true;
		},
		
		setNoteOff: function(mesh, beatIndex, trackIndex) {
			
			let track = trackIndex + 1;
			beatIndex = beatIndex % this.settings.rhythmWheel.beats;
			let facesPerRow = this.settings.rhythmWheel.beats * 2;
			let faceIndex = (facesPerRow * track - 1) - (beatIndex * 2);

			this.setFaceColorByIndex(mesh, faceIndex, distinctColors[trackIndex], 1);
			this.setFaceColorByIndex(mesh, faceIndex - 1, distinctColors[trackIndex], 1);
			mesh.geometry.faces[faceIndex].selected = false;
			mesh.geometry.faces[faceIndex - 1].selected = false;
		},

		enableControls: function() {
			controls = new THREE.OrbitControls(camera, renderer.domElement);
			controls.target.set(0, 0, 0);
			controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
			controls.dampingFactor = 0.05;
			controls.zoomSpeed = 6;
			controls.enablePan = !utils.mobile();
			controls.minDistance = 0;
			controls.maxDistance = 200;
			controls.maxPolarAngle = Math.PI / 2;
		},
		
		bindUIEvents: function() {
			
			let self = this;
			let message = document.getElementById('message');
			
			let onMouseMove = function(event) {
				mouse.x = ( (event.clientX - renderer.domElement.offsetLeft) / renderer.domElement.width ) * 2 - 1;
				mouse.y = -( (event.clientY - renderer.domElement.offsetTop) / renderer.domElement.height ) * 2 + 1;
			};
			
			window.addEventListener('mousemove', onMouseMove, false);
			
			document.querySelector('canvas').addEventListener('click', function(event) {
				
				self.intersects(event);
			});
			
			let wheelLengthInput = document.querySelector('#wheelLength');
			let instrumentSelector = document.querySelector('.instrument-selection');
			let presetSelector = document.querySelector('.presets');
			
			if (presetSelector) presetSelector.addEventListener('change', function() {
				
				if (instrumentSelector) instrumentSelector.selectedIndex = 0;
				wheelLengthInput.parentElement.parentElement.style.display = 'none';
				preset = beats[presetSelector.value];
				tracks = [];
				tracks2 = [];
				self.settings.rhythmWheel.tracks = preset.instruments.length;
				self.settings.rhythmWheel.beats = preset.length;
				self.reset();
			});
			
			if (instrumentSelector) instrumentSelector.addEventListener('change', function() {
				
				presetSelector.selectedIndex = 0;
				wheelLengthInput.parentElement.parentElement.style.display = 'block';
				self.clearAllNotes(rhythmWheelMesh);
				self.clearAllNotes(rhythmWheelMesh2);
				preset = beats['empty'];
				preset.bpm = beats.instrumentSets[instrumentSelector.value].bpm
				preset.instruments = beats.instrumentSets[instrumentSelector.value].instruments;
				self.settings.rhythmWheel.tracks = beats.instrumentSets[instrumentSelector.value].instruments.length;
				self.settings.rhythmWheel.beats = beats.instrumentSets[instrumentSelector.value].length;
				self.reset();
			});
			
			let playToggle = document.querySelector('.play-toggle');
			playToggle.addEventListener('click', function() {
				
				StartAudioContext(Tone.context)
				if (Tone.context.state !== 'running') {
					Tone.context.resume();
				}
				
				playToggle.classList.toggle('active');
				Tone.Transport.toggle();

				loop1.start(0);
				loop2.start(0);
			});
			
			let clearButton = document.querySelector('.clear-notes');
			if (clearButton) clearButton.addEventListener('click', function() {
				
				self.clearAllNotes(rhythmWheelMesh);
				self.clearAllNotes(rhythmWheelMesh2);
			});
			
			let inputSteppers = document.querySelectorAll('.input-stepper');
			inputSteppers.forEach(function(inputStepper) {

				let input = inputStepper.querySelector('input');
				if (input.getAttribute('id') === 'wheelLength') {
					
					let increase = inputStepper.querySelector('.increase');
					if (increase) increase.addEventListener('click', function() {
						let max = parseInt(input.getAttribute('max'));
						if (input.value < max) {	
							input.value = parseInt(input.value) + 1;
							
							self.increaseWheel();
						}
					});
					
					let decrease = inputStepper.querySelector('.decrease');
					if (decrease) decrease.addEventListener('click', function() {
						let min = parseInt(input.getAttribute('min'));
						if (input.value > min) {
							input.value = parseInt(input.value) - 1;
							
							self.decreaseWheel();
						}
					});
				}
				
				if (input.getAttribute('id') === 'phase') {
					
					let increase = inputStepper.querySelector('.increase');
					if (increase) increase.addEventListener('click', function() {
						let max = parseFloat(input.getAttribute('max'));
						if (input.value < max) {
							let newRate = parseFloat(input.value) + .5;
							input.value = newRate;
							loop2.playbackRate = newRate/100;
						}
					});
					
					let decrease = inputStepper.querySelector('.decrease');
					if (decrease) decrease.addEventListener('click', function() {
						let min = parseFloat(input.getAttribute('min'));
						if (input.value > min) {
							let newRate = parseFloat(input.value) - .5
							input.value = newRate;
							loop2.playbackRate = newRate/100;
						}
					});
				}
			});
		},
		
		clearAllNotes: function(mesh) {
			
			let self = this;
			self.reset();
			preset.beats = [];
			tracks = [];
			tracks2 = [];
			
			self.initEmptyTracks();
			
			for (let i = 0; i < self.settings.rhythmWheel.beats; i++) {
				
				preset.beats.push([]);
				
				for (let j = 0; j < self.settings.rhythmWheel.tracks; j++) {
					
					preset.beats[i].push(null);
					self.setNoteOff(mesh, i, j);
				}
			}
			
			self.setEmptyFaceColors(mesh);
		},
		
		reset: function() {
			
			let self = this;
			
			Tone.Transport.stop();
			Tone.Transport.cancel(0);
			rhythmCount = 0, rhythmCount2 = 0;
			targetList = [];
			
			while(scene.children.length > 0){ 
				scene.remove(scene.children[0]); 
			}
			
			self.addGeometries();
			self.addWheelLabels(rhythmWheelMesh);
			self.addWheelLabels(rhythmWheelMesh2);
			self.addUILabels();
			self.setUpRhythm();
			muted = false;
			
			let playToggle = document.querySelector('.play-toggle');
			playToggle.classList.remove('active');
			console.log(targetList);
		},
		
		increaseWheel: function() {
			
			let self = this;
			self.settings.rhythmWheel.beats += 1;
			
			preset.beat.forEach(function(track) {
				track.push(null);
			});
			self.reset();
			self.clearAllNotes(rhythmWheelMesh);
			self.clearAllNotes(rhythmWheelMesh2);
		},
		
		decreaseWheel: function() {
			
			let self = this;
			self.settings.rhythmWheel.beats -= 1;
			self.clearAllNotes(rhythmWheelMesh);
			self.clearAllNotes(rhythmWheelMesh2);
			preset.beat.forEach(function(track) {
				track.pop(null);
			});
			self.reset();
			self.clearAllNotes(rhythmWheelMesh);
			self.clearAllNotes(rhythmWheelMesh2);
		},
		
		intersects: function(event) {
			
			let self = this;
			raycaster.setFromCamera(mouse, camera);
			var intersects = raycaster.intersectObjects(targetList);
			
			if (intersects.length > 0) {
				
				let faceIndex = intersects[0].faceIndex;
				self.setUpFaceClicks(faceIndex, intersects[0].object);
				self.setUpDeleteAndCopyClicks(intersects[0].object);
			}
		},
		
		setUpDeleteAndCopyClicks(object) {
			if (object === copyWheel) this.copyWheel();
			if (object === clearWheel1) this.clearWheel(rhythmWheelMesh);
			if (object === clearWheel2) {
				
				this.clearWheel(rhythmWheelMesh2);
			}
			if (object === muteWheel) this.togglePhaseMute();
		},
		
		togglePhaseMute: function() {
			
			let self = this;
			
			scene.remove(muteLabel);
			if (!muted) {
				muteLabel = self.labelPoint(new THREE.Vector3(clearWheel2.position.x - .6, clearWheel2.position.y, clearWheel2.position.z + 6.5), 'Unmute Phase', scene, black, self.settings.smallFont);
			}
			else {
				muteLabel = self.labelPoint(new THREE.Vector3(clearWheel2.position.x - .6, clearWheel2.position.y, clearWheel2.position.z + 6.5), 'Mute Phase', scene, black, self.settings.smallFont);
			}
			muted = !muted;
		},
		
		copyWheel: function() {
			tracks2 = tracks;
			this.reset();
		},
		
		clearWheel: function(mesh) {
			
			let self = this; 
			if (mesh === rhythmWheelMesh) {
				tracks = [];
				preset = beats['empty'];
				self.reset();
			}
			else if (mesh === rhythmWheelMesh2) {
				tracks2 = [];
				preset = beats['empty'];
				self.reset();
			}
		},
		
		setUpFaceClicks: function(faceIndex, mesh) {
			
			let beatIndex = (this.settings.rhythmWheel.beats - 1) - Math.floor(faceIndex / 2) % this.settings.rhythmWheel.beats;
			let trackIndex = Math.floor(faceIndex / (this.settings.rhythmWheel.beats * 2));

			let setMaterial = 1;
			if (mesh.geometry.faces[faceIndex].selected === true) {
				setMaterial = 0;
			}
			else {
				setMaterial = 1;
			}
			
			let evenFace = (faceIndex % 2 === 0);
			if (evenFace) {
				this.setFaceColorByIndex(mesh, faceIndex, distinctColors[trackIndex], setMaterial);
				this.setFaceColorByIndex(mesh, faceIndex + 1, distinctColors[trackIndex], setMaterial);
				mesh.geometry.faces[faceIndex].selected = !mesh.geometry.faces[faceIndex].selected;
				mesh.geometry.faces[faceIndex + 1].selected = !mesh.geometry.faces[faceIndex + 1].selected;
			}
			else {
				this.setFaceColorByIndex(mesh, faceIndex, distinctColors[trackIndex], setMaterial);
				this.setFaceColorByIndex(mesh, faceIndex - 1, distinctColors[trackIndex], setMaterial);
				mesh.geometry.faces[faceIndex].selected = !mesh.geometry.faces[faceIndex].selected;
				mesh.geometry.faces[faceIndex - 1].selected = !mesh.geometry.faces[faceIndex - 1].selected;
			}
			
			if (mesh === rhythmWheelMesh) {
				
				if (tracks[trackIndex][beatIndex] === null) tracks[trackIndex][beatIndex] = Object.keys(beats.allInstruments._players)[trackIndex]; // get an instrument for each track row
				else tracks[trackIndex][beatIndex] = null;
			}
			else if (mesh === rhythmWheelMesh2) {
				
				if (tracks2[trackIndex][beatIndex] === null) tracks2[trackIndex][beatIndex] = Object.keys(beats.allInstruments._players)[trackIndex]; // get an instrument for each track row
				else tracks2[trackIndex][beatIndex] = null;
			}
		},
		
		setFaceColorByIndex: function(mesh, faceIndex, color, materialIndex) {
			mesh.geometry.faces[faceIndex].materialIndex = materialIndex;
			mesh.geometry.faces[faceIndex].color.setRGB(color.r, color.g, color.b);
			
			mesh.geometry.colorsNeedUpdate = true;
			mesh.geometry.groupsNeedUpdate = true;
		},
		
		loadFont: function() {
			
			let self = this;
			let loader = new THREE.FontLoader();
			let fontPath = '';
			fontPath = 'assets/vendors/js/three.js/examples/fonts/helvetiker_regular.typeface.json';

			loader.load(fontPath, function(font) { // success event
				
				self.settings.font.fontStyle.font = font;
				self.settings.smallFont.fontStyle.font = font;
				self.begin();
				if (self.settings.axesHelper.activateAxesHelper) self.labelAxes();
			},
			function(event) { // in progress event.
			},
			function(event) { // error event
				self.settings.font.enable = false;
				self.begin();
			});
		},
		
		resizeRendererOnWindowResize: function() {

			window.addEventListener('resize', utils.debounce(function() {
				
				if (renderer) {
	
					camera.aspect = window.innerWidth / window.innerHeight;
					camera.updateProjectionMatrix();
					renderer.setSize(window.innerWidth, window.innerHeight);
				}
			}, 250));
		},
		
		labelPoint: function(pt, label, scene, color, font) {
			
			let self = this, mesh;
			font = font || this.settings.font;
			let textCenterOffset = font.fontStyle.size / 2;
			if (this.settings.font.enable) {
				color = color || 0xff0000;
				let textGeometry = new THREE.TextGeometry(label, font.fontStyle);
				textGeometry.rotateX(-Math.PI / 2);
				textGeometry.translate(pt.x - textCenterOffset, pt.y, pt.z + textCenterOffset);
				let textMaterial = new THREE.MeshBasicMaterial({ color: color });
				mesh = new THREE.Mesh(textGeometry, textMaterial);

				scene.add(mesh);
			}
			return mesh;
		},
		
		addWheelLabels: function(mesh) {
			
			let self = this;
			let transform = new THREE.Vector3(0, 0, -this.settings.rhythmWheel.outerRadius);
			let wheelCenter = new THREE.Vector3(mesh.position.x, mesh.position.y, mesh.position.z);
			
			let instrumentNames = document.querySelector('.instrument-names');
			instrumentNames.innerHTML = '';
			preset.instruments.forEach(function(instrument, i) {
				let instrumentElement = document.createElement('li');
				instrumentElement.innerHTML = instrument.displayName;
				instrumentElement.style.backgroundColor = '#' + distinctColors[i].getHexString();
				instrumentElement.style.color = textColors[i];
				instrumentNames.appendChild(instrumentElement);
			});
			
			for (let i = 0; i < self.settings.rhythmWheel.beats; i++) {
				
				let axis = new THREE.Vector3(0, 1, 0);
				let placementRotation = -(2 * Math.PI / self.settings.rhythmWheel.beats) * (i+ 1);
				let centerRotation = Math.PI / self.settings.rhythmWheel.beats;
				let totalRotation = placementRotation + centerRotation;
				let result = transform.clone().applyAxisAngle(axis, totalRotation);
				
				let labelPoint;
				if (i % 2 === 1) {
					result.setLength(result.length() * (1 + self.settings.font.fontStyle.size / 4));
					labelPoint = gfx.movePoint(wheelCenter, result);
					if (self.settings.rhythmWheel.beats < 32) {
						
						self.labelPoint(labelPoint, Math.floor((i + 2)/2).toString(), scene, black);
					}
					else {
						self.labelPoint(labelPoint, Math.floor((i + 2)/2).toString(), scene, black, self.settings.smallFont);
					}
				}
				else if (self.settings.rhythmWheel.beats <= 31) {
					result.setLength(result.length() * (1 + self.settings.font.fontStyle.size / 8));
					labelPoint = gfx.movePoint(wheelCenter, result);
					self.labelPoint(labelPoint, '&', scene, black, self.settings.smallFont);
				}
			}
		},
		
		addUILabels: function() {
			
			let self = this;
			self.labelPoint(new THREE.Vector3(clearWheel1.position.x - .2, clearWheel1.position.y, clearWheel1.position.z), 'Clear', scene, black, self.settings.smallFont);
			self.labelPoint(new THREE.Vector3(clearWheel2.position.x - .2, clearWheel2.position.y, clearWheel2.position.z), 'Clear', scene, black, self.settings.smallFont);
			self.labelPoint(new THREE.Vector3(copyWheel.position.x - .6, copyWheel.position.y, copyWheel.position.z), 'Copy', scene, black, self.settings.smallFont);
			//muteLabel = self.labelPoint(new THREE.Vector3(clearWheel2.position.x - .6, clearWheel2.position.y, clearWheel2.position.z + 6.5), 'Mute Phase', scene, black, self.settings.smallFont);
			
			gfx.drawLine(new THREE.Vector3(.25, 0, 0), new THREE.Vector3(1, 0, 0), scene, black);
			gfx.drawLine(new THREE.Vector3(1, 0, 0), new THREE.Vector3(.8, 0, -.2), scene, black);
			gfx.drawLine(new THREE.Vector3(1, 0, 0), new THREE.Vector3(.8, 0, .2), scene, black);
		}
	};
};