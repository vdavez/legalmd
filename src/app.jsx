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
    contents = []
    if (document.location.hash != "") {
      $.ajax({
        async: false,
        url: 'https://api.github.com/gists/' + document.location.hash.replace("#",""),
        context: this
      }).done(function (d) {
          contents[0] = d.files["custom.yaml"].content
          contents[1] = d.files["config.yaml"].content
          contents[2] = d.files["inbox.md"].content;
      })
    } else {
       contents[0] = "name: Legal Markdown\ntest: hello?"
       contents[1] = "levels: \n  - form: $x.\n    num: I\n  - form: $x.\n    num: A\n  - form: ($x)\n    num: 1"
       contents[2] = "#{{name}}\n\nType some *markdown* here to try it out. Legal citations become links.\n\nSee, e.g., 35 USC 112 and D.C. Official Code 2-531.\n\nl. |xref| Make nested lists\nll. It's easy to do\nll. Just add a lowercase `l` and a period `.`\nlll. Or many\nlll. You can even use cross references. Try adding a level before |xref|\nlll. Let your imagination run wild.\nl. So, woohoo!"
    }
    return {custom: contents[0], config: contents[1], inbox: contents[2]} 
  },
  handleChange: function (uploadedText) {
    (uploadedText.custom != undefined ? this.setState({custom: uploadedText.custom, config:this.state.config}) : this.setState({custom: this.state.custom, config:uploadedText.config}))
  },
  render: function () {
    return (
      <div>
      <div className="row">
        <CustomBox data={this.state.custom} onChange={this.handleChange}/>
        <ConfigBox data={this.state.config} onChange={this.handleChange}/>
      </div>
      <MarkdownFrame data={this.state} inbox={this.state.inbox}/>
      </div>
    )
  }
})

var CustomBox = React.createClass({
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
      <div className="col-lg-6">
        <h3>Customize</h3>
          <textarea className="yaml_box" id="yaml_editor" ref="custom_yaml" value={this.state.custom} onChange={this.handleChange}/>
          <UploadButton name="custom_upload" onUpload={this.getUploadText} />
      </div>
    )
  }
})

var ConfigBox = React.createClass({
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
      <div className="col-lg-6">
        <h3>Configure</h3>
          <textarea className="yaml_box" id="config_box" ref="config_yaml" value={this.state.config} onChange={this.handleChange}/>
          <UploadButton name="config_upload" onUpload={this.getUploadText} />
      </div>
    )
  }
})

var MarkdownFrame = React.createClass({
  render: function () {
    return (
      <div className="row">
        <Inbox data={this.props.data} inbox={this.props.inbox} />
      </div>
    )
  }
})

var Inbox = React.createClass({
  getInitialState: function () {
    return {inbox: this.props.inbox}
  },
  getUploadText: function (text) {
    this.setState({inbox: text.text})
  },
  handleChange: function() {
    this.setState({inbox: this.refs.textarea_inbox.getDOMNode().value});
  },
  render: function () {
    return (
      <div>
      <div className="col-lg-6 column">
          <h3>Input</h3>
          <textarea className="inbox" id="inbox" ref="textarea_inbox" value={this.state.inbox} onChange={this.handleChange}/>
          <UploadButton name="inbox_upload" onUpload={this.getUploadText} />
      </div>
        <Outbox data={this.props.data} inbox={this.state} />
      </div>
    )
  }
})

