/*

VESearchTool.js: basic place-name search tool for Virtual Earth

*/

/*global dojo */
/*global StringUtils */
/*global VEShape, VEShapeLayer, VEShapeType */

function VESearchTool (map, resultsDivID) {
  
  var resultsLayer = new VEShapeLayer();
  map.AddShapeLayer(resultsLayer);
  
  var instance = this;
  var processSearchResults = function (ignore1, ignore2, results) {
      resultsLayer.DeleteAllShapes();
      var resultsDiv = dojo.byId(resultsDivID);
      if (results === null) {
        results = [];
        resultsDiv.appendChild(document.createTextNode("No Results Found"));
      } else {
        var header = document.createElement("p");
        header.className = "header";
        header.appendChild(document.createTextNode("Search Results:"));
        resultsDiv.appendChild(header);
        var onAnchorClick = function () {
            map.SetCenterAndZoom(this.placeLoc, 14);
          };
        for (var i = 0; i < results.length; i += 1) {
          var row = document.createElement("p");
          row.className = "row";
          var nameParts = StringUtils.splitOnce(results[i].Name, ",");
          var myAnchor = document.createElement("a");
          myAnchor.innerText = nameParts[0];
          myAnchor.setAttribute("href", "#");
          myAnchor.setAttribute("name", i);
          myAnchor.placeLoc = results[i].LatLong;
          myAnchor.onclick = onAnchorClick;
          row.appendChild(myAnchor);
          if (nameParts.length > 1) {
            row.appendChild(document.createTextNode("," + nameParts[1]));
          }
          resultsDiv.appendChild(row);
          var shape = new VEShape(VEShapeType.Pushpin, results[i].LatLong);
          shape.SetDescription(results[i].Name);
          resultsLayer.AddShape(shape);
        }
      }
      resultsDiv.style.visibility="visible";
      instance.onFinishSearch(results);
    };
  
  this.onBeginSearch = function (text) { };
  
  this.onFinishSearch = function (results) { };
  
  this.doSearch = function (text) {
      this.clearSearchResults();
      this.onBeginSearch(text);
      map.Find(null, text, null, null, 0, 20, false, false, false, false, processSearchResults);
    };
  
  this.clearSearchResults = function () {
      resultsLayer.DeleteAllShapes();
      var resultsDiv = dojo.byId(resultsDivID);
      for (var i = resultsDiv.childNodes.length - 1; i >= 0; i -= 1) {
        resultsDiv.removeChild(resultsDiv.childNodes[i]);
      }
      resultsDiv.style.visibility="hidden";
    };
}
