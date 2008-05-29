/*global ActiveXObject */
/*global VELatLongRectangle */
/*global XMLSerializer */

/*global xmlns */
var xmlns = { xsd: "http://www.w3.org/2001/XMLSchema",
              gml: "http://www.opengis.net/gml",
              wfs: "http://www.opengis.net/wfs" };

/*global StringUtils */
var StringUtils = {
  
  regExes: { 
      surroundingSpaces: (/^\s*|\s*$/g),
      allSpaces: (/\s*/g),
      spaces: (/\s+/),
      allCommas: (/\s*,\s*/g),
      xmlNamespace: (/^\w+:/) 
    },
  
  trimSpaces: function (string) {
      return string.replace(this.regExes.surroundingSpaces, "");
    },
    
  splitOnSpaces: function (string) {
      return string.split(this.regExes.spaces);
    },

  removeSpaces: function (string) {
      return string.replace(this.regExes.allSpaces, "");
    },

  removeCommas: function (string) {
      return string.replace(this.regExes.allCommas, "");
    },
    
  removeNamespace: function (name) {
      if (name) {
        return name.replace(this.regExes.xmlNamespace, "");
      } else {
        return name;
      }
    },
  
  splitOnce: function (string, delimiter) {
      var result = [];
      var i = string.indexOf(delimiter);
      if (i < 0) {
        result.push(string);
      } else {
        result.push(string.substring(0,i));
        result.push(string.substr(i+1));
      }
      return result;
    }
};

/*global XMLUtils */
var XMLUtils = {

  xmldom: (window.ActiveXObject) ? new ActiveXObject("Microsoft.XMLDOM") : null,
  
  getElementsByTagNameNS: function (node, uri, name) {
      var elements = [];
      if (node.getElementsByTagNameNS) {
        elements = node.getElementsByTagNameNS(uri, name);
      } else {
        // brute force method
        var allNodes = node.getElementsByTagName("*");
        var potentialNode, fullName;
        for (var i = 0; i < allNodes.length; i += 1) {
          potentialNode = allNodes[i];
          fullName = (potentialNode.prefix) ? (potentialNode.prefix + ":" + name) : name;
          if ((name === "*") || (fullName === potentialNode.nodeName)) {
            if ((uri === "*") || (uri === potentialNode.namespaceURI)) {
              elements.push(potentialNode);
            }
          }
        }
      }
      return elements;
    },

  getElementsByTagName: function (node, name) {
      if (this.xmldom) {
        // WTF does IE not find elements with a namespace prefix? Isn't the
        // whole point of getElementsByTagName that it doesn't pay attention
        // to namespace?
        var result = [];
        var allNodes = node.getElementsByTagName("*");
        var potentialNode;
        for (var i = 0; i < allNodes.length; i += 1) {
          potentialNode = allNodes[i];
          if ((name === "*") || (name === StringUtils.removeNamespace(potentialNode.nodeName))) {
            result.push(potentialNode);
          }
        }
        result.item = function (index) {
            return this[index];
          };
        return result;
      } else {
        return node.getElementsByTagName(name);
      }
    },

  getFirstElementWithTagName: function (node, name) {
      if (this.xmldom) {
        // WTF does IE not find elements with a namespace prefix? Isn't the
        // whole point of getElementsByTagName that it doesn't pay attention
        // to namespace?
        var allNodes = node.getElementsByTagName("*");
        var potentialNode;
        for (var i = 0; i < allNodes.length; i += 1) {
          potentialNode = allNodes[i];
          if ((name === "*") || (name === StringUtils.removeNamespace(potentialNode.nodeName))) {
            return potentialNode;
          }
        }
      } else {
        return node.getElementsByTagName(name).item(0);
      }
    },

  getElementByName: function (node, id) {
      // brute force method
      var allNodes = node.getElementsByTagName("*");
      for (var i = 0; i < allNodes.length; i += 1) {
        if (allNodes[i].name === id) {
          return allNodes[i];
        }
      }
      return null;
    },

  createElementNS: function (uri, name) {
      var element;
      if (this.xmldom) {
        if (typeof uri === "string") {
          element = this.xmldom.createNode(1, name, uri);
        } else {
          element = this.xmldom.createNode(1, name, "");
        }
      } else {
        element = document.createElementNS(uri, name);
      }
      return element;
    },

  createTextNode: function (text) {
      var node;
      if (this.xmldom) {
        node = this.xmldom.createTextNode(text);
      } else {
        node = document.createTextNode(text);
      }
      return node;
    },
  
  xmlToString: function (node) {
      if (this.xmldom) {
        return node.xml;
      } else {
        var serializer = new XMLSerializer();
        if (node.nodeType === 1) {
          // Add nodes to a document before serializing. Everything else
          // is serialized as is. This may need more work. See #1218 .
          var doc = document.implementation.createDocument("", "", null);
          if (doc.importNode) {
              node = doc.importNode(node, true);
          }
          doc.appendChild(node);
          return serializer.serializeToString(doc);
        } else {
          return serializer.serializeToString(node);
        }
      }
    },
  
  // cross-browser hackery thnks to http://www.webreference.com/programming/javascript/domwrapper/2.html
  createDocument: function (xmlns, root) {
      if (document.implementation.createDocument) {
        return document.implementation.createDocument(xmlns, root, null);
      } else if (this.xmldom) {
        var result = null;
        var names = ["Msxml2.DOMDocument.6.0", "Msxml2.DOMDocument.3.0", "MSXML2.DOMDocument", "MSXML.DOMDocument", "Microsoft.XMLDOM"];
        for (var i = 0; i < names.length; i += 1) {
          try { 
            result = new ActiveXObject(names[i]); 
            break;
          } catch (e) { }
        }
        if (result === null) {
          throw "Unable to create DOM document";
        }
        result.async="false"; 
        if (root) {
          if (xmlns) {
            var prefix = "a";
            var splitName = StringUtils.splitOnce(root, ":");
            if (splitName.length > 1) {
              prefix = splitName[0];
              root = splitName[1];
            }
            result.loadXML("<"+prefix+":"+root+"xmlns:"+prefix+"=\""+xmlns+"\" />");
          } else {
            result.loadXML("<" + root + " />");
          }
        }
      } else {
        throw "Unable to create DOM document";
      }
    }
};

VELatLongRectangle.prototype.Contains = function (rect) {
	return (rect.TopLeftLatLong.Longitude >= this.TopLeftLatLong.Longitude) &&
         (rect.BottomRightLatLong.Latitude >= this.BottomRightLatLong.Latitude) &&
         (rect.BottomRightLatLong.Longitude <= this.BottomRightLatLong.Longitude) &&
         (rect.TopLeftLatLong.Latitude <= this.TopLeftLatLong.Latitude);
  };

VELatLongRectangle.prototype.GetWidth = function (rect) {
    return this.BottomRightLatLong.Longitude - this.TopLeftLatLong.Longitude;
  };

VELatLongRectangle.prototype.GetHeight = function (rect) {
    return this.TopLeftLatLong.Latitude - this.BottomRightLatLong.Latitude;
  };
