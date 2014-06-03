var _ = require('underscore');

module.exports = function Leveler(str, type) {
	return {
//		out: level(str, [{"form":"Sec. $x.","num":"1"}, {"form":"\t($x)","num":"a"}, {"form":"\t\t($x)","num":"1"}])
		out: level(str, type)
	};
}

function level (str, type) {
	var out = [];
	var xrefer = []
	var arr = str.split("\n")
	counter = [0]
	_.each(arr, function (m, i, array) {
		out[i] = m.replace(/^(l+)\.(\s\|(\w|\_|\-)+\|)?/, function() {
			counter = countIt(arguments[1], counter)
			var head = headingFor(counter, type)
			// Check for cross-references
			if (arguments[2] != undefined && arguments[2] != "") {
				xrefer.push({"xref":arguments[2].trim(), "index": i, "head":head.trim()})
			}
			return head
		})
	})
	var returnStr = out.join('\n\n')
	_.each(xrefer, function (m, i, xlist) {
		returnStr = returnStr.replace(m.xref, m.head)
	})

	return returnStr;
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

function headingFor(counter, type) {
  //iterate over each level
  var l = counter.length - 1
  if (type[l] == undefined) return counter[l]
  else return type[l].form.replace("$x", testChar(type[l].num,counter[l]))
}

function testChar(a,b){var c=a.toString().charCodeAt(0);return 65==c?indexToChar(b,!0):97==c?indexToChar(b,!1):73==c?romanize(b):105==c?romanize(b).toLowerCase():b}function indexToChar(a,b){return b?String.fromCharCode(a+64):String.fromCharCode(a+96)}function romanize(a){if(!+a)return!1;for(var b=String(+a).split(""),c=["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM","","X","XX","XXX","XL","L","LX","LXX","LXXX","XC","","I","II","III","IV","V","VI","VII","VIII","IX"],d="",e=3;e--;)d=(c[+b.pop()+10*e]||"")+d;return Array(+b.join("")+1).join("M")+d}