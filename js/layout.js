(function($){


	var initLayout = function() {
		var hash = window.location.hash.replace('#', '');
		var currentTab = $('ul.navigationTabs a')
							.bind('click', showTab)
							.filter('a[rel=' + hash + ']');
		if (currentTab.size() == 0) {
			currentTab = $('ul.navigationTabs a:first');
		}
		showTab.apply(currentTab.get(0));
		$('#colorpickerHolder').ColorPicker({flat: true,
	
		onChange: function (hsb, hex, rgb) {
				col="#"+hex;
				
				//console.log("light Color-> #"+hex);
				//console.log("Dark Color->" + dark_color);
				//$("#offer").css('backgroundColor', col);
				//$(".full-hexagon").children().css('backgroundColor', dark_color);
				//$(".full-hexagon").children().css('borderColor', dark_color);
				  setColor(col);
			}		
		});		
		
	};
	
	var showTab = function(e) {
		var tabIndex = $('ul.navigationTabs a')
							.removeClass('active')
							.index(this);
		$(this)
			.addClass('active')
			.blur();
		$('div.tab')
			.hide()
				.eq(tabIndex)
				.show();
	};
	
	EYE.register(initLayout, 'init');
})(jQuery);

var lightenDarkenColor = function (col, amt) {
	var usePound = false;
	if (col[0] == "#") {
		col = col.slice(1);
		usePound = true;
	}
	var num = parseInt(col, 16);
	var r = (num >> 16) + amt;
	if (r > 255) {
		r = 255;
	} else if (r < 0) {
		r = 0;
	}
	var b = ((num >> 8) & 0x00FF) + amt;
	if (b > 255) {
		b = 255;
	} else if (b < 0) {
		b = 0;
	}
	var g = (num & 0x0000FF) + amt;
	if (g > 255) {
		g = 255;
	} else if (g < 0) {
		g = 0;
	}
	return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
}
var global_color="#ff0000";
var global_lightest_color="#ff0000";
var global_dark_color="#ff0000";
var global_darker_color="#ff0000";
var global_shadow_color="#ff0000";


