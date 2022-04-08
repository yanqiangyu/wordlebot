var wordlist;

var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    wordlist = JSON.parse(this.responseText);
    console.log ("Loaded word list with " + wordlist.length + " words.");
  }
};

xmlhttp.open("GET", "js/wordlist.json", true);
xmlhttp.send();