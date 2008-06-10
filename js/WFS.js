/*global dojo, GML StringUtils, Utility, XMLUtils, xmlns */
/*global VELatLong, VELatLongRectangle, VEShape */
/*global Type, Sys, AsyncDataProvider, WFS */

Type.registerNamespace("WFS");

// ----------------------------------------------------------------------------
// WFS.LatLongBoundingBox class

WFS.LatLongBoundingBox = function (xml) {
    if (xml.localName === "LatLongBoundingBox") {
      this.minx = parseFloat(xml.getAttribute("minx"));
      this.miny = parseFloat(xml.getAttribute("miny"));
      this.maxx = parseFloat(xml.getAttribute("maxx"));
      this.maxy = parseFloat(xml.getAttribute("maxy"));
    } else if (xml.localName === "WGS84BoundingBox") {
      var blNode = XMLUtils.getFirstElementWithTagName(xml, "LowerCorner");
      var bl = (blNode.text || blNode.textContent).split(" ");
      this.minx = parseFloat(bl[0]);
      this.miny = parseFloat(bl[1]);
      var trNode = XMLUtils.getFirstElementWithTagName(xml, "UpperCorner");
      var tr = (trNode.text || trNode.textContent).split(" ");
      this.maxx = parseFloat(tr[0]);
      this.maxy = parseFloat(tr[1]);
    }
  };

WFS.LatLongBoundingBox.registerClass("WFS.LatLongBoundingBox");

// ----------------------------------------------------------------------------
// WFS.FeatureType class

WFS.FeatureType = function (xml, version) {
    if (!version) {
      version = "1.0.0";
    }
    var nameNode = XMLUtils.getFirstElementWithTagName(xml, "Name");
    this.name = StringUtils.removeNamespace(nameNode.text || nameNode.textContent);
    var titleNode = XMLUtils.getFirstElementWithTagName(xml, "Title");
    this.title = titleNode.text || titleNode.textContent;
    var srsNode = null;
    if (version === "1.0.0") {
      srsNode = XMLUtils.getFirstElementWithTagName(xml, "SRS");
      this.srs = srsNode.text || srsNode.textContent;
      this.bounds = new WFS.LatLongBoundingBox(XMLUtils.getFirstElementWithTagName(xml, "LatLongBoundingBox"));
    } else if (version === "1.1.0") {
      srsNode = XMLUtils.getFirstElementWithTagName(xml, "DefaultSRS");
      this.srs = srsNode.text || srsNode.textContent;
      this.bounds = new WFS.LatLongBoundingBox(XMLUtils.getFirstElementWithTagName(xml, "WGS84BoundingBox"));
    } else {
      throw "unrecognized WFS version: " + version;
    }
    this.description = null;
    this.visible = false;
  };

WFS.FeatureType.registerClass("WFS.FeatureType");

// ----------------------------------------------------------------------------
// WFS.FeatureDescription class

WFS.FeatureDescription = function (schemaDoc, typeName) {
    var collectAttributes = function (attributes) {
        var result = [];
        for (var i = 0; i < attributes.length; i += 1) {
          result[attributes[i].nodeName] = attributes[i].nodeValue;
        }
        return result;
      };
    this.xmlns = schemaDoc.documentElement.getAttribute("targetNamespace");
    this.typeName = typeName;
    this.variables = [];
    this.geom = null;
    // It would be much nicer to do this with XPath, or even XSLT, but 
    // I haven't been able to find an XPath library that works cross-
    // browser and isn't horribly buggy.
    var elements = XMLUtils.getElementsByTagNameNS(schemaDoc, xmlns.xsd, "element");
    var schemaTypeName = null;
    var i;
    for (i = 0; i < elements.length; i += 1) {
      if (elements[i].getAttribute("name") === typeName) {
        // Remove the namespace declaration (if any). Does this work for
        // all servers, or only ionicsoft's?
        schemaTypeName = StringUtils.removeNamespace(elements[i].getAttribute("type"));
        break;
      }
    }
    var types = XMLUtils.getElementsByTagNameNS(schemaDoc, xmlns.xsd, "complexType");
    var type = null;
    for (i = 0; i < types.length; i += 1) {
      if (types[i].getAttribute("name") === schemaTypeName) {
        type = types[i];
        break;
      }
    }
    var sequences = XMLUtils.getElementsByTagNameNS(type, xmlns.xsd, "sequence");
    //TODO: also look for xsd:complexContent, xsd:all, xsd:group, etc...?
    for (i = 0; i < sequences.length; i += 1) {
      elements = XMLUtils.getElementsByTagNameNS(sequences[i], xmlns.xsd, "element");
      for (var j = 0; j < elements.length; j += 1) {
        var rawType = elements[j].getAttribute("type");
        if (rawType === null) {
          var restrictions = XMLUtils.getElementsByTagNameNS(elements[j], xmlns.xsd, "restriction");
          if (restrictions.length > 0) {
            rawType = restrictions.item(0).getAttribute("base");
          }
        }
        type = StringUtils.removeNamespace(rawType);
        if ((type === "GeometryPropertyType") ||
            (type === "PointPropertyType") ||
            (type === "LineStringType") ||
            (type === "LineStringPropertyType") ||
            (type === "PolygonPropertyType")) {
            //TODO: do we need to support more types?
            if (this.geom !== null) {
              console.error("multiple geometry elements defined");
            }
            this.geom = collectAttributes(elements[j].attributes);
        } else {
          this.variables.push(collectAttributes(elements[j].attributes));
        }
      }
    }
  };

