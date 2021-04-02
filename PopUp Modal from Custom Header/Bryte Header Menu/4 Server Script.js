(function(){
	// build menus
	var menu_id = $sp.getValue('sys_id'); // instance sys_id
	var gr = new GlideRecord('sp_instance_menu');
	gr.get(menu_id);
	data.menu = {};
	data.menu.items = $sp.getMenuItems(menu_id);
	data.isLoggedIn = GlideSession.get().isLoggedIn();
  	data.guidedTours = {};
	// Show tours only if gtd's sp sys property is set
	data.showTours = (gs.getProperty('com.snc.guided_tours.sp.enable') === 'true') && data.isLoggedIn;
  	if (!data.showTours) {
	  data.guidedTours = null;
	}
	var catalogArr = ($sp.getCatalogs().value + "").split(",");
  
	catalogArr.forEach(function(catalog) {
		data.showWishlist = data.showWishlist || new sn_sc.Catalog(catalog).isWishlistEnabled();
	});
	if (data.isLoggedIn) {
		if (data.showWishlist)
			data.wishlistWidget = $sp.getWidget("sc_wishlist_cart", {wishlistTemplate: "small_wishlist.html", auto_update_wishlist:options.auto_update_wishlist});
		if (gs.getProperty("glide.sc.portal.use_cart_v2_header", "false") === "true")
			data.cartWidget = $sp.getWidget("sc-shopping-cart-v2", {cartTemplate: "small_shopping_cart_v2.html", auto_update_cart:options.auto_update_cart});
		else
			data.cartWidget = $sp.getWidget("sc-shopping-cart", {cartTemplate: "small_shopping_cart.html", auto_update_cart:options.auto_update_cart});
	}
})();