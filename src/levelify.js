var _ = require('underscore');

// TODO:
// [] Add customized headings  
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
// TODO		return headingFor(counter)
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

function headingFor(match) {
  if (match.length == 1)
    return "Article " + match + ".";
  else if (match.length == 2)
    return "Section " + match.join(".");
  else if (match.length >= 3)
    return counter.join(".");
}