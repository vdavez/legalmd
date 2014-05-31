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

var YAMLFrame = React.createClass({displayName: 'YAMLFrame',
  getInitialState: function () {
    return {custom: "Testing", config: "Hello?"}
  },
  handleUpload: function (uploadedText) {
    return false
    //ToDo: This is going to change the state associated with an upload
  },
  render: function () {
    return (
      React.DOM.div( {className:"row"}, 
        CustomBox( {data:this.state.custom, onUpload:this.handleUpload}),
        ConfigBox( {data:this.state.config, onUpload:this.handleUpload})
      )
    )
  }
})

var CustomBox = React.createClass({displayName: 'CustomBox',
  getUploadText: function () {
    return false
  },
  render: function () {
    return (
      React.DOM.div( {className:"col-lg-6"}, 
        React.DOM.h3(null, "YAML Entry | Citation Linker"),
          React.DOM.textarea( {className:"custom_box", id:"yaml_editor", ref:"custom_yaml", defaultValue:this.props.data}),
          UploadButton( {name:"custom_upload", onUpload:this.getUploadText} )
      )
    )
  }
})

var ConfigBox = React.createClass({displayName: 'ConfigBox',
  render: function () {
    return (
      React.DOM.div( {className:"col-lg-6"}, 
        React.DOM.h3(null, "YAML Entry | Citation Linker"),
          React.DOM.textarea( {className:"config_box", id:"config_box", ref:"config_yaml", defaultValue:this.props.data}),
          UploadButton( {name:"config_upload"})
      )
    )
  }
})

var MarkdownFrame = React.createClass({displayName: 'MarkdownFrame',
  render: function () {
    return (
      React.DOM.div( {className:"row"}, 
        Inbox(null ),
        Outbox(null )
      )
    )
  }
})

var Inbox = React.createClass({displayName: 'Inbox',
  render: function () {
    return (
      React.DOM.div( {className:"col-lg-6 column"}, 
          React.DOM.h3(null, "Input"),
          React.DOM.textarea( {'data-persist':"garlic", className:"inbox", id:"inbox", ref:"textarea_inbox"} ),
          UploadButton( {name:"inbox_upload"})
      )    
    )
  }
})

var Outbox = React.createClass({displayName: 'Outbox',
  render: function () {
    return (
      React.DOM.div( {className:"col-lg-6 column"},  
        React.DOM.h3(null, "Output"),
        React.DOM.div( {className:"content outbox", id:"outbox"}),
        DownloadButton(null )
      )
    )
  }
})

var UploadButton = React.createClass({displayName: 'UploadButton',
  render: function () {
    return (
      React.DOM.form(null, 
        React.DOM.input( {type:"file", id:this.props.name, onUpload:true})
      )
    )
  }
})

var DownloadButton = React.createClass({displayName: 'DownloadButton',
  render: function () {
    return (
      React.DOM.a( {id:"btnExport", download:"output.html", className:"button btn center-block btn-success btn-lg"}, "Download to File")
    )
  }
})

var YAMLBox = React.createClass({displayName: 'YAMLBox',
getInitialState: function() {
  if (localStorage.yaml == undefined) {
    return {data: 'name: test this\nlevels: \n  - form: $x.\n    num: I\n  - form: $x.\n    num: A\n  - form: ($x)\n    num: 1'}
  } else {
    return {data: localStorage.yaml}
  }
  },
  handleChange: function() {
    this.setState({data: this.refs.textarea_yaml.getDOMNode().value});
  },
	render: function () {
		return (
      React.DOM.div( {className:"col-lg-6 column"}, 
			 React.DOM.h3(null, "YAML Entry | Citation Linker"),
					React.DOM.textarea( {className:"yaml_box", id:"yaml_editor",
			            onChange:this.handleChange,
            			ref:"textarea_yaml",
            			defaultValue:this.state.data} )
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
    if (localStorage.inbox == undefined) {
      return {value: 'Type some *markdown* here to {{name}}.  Legal citations become links.\n\nSee, e.g., 35 USC 112 and D.C. Official Code 2-531.\n\nl. Make nested lists\nll. It\'s easy to do\nll. Just add a lowercase `l` and a period `.`\nlll. Or many\nlll. Let your imagination run wild.\nl. So, woohoo!'};
    }
  },
  handleChange: function() {
    this.setState({value: this.refs.textarea_inbox.getDOMNode().value})
  },
  render: function() {
    var yml = YAML.parse(this.props.data)
    var mustached = converter.makeHtml(leveler(Mustache.to_html(this.state.value, yml), yml.levels).out)
    return (
      React.DOM.div( {className:"MarkdownEditor"}, 
        React.DOM.div( {className:"col-lg-6 column"}, 
          React.DOM.h3(null, "Input"),
          React.DOM.textarea( {'data-persist':"garlic", className:"field span20", id:"inbox", rows:"25", cols:"60",
            onChange:this.handleChange,
            ref:"textarea_inbox",
            defaultValue:this.state.value} )
        ),

        React.DOM.div( {className:"col-md-6 column"}, 
        React.DOM.form(null, 
        React.DOM.div( {className:"form-group"}, 
          React.DOM.h3(null, "Output"),
          React.DOM.div(
            {className:"content outbox",
            dangerouslySetInnerHTML:{
              __html: mustached
            }}
          ),
        React.DOM.a( {id:"btnExport", download:"output.html", className:"button btn center-block btn-success btn-lg"}, "Download to File"))))
      )
    );
  }
});

React.renderComponent(
  Container(null, YAMLFrame(null ),MarkdownFrame(null )),
  document.getElementById('content')
);