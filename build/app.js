/** @jsx React.DOM */

var Container = React.createClass({displayName: 'Container',
  render: function() {
    return (
      React.DOM.div( {className:"container"}, 
        React.DOM.div( {className:"row clearfix"}, 
        	React.DOM.h1(null, "Legal Markdown Editor"),
          React.DOM.hr(null ),
          this.props.children
        )
      )
    );
  }
});

var YAMLBox = React.createClass({displayName: 'YAMLBox',
getInitialState: function() {
    return {data: 'name: test this'};
  },
  handleChange: function() {
    this.setState({data: this.refs.textarea.getDOMNode().value});
  },
	render: function () {
		return (
			React.DOM.div( {className:"YAMLEditor"}, 
				React.DOM.div( {className:"col-md-12 column"}, 
					React.DOM.h3(null, "YAML Entry | Citation Linker"),
					React.DOM.textarea( {className:"field span20", id:"textarea", rows:"5", cols:"80",
			            onChange:this.handleChange,
            			ref:"textarea",
            			defaultValue:this.state.data} )

				),
        MarkdownEditor( {data:this.state.data} )
			)
		)
	}
});

function makeUsCodeUrl(citation) {
  var usc = citation.usc;
  var title = usc.title;
  var section = usc.section;
  return "http://www.law.cornell.edu/uscode/text/" + title + "/" + section;
}

function makeCfrUrl(citation) {
  var cfr = citation.cfr;
  var title = cfr.title;
  var section = cfr.part;
  return "http://www.law.cornell.edu/cfr/text/" + title + "/" + section;
}

function makeDcCodeUrl(citation) {
  var dc_code = citation.dc_code;
  var title = dc_code.title;
  var section = dc_code.section;
  return "http://dccode.org/simple/sections/" + title + "-" + section + ".html";
}

function makeJudicialUrl(citation) {
  console.log("judicialing");
  // nice 'n easy
  return "https://casetext.com/search#!/?q=" + citation.match;
}

function makeUrl(citation) {
  if (citation.type === "usc") { return makeUsCodeUrl(citation); }
  if (citation.type === "cfr") { return makeCfrUrl(citation); }
  if (citation.type === "dc_code") { return makeDcCodeUrl(citation); }
  if (citation.type === "judicial") { return makeJudicialUrl(citation); }

  // if no match, silently default to the plain text
  return citation.match;
}

var makeATag = function(name, href) {
  var open = "<a href='" + href +"'>";
  var middle = name;
  var close = "</a>"

  return open + middle + close;
}


var citations = function(converter) {
  return  [
    {
      type: 'output',
      filter: function(source) {
        var matches = Citation.find(source)['citations'];


        if (matches === 0) {
          console.log("exited");
          return source;
        }

        for (var i=0,len=matches.length; i<len; i++) {
          var match = matches[i].match;
          source = source.replace(match, makeATag(match, makeUrl(matches[i])));
        }

        return source;
      }
    }
  ];
};
window.Showdown.extensions.citations = citations;
var converter = new Showdown.converter({ extensions: ['citations'] });
var MarkdownEditor = React.createClass({displayName: 'MarkdownEditor',

  getInitialState: function() {
    return {value: 'Type some *markdown* here to {{name}}.  Legal citations become links.\n\nSee, e.g., 35 USC 112 and D.C. Official Code 2-531.'};
  },
  handleChange: function() {
    this.setState({value: this.refs.textarea.getDOMNode().value})
  },
  render: function() {
    var mustached = converter.makeHtml(Mustache.to_html(this.state.value, YAML.parse(this.props.data)))
    return (
      React.DOM.div( {className:"MarkdownEditor"}, 
        React.DOM.div( {className:"col-lg-6 column"}, 
          React.DOM.h3(null, "Input"),
          React.DOM.textarea( {className:"field span20", id:"textarea", rows:"25", cols:"60",
            onChange:this.handleChange,
            ref:"textarea",
            defaultValue:this.state.value} )
        ),
        React.DOM.div( {className:"col-md-6 column"}, 
          React.DOM.h3(null, "Output"),
          React.DOM.div(
            {className:"content outbox",
            dangerouslySetInnerHTML:{
              __html: mustached
            }}
          )
        )
      )
    );
  }
});

React.renderComponent(
  Container(null, YAMLBox(null )),
  document.getElementById('content')
);