function setColor(col)
{	
	var more_lightest_color = lightenDarkenColor(col, 100);
	var lightest_color = lightenDarkenColor(col, 80);
	var dark_color = lightenDarkenColor(col, -20);
	var darker_color = lightenDarkenColor(col, -40);
	var shadow_color = lightenDarkenColor(col, -50);
	global_color=col;
  global_lightest_color=lightest_color;
  global_dark_color=dark_color;
  global_darker_color=darker_color;
  global_shadow_color=shadow_color;

	
  $(".no-csstransforms .circle").css('backgroundColor', col);
  $(".no-csstransforms .full-square").css('backgroundColor', dark_color);
  $(".no-csstransforms .portfolioContainer .project-details").css('backgroundColor', col);


	$("#mailID i").css('color', col);
	$("#phone i").css('color', col);
	
	$("#banner-detail h1").css('color', col);

	$(".hexa-logo .hex-box").css('backgroundColor', col);
	$(".hexa-logo .hex-box").css('borderColor', col);
	$(".hexa-logo .hex-middle").css('backgroundColor', col);
	$(".hexa-logo .hex-middle").css('borderColor', col);

	
	//$(".navbar-nav > li a:hover").css('color', col);
	$('.navbar-nav > li a').hover( function(){
		$(this).css('color', col);
	},
	function(){
		$(this).css('color', '#7d7d7d');
	});
	
	
	//$(".navbar-nav > li:hover").css('borderBottomColor', col);
	$('.navbar-nav > li').hover( function(){
		$(this).css('borderBottomColor', col);
	},
	function(){
		$(this).css('borderBottomColor', '#4F4E53');
	});
	

	$("#search-box input").css('backgroundColor', col);
	

	$("#home .hgroup span").css('borderBottomColor', col);
	$("#works .hgroup span").css('borderBottomColor', col);
	$("#prices .hgroup span").css('borderBottomColor', col);
	$("#family .hgroup span").css('borderBottomColor', col);
	$("#post-blogs .hgroup span").css('borderBottomColor', col);
	

	// $(".home-figcaption ul li i").css('color', col);
	$(".home-figcaption div.hexa-gon").css('backgroundColor', col);
	$(".home-figcaption div.hexa-gon-before").css('borderBottomColor', col);
	$(".home-figcaption div.hexa-gon-after").css('borderTopColor', col);


	$('.portfolioContainer .element-item').hover( function(){
			$(this).find(".project-details-overlay").css('backgroundColor', col);
			$(this).find(".project-details p").css('color', lightest_color);
	});

	
	$("#offer").css('backgroundColor', col);
	$("#purchase").css('backgroundColor', col);
	$("#footer-2").css('backgroundColor', darker_color);
	$(".footer-navbar a").css('color', more_lightest_color);


	//$("#offer .figcaption h4").css('color', darker_color);
	$("#offer .figcaption h5").css('color', lightest_color);
	$(".full-hexagon").children().css('backgroundColor', dark_color);
	$(".full-hexagon").children().css('borderColor', dark_color);

		
	$("#prices .prices-monthly-select a").css('backgroundColor', col);


	$("#purchase article a:first-child").css('borderColor', shadow_color);
	$("#purchase article a:last-child").css('backgroundColor', darker_color);
	$("#purchase article a:last-child").css('borderColor', shadow_color);
	

	$(".desktop-family-pic-holder figcaption").css('backgroundColor', col);
	$(".mobile-family-pic-holder figcaption").css('backgroundColor', col);

	$(".desktop-family-pic-holder i").css('color', col);
	$(".mobile-family-pic-holder i").css('color', col);
	$(".desktop-family-pic-holder i").css('backgroundColor', lightest_color);
	$(".mobile-family-pic-holder i").css('backgroundColor', lightest_color);
	
	$(".desktop-family-pic-holder .bar").css('backgroundColor', shadow_color);
	$(".desktop-family-pic-holder p").css('color', lightest_color);
	$(".desktop-family-pic-holder h6").css('color', lightest_color);
	
	$(".mobile-family-pic-holder .bar").css('backgroundColor', shadow_color);
	$(".mobile-family-pic-holder p").css('color', lightest_color);
	$(".mobile-family-pic-holder h6").css('color', lightest_color);
	
	
	$("#family i.fa-heart").css('color', col);
	
	var bxs="0px 0px 5px "+shadow_color;
	$("#contact-form input:focus").css('borderColor', darker_color);
	$("#contact-form input:focus").css('boxShadow',  bxs);
	$("#contact-form textarea:focus").css('borderColor', darker_color);
	$("#contact-form textarea:focus").css('boxShadow',  bxs);
	
	//$("#contact-form button:hover").css('backgroundColor', col);
	$('#contact-form button').hover( function(){
		$(this).css('backgroundColor', col);
	},
	function(){
		$(this).css('backgroundColor', '#fff');
	});

	
	$(".hex-box").css('backgroundColor', dark_color);
	$(".hex-box").css('borderColor', dark_color);
	$(".hex-middle").css('backgroundColor', dark_color);
	$(".hex-middle").css('borderColor', dark_color);


	$( "#contact-form input, textarea" ).focusin(function() {
		 		$(this).css("borderColor",col);	
		 		$(this).parent().find('label').css("backgroundColor",col);
	});
	$( "#contact-form input, textarea" ).focusout(function() {
			$(this).parent().find('label').css("backgroundColor","transparent");
	});
	

	$("#post-blogs figure").css('backgroundColor', col);
	$(".blog-posts .date").css('backgroundColor', col);
	$(".blog-post-heading .fa").css('borderColor', col);
	$(".blog-post-heading .fa").css('color', col);
	
	//$("#footer-2 .full-hexagon").css('backgroundColor', shadow_color);
	
	 $(document).ready(function(){
	  	if ($(window).width() >= 992) {  
		 		setDesktopColor(col);
	    }
	  });
	


		$(window).resize(function(){
			if ($(window).width() <= 991) {	
				//alert('less than 991');			
				setMobileColor(col);
			}
			if ($(window).width() >= 992) { 
				//alert('greater than 992');			
				setDesktopColor(col);
			}   
		});
}


