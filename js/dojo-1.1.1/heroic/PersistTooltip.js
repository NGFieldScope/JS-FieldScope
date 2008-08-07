dojo.require("dijit.Tooltip");
dojo.provide("heroic.PersistTooltip");
dojo.declare("heroic.PersistTooltip", [dijit.Tooltip], {

  postCreate: function() {
      if(!dijit._masterTT){
          dijit._masterTT = new dijit._MasterTooltip();
      }
      // should get the connection list & see if another heroic.widget.PersistTooltip
      // has already made these connections.
      dijit._masterTT.connect(dijit._masterTT.domNode,'onmouseover',this.ttPersist);
      dijit._masterTT.connect(dijit._masterTT.domNode,'onmouseout',this.ttFade);
      this.inherited("postCreate", arguments);
    },

  ttPersist: function (evt) {
      // console.log("persist");
      this.fadeOut.stop();
      this.fadeIn.play();
    },

  ttFade: function (evt) {
      // console.log("fade");
      this.fadeOut.play();
    }
  }
);