// Make DOM objects for a Javascript-based "form" for entering
// data for this WFS feature type. It's not really an HTML form,
// but it behaves sort of like one.
WFS.FeatureDescription.prototype.getFormDOM = function () {
    var result = document.createElement("div");
    result.style.margin = "2px";
    result.description = this;
    result.onSave = function () { };
    result.onCancel = function () { };
    result.getAttributes = function () {
        // This is intended to be called from the onSave method above
        var result = [];
        for (var i = 0; i < this.description.variables.length; i += 1) {
          var name = this.description.variables[i].name;
          var input = XMLUtils.getElementByName(this, name);
          if (input) {
            result[name] = input.value;
          }
        }
        return result;
      };
    var tableDiv = document.createElement("div");
    tableDiv.style.border = "thin inset gray";
    var table = document.createElement("table");
    var tbody = document.createElement("tbody");
    for (var i = 0; i < this.variables.length; i += 1) {
      if (this.variables[i].name !== "OBJECTID") {
        var row = document.createElement("tr");
        var cell1 = document.createElement("td");
        cell1.appendChild(document.createTextNode(this.variables[i].name));
        row.appendChild(cell1);
        var cell2 = document.createElement("td");
        var field = document.createElement("input");
        field.type = "text";
        field.style.width = "95%";
        field.name = this.variables[i].name;
        if (this.variables[i]["default"] !== undefined) {
          field.value = this.variables[i]["default"];
        }
        cell2.appendChild(field);
        row.appendChild(field);
        tbody.appendChild(row);
      }
    }
    table.appendChild(tbody);
    tableDiv.appendChild(table);
    result.appendChild(tableDiv);
    var buttonDiv = document.createElement("div");
    buttonDiv.style.margin = "2px";
    buttonDiv.style.textAlign = "right";
    var cancelButton = document.createElement("input");
    cancelButton.type = "button";
    cancelButton.value = "Cancel";
    cancelButton.onclick = function (event) { 
        result.onCancel(); 
      };
    buttonDiv.appendChild(cancelButton);
    buttonDiv.appendChild(document.createTextNode(" "));
    var saveButton = document.createElement("input");
    saveButton.type = "button";
    saveButton.value = "Save";
    saveButton.onclick = function (event) { 
        result.onSave();
      };
    buttonDiv.appendChild(saveButton);
    result.appendChild(buttonDiv);
    return result;
  };

WFS.FeatureDescription.registerClass("WFS.FeatureDescription");

// ----------------------------------------------------------------------------
// WFS.Capabilities class

