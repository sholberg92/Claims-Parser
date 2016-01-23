
var app = angular.module("patentapp", []);

app.controller("PatentController", ['$scope', '$timeout', '$http', function($scope, $timeout, $http) {
	$scope.contents = "No File Loaded";
	var xhttp = new XMLHttpRequest();
	$scope.patentLink = 'http://www.freepatentsonline.com/';
	$scope.patentNum = '7480604';
	var requestPatents = function(patentNums) {
		var parseHTML = function(html, num) {
			var el = document.createElement('html');
			el.innerHTML = html;
			var tags = el.querySelectorAll('div.disp_elm_title');
			var claims = '';
			for(var i = 0; i < tags.length; i++) {
				if(tags[i].textContent == "Claims:") {
					claims += el.querySelectorAll('div.disp_elm_title')[i].nextElementSibling.textContent;
				}
				
			}

			//console.log(claims.split(/\n/));
			
			parseClaims(claims.split(/\n/));
		}		
		
		var patAjax = function(number) {
			var reqStr = $scope.patentLink + number + '.html';
			//reqStr = "https://patents.google.com/patent/US" + patentNums[i] + "/en";
			$http.post('/patFetch', {num: number})
				.success(function(response) {
					parseHTML(response.html);
					//console.log(response.html);
				});
		
		};
		
		if(Array.isArray(patentNums)) {
			for(var i = 0; i < patentNums.length; i++) {
				patAjax(patentNums[i]);
			}
		} else {
			patAjax(patentNums);
		}
		

	}

	var claimsAry = [];
	claimsAry.push({});
	var numClaims = 0;
	var indClaims = 0;
	var methodClaims = 0;
	var mfClaims = 0;
	var appClaims = 0;
	var dependingClaim = 0;
	
	function generateTree(claims) {
		//console.log("test");
		var find = function(i, j, count, pos) {
			for(var i = 1; i < count; i++) {
				if(claims[i].dependingOn == j) {
					if(i == j) {
						console.log("claim(" + i + ")");
					} else {
						var str = '';
						str = Array(pos+1).join('\t') + "+---claim(" + i + ")";
						console.log(str);
						claims[i].dependingOn = 0;
					}
					if(i != j) {
						find(i+1, i, count, pos+1);
					}
				}

				
			}
			
		};	
		for(var i = 1; i < claims.length; i++) {
			find(1, i, claims.length, 1);
		}
	};
	
	
	function parseClaims(claims) {
		for(var i = 0; i < claims.length; i++) {
			var cnum = parseInt(claims[i].toString().trim().substring(0, 10));
			if(!isNaN(cnum)) {
				
				
				dependingClaim = cnum;
				numClaims++;
				var claimObj = {claim: '', num: cnum, ind: 0, method: 0, app: 0, mf: 0};
				
				var lowerClaim = claims[i].toString().toLowerCase().trim();
				claimObj.claim = lowerClaim;
				var claimIdx = lowerClaim.search("claim");
				if(claimIdx == -1) {
					claimIdx = lowerClaim.search("claims");
				}
				if(claimIdx == -1) { //claim is independent
					indClaims ++;
					claimObj.ind = 1;
					if(lowerClaim.search("method") != -1) {
						claimObj.method = 1;
						methodClaims++;
					} else {
						claimObj.app = 1;
						appClaims++;
					}
					if(lowerClaim.search("means") != -1) {
						claimObj.mf = 1;
						mfClaims++;
					}
				} else { //claim is dependent
					dependingClaim = parseInt(lowerClaim.substring(claimIdx, claimIdx+10).match(/\d+/)[0]);
				}
				claimsAry.push({dependingOn: dependingClaim, obj: claimObj});
				
			}
			
			
		}
		generateTree(claimsAry);
		
		console.log("Independent: " + indClaims);
		console.log("# Claims: " + numClaims);
		console.log("Apparatus : " + appClaims);
		console.log("Method: " + methodClaims);
		console.log("Means+Function: " + mfClaims);
	};
		
	$scope.fetchClaims = function(number) {
		requestPatents(number);
	};	
	
	$scope.getFile = function() {
		
		var reader = new FileReader();
		reader.onloadend = function() {
			var claims = reader.result.split(/[\r\n]+/g);
			
			parseClaims(claims);

			$scope.contents = "File loaded";

			$scope.$apply();
		}
		reader.readAsText($scope.file);		
	}
	
}]);

app.directive("ngFileSelect", function() {
	return {
		link: function($scope, elem) {
			elem.bind("change", function(e) {
				$scope.file = (e.srcElement || e.target).files[0];
				$scope.getFile();
			});
		}
		
		
	}
	
});

