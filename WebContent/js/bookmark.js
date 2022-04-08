javascript: {
var wordlist;

var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    var v = this.responseText.indexOf (",Oa=");
    if (v >= 0 ) {
	    var s = this.responseText.indexOf ("[", v);	
	    var e = this.responseText.indexOf ("]", s);
	    var Oa = JSON.parse(this.responseText.substring (s, e + 1));
	    v = this.responseText.indexOf ("var Ma=");
	    s = this.responseText.indexOf ("[", v);	
	    e = this.responseText.indexOf ("]", s);
	    var Ma = JSON.parse(this.responseText.substring (s, e + 1));
	    wordlist = Oa.concat(Ma);
	    console.log ("Loaded word list with " + wordlist.length + " words.");
	    playGame ();
    }
    else {
	    console.log ("No word list found.");
    }
  }
};
xmlhttp.open("GET", "https://www.nytimes.com/games/wordle/main.3d28ac0c.js", true);
xmlhttp.send();

var a=document.getElementsByTagName ("game-app");
var k=a[0].$keyboard.$keyboard;
var answer=a[0].solution;
var layout=["qwertyuiop"," asdfghjkl","*zxcvbnm^"];
console.log (a);

function find (c) {
	var r = {r:-1,c:-1};
	c=c.toLowerCase();
	for (r.r = 0; r.r < 3; r.r++) {
		r.c=layout[r.r].indexOf(c);
		if (r.c >= 0) return r;
	}
	return r;
}
function enter(){
	k.childNodes[2].childNodes[0].click();
}
function play (word) {
	for (i = 0; i < 5; ++i) {var r=find (word.charAt(i));k.childNodes[r.r].childNodes[r.c].click();}
}
function analyze (words) {
	var statistics = [];
	for (i = 0; i < 26; ++i) {
		var p = [0,0,0,0,0];
		var metrics = {
			c : String.fromCharCode (i+65), 
			r : 0,
			p : p
		};
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
		};
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
function checkboard (word, l) {
	if (l > 0) {
		var e=a[0].evaluations[l-1];
		var w1 = a[0].boardState[l-1].toUpperCase();
		var w2 = word.toUpperCase();
		for (var i = 0; i < w1.length; ++i) {
			var matched = w1.charAt(i) == w2.charAt(i);
			if (e[i] == "correct" && !matched) {
				return false;
			}
			var c1 = w1.charAt(i);
			var found = w2.indexOf (c1) >= 0;
			if (e[i] == "absent" && found) {
				return false;
			}
			if (e[i] == "present" && (!found || matched)) {
				return false;
			}
		}
	}
	return true;
}
function playGame () {
	for (var i = 0; i <= a[0].rowIndex; ++i) {
		wordlist = wordlist.filter (word => checkboard(word, i));
		console.log("Filtered list:" + wordlist.length);
	}
	var statistics = analyze (wordlist);
	var guesses = findWord (wordlist, statistics); 
	if (guesses.length > 0) {
		var n = a[0].rowIndex > 0 ? 0 : Math.floor (Math.min (6, guesses.length) * Math.random ());
		console.log ("play word: ", guesses[n].c);
		play (guesses[n].c);
		enter ();
	}
}
}