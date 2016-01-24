app.factory('patentService', ['$http', function($http) {
	var patentFactory = {};
	
	
	patentFactory.patFetch = function(number, callback) {
		$http.post('/patFetch', {num: number})
			.success(function(response) {
				callback(response);
			});		
	}
	
	
	return patentFactory;
}]);