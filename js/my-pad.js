/*----------------------------------------------------*/
/*	SHOW PLAN DETAILS ON CLICK
/*----------------------------------------------------*/
$(document).ready(function(){
		$('.prices-monthly-plan').on("click",function (){
				$('.prices-plan').removeClass("show-plan");
				$('.plan-details').removeClass("show-plan-details");
				$(this).parent('.prices-plan').toggleClass("show-plan");
        	$(this).parent('.prices-plan').find(".plan-details").toggleClass("show-plan-details");	
		});




/*----------------------------------------------------*/
/*	Family Hover Details
/*----------------------------------------------------*/

	$('.tcol').click(function () 
		{	
			var tr=	$(this).find('figcaption').hasClass('hovered');

			$(".tcol figcaption").removeClass('hovered');	
			$(this).find('img').toggleClass('details');	
			$(".tcol").removeClass('disappear');	
			$(this).find('figcaption').toggleClass('hovered');
			$(this).siblings().toggleClass("disappear");
			
			if(tr)
			{
					$(this).find('figcaption').removeClass('hovered');
					$(this).find('img').removeClass('details');
					$(this).siblings().toggleClass("disappear");

					if($(this).hasClass("col2") )
					{
						$(this).removeClass('move-left');
					}
			}

			if($(this).hasClass("col2") )
			{
				  $(this).siblings().addClass("disappear");
					$(this).toggleClass('move-left');
			}
		});

	/*================COLUMN 1============================*/
		// $('#mem1').click(function () {
		// 	$('#mem1 figcaption').toggleClass('hovered');
		// 	$('#mem1 img').toggleClass('details');
		// 	$('#mem2').toggleClass('disappear');
		// });

		// $('#mem3').click(function () {
		// 	$('#mem3 figcaption').toggleClass('hovered');
		// 	$('#mem3 img').toggleClass('details');
		// 	$('#mem4').toggleClass('disappear');
		// });

		// $('#mem5').click(function () {
		// 	$('#mem5 figcaption').toggleClass('hovered');
		// 	$('#mem5 img').toggleClass('details');
		// 	$('#mem6').toggleClass('disappear');
		// });

	/*================COLUMN 2============================*/
		// $('#mem2').click(function () {
		// 	$('#mem2 figcaption').toggleClass('hovered');
		// 	$('#mem2 img').toggleClass('details');
		// 	$('#mem2').toggleClass('move-left');
		// 	$('#mem1').toggleClass('disappear');
		// });

		// $('#mem4').click(function () {
		// 	$('#mem4 figcaption').toggleClass('hovered');
		// 	$('#mem4 img').toggleClass('details');
		// 	$('#mem4').toggleClass('move-left');
		// 	$('#mem3').toggleClass('disappear');
		// });

		// $('#mem6').click(function () {
		// 	$('#mem6 figcaption').toggleClass('hovered');
		// 	$('#mem6 img').toggleClass('details');
		// 	$('#mem6').toggleClass('move-left');
		// 	$('#mem5').toggleClass('disappear');
		// });

});