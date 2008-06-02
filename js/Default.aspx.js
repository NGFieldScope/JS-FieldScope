
//load map    
function Page_Load() {  
    var mapArgs = new DTS.MapArgs("myMap", new VELatLong(44.61,-72.02), 8, VEMapStyle.Hybrid, false, VEMapMode.Mode2D, VEDistanceUnit.Kilometers);
    map = null;

    //use dojo.addonload to be sure all elements are rendered
    dojo.addOnLoad(function () {
        map = new DTS.Map(NGSDataService, mapArgs);
        map.UpdateSlider();
    });
    
}  

//Clean up all objects
function Page_Unload() {
    if (map!=null) {
        map.Dispose();
        map = null;
    }
}



//set page event handlers
if (window.attachEvent) {
	window.attachEvent("onload", Page_Load);
	window.attachEvent("onunload", Page_Unload);	
} else {
	window.addEventListener("DOMContentLoaded", Page_Load, false);
	window.addEventListener("unload", Page_Unload, false);
}

if (typeof(Sys) !== "undefined") Sys.Application.notifyScriptLoaded();
