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
  ['knockout', 'pubsub', 'ccRestClient'],

  //-------------------------------------------------------------------
  // MODULE DEFINITION
  //-------------------------------------------------------------------
  function(ko, pubsub, ccRestClient) {

    "use strict";

    var self;

    return {

      onLoad: function(widget) {
        self = widget;
        widget.recentProducts = ko.observableArray();
        widget.recentProductsAll = [];

        var recentlyViewedCookie = JSON.parse(localStorage.getItem("cc.product.recentlyViewed")) || [];

//        var cutoffDate = Number(widgetModel.lifespan()).days().ago();
//        var thresholdMarker = recentlyViewedArray.length;
//        for(var i = 0; i < recentlyViewedArray.length; i++){
//          var viewedDate = Date.parse(recentlyViewedArray[i].dateViewed);
//          if(viewedDate.compareTo(cutoffDate) === -1){
//              thresholdMarker = i;
//              break;
//          }
//        }
//        recentlyViewedArray.length = thresholdMarker;


        // Refresh the Recently Viewed Data
        if(recentlyViewedCookie.length > 0){
            
            var pProductIds = [];
            for(var j = 0; j < recentlyViewedCookie.length; j++){
              pProductIds.push(recentlyViewedCookie[j].id);
            }
    
            var pData = {
                catalogId: "",
                productIds: pProductIds
            };
    
            ccRestClient.request('listProducts', pData,
              function (upToDateProductData) {
                for(var k = 0; k < recentlyViewedCookie.length; k++){
                    widget.recentProductsAll[k] = {};
                    widget.recentProductsAll[k].id = upToDateProductData[k].id;
                    widget.recentProductsAll[k].displayName = upToDateProductData[k].displayName;
                    widget.recentProductsAll[k].brand = upToDateProductData[k].brand;
                    widget.recentProductsAll[k].route = upToDateProductData[k].route;
                    widget.recentProductsAll[k].listPrice = upToDateProductData[k].listPrice;
                    widget.recentProductsAll[k].salePrice = upToDateProductData[k].salePrice;
                    widget.recentProductsAll[k].primaryLargeImageURL = upToDateProductData[k].primaryLargeImageURL;
                    widget.recentProductsAll[k].primaryMediumImageURL = upToDateProductData[k].primaryMediumImageURL;
                    widget.recentProductsAll[k].primarySmallImageURL = upToDateProductData[k].primarySmallImageURL;
                    widget.recentProductsAll[k].primaryThumbImageURL = upToDateProductData[k].primaryThumbImageURL;
                }
                self.refreshDisplay();
                $.Topic(pubsub.topicNames.PRODUCT_VIEWED).subscribe(self.productViewed);
              },
              function (upToDateProductData) {
                console.log("Failed to refresh Recently Viewed");
              }
            );
            
        } else {
            $.Topic(pubsub.topicNames.PRODUCT_VIEWED).subscribe(self.productViewed);
        }

      },


      productViewed: function(product) {

        // See if the viewed product is already in the array, and remove it
        var foundIndex = -1;
        for(var i = 0; i < self.recentProductsAll.length; i++){
          if(self.recentProductsAll[i].id == product.id) foundIndex = i;
        }
        if (foundIndex > -1) self.recentProductsAll.splice(foundIndex, 1);

        var viewedProduct = {};
        viewedProduct.id = product.id;
        viewedProduct.displayName = product.displayName;
        viewedProduct.brand = product.brand;
        viewedProduct.route = product.route;
        viewedProduct.listPrice = product.listPrice;
        viewedProduct.salePrice = product.salePrice;
        viewedProduct.primaryLargeImageURL = product.primaryLargeImageURL;
        viewedProduct.primaryMediumImageURL = product.primaryMediumImageURL;
        viewedProduct.primarySmallImageURL = product.primarySmallImageURL;
        viewedProduct.primaryThumbImageURL = product.primaryThumbImageURL;

        // Insert viewed product at top of array
        self.recentProductsAll.unshift(viewedProduct);
        self.refreshDisplay();

      },

      refreshDisplay: function() {
        self.recentProducts.removeAll();
        var numDisplayed = Math.min(self.numDisplayed() || 3 , self.recentProductsAll.length);

        for(var j = 0; j < self.recentProductsAll.length; j++){
            if (self.recentProductsAll[j].id !== self.pageContextId){
                self.recentProducts.push(self.recentProductsAll[j]);
            }
            if (self.recentProducts().length === numDisplayed) break;
        }

      },

      beforeAppear: function(page) {
        self.pageContextId = page.contextId;
        self.refreshDisplay();
      }
    };
  }
);