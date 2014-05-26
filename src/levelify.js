var _ = require('underscore');

module.exports = function Leveler(str) {
	return {
		out: level(str)
	};
}

function level (str) {
	var out = [];
	var arr = str.split("\n")
	counter = [0]
	_.each(arr, function (m, i, array) {
		out[i] = m.replace(/^(l+)\./, function() {
			counter = countIt(arguments[1], counter)
			return counter.join(".")
		})
	})
	return out.join('\n\n');
}

function countIt (match, counter) {
	if (match.length == counter.length) {
  		counter[counter.length-1] += 1;
  		return counter;
	}

	else if (match.length > counter.length) {
		var digits = match.length - counter.length;
		for (var i=0; i<digits; i++) {
    		counter.push(1);
		}
		return counter;
	}

	else if (match.length < counter.length) {
  		counter = counter.slice(0, match.length);
  		counter[counter.length-1] += 1;
  		return counter;
	}
}

function headingFor(match, counter) {
  if (match.length == 1)
    return "Article " + counter + ".";
  else if (match.length == 2)
    return "Section " + counter.join(".");
  else if (match.length >= 3)
    return counter.join(".");
}