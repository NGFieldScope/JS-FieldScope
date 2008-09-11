/*	Google Maps API HtmlControl v1.1.2
	based on code posted on Google Maps API discussion group
	last updated/modified by Martin Pearman 20th August 2008
	
	http://googlemapsapi.martinpearman.co.uk/htmlcontrol
	
	This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

	This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

	You should have received a copy of the GNU General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
function HtmlControl(_1,_2){this.html=_1;this.isVisible=true;this.isPrintable=false;this.isSelectable=false;if(_2){this.isVisible=(_2.visible===false)?false:true;this.isPrintable=(_2.printable===true)?true:false;this.isSelectable=(_2.selectable===true)?true:false;}}HtmlControl.prototype=new GControl();HtmlControl.prototype.initialize=function(_3){this.div=document.createElement("div");this.div.innerHTML=this.html;this.setVisible(this.isVisible);_3.getContainer().appendChild(this.div);return this.div;};HtmlControl.prototype.getDefaultPosition=function(){return new GControlPosition(G_ANCHOR_TOP_LEFT,new GSize(7,7));};HtmlControl.prototype.selectable=function(){return this.isSelectable;};HtmlControl.prototype.printable=function(){return this.isPrintable;};HtmlControl.prototype.setVisible=function(_4){this.div.style.display=_4?"":"none";this.isVisible=_4;};HtmlControl.prototype.visible=function(){return this.isVisible;};