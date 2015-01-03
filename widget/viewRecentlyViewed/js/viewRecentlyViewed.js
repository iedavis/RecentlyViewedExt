/**
 * @fileoverview View Recently Viewed.
 * Option.
 */

define(
  //-------------------------------------------------------------------
  // PACKAGE NAME
  //-------------------------------------------------------------------
  'viewRecentlyViewed',

  //-------------------------------------------------------------------
  // DEPENDENCIES
  //-------------------------------------------------------------------
  ['knockout'],

  //-------------------------------------------------------------------
  // MODULE DEFINITION
  //-------------------------------------------------------------------
  function(ko) {

    "use strict";

    return {

      onLoad: function(widget) {
        widget.recentProducts = ko.observableArray();

      },

      beforeAppear: function(page) {
        self = this;
        var prodArray = JSON.parse(localStorage.getItem("cc.product.recentlyViewed")) || [];
        for(var j = 0; j < prodArray.length; j++){
            if (page.contextId && prodArray[j].id == page.contextId) prodArray.splice(j, 1);
        }
        self.recentProducts.removeAll();
        var numDisplayed = Math.min(self.numDisplayed() || 3 , prodArray.length);
        for(var i = 0; i < numDisplayed; i++){
            self.recentProducts.push(prodArray[i]);
        }
      }
    };
  }
);