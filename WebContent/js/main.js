function analyze (words) {
	var statistics = [];
	for (i = 0; i < 26; ++i) {
		var p = [0,0,0,0,0];
		var metrics = {
			c : String.fromCharCode (i+65), 
			r : 0,
			p : p
		}
		statistics.push (metrics);
	}
	for (i = 0; i < words.length; ++i) {
		var word = words[i];
		for (j = 0; j < word.length; ++j) {
			var code = word.toUpperCase().charCodeAt(j)-65;
			if (code >= 0 && code < 26) {
				statistics[code].r++;
				statistics[code].p[j]++;
			}
		}
	}
	return statistics;
}

function findWord (words, stats) {
	var guesses = [];
	for (i = 0; i < wordlist.length; ++i) {
		var word = wordlist[i];
		var p = new Array(5).fill(0);
		var used = new Array(26).fill(0);
		var guess = {
			c : word.toUpperCase(),
			r : 0,
			p : p
		}
		for (j = 0; j < word.length; ++j) {
			var code = word.toUpperCase().charCodeAt(j)-65;
			if (code >= 0 && code < 26) {
				if (used[code] < stats[code].p[j]) {
					guess.r += (stats[code].p[j] - used[code]);
					guess.p[j] = stats[code].p[j];
					used[code] = stats[code].p[j];
				}
			}
		}
		guesses.push (guess);
	}
	guesses.sort((a, b) => (a.r > b.r) ? -1 : 1);
	return guesses;
}

function showTable (data, title, div, len) {
	var s = "<BR>" + title + "<BR><TABLE width='62%'>";
	len = len < 0 ? data.length : len;
	for (i = 0; i < len; ++i) {
		s += "<TR><TD>";
		s += data[i].c +  "</TD><TD align='right'>" + data[i].r;
		for (j =0; j < 5; ++j) {
			s += "</TD><TD align='right' width='10%'>" + data[i].p[j];
		}
		s += "</TD></TR>";
	}
	s += "</TABLE>";
	document.getElementById(div).innerHTML = s;
}


const letterState = ['letter-grey','letter-yellow','letter-green']

function drawboard (board, div) {
	var s = "<BR><BR><div id='gameTable' width='62%'>";
	var n = game.step;

	for (i = 0; i < n; ++i) {
		s += '<div class="row">'
		
		for (j =0; j < 5; ++j) {
			s += `<div
				class='
					letter
					${game.step > 0? letterState[board[i].m[j]]: ''}
					${i === n - 1 ? `active-letter-${j+1}`:''}
				'
				align='center'
				width='15%'
				>
					${board[i].w.charAt(j)}
			</div>`;
		}
		s += `<div class="remaining">${board[i].c} possible</div>`;
		s+= "</div>"
	}
	s += "</div>";
	document.getElementById(div).innerHTML = s;
}

function checkboard (word, board, step) {
	if (step > 0) {
		var hint = board[step-1];
		var w1 = hint.w.toUpperCase();
		var w2 = word.toUpperCase();

		for (i = 0; i < w1.length; ++i) {
			var matched = w1.charAt(i) == w2.charAt(i)
			if (hint.m[i] == 2 && !matched) {
				return false;
			}
			var c1 = w1.charAt(i);
			var found = w2.indexOf (c1) >= 0;
			if (hint.m[i] == 0 && found) {
				return false;
			}
			if (hint.m[i] == 1 && (!found || matched)) {
				return false;
			}
		}
	}
	return true;
}

function testboard (board, step) {
	var w1 = board[step].w;
	var w2 = game.answer;
	board[step].m[i] = 0;
	for (i = 0; i < w1.length; ++i) {
		if (w1.charAt(i) == w2.charAt(i)) {
			board[step].m[i] = 2;
		}
		else {
			if (w2.indexOf(w1.charAt(i)) >= 0) {
				board[step].m[i] = 1;
			}
		}
	}
	return w1 == w2;
}

function play (board, step) {
	wordlist = wordlist.filter (word => checkboard(word, board, step));
	var statistics = analyze (wordlist);
	showTable (statistics, "General Statistics:", "letters", -1);

	game.guesses = findWord (wordlist, statistics); 
	if (game.guesses.length > 0) {
		showTable (game.guesses, "Best guesses: (" + game.guesses.length + ")", "guesses", Math.min(game.guesses.length, 10));
		board[step].c = game.guesses.length;
		drawboard (board, "board");	
	}
	if (game.matched || game.step >= 6) {
		document.getElementById("test").value = (game.matched ? "" + game.step + "/6, Again?" : "Hmmm... try again?");
	}
}

function test () {
	if (!game.setup) {
		var a = document.getElementById("answer").value.toUpperCase();
		if (a.length > 5) {
			a  = a.substring(0,5);
		}
		if (a.length == 5) {
			game.answer = a;
		}
		document.getElementById("answer").value = game.answer;
		document.getElementById("answer").disabled = true;
		document.getElementById("test").value = "Next";
		game.setup = true;
		play (game.board, game.step);	
	}
	else {
		if (game.step < 6 && !game.matched) {
			var pick = Math.floor (Math.min (10, game.guesses.length) * Math.random ()); 
			game.board[game.step].w = game.guesses[pick].c;
			game.matched = testboard(game.board, game.step);
			play (game.board, ++game.step);	
		}
		else {
			location.reload();
		}
	}
}

var game;
function main () {
	var board = [];
	var guesses = [];
	for (i = 0; i < 7; ++i) {
		var match = new Array(5).fill(0);
		var guess = {
			c : 0,
			w : "*****",
			m : match
		}
		board.push(guess);
	}
	game = {
		answer : "VAGUE",
		board : board,
		guesses : guesses,
		step : 0,
		matched : false,
		setup : false
	}
	document.getElementById("answer").value = game.answer;
}