function setMobileColor(col)
{
	$("#options ul#filters a").css('backgroundColor', '#393939');
	
	$("#options ul#filters a").hover( function(){
			$(this).css('color', '#fff');
			$(this).css('backgroundColor', col);
	});
	$('#options ul#filters a').mouseleave( function(){
			$(this).css('backgroundColor', '#393939');
			$(this).css('color', '#fff');
	});
	$("#options ul#filters a.active").css('backgroundColor', col);

	$("#prices article").css('borderBottomColor', col);
	$(".prices-monthly-details").css('backgroundColor', col);
  $('.prices-monthly-plan').css('backgroundColor', "#393939");
	$('.prices-plan').hover( function(){
		$(this).find('.prices-monthly-plan').css('backgroundColor', "#393939");
	});

	$('.prices-plan').mouseleave( function(){
		$('.prices-plan-wrapper').find('.prices-monthly-plan').css('backgroundColor', '#393939');
	});

	$(".prices-monthly-select").css('backgroundColor', col);
	$(".prices-plan > div.active").css('backgroundColor', '#393939');
}


function setDesktopColor(col)
{
	// $("#prices .active").css('backgroundColor', col);
	$("#options ul#filters a").css('color', '#6f6f6f');
	$("#options ul#filters a").css('backgroundColor', 'transparent');
	$("#options ul#filters a.active").css('backgroundColor', 'transparent');
	$("#options ul#filters a").hover( function(){
			$(this).css('color', '#fff');
			$(this).css('backgroundColor', col);
	});
	$('#options ul#filters a').mouseleave( function(){
		$(this).css('color', '#6f6f6f');
		$(this).css('backgroundColor', 'transparent');
	});

  $(".prices-monthly-select").css('backgroundColor', "#EFEFEF");
  $('.prices-monthly-plan').css('backgroundColor', "#a3a3a3");
  $(".prices-monthly-details").css('backgroundColor', '#f6f6f6');

	$('.prices-plan').hover( function(){
		$(this).find('.extender').css('backgroundColor', col);
		$(this).find('.arrow-right').css('borderLeftColor', col);
		$(this).find('.prices-monthly-plan').css('backgroundColor', col);
		$(this).find(".ribbon i").css('color', col);
		$(this).find(".ribbon-after").css('borderBottomColor', col);

	});

	$('.prices-plan').mouseleave( function(){
		$('.prices-plan-wrapper').find('.extender').css('backgroundColor', '#a3a3a3');
		$('.prices-plan-wrapper').find('.arrow-right').css('borderLeftColor', '#a3a3a3');
		$('.prices-plan-wrapper').find('.prices-monthly-plan').css('backgroundColor', '#a3a3a3');

		$(this).find(".ribbon i").css('color', "#a3a3a3");
		$(this).find(".ribbon-after").css('borderBottomColor', "#a3a3a3");
	});
}


function showColor()
{				
		if(global_color=="#ff0000")
			{
				alert("You are already in base color");
				return false;
			}
		else
			{
				$(".chBut").trigger("click");				
				$('.overlay').addClass('show-overlay');
				$.ajax({
            type: "POST",
            url: 'testcss.php',
            data: {color:global_color,lightest_color:global_lightest_color,dark_color:global_dark_color,darker_color:global_darker_color,shadow_color:global_shadow_color},
            success: function(data, textStatus, jqXHR)
		          {               
								$("#cont").val(data);
		            $('.modal').addClass('show-modal');		                       
		            $("textarea#cont").focus();
		          },
		        error: function(jqXHR, textStatus, errorThrown)
		          {
		            // Handle errors here
		            console.log('ERRORS: ' + textStatus);
		            // STOP LOADING SPINNER
		          }
		    });
		}//end of if
			$('.modal i').click(function () {
					$('.overlay').removeClass('show-overlay');
					$('.modal').removeClass('show-modal');
			});
}

	
$(document).ready(function(){
		$(".sel-btn").on("click",function()
		{
			$("#cont").select();
		});
});