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
    return {custom: "name: Legal Markdown", config: "levels: \n  - form: $x.\n    num: I\n  - form: $x.\n    num: A\n  - form: ($x)\n    num: 1"}
  },
  handleChange: function (uploadedText) {
    (uploadedText.custom != undefined ? this.setState({custom: uploadedText.custom, config:this.state.config}) : this.setState({custom: this.state.custom, config:uploadedText.config}))
  },
  render: function () {
    return (
      React.DOM.div(null, 
      React.DOM.div( {className:"row"}, 
        CustomBox( {data:this.state.custom, onChange:this.handleChange}),
        ConfigBox( {data:this.state.config, onChange:this.handleChange})
      ),
      MarkdownFrame( {data:this.state})
      )
    )
  }
})

var CustomBox = React.createClass({displayName: 'CustomBox',
  getInitialState: function () {
    return {custom: this.props.data}
  },
  getUploadText: function (text) {
    this.setState({custom: text.text})
    this.props.onChange(this.state)
  },
  handleChange: function() {
    this.setState({custom: this.refs.custom_yaml.getDOMNode().value});
    this.props.onChange(this.state)
  },
  render: function () {
    return (
      React.DOM.div( {className:"col-lg-6"}, 
        React.DOM.h3(null, "Customize"),
          React.DOM.textarea( {className:"yaml_box", id:"yaml_editor", ref:"custom_yaml", value:this.state.custom, onChange:this.handleChange}),
          UploadButton( {name:"custom_upload", onUpload:this.getUploadText} )
      )
    )
  }
})

var ConfigBox = React.createClass({displayName: 'ConfigBox',
  getInitialState: function () {
    return {config: this.props.data}
  },
  getUploadText: function (text) {
    this.setState({config: text.text})
    this.props.onChange(this.state)
  },
  handleChange: function() {
    this.setState({config: this.refs.config_yaml.getDOMNode().value});
    this.props.onChange(this.state)
  },
  render: function () {
    return (
      React.DOM.div( {className:"col-lg-6"}, 
        React.DOM.h3(null, "Configure"),
          React.DOM.textarea( {className:"yaml_box", id:"config_box", ref:"config_yaml", value:this.state.config, onChange:this.handleChange}),
          UploadButton( {name:"config_upload", onUpload:this.getUploadText} )
      )
    )
  }
})

var MarkdownFrame = React.createClass({displayName: 'MarkdownFrame',
  render: function () {
    return (
      React.DOM.div( {className:"row"}, 
        Inbox( {data:this.props.data} )
      )
    )
  }
})

var Inbox = React.createClass({displayName: 'Inbox',
  getInitialState: function () {
    return {inbox: "#{{name}}\n\nType some *markdown* here to try it out. Legal citations become links.\n\nSee, e.g., 35 USC 112 and D.C. Official Code 2-531.\n\nl. |xref| Make nested lists\nll. It\'s easy to do\nll. Just add a lowercase `l` and a period `.`\nlll. Or many\nlll. You can even use cross references. Try adding a level before |xref|\nlll. Let your imagination run wild.\nl. So, woohoo!"}
  },
  getUploadText: function (text) {
    this.setState({inbox: text.text})
  },
  handleChange: function() {
    this.setState({inbox: this.refs.textarea_inbox.getDOMNode().value});
  },
  render: function () {
    return (
      React.DOM.div(null, 
      React.DOM.div( {className:"col-lg-6 column"}, 
          React.DOM.h3(null, "Input"),
          React.DOM.textarea( {className:"inbox", id:"inbox", ref:"textarea_inbox", value:this.state.inbox, onChange:this.handleChange}),
          UploadButton( {name:"inbox_upload", onUpload:this.getUploadText} )
      ),
        Outbox( {data:this.props.data, inbox:this.state} )
      )
    )
  }
})

var Outbox = React.createClass({displayName: 'Outbox',
  render: function () {
    console.log(this.props.inbox.inbox)
    var yml = $.extend(YAML.parse(this.props.data.custom),YAML.parse(this.props.data.config))
    var mustached = converter.makeHtml(leveler(Mustache.to_html(this.props.inbox.inbox, yml), yml.levels).out)
    return (
      React.DOM.div( {className:"col-lg-6 column"},  
        React.DOM.h3(null, "Output"),
        React.DOM.div( {className:"content outbox", dangerouslySetInnerHTML:{__html: mustached}}),
        DownloadButton(null )
      )
    )
  }
})

var UploadButton = React.createClass({displayName: 'UploadButton',
  handleChange: function () {
    var reader = new FileReader();
    reader.readAsText(this.refs.btn.getDOMNode().files[0])
    reader.onloadend = function(evt) {
      this.props.onUpload({text:reader.result})
    }.bind(this)
  },
  render: function () {
    return (
      React.DOM.form(null, 
        React.DOM.input( {type:"file", ref:"btn", id:this.props.name, onChange:this.handleChange})
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

React.renderComponent(
  Container(null, YAMLFrame(null )),
  document.getElementById('content')
);