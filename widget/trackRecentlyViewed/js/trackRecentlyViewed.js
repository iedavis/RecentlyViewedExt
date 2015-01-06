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
  ['knockout', 'pubsub', 'js/date'],
  
  //-------------------------------------------------------------------
  // MODULE DEFINITION
  //-------------------------------------------------------------------
  function(ko, pubsub) {

    "use strict";

    return{

      onLoad: function(widgetModel) {

        // Validate products in localStorage
        var recentlyViewedArray = JSON.parse(localStorage.getItem("cc.product.recentlyViewed")) || [];

        var cutoffDate = Number(widgetModel.lifespan()).days().ago();

        var thresholdMarker = recentlyViewedArray.length;
        for(var i = 0; i < recentlyViewedArray.length; i++){
          var viewedDate = Date.parse(recentlyViewedArray[i].dateViewed);
          if(viewedDate.compareTo(cutoffDate) === -1){
              thresholdMarker = i;
              break;
          }
        }

        recentlyViewedArray.length = thresholdMarker;
        localStorage["cc.product.recentlyViewed"] = JSON.stringify(recentlyViewedArray);

        // Check all Prouct ID still exist in catalog


        $.Topic(pubsub.topicNames.PRODUCT_VIEWED).subscribe(this.trackProductViewed);

      },

      trackProductViewed: function(product) {

        var viewHistoryLength = 24;
        var today = Date.today();

        // Retrieve array from localStorage (or create an empty array if not in localStorage)
        var recentlyViewedArray = JSON.parse(localStorage.getItem("cc.product.recentlyViewed")) || [];

        // See if the viewed product is already in the array, and remove it
        var foundIndex = -1;
        for(var i = 0; i < recentlyViewedArray.length; i++){
          if(recentlyViewedArray[i].id == product.id) foundIndex = i;
        }
        if (foundIndex > -1) recentlyViewedArray.splice(foundIndex, 1);

        // Insert viewed product at top of array
        recentlyViewedArray.unshift({
          "id": product.id,
          "dateViewed": today.getFullYear() + " " + (today.getMonth() + 1) + " " + today.getDate(),
          "displayName": product.displayName,
          "brand": product.brand,
          "route": product.route,
          "listPrice": product.listPrice(),
          "salePrice": product.salePrice(),
          "primaryLargeImageURL": product.primaryLargeImageURL,
          "primaryMediumImageURL": product.primaryMediumImageURL,
          "primarySmallImageURL": product.primarySmallImageURL,
          "primaryThumbImageURL": product.primaryThumbImageURL
        });

        // Trim the array to the maximum length (+1 to cater for Product Details Page)
        if(recentlyViewedArray.length > viewHistoryLength)recentlyViewedArray.length = viewHistoryLength + 1;

        // Place array back into localStorage
        localStorage["cc.product.recentlyViewed"] = JSON.stringify(recentlyViewedArray);
      }
    };
  }
);