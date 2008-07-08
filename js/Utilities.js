/*global ActiveXObject, VELatLong, XMLSerializer, Sys */


// ----------------------------------------------------------------------------
// xml namespaces

/*global xmlns */
xmlns = { xsd: "http://www.w3.org/2001/XMLSchema",
          gml: "http://www.opengis.net/gml",
          wfs: "http://www.opengis.net/wfs" };

// ----------------------------------------------------------------------------
// String utilities

/*global StringUtils */
StringUtils = {
  
  regExes: { 
      surroundingSpaces: (/^\s*|\s*$/g),
      allSpaces: (/\s*/g),
      spaces: (/\s+/),
      allCommas: (/\s*,\s*/g),
      xmlNamespace: (/^\w+:/),
      portNumber: (/:\d+$/)
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
    
  removePortNumber: function (host) {
      if (host) {
        return host.replace(this.regExes.portNumber, "");
      } else {
        return host;
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
    },
  
  padLeft: function (str, len, pad) {
      if (len + 1 >= str.length) {
        str = new Array(len + 1 - str.length).join(pad) + str;
      }
      return str;
    }
};

// ----------------------------------------------------------------------------
// XML DOM utilities

/*global XMLUtils */
XMLUtils = {

  xmldom: window.ActiveXObject ? new ActiveXObject("Microsoft.XMLDOM") : null,
  
  getElementsByTagNameNS: function (node, uri, name) {
      if (node.getElementsByTagNameNS) {
        return node.getElementsByTagNameNS(uri, name);
      } else {
        // brute force method
        var result = [];
        var allNodes = node.getElementsByTagName("*");
        var potentialNode, fullName;
        for (var i = 0; i < allNodes.length; i += 1) {
          potentialNode = allNodes[i];
          fullName = potentialNode.prefix ? (potentialNode.prefix + ":" + name) : name;
          if ((name === "*") || (fullName === potentialNode.nodeName)) {
            if ((uri === "*") || (uri === potentialNode.namespaceURI)) {
              result.push(potentialNode);
            }
          }
        }
        result.item = function (index) {
            return this[index];
          };
        return result;
      }
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

// ----------------------------------------------------------------------------
// MetaLens utilities

/*global Utility */
/*jslint bitwise: false */
Utility = {
    /// <summary>
    ///   static Utility class
    /// </summary>

    OnFailed: function (error) {
        /// <summary>
        ///     This is the failed callback function for all webservices.
        /// </summary>  
        /// <param name="error">The error object from the webservice</param>          
        
        var stackTrace = error.get_stackTrace();
        var message = error.get_message();
        var statusCode = error.get_statusCode();
        var exceptionType = error.get_exceptionType();
        var timedout = error.get_timedOut();
       
        // Display the error.    
        var RsltElem = 
            "Stack Trace: " +  stackTrace + "<br/>" +
            "Service Error: " + message + "<br/>" +
            "Status Code: " + statusCode + "<br/>" +
            "Exception Type: " + exceptionType + "<br/>" +
            "Timedout: " + timedout;
            
            alert(RsltElem);
    },
       
    decodeLine: function (encoded) {
        /// <summary>
        ///     Decode an encoded string into a list of VE lat/lng.
        /// </summary>  
        /// <param name="encoded">The encoded string</param>       
        /// <returns>Array of VELatLong</returns>
       
        var len = encoded.length;
        var index = 0;
        var array = [];
        var lat = 0;
        var lng = 0;
        try {
            while (index < len) {
                var b;
                var shift = 0;
                var result = 0;
                do {
                      b = encoded.charCodeAt(index) - 63;
                      index += 1;
                      result |= (b & 0x1f) << shift;
                      shift += 5;
                } while (b >= 0x20);
                var dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
                lat += dlat;

                shift = 0;
                result = 0;
                do {
                      b = encoded.charCodeAt(index) - 63;
                      index += 1;
                      result |= (b & 0x1f) << shift;
                      shift += 5;
                } while (b >= 0x20);
                var dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
                lng += dlng;

                array.push(new VELatLong((lat * 1e-5), (lng * 1e-5)));
            }
        } catch(ex) {
            //error in encoding.
        }
        return array;
    },  

    createEncodings: function(points) {
        /// <summary>
        ///     Create the encoded bounds.
        /// </summary>  
        /// <param name="points">Array of VELatLong</param>       
        /// <returns>The encoded string</returns>    
        var i = 0;
        var plat = 0;
        var plng = 0;
        var encoded_points = "";

        for(i = 0; i < points.length; i += 1) {
            var point = points[i];
            var lat = point.Latitude;
            var lng = point.Longitude;

            var late5 = Math.floor(lat * 1e5);
            var lnge5 = Math.floor(lng * 1e5);

            var dlat = late5 - plat;
            var dlng = lnge5 - plng;

            plat = late5;
            plng = lnge5;

            encoded_points += this.encodeSignedNumber(dlat) + this.encodeSignedNumber(dlng);
        } 
        return encoded_points;
    },
    
    encodeSignedNumber: function(num) {
        /// <summary>
        ///     Encode a signed number in the encode format.
        /// </summary>  
        /// <param name="num">signed number</param>       
        /// <returns>encoded string</returns>       
        var sgn_num = num << 1;

        if (num < 0) {
            sgn_num = ~(sgn_num);
        }

        return this.encodeNumber(sgn_num);
    },

    encodeNumber: function(num) {
        /// <summary>
        ///     Encode an unsigned number in the encode format.
        /// </summary>  
        /// <param name="num">unsigned number</param>       
        /// <returns>encoded string</returns>        
        var encodeString = "";

        while (num >= 0x20) {
            encodeString += String.fromCharCode((0x20 | (num & 0x1f)) + 63);
            num >>= 5;
        }

        encodeString += String.fromCharCode(num + 63);
        return encodeString;
    }      
};

if (typeof(Sys) !== "undefined") { Sys.Application.notifyScriptLoaded(); }
