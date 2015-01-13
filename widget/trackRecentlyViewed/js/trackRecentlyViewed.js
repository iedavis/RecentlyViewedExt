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
  ['knockout', 'pubsub', 'ccRestClient', 'moment'],
  
  //-------------------------------------------------------------------
  // MODULE DEFINITION
  //-------------------------------------------------------------------
  function(ko, pubsub, ccRestClient, moment) {

    "use strict";

    var widget;

    return{

      onLoad: function(widgetModel) {
        widget = widgetModel;

        var recentlyViewedCookie = JSON.parse(localStorage.getItem("cc.product.recentlyViewed")) || [];

        // Remove stale Products
        var cutOffDate = moment().subtract(Number(widget.lifespan()), 'days');
        for(var i = 0; i < recentlyViewedCookie.length; i++){
            if(moment(recentlyViewedCookie[i].viewedDate).isBefore(cutOffDate)){
                recentlyViewedCookie.length = i;
                break;
            }
        }

        localStorage["cc.product.recentlyViewed"] = JSON.stringify(recentlyViewedCookie);

        $.Topic(pubsub.topicNames.PRODUCT_VIEWED).subscribe(this.trackProductViewed);
      },

      trackProductViewed: function(product) {

        var viewHistoryLength = 12;

        // Retrieve array from localStorage (or create an empty array if not in localStorage)
        var recentlyViewedCookie = JSON.parse(localStorage.getItem("cc.product.recentlyViewed")) || [];

        // See if the viewed product is already in the array, and remove it
        var foundIndex = -1;
        for(var i = 0; i < recentlyViewedCookie.length; i++){
          if(recentlyViewedCookie[i].id == product.id) {foundIndex = i; break;}
        }
        if (foundIndex > -1) recentlyViewedCookie.splice(foundIndex, 1);

        // Insert viewed product at top of array
        recentlyViewedCookie.unshift({
          "id": product.id,
          "viewedDate": moment().format('DDMMMYY'),
        });

        // Trim the array to the maximum length (+1 to cater for Product Details Page)
        if(recentlyViewedCookie.length > viewHistoryLength)recentlyViewedCookie.length = viewHistoryLength + 1;

        // Place array back into localStorage
        localStorage["cc.product.recentlyViewed"] = JSON.stringify(recentlyViewedCookie);
      }
    };
  }
);