WFS.Capabilities = function (capabilities) {
    this.getFeatureUrl = null;
    this.describeFeatureUrl = null;
    this.transactionUrl = null;
    var version = capabilities.getAttribute("version");
    var i;
    if (version === "1.0.0") {
      var getFeature = XMLUtils.getFirstElementWithTagName(capabilities, "GetFeature");
      this.getFeatureUrl = XMLUtils.getFirstElementWithTagName(getFeature, "Get").getAttribute("onlineResource");
      var describeFeature = XMLUtils.getFirstElementWithTagName(capabilities, "DescribeFeatureType");
      this.describeFeatureUrl = XMLUtils.getFirstElementWithTagName(describeFeature, "Get").getAttribute("onlineResource");
      var transaction = XMLUtils.getFirstElementWithTagName(capabilities, "Transaction");
      this.transactionUrl = XMLUtils.getFirstElementWithTagName(transaction, "Get").getAttribute("onlineResource");
    } else if (version === "1.1.0") {
      // sometimes you get version 1.1.0 even if you ask for 1.0.0 (thanks, ESRI)
      var operations = XMLUtils.getElementsByTagName(capabilities, "Operation");
      for (i = 0; i < operations.length; i += 1) {
        var name = operations.item(i).getAttribute("name");
        if (name === "GetFeature") {
          this.getFeatureUrl = XMLUtils.getFirstElementWithTagName(operations.item(i), "Get").getAttribute("xlink:href");
        } else if (name === "DescribeFeatureType") {
          this.describeFeatureUrl = XMLUtils.getFirstElementWithTagName(operations.item(i), "Get").getAttribute("xlink:href");
        } else if (name === "Transaction") {
          this.transactionUrl = XMLUtils.getFirstElementWithTagName(operations.item(i), "Post").getAttribute("xlink:href");
        }
      }
    } else {
      throw "unrecognized WFS version: " + version;
    }
    var types = XMLUtils.getElementsByTagName(XMLUtils.getFirstElementWithTagName(capabilities, "FeatureTypeList"), "FeatureType");
    this.featureTypes = [];
    for (i = 0; i < types.length; i += 1) {
      this.featureTypes[i] = new WFS.FeatureType(types.item(i), version);
    }
  };

WFS.Capabilities.registerClass("WFS.Capabilities");

// ----------------------------------------------------------------------------
// Global function WFS.getFeatureAsync

WFS.getFeatureAsync = function (url, layers, bounds, onLoad, onError) {

    //HACK: as of RC1, ArcGIS Server's interpretation of BBOX is broken,
    // but we can work around it by always asking for everything
    bounds = [ -180, -90, 180, 90 ];
    
    return dojo.xhrGet({ 
        url: url +
             "REQUEST=GetFeature" +
             "&VERSION=1.0.0" +
             "&SERVICE=WFS" +
             "&TYPENAME=" + layers.join(",") +
             "&BBOX=" + bounds.join(","),
        handleAs: "xml",
        load: function (response, ioArgs) {
            onLoad(response, ioArgs);
            return response;
          },
        error: function (response, ioArgs) {
            onError(response, ioArgs);
            return response;
          }
     });
  };

// ----------------------------------------------------------------------------
// Global function WFS.describeFeatureTypeSync

WFS.describeFeatureTypeSync = function (url, featureType) {
    var xml = null;
    dojo.xhrGet({ url: url +
                       "REQUEST=DescribeFeatureType" +
                       "&VERSION=1.0.0" +
                       "&SERVICE=WFS" +
                       "&TYPENAME=" + featureType,
                  handleAs: "xml",
                  load: function (response, ioArgs) {
                      xml = response;
                      return response;
                    },
                  error: function (response, ioArgs) {
                      console.error("HTTP status code: ", ioArgs.xhr.status);
                      return response;
                    },
                  sync: true
                });
    return new WFS.FeatureDescription(xml, featureType);
  };

// ----------------------------------------------------------------------------
// Global function WFS.getCapabilitiesSync

WFS.getCapabilitiesSync = function (url) {
    var xml = null;
    dojo.xhrGet({ url: url + "?" +
                       "REQUEST=GetCapabilities" +
                       "&VERSION=1.0.0" +
                       "&SERVICE=WFS",
                  handleAs: "xml",
                  load: function (response, ioArgs) {
                      xml = response.documentElement;
                      return response;
                    },
                  error: function (response, ioArgs) {
                      console.error("HTTP status code: ", ioArgs.xhr.status);
                      return response;
                    },
                  sync: true
                });
    return new WFS.Capabilities(xml);
  };

// ----------------------------------------------------------------------------
// Setup additional properties for shapes

VEShape.prototype.WFSRecord = null;

