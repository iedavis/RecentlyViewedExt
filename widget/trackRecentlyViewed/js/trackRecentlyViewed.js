/**
 * @fileoverview trackRecentlyViewed Widget. 
 * @author Ian Davis
 */
define(
  //-------------------------------------------------------------------
  // PACKAGE NAME
  //-------------------------------------------------------------------
  'trackRecentlyViewed',
  
  //-------------------------------------------------------------------
  // DEPENDENCIES
  //-------------------------------------------------------------------
  ['knockout', 'pubsub', 'ccRestClient', 'js/date'],
  
  //-------------------------------------------------------------------
  // MODULE DEFINITION
  //-------------------------------------------------------------------
  function(ko, pubsub, ccRestClient) {

    "use strict";

    return{

      onLoad: function(widgetModel) {

        $.Topic(pubsub.topicNames.PRODUCT_VIEWED).subscribe(this.trackProductViewed);
      },

      trackProductViewed: function(product) {

        var viewHistoryLength = 24;
        var today = Date.today();

        // Retrieve array from localStorage (or create an empty array if not in localStorage)
        var recentlyViewedCookie = JSON.parse(localStorage.getItem("cc.product.recentlyViewed")) || [];

        // See if the viewed product is already in the array, and remove it
        var foundIndex = -1;
        for(var i = 0; i < recentlyViewedCookie.length; i++){
          if(recentlyViewedCookie[i].id == product.id) foundIndex = i;
        }
        if (foundIndex > -1) recentlyViewedCookie.splice(foundIndex, 1);

        // Insert viewed product at top of array
        recentlyViewedCookie.unshift({
          "id": product.id,
          "dateViewed": today.getFullYear() + " " + (today.getMonth() + 1) + " " + today.getDate(),
        });

        // Trim the array to the maximum length (+1 to cater for Product Details Page)
        if(recentlyViewedCookie.length > viewHistoryLength)recentlyViewedCookie.length = viewHistoryLength + 1;

        // Place array back into localStorage
        localStorage["cc.product.recentlyViewed"] = JSON.stringify(recentlyViewedCookie);
      }
    };
  }
);