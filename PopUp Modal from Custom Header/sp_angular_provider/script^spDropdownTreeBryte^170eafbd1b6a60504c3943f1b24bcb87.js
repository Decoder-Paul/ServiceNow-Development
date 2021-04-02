/*! RESOURCE: /scripts/app.$sp/directive.spDropdownTree.js */

/* angular.module('sn.$sp').directive('spDropdownTreeTemplateBryte',   */
function () {
	return {
		restrict: 'E',
		scope: {items: '='},
		replace: true,
		template: '<ul class="dropdown-menu">' +
		'<li ng-repeat="mi in items" style="min-width: 20em;" ng-class="{\'dropdown-submenu\': mi.type == \'menu\', \'dropdown-menu-line\':$index < items.length - 1}" ng-include="getURL()">' +
		'</ul>',
		link : function(scope, element, attrs, controller) {
			scope.getURL = function() {
				return 'spDropdownTreeBryte';
			}
		}
	}
};
(function($) {
	$("body").on( "click", "a.menu_trigger", function(e) {
		var current = $(this).next();
		var grandparent = $(this).parent().parent();
		if ($(this).hasClass('left-caret') || $(this).hasClass('right-caret'))
			$(this).toggleClass('right-caret left-caret');
		grandparent.find('.left-caret').not(this).toggleClass('right-caret left-caret');
		current.toggle();
		$(".dropdown-menu").each(function(i, elem) {
			var elemClosest = $(elem).closest('.dropdown');
			var currentClosest = current.closest('.dropdown');
			if (!elem.contains(current[0]) && elem != current[0] && (!currentClosest.length || !elemClosest.length || elemClosest[0] == currentClosest[0]))
				$(elem).hide();
		})
		e.stopPropagation();
	});
	$("body").on( "click", "a:not(.menu_trigger)", function() {
		var root=$(this).closest('.dropdown');
		root.find('.left-caret').toggleClass('right-caret left-caret');
	});
})(jQuery);