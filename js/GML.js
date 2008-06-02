/*

GML.js: Parsing from and Serializing to GML for use with Virtual Earth
Based on OpenLayers.Format.GML from the OpenLayers project. 
Used under the following license:

This license applies to all code and content in the 'branches', 'trunk', and
'project' directories of the Openlayers code repository at svn.openlayers.org,
and applies to all release of OpenLayers later than 2.5.

Copyright (c) 2005-2008 MetaCarta, Inc.

All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted (subject to the limitations in the
disclaimer below) provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.

 * Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the
   distribution.

 * Neither the name of MetaCarta, Inc. nor the names of its
   contributors may be used to endorse or promote products derived
   from this software without specific prior written permission.

NO EXPRESS OR IMPLIED LICENSES TO ANY PARTY'S PATENT RIGHTS ARE
GRANTED BY THIS LICENSE.  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT
HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED
WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN
IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/

/*global VEAltitudeMode, VELatLong, VEShape, VEShapeType */
/*global StringUtils, XMLUtils, xmlns */
/*global Type, Sys, GML */

Type.registerNamespace("GML");

GML.Record = function () {
    this.typeName = "";
    this.xmlns = null;
    this.fid = null;
    this.shapeType = null;
    this.attributes = [];
    this.geomName = "";
    this.shapes = [];
  };

GML.Record.registerClass("GML.Record");

