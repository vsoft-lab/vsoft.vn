$(document).ready(function(){ 
	$( "#features-2 #screen-1" ).hover(function() {
		$( "#features-2 #mobile" ).removeClass();
		$( "#features-2 #mobile" ).addClass('active1');
	});	

	$( "#features-2 #screen-2" ).hover(function() {
		$( "#features-2 #mobile" ).removeClass();
		$( "#features-2 #mobile" ).addClass('active2');
	});	
	
	$( "#features-2 #screen-3" ).hover(function() {
		$( "#features-2 #mobile" ).removeClass();
		$( "#features-2 #mobile" ).addClass('active3');
	});

	$( "#features-2 #screen-4" ).hover(function() {
		$( "#features-2 #mobile" ).removeClass();
		$( "#features-2 #mobile" ).addClass('active4');
	});
});