/** @jsx React.DOM */

var Container = React.createClass({displayName: 'Container',
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
       contents[0] = "name: Legal Markdown\n\nmustache: '[mustache powered-templating](http://mustache.github.io/)'"
       contents[1] = "levels: \n  - form: $x. \n    num: I \n  - form: $x. \n    num: A \n  - form: ($x) \n    num: 1"
       contents[2] = "#Legal MarkdownJS\n\nType some *markdown* here to try it out. Legal citations become links.\n\nSee, e.g., 35 USC 112 and D.C. Official Code 2-531.\n\n##Levels\n\nl. |xref| Make nested lists\nll. It's easy to do\nll. Just add a lowercase `l` and a period `.`\nlll. Or many\nlll. You can even use cross references. Try adding a level before |xref|\nlll. Let your imagination run wild.\nl. So, woohoo!\n\n##Templating\n\nOh yeah. Did I mention that you can use {{mustache}}? To use it, try setting some customization variables using the dropdown menu above."
    }
    return {custom: contents[0], config: contents[1], inbox: contents[2]} 
  },
  handleChange: function (uploadedText) {
    (uploadedText.custom != undefined ? this.setState({custom: uploadedText.custom, config:this.state.config, inbox:this.state.inbox}) : this.setState({custom: this.state.custom, config:uploadedText.config, inbox:this.state.inbox}))
  },
  textChange: function (inboxText) {
    this.setState({custom: this.state.custom, config: this.state.config, inbox: inboxText.inbox})
  },
saveAnonGist: function () {
    var yml = $.extend(YAML.parse(this.state.custom),YAML.parse(this.state.config))
    var mustached = converter.makeHtml(leveler(Mustache.to_html(this.state.inbox, yml), yml.levels).out)
    var gist = {
      description: "legalmd-gist",
      public: true,
      files: {
        "inbox.md": {
            "content": this.state.inbox
        },
        "config.yaml": {
            "content": this.state.config
        },
        "custom.yaml": {
            "content": this.state.custom
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
    var yml = $.extend(YAML.parse(this.state.custom),YAML.parse(this.state.config))
    var mustached = converter.makeHtml(leveler(Mustache.to_html(this.state.inbox, yml), yml.levels).out)
    var gist = {
      description: "legalmd-gist",
      public: true,
      files: {
        "inbox.md": {
            "content": this.state.inbox
        },
        "config.yaml": {
            "content": this.state.config
        },
        "custom.yaml": {
            "content": this.state.custom
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
  render: function() {
    var about_click = (function () {$("#about-modal").modal("show")});
    var custom_click = (function () {$("#custom").modal("show")});
    var config_click = (function () {$("#config").modal("show")});
    var titleStyle = {color: 'd9534f'};
    return (
      React.DOM.div(null, 
      AboutModal(null ),
      CustomModal( {name:"custom", data:this.state.custom, onChange:this.handleChange}),
      ConfigModal( {name:"config", data:this.state.config, onChange:this.handleChange}),
      React.DOM.nav( {className:"navbar navbar-inverse navbar-default navbar-static-top z-index > 1040", role:"navigation"}, 
        React.DOM.div( {className:"container-fluid"}, 
          React.DOM.div( {className:"navbar-header"}, 
            React.DOM.button( {type:"button", className:"navbar-toggle", 'data-toggle':"collapse", 'data-target':"#lmd-navbar"}, 
              React.DOM.span( {className:"sr-only"}, "Toggle navigation"),
              React.DOM.span( {className:"icon-bar"}),
              React.DOM.span( {className:"icon-bar"}),
              React.DOM.span( {className:"icon-bar"})
            ),
            React.DOM.a( {style:titleStyle, className:"navbar-brand", href:"#"}, "LegalMarkdownJS")
          ),

          React.DOM.div( {className:"collapse navbar-collapse", id:"lmd-navbar"}, 
            React.DOM.ul( {className:"nav navbar-nav"}, 
              React.DOM.li(null, React.DOM.button( {className:"dropdown-toggle btn btn-danger btn-lg", 'data-toggle':"dropdown"}, "Save",React.DOM.span( {className:"caret"})),
              React.DOM.ul( {className:"dropdown-menu", role:"menu"}, 
                React.DOM.li(null, React.DOM.a( {id:"btnExport", download:"output.html"}, "Download to File")),
                React.DOM.li(null, React.DOM.a( {onClick:this.saveGist}, "Save to Gist")),
                React.DOM.li(null, React.DOM.a( {onClick:this.saveAnonGist}, "Save to Anonymous Gist"))
              )
              ),
              React.DOM.li(null, React.DOM.a( {className:"dropdown-toggle", 'data-toggle':"dropdown"}, "Set Customization Variables",React.DOM.span( {className:"caret"})),
              React.DOM.ul( {className:"dropdown-menu", role:"menu"}, 
              React.DOM.li(null, React.DOM.a( {onClick:custom_click}, "Customize")),
              React.DOM.li(null, React.DOM.a( {onClick:config_click}, "Configure"))
              )),
              React.DOM.li(null, React.DOM.a( {onClick:about_click}, "About")),
              React.DOM.li(null, React.DOM.a( {href:"http://github.com/vzvenyach/legalmd", target:"blank"}, "Source Code"))
            )
        )
      )
      ),
      React.DOM.div( {className:"container-fluid"}, 
        React.DOM.div( {className:"row clearfix"}, 
          Inbox( {ref:"myMDFrame", data:this.state, inbox:this.state.inbox, onChange:this.textChange})
        )
      )
    )
    );
  }
});

var CustomModal = React.createClass({displayName: 'CustomModal',
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
      React.DOM.div( {id:this.props.name, className:"modal fade"}, 
        React.DOM.div( {className:"modal-dialog"}, 
          React.DOM.div( {className:"modal-content"}, 
            React.DOM.div( {className:"modal-header"}, 
              React.DOM.button( {type:"button", className:"close", 'data-dismiss':"modal", 'aria-hidden':"true"}, "x"),
              React.DOM.h4( {className:"modal-title"}, "Customize")
            ),
          React.DOM.div( {className:"modal-body"}, 
          React.DOM.form( {role:"form"}, 
            React.DOM.textarea( {ref:"custom_yaml", value:this.state.custom, rows:"10", className:"form-control", onChange:this.handleChange}),
            UploadButton( {name:"custom_upload", onUpload:this.getUploadText} )
          )
          ),
          React.DOM.div( {className:"modal-footer"}, 
            React.DOM.button( {type:"button", className:"btn btn-default", 'data-dismiss':"modal"}, "Close")
          )
        )
      )
    )
    )
  }
})

var ConfigModal = React.createClass({displayName: 'ConfigModal',
  getInitialState: function () {
    return {config: this.props.data}
  },
  getUploadText: function (text) {
    this.setState({config: text.text})
    this.props.onChange(this.state)
  },
  handleChange: function() {
    this.setState({config: this.refs.yaml_box.getDOMNode().value});
    this.props.onChange(this.state)
  },
  render: function () {
    return (
      React.DOM.div( {id:this.props.name, className:"modal fade"}, 
        React.DOM.div( {className:"modal-dialog"}, 
          React.DOM.div( {className:"modal-content"}, 
            React.DOM.div( {className:"modal-header"}, 
              React.DOM.button( {type:"button", className:"close", 'data-dismiss':"modal", 'aria-hidden':"true"}, "x"),
              React.DOM.h4( {className:"modal-title"}, "Configure")
            ),
          React.DOM.div( {className:"modal-body"}, 
          React.DOM.form( {role:"form"}, 
            React.DOM.textarea( {ref:"yaml_box", value:this.state.config, rows:"10", className:"form-control", onChange:this.handleChange}),
            UploadButton( {name:"config_upload", onUpload:this.getUploadText} )
          )
          ),
          React.DOM.div( {className:"modal-footer"}, 
            React.DOM.button( {type:"button", className:"btn btn-default", 'data-dismiss':"modal"}, "Close")
          )
        )
      )
    )
    )
  }
})

var AboutModal = React.createClass({displayName: 'AboutModal',
  render: function () {
    return (
      React.DOM.div( {id:"about-modal", className:"modal fade"}, 
        React.DOM.div( {className:"modal-dialog"}, 
          React.DOM.div( {className:"modal-content"}, 
            React.DOM.div( {className:"modal-header"}, 
              React.DOM.button( {type:"button", className:"close", 'data-dismiss':"modal", 'aria-hidden':"true"}, "×"),
              React.DOM.h4( {className:"modal-title"}, "About LegalMarkdownJS")
            ),
          React.DOM.div( {className:"modal-body"}, 
            React.DOM.h3(null, "About"),
            React.DOM.p(null, "Inspired by the ruby gem built by @compleatang, I wanted to build a javascript port of Legal Markdown."),
            React.DOM.h3(null, "Contributing"),
            React.DOM.p(null, "To help make development easy and the user-experience seamless, I am using reactjs to develop the application. It has a slight learning curve, but once you get the hang of it, it is pretty sweet."),
            React.DOM.h3(null, "License"),
            React.DOM.p(null, "MIT")
          ),
          React.DOM.div( {className:"modal-footer"}, 
            React.DOM.button( {type:"button", className:"btn btn-default", 'data-dismiss':"modal"}, "Close")
          )
        )
      )
    )
    )
  }
})

var Inbox = React.createClass({displayName: 'Inbox',
  getInitialState: function () {
    return {inbox: this.props.inbox}
  },
  getUploadText: function (text) {
    this.setState({inbox: text.text})
  },
  handleChange: function() {
    this.setState({inbox: this.refs.textarea_inbox.getDOMNode().value});
    this.props.onChange(this.state)
  },
  render: function () {
    return (
      React.DOM.div( {className:"row"}, 
      React.DOM.div(null, 
      React.DOM.div( {className:"col-md-6 column"}, 
          React.DOM.h3(null, "Type in Markdown and..."),
          React.DOM.textarea( {className:"inbox", id:"inbox", ref:"textarea_inbox", value:this.state.inbox, onChange:this.handleChange}),
          UploadButton( {name:"inbox_upload", onUpload:this.getUploadText} )
      ),
        Outbox( {ref:"myOutBox", data:this.props.data, inbox:this.state} )
      )
      )
    )
  }
})

var Outbox = React.createClass({displayName: 'Outbox',
  render: function () {
    var yml = $.extend(YAML.parse(this.props.data.custom),YAML.parse(this.props.data.config))
    var mustached = converter.makeHtml(link2bills(leveler(Mustache.to_html(this.props.inbox.inbox, yml), yml.levels).out))
    return (
      React.DOM.div( {className:"col-md-6 column"},  
        React.DOM.h3(null, "... get out beautifully rendered HTML"),
        React.DOM.div( {className:"content outbox", dangerouslySetInnerHTML:{__html: mustached}})
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
        React.DOM.input( {type:"file", ref:"btn", id:this.props.name, onChange:this.handleChange}, "Upload a file to load into the textarea above")
      )
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
  Container(null ),
  document.getElementById('content')
);