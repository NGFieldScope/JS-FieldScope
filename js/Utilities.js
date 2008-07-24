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
  
  visible : function (dom) {
      if (dom) {
        return dom.style.display !== "none";
      }
      return false;
    },
  
  show : function (dom) {
      if (dom) {
        dom.style.display = "";
      }
    },
    
  hide: function (dom) {
      if (dom) {
        dom.style.display = "none";
      }
    },
  
  toggleDisplay : function (dom) {
      if (dom) {
        if (dom.style.display === "none") {
          dom.style.display = "";
        } else {
          dom.style.display = "none";
        }
      }
    }
};

// ----------------------------------------------------------------------------
if (typeof(Sys) !== "undefined") { Sys.Application.notifyScriptLoaded(); }