// ----------------------------------------------------------------------------
// WFS.DataProvider class

WFS.DataProvider = function (url) {
    
    this.capabilities = WFS.getCapabilitiesSync(url);
    this.parser = new GML.Parser();
    this.customIcon = null;
    
    this.GetMinimumZoomLevel = function () { 
        return 0; 
      };
    
    this.GetRecords = function (bounds, zoom, OnSuccess, OnFailure) {
        var layers = [];
        for (var i = 0; i < this.capabilities.featureTypes.length; i += 1) {
          if (this.capabilities.featureTypes[i].visible) {
            layers.push(this.capabilities.featureTypes[i].name);
          }
        }
        if (layers.length > 0) {
          WFS.getFeatureAsync(this.capabilities.getFeatureUrl,
                              layers,
                              [ bounds.TopLeftLatLong.Longitude,
                                bounds.BottomRightLatLong.Latitude,
                                bounds.BottomRightLatLong.Longitude,
                                bounds.TopLeftLatLong.Latitude ],
                              Function.createDelegate(this, function (response, ioArgs) {
                                  var result = this.parser.parseGML(response);
                                  OnSuccess.call(this, result);
                                }),
                              Utility.OnFailed);
        } else {
          OnSuccess.call(this, []);
        }
      };
    
    this.CreateShape = function (record) { 
        var shape = record.shapes[0];
        if (this.customIcon) {
          shape.SetCustomIcon(this.customIcon);
        }
        shape.SetTitle("Student Observation");
        shape.WFSRecord = record;
        return shape;
      };
    
    this.OwnsShape = function (shape) { 
        return shape.WFSRecord !== null;
      };
    
    this.GetPopup = function (shape, divID, OnSuccess, OnFailure) {
        var record = shape.WFSRecord;
        var dom = document.createElement("div");
        var result = "<table>";
        result += "<tr>";
        result += "<th style='border:1px outset white;font-weight:bold;padding:2px'>Attribute</th>";
        result += "<th style='border:1px outset white;font-weight:bold;padding:2px'><b>Value</b></th>";
        result += "</tr>";
        for (var attrib in record.attributes) {
          if (attrib !== "OBJECTID") {
            result += "<tr>";
            result += "<td style='border:1px outset white;padding:3px'>" + attrib + "</td>";
            result += "<td style='border:1px outset white;padding:3px'>" + record.attributes[attrib] + "</td>";
            result += "</tr>";
          }
        }
        result += "</table>";
        dom.innerHTML = result;
        OnSuccess.call(this, shape.GetID(), "", "", dom);
      };
    
    this.getFeatureTypeDescription = function (index) {
        if (this.capabilities.featureTypes[index].description) {
          return this.capabilities.featureTypes[index].description;
        } else {
          var result = WFS.describeFeatureTypeSync(this.capabilities.describeFeatureUrl,
                                                   this.capabilities.featureTypes[index].name);
          this.capabilities.featureTypes[index].description = result;
          return result;
        }
      };
  };

WFS.DataProvider.registerClass('WFS.DataProvider', null, AsyncDataProvider);

// ----------------------------------------------------------------------------
// Global function wfsInsertAsync

WFS.insertAsync = function (url, features, onInsert, onError) {
    var transaction = XMLUtils.createDocument(xmlns.wfs, "wfs:Transaction");
    transaction.documentElement.setAttribute("xmlns", url);
    transaction.documentElement.setAttribute("xmlns:gml", xmlns.gml);
    transaction.documentElement.setAttribute("version", "1.0.0");
    transaction.documentElement.setAttribute("service", "WFS");
    var insert = XMLUtils.createElementNS(xmlns.wfs, "wfs:Insert");
    for (var i = 0; i < features.length; i += 1) {
      insert.appendChild(features[i]);
    }
    transaction.documentElement.appendChild(insert);
    dojo.rawXhrPost({ 
        url: url,
        handleAs: "text",
        load: function (response, ioArgs) {
            onInsert(response, ioArgs);
            return response;
          },
        error: function (response, ioArgs) {
            onError(response, ioArgs);
            return response;
          },
        contentType: "text/xml",
        postData: XMLUtils.xmlToString(transaction)
      });
  };

if (typeof(Sys) !== "undefined") { Sys.Application.notifyScriptLoaded(); }