GML.Parser = function () {
    
    function parseAttributes (xml) {
      var attributes = {};
      // assume attributes are children of the first type 1 child
      var childNode = xml.firstChild;
      var children, child, grandchildren, grandchild, name, value;
      while (childNode) {
        if (childNode.nodeType === 1) {
          // attributes are type 1 children with one type 3 child
          children = childNode.childNodes;
          for (var i = 0; i < children.length; i += 1) {
            child = children[i];
            if (child.nodeType === 1) {
              grandchildren = child.childNodes;
              if (grandchildren.length === 1) {
                grandchild = grandchildren[0];
                if ((grandchild.nodeType === 3) || (grandchild.nodeType === 4)) {
                  name = child.prefix ? child.nodeName.split(":")[1] : child.nodeName;
                  value = StringUtils.trimSpaces(grandchild.nodeValue);
                  attributes[name] = value;
                }
              }
            }
          }
          break;
        }
        childNode = childNode.nextSibling;
      }
      return attributes;
    }
    
    // Returns a list of GML.Records
    this.parseGML = function (xml) {
        var featureNodes = XMLUtils.getElementsByTagNameNS(xml, xmlns.gml, "featureMember");
        var records = [];
        for (var i = 0; i < featureNodes.length; i += 1) {
          records.push(this.parseFeature(featureNodes[i]));
        }
        return records;
      };
    
    this.parseFeature = function (xml) {
        var result = new GML.Record();
        // only accept one geometry per feature - look for highest "order"
        var type, nodeList;
        for (var t in this.shapeTypes) {
          if (t) {
            type = t;
            nodeList = XMLUtils.getElementsByTagNameNS(xml, xmlns.gml, type);
            if (nodeList.length > 0) {
              // only deal with first geometry of this type
              var parseMethod = this.parseGeometryMethods[type.toLowerCase()];
              if (parseMethod) {
                result.shapes = parseMethod.call(this, nodeList[0]);
                result.geomName = nodeList[0].parentNode.localName;
              } else {
                alert("unsupported geometry type: " + type);
              }
              break;
            }
          }
        }
        result.typeName = xml.firstChild.localName;
        result.xmlns = xml.firstChild.namespaceURI;
        result.fid = xml.firstChild.getAttribute("fid");
        result.shapeType = this.shapeTypes[type];
        result.attributes = parseAttributes(xml);
        return result;
      };
    
    var parseLinestringCoordinates = function (xml) {
        var nodeList, coordString;
        var coords = [];
        var points = [];
        var i, j, x, y;
        // look for <gml:posList>
        nodeList = XMLUtils.getElementsByTagNameNS(xml, xmlns.gml, "posList");
        if (nodeList.length > 0) {
          coordString = nodeList[0].text || nodeList[0].textContent;
          coordString = StringUtils.trimSpace(coordString);
          coords = StringUtils.splitOnSpaces(coordString);
          var dim = parseInt(nodeList[0].getAttribute("dimension"), 10);
          for (i = 0; i < coords.length/dim; i += 1) {
            j = i * dim;
            x = coords[j];
            y = coords[j+1];
            if (coords.length === 2) {
              points.push(new VELatLong(parseFloat(y), 
                                        parseFloat(x)));
            } else {
              points.push(new VELatLong(parseFloat(y), 
                                        parseFloat(x), 
                                        parseFloat(coords[j+2]), 
                                        VEAltitudeMode.Absolute));
            }
          }
        }
        // look for <gml:coordinates>
        if (coords.length === 0) {
          nodeList = XMLUtils.getElementsByTagName(xml, "coordinates");
          if (nodeList.length > 0) {
            coordString = nodeList[0].text || nodeList[0].textContent;
            coordString = StringUtils.removeCommas(StringUtils.removeSpaces(coordString));
            var pointList = StringUtils.splitOnSpaces(coordString);
            for (i = 0; i < pointList.length; i += 1) {
              coords = pointList[i].split(",");
              if (coords.length === 2) {
                points.push(new VELatLong(parseFloat(coords[1]), 
                                          parseFloat(coords[0])));
              } else {
                points.push(new VELatLong(parseFloat(coords[1]), 
                                          parseFloat(coords[0]), 
                                          parseFloat(coords[2]), 
                                          VEAltitudeMode.Absolute));
              }
            }
          }
        }
        return points;
      };
    
    this.parseGeometryMethods = {
      
      point: function (xml) {
          var nodeList, coordString, coords = [];
          // look for <gml:pos>
          nodeList = XMLUtils.getElementsByTagNameNS(xml, xmlns.gml, "pos");
          if (nodeList.length > 0) {
            coordString = nodeList[0].firstChild.nodeValue;
            coordString = StringUtils.trimSpaces(coordString);
            coords = StringUtils.splitOnSpaces(coordString).reverse();
          }
          // look for <gml:coordinates>
          if (coords.length === 0) {
            nodeList = XMLUtils.getElementsByTagNameNS(xml, xmlns.gml, "coordinates");
            if (nodeList.length > 0) {
              coordString = nodeList[0].firstChild.nodeValue;
              coordString = StringUtils.removeSpaces(coordString);
              coords = coordString.split(",");
            }
          }
          // look for <gml:coord>
          if (coords.length === 0) {
            nodeList = XMLUtils.getElementsByTagNameNS(xml, xmlns.gml, "coord");
            if (nodeList.length > 0) {
              var xList = XMLUtils.getElementsByTagNameNS(nodeList[0], xmlns.gml, "X");
              var yList = XMLUtils.getElementsByTagNameNS(nodeList[0], xmlns.gml, "Y");
              if (xList.length > 0 && yList.length > 0) {
                coords = [ xList[0].firstChild.nodeValue, yList[0].firstChild.nodeValue ];
              }
            }
          }
          var point = null;
          // preserve third dimension
          if (coords.length === 2) {
            point = new VELatLong(parseFloat(coords[1]), 
                                  parseFloat(coords[0]));
          } else {
            point = new VELatLong(parseFloat(coords[1]), 
                                  parseFloat(coords[0]), 
                                  parseFloat(coords[2]), 
                                  VEAltitudeMode.Absolute);
          }
          return [new VEShape(VEShapeType.Pushpin, point)];
        },
      
      multipoint: function (xml) {
          var result = [];
          var nodeList = XMLUtils.getElementsByTagNameNS(xml, xmlns.gml, "Point");
          for (var i = 0; i < nodeList.length; i += 1) {
            result.push(this.parseGeometryMethods.point.call(this, nodeList[i]));
          }
          return result;
        },
      
      linestring: function (xml) {
          return new VEShape(VEShapeType.Polyline, parseLinestringCoordinates(xml));
        },
      
      multilinestring: function (xml) {
          var result = [];
          var nodeList = XMLUtils.getElementsByTagNameNS(xml, xmlns.gml, "LineString");
          for (var i = 0; i < nodeList.length; i += 1) {
            result.push(this.parseGeometryMethods.linestring.call(this, nodeList[i]));
          }
          return result;
        },
      
      polygon: function (xml) {
          var result = [];
          var nodeList = XMLUtils.getElementsByTagNameNS(xml, xmlns.gml, "LinearRing");
          for (var i = 0; i < nodeList.length; i += 1) {
            result.push(new VEShape(VEShapeType.Polygon, parseLinestringCoordinates(nodeList[i])));
          }
          return result;
        },
      
      multipolygon: function (xml) {
          var result = [];
          var nodeList = XMLUtils.getElementsByTagNameNS(xml, xmlns.gml, "Polygon");
          for (var i = 0; i < nodeList.length; i += 1) {
            result = result.concat(this.parseGeometryMethods.polygon.call(this, nodeList[i]));
          }
          return result;
        }
    };
  };

GML.Parser.prototype.shapeTypes = { 
    "MultiPolygon" : VEShapeType.Polygon, 
    "Polygon" : VEShapeType.Polygon, 
    "MultiLineString" : VEShapeType.Polyline, 
    "LineString" : VEShapeType.Polyline, 
    "MultiPoint" : VEShapeType.Pushpin, 
    "Point" : VEShapeType.Pushpin 
  };

GML.Parser.registerClass("GML.Parser");

GML.Serializer = function () {
    
    var buildCoordinatesNode = function (shape) {
        var result = XMLUtils.createElementNS(xmlns.gml, "gml:coordinates");
        result.setAttribute("decimal", ".");
        result.setAttribute("cs", ",");
        result.setAttribute("ts", " ");
        var points = shape.GetPoints();
        var parts = [];
        for (var i = 0; i < points.length; i += 1) {
          parts.push(points[i].Longitude + "," + points[i].Latitude);
        }
        result.appendChild(this.createTextNode(parts.join(" ")));
        return result;
      };
    
    var serializePoint = function (point) {
        var gml = XMLUtils.createElementNS(xmlns.gml, "gml:Point");
        gml.appendChild(buildCoordinatesNode((point)));
        return gml;
      };
    
    var serializeMultipoint = function (points) {
        var result = XMLUtils.createElementNS(xmlns.gml, "gml:MultiPoint");
        var pointMember;
        for (var i = 0; i < points.length; i += 1) { 
          pointMember = XMLUtils.createElementNS(xmlns.gml, "gml:pointMember");
          pointMember.appendChild(serializePoint(points[i]));
          result.appendChild(pointMember);
        }
        return result;            
      };
    
    var serializeLinestring = function (linestring) {
        var result = XMLUtils.createElementNS(xmlns.gml, "gml:LineString");
        result.appendChild(buildCoordinatesNode(linestring));
        return result;
      };
    
    var serializeMultilinestring = function (linestrings) {
        var result = XMLUtils.createElementNS(xmlns.gml, "gml:MultiLineString");
        var lineMember;
        for (var i = 0; i < linestrings.length; i += 1) {
          lineMember = this.XMLUtils.createElementNS(xmlns.gml, "gml:lineStringMember");
          lineMember.appendChild(serializeLinestring(linestrings[i]));
          result.appendChild(lineMember);
        }
        return result;
      };
    
    var serializePolygon = function (polygon) {
        var result = XMLUtils.createElementNS(xmlns.gml, "gml:Polygon");
        var boundary = XMLUtils.createElementNS(xmlns.gml, "gml:outerBoundaryIs");
        var ring = XMLUtils.createElementNS(xmlns.gml, "gml:LinearRing");
        ring.appendChild(buildCoordinatesNode(polygon));
        boundary.appendChild(ring);
        result.appendChild(boundary);
        return result;
      };
      
    var serializeMultipolygon = function (polygons) {
        var result = this.XMLUtils.createElementNS(xmlns.gml, "gml:MultiPolygon");
        var polyMember;
        for (var i = 0; i < polygons.length; i += 1) {
          polyMember = XMLUtils.createElementNS(xmlns.gml, "gml:polygonMember");
          polyMember.appendChild(serializePolygon(polygons[i]));
          result.appendChild(polyMember);
        }
        return result;
      };
    
    function serialize (record) {
      var result = XMLUtils.createElementNS(record.xmlns, record.typeName);
      for (var name in record.attributes) {
        if (typeof(name) !== "function") { 
          var element = XMLUtils.createElementNS(record.xmlns, name);
          element.appendChild(document.createTextNode(record.attributes[name]));
          result.appendChild(element);
        }
      }
      var geomNode = XMLUtils.createElementNS(record.xmlns, record.geomName);
      switch (record.shapeType) {
        case VEShapeType.Pushpin:
          if (record.shapes.length === 1) {
            geomNode.appendChild(serializePoint(record.shapes[0]));
          } else {
            geomNode.appendChild(serializeMultipoint(record.shapes));
          }
          break;
        case VEShapeType.Polyline:
          if (record.shapes.length === 1) {
            geomNode.appendChild(serializeLinestring(record.shapes[0]));
          } else {
            geomNode.appendChild(serializeMultilinestring(record.shapes));
          }
          break;
        case VEShapeType.Polygon:
          if (record.shapes.length === 1) {
            geomNode.appendChild(serializePolygon(record.shapes[0]));
          } else {
            geomNode.appendChild(serializeMultipolygon(record.shapes));
          }
          break;
        default:
          throw "Unknown shape type " + record.shapes[0].GetType();
      }
      result.appendChild(geomNode);
      return result;
    }
  };

GML.Serializer.registerClass("GML.Serializer");

if (typeof(Sys) !== "undefined") { Sys.Application.notifyScriptLoaded(); }
