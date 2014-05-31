/** @jsx React.DOM */

var Container = React.createClass({
  render: function() {
    return (
      <div className="container">
        <div className="row clearfix">
        	<h1>Legal Markdown Editor</h1>
          <hr />
          {this.props.children}
        </div>
      </div>
    );
  }
});

var YAMLFrame = React.createClass({
  getInitialState: function () {
    return {custom: "Testing", config: "Hello?"}
  },
  handleUpload: function (uploadedText) {
    return false
    //ToDo: This is going to change the state associated with an upload
  },
  render: function () {
    return (
      <div className="row">
        <CustomBox data={this.state.custom} onUpload={this.handleUpload}/>
        <ConfigBox data={this.state.config} onUpload={this.handleUpload}/>
      </div>
    )
  }
})

var CustomBox = React.createClass({
  getUploadText: function () {
    return false
  },
  render: function () {
    return (
      <div className="col-lg-6">
        <h3>YAML Entry | Citation Linker</h3>
          <textarea className="custom_box" id="yaml_editor" ref="custom_yaml" defaultValue={this.props.data}/>
          <UploadButton name="custom_upload" onUpload={this.getUploadText} />
      </div>
    )
  }
})

var ConfigBox = React.createClass({
  render: function () {
    return (
      <div className="col-lg-6">
        <h3>YAML Entry | Citation Linker</h3>
          <textarea className="config_box" id="config_box" ref="config_yaml" defaultValue={this.props.data}/>
          <UploadButton name="config_upload"/>
      </div>
    )
  }
})

var MarkdownFrame = React.createClass({
  render: function () {
    return (
      <div className="row">
        <Inbox />
        <Outbox />
      </div>
    )
  }
})

var Inbox = React.createClass({
  render: function () {
    return (
      <div className="col-lg-6 column">
          <h3>Input</h3>
          <textarea data-persist="garlic" className="inbox" id="inbox" ref="textarea_inbox" />
          <UploadButton name="inbox_upload"/>
      </div>    
    )
  }
})

var Outbox = React.createClass({
  render: function () {
    return (
      <div className="col-lg-6 column"> 
        <h3>Output</h3>
        <div className="content outbox" id="outbox"/>
        <DownloadButton />
      </div>
    )
  }
})

var UploadButton = React.createClass({
  render: function () {
    return (
      <form>
        <input type="file" id={this.props.name} onUpload/>
      </form>
    )
  }
})

var DownloadButton = React.createClass({
  render: function () {
    return (
      <a id="btnExport" download="output.html" className="button btn center-block btn-success btn-lg">Download to File</a>
    )
  }
})

var YAMLBox = React.createClass({
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
      <div className="col-lg-6 column">
			 <h3>YAML Entry | Citation Linker</h3>
					<textarea className="yaml_box" id="yaml_editor"
			            onChange={this.handleChange}
            			ref="textarea_yaml"
            			defaultValue={this.state.data} />
			</div>
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
var MarkdownEditor = React.createClass({

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
      <div className="MarkdownEditor">
        <div className="col-lg-6 column">
          <h3>Input</h3>
          <textarea data-persist="garlic" className="field span20" id="inbox" rows="25" cols="60"
            onChange={this.handleChange}
            ref="textarea_inbox"
            defaultValue={this.state.value} />
        </div>

        <div className="col-md-6 column">
        <form>
        <div className="form-group">
          <h3>Output</h3>
          <div
            className="content outbox"
            dangerouslySetInnerHTML={{
              __html: mustached
            }}
          />
        <a id="btnExport" download="output.html" className="button btn center-block btn-success btn-lg">Download to File</a></div></form></div>
      </div>
    );
  }
});

React.renderComponent(
  <Container><YAMLFrame /><MarkdownFrame /></Container>,
  document.getElementById('content')
);