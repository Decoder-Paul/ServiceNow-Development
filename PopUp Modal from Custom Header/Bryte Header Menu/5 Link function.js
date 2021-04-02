function(scope, elem) {
	$(elem).on('keydown','.header-menu-item',function(e){
		var target = e.target;
		if (target.localName == 'a') {
			var currentMenuItem = $(target).parents('li');
			var parentUL = currentMenuItem.parents('ul');
			var allMenuItems = parentUL.children('li:visible');
			var firstMenuItem = allMenuItems.first();
			var lastMenuItem = allMenuItems.last();
			var menuItemToFocus;
			if(e.keyCode == 37) {
				e.preventDefault();
				currentMenuItem.removeClass('open');
				var previousMenuItem = currentMenuItem.prevAll('li:visible').first();
				//enable circular navigation
				menuItemToFocus = previousMenuItem.length ? previousMenuItem : lastMenuItem;
				menuItemToFocus.find('a').focus();
			} else if(e.keyCode == 39) {
				e.preventDefault();
				currentMenuItem.removeClass('open');
				var nextMenuItem = currentMenuItem.nextAll('li:visible').first();
				//enable circular navigation
				menuItemToFocus = nextMenuItem.length ? nextMenuItem : firstMenuItem;
				menuItemToFocus.find('a').focus();
			}
			if(e.keyCode == 9) {
				$(target).parents('li').removeClass('open');
			}
		}
		});
	}