/*global FieldScope Type, Sys */

Type.registerNamespace("FieldScope");

// ----------------------------------------------------------------------------
// String utilities

FieldScope.StringUtils = {
  
  regExes: { 
      portNumber: (/:\d+$/)
    },
  
  removePortNumber: function (host) {
      if (host) {
        return host.replace(this.regExes.portNumber, "");
      } else {
        return host;
      }
    },
  
  padLeft: function (str, len, pad) {
      if (len + 1 >= str.length) {
        str = new Array(len + 1 - str.length).join(pad) + str;
      }
      return str;
    }
};

FieldScope.DomUtils = {

  show : function (dom) {
      if (dom) {
        dom.style.visibility="visible";
      }
    },
    
  hide: function (dom) {
      if (dom) {
        dom.style.visibility="hidden";
      }
    }
};

// ----------------------------------------------------------------------------
if (typeof(Sys) !== "undefined") { Sys.Application.notifyScriptLoaded(); }
