function(spUtil, $scope) {
  /* widget controller */
	var c = this;
if (!c.data.table)
		return;
	
	spUtil.recordWatch($scope, c.data.table, c.data.filter);
}