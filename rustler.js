/* exported Game */
let Game = {
	video: null,
	width: null,
	height: null,
	pixelCount: null,
	canvas: null,
	context: null,
	clock: null,
	meter: null,
	previousCanvasData: null,
	gameIsRunning: false,
	startTime: null,
	difficulty: 50,
	youwon: null,
	youlost: null,
	nooo: [
		'nooo', 'uh-oh', 'ohdear', 'oops', 'bummer', 'missed', 'ohdear1', 'missed1', 'grenade', 'bummer1'
	],
	jingle: ['jingle', 'flawless1', 'wobble', 'fire', 'firstblood', 'victory', 'victory2'],
	hurry: ['hurry', 'comeonthen', 'stupid', 'comeonthen1', 'whatthe'],
	hurryPlayed: 1,

	init: function () {
		for (let id of ['video', 'canvas', 'clock', 'meter', 'youwon', 'youlost']) {
			this[id] = document.getElementById(id);
		}

		this.width = this.video.width;
		this.height = this.video.height;
		this.pixelCount = this.width * this.height;

		this.context = this.canvas.getContext('2d');

		let onstart = (stream) => {
			this.video.src = URL.createObjectURL(stream);
			this.video.play();
		};
		if ('getUserMedia' in navigator.mediaDevices) {
			navigator.mediaDevices.getUserMedia({
				video: { width: this.width, height: this.height }
			}).then(onstart);
		} else {
			navigator.webkitGetUserMedia({video: true}, onstart, function() {});
		}

		window.onkeypress = (event) => {
			if (event.charCode == 32) {
				event.preventDefault();
				this.stopGame(true);
			}
		};

		this.youwon.addEventListener('transitionend', function() {
			this.classList.add('hidden');
		});
		this.youlost.addEventListener('transitionend', function() {
			this.classList.add('hidden');
		});
	},

	requestAnimationFrame: function () {
		setTimeout(this.draw.bind(this), 50);
	},

	draw: function () {
		if (!this.gameIsRunning) {
			return;
		}

		this.context.drawImage(this.video, 0, 0, this.width, this.height);
		if (Date.now() - this.startTime < 200) {
			this.requestAnimationFrame();
			return;
		}

		let frame = this.context.getImageData(0, 0, this.width, this.height);
		let data = frame.data;

		if (!this.previousCanvasData) {
			this.previousCanvasData = data;
			this.requestAnimationFrame();
			return;
		}

		let count = 0;
		for (let i = 0; i < this.pixelCount; i++) {
			if (Math.abs(this.previousCanvasData[i * 4] - data[i * 4]) > 20) {
				count++;
			}
		}

		let time = Date.now() / 1000 - this.startTime;
		this.clock.textContent = time.toFixed(1);

		let seconds = Math.floor(time);
		if (seconds % 10 === 0 && seconds > this.hurryPlayed) {
			this.playSound('hurry');
			this.hurryPlayed = seconds;
		}

		let percentage = count / 150;
		this.meter.style.width = percentage + '%';
		this.meter.style.backgroundColor = 'hsl(' + Math.max(0, 100 - percentage) + ', 80%, 50%)';

		if (percentage < this.difficulty) {
			this.previousCanvasData = data;
			this.requestAnimationFrame();
		} else {
			this.stopGame();
		}
	},

	startGame: function(difficulty=50) {
		this.gameIsRunning = true;
		this.hurryPlayed = 1;
		document.body.classList.add('running');
		this.difficulty = difficulty;
		this.startTime = Date.now() / 1000;
		this.video.play();
		this.requestAnimationFrame();
		document.documentElement.focus();
	},

	stopGame: function(win=false) {
		if (!this.gameIsRunning) {
			return;
		}
		this.gameIsRunning = false;
		document.body.classList.remove('running');
		this.video.pause();
		this.previousCanvasData = null;
		if (win) {
			this.playSound('jingle');
			this.youwon.classList.remove('hidden');
		} else {
			this.playSound('nooo');
			this.youlost.classList.remove('hidden');
		}
	},

	playSound: function(which) {
		let sounds = this[which];
		let chosen = Math.floor(Math.random() * sounds.length);
		new Audio('fx/' + sounds[chosen] + '.ogg').play();
	}
};