var Outbox = React.createClass({
    saveAnonGist: function () {
    var yml = $.extend(YAML.parse(this.props.data.custom),YAML.parse(this.props.data.config))
    var mustached = converter.makeHtml(leveler(Mustache.to_html(this.props.inbox.inbox, yml), yml.levels).out)
    var gist = {
      description: "legalmd-gist",
      public: true,
      files: {
        "inbox.md": {
            "content": this.props.inbox.inbox
        },
        "config.yaml": {
            "content": this.props.data.config
        },
        "custom.yaml": {
            "content": this.props.data.custom
        },
        "output.html": {
            "content": mustached
        }
      }
    };
      $.ajax({
        type: "post",
        url:'https://api.github.com/gists',
        data: JSON.stringify(gist),
      }).done(function(data, status, xhr) {
        // take new Gist id, make permalink
        if (history && history.pushState)
        history.pushState({id: data.id}, null, "#" + data.id);
        console.log(data.id)
        // mark what we last saved
        console.log("Remaining this hour: " + xhr.getResponseHeader("X-RateLimit-Remaining"));
      }).fail(function(xhr, status, errorThrown) {
        console.log(xhr);
        })
    return false;
  },
  saveGist: function () {
    var yml = $.extend(YAML.parse(this.props.data.custom),YAML.parse(this.props.data.config))
    var mustached = converter.makeHtml(leveler(Mustache.to_html(this.props.inbox.inbox, yml), yml.levels).out)
    var gist = {
      description: "legalmd-gist",
      public: true,
      files: {
        "inbox.md": {
            "content": this.props.inbox.inbox
        },
        "config.yaml": {
            "content": this.props.data.config
        },
        "custom.yaml": {
            "content": this.props.data.custom
        },
        "output.html": {
            "content": mustached
        }
      }
    };

    if (document.location.hash != "") {
       OAuth.popup('github', function(err, result) {
            if (err) {
                console.log(err); // do something with error
                return;
            }
            var gist_url = 'https://api.github.com/gists/' + document.location.hash.replace("#","")
          result.patch({
            url: gist_url,
            contentType: "application/json",
            data: JSON.stringify(gist),
            }).fail(function (xhr, status, errorThrown) {
              result.post({
                url:gist_url + '/forks',
                data: JSON.stringify(gist),
              }).done(function(data, status, xhr) {
        // take new Gist id, make permalink
              if (history && history.pushState)
                history.pushState({id: data.id}, null, "#" + data.id);
                console.log(data.id)
                // mark what we last saved
                console.log("Remaining this hour: " + xhr.getResponseHeader("X-RateLimit-Remaining"));
              }).fail(function(xhr, status, errorThrown) {
            console.log(xhr);
            })
            result.patch({
              url: 'https://api.github.com/gists/' + document.location.hash.replace("#",""),
              contentType: "application/json",
              data: JSON.stringify(gist),
              })
            })
        })
    }
    else {
    OAuth.popup('github', function(err, result) {
            if (err) {
                console.log(err); // do something with error
                return;
            }
      console.log("Saving to a gist...");
      result.post({
        url:'https://api.github.com/gists',
        data: JSON.stringify(gist),
      }).done(function(data, status, xhr) {
        // take new Gist id, make permalink
        if (history && history.pushState)
        history.pushState({id: data.id}, null, "#" + data.id);
        console.log(data.id)
        // mark what we last saved
        console.log("Remaining this hour: " + xhr.getResponseHeader("X-RateLimit-Remaining"));
      }).fail(function(xhr, status, errorThrown) {
        console.log(xhr);
        })
      });
    }
    return false;
  },
  render: function () {
    var yml = $.extend(YAML.parse(this.props.data.custom),YAML.parse(this.props.data.config))
    var mustached = converter.makeHtml(link2bills(leveler(Mustache.to_html(this.props.inbox.inbox, yml), yml.levels).out))
    return (
      <div className="col-lg-6 column"> 
        <h3>Output</h3>
        <div className="content outbox" dangerouslySetInnerHTML={{__html: mustached}}/>
        <div className="form-group">
        <DownloadButton />
        <button className="button btn btn-primary btn-block btn-lg" onClick={this.saveGist}>Save to User Gist</button>
        <button className="button btn btn-info btn-block btn-lg" onClick={this.saveAnonGist}>Save to Anonymous Gist</button>
        </div>
      </div>
    )
  }
})

var UploadButton = React.createClass({
  handleChange: function () {
    var reader = new FileReader();
    reader.readAsText(this.refs.btn.getDOMNode().files[0])
    reader.onloadend = function(evt) {
      this.props.onUpload({text:reader.result})
    }.bind(this)
  },
  render: function () {
    return (
      <form>
        <input type="file" ref="btn" id={this.props.name} onChange={this.handleChange}/>
      </form>
    )
  }
})

var DownloadButton = React.createClass({
  render: function () {
    return (
      <a id="btnExport" download="output.html" className="button center-block btn btn-success btn-lg">Download to File</a>
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

function link2bills(h) {
  // Regex is "BXX-XXX" or "PRXX-XXX" or "B XX-XXX"
  var reg = XRegExp('(?<type>(PR|Proposed Resolution)|(B|Bill))(\\s?)(?<period>\\d{1,2})(\\-)(?<number>\\d{1,4})', 'gi');
  return XRegExp.replace(h, reg, function(d) {
    // Bill or PR?
    var url;
    var t = (d.type[0].toLowerCase() == "b" ? "B" : "PR");
    // Leading Zeros
    while (d.number.length < 4) {
      d.number = "0" + d.number;
    }
    //Build the URL
    var identifer = t + d.period + '-' + d.number;

    //Smartly figure out whether you're in CP 20 (new LIMS) or before then (old LIMS)
    var url = (d.period > 19 ? 'http://lims.dccouncil.us/Legislation/' + identifer : "http://dcclims1.dccouncil.us/lims/legislation.aspx?LegNo=" + identifer)
    //Return the Linked URL
    return makeATag(d, url);
    }, "all");
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
  <Container><YAMLFrame /></Container>,
  document.getElementById('content')
);