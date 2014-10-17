suburl = 'mail.php';

jQuery(function($){
	$('#name , #id , #comments').focus(function(){
		$('#contact-form').find('.text-danger').html('').hide();
		$('#contact-form').find('.ms').remove();
	});
	
	$('#contact-form').submit(function(e){
		$('.spinner').show();
		e.preventDefault();
		$('#contact-form').find('.text-danger').html('').hide();
		$('#contact-form').find('.ms').remove();
		data = [];
		data = $(this).serialize();
		
		$.post(suburl ,  data , function(response){
			
				$('.spinner').hide();
				try{	
					if(typeof response.error != 'undefined'){
						if(typeof response.error.namea  != 'undefined'){
							$('.name-wrapper').find('.text-danger').html(response.error.namea).show();
						 }
						 if(typeof response.error.email != 'undefined'){
							$('.email-wrapper').find('.text-danger').html(response.error.email).show();
						 }
						 if(typeof response.error.comments != 'undefined'){
							$('.comments-wrapper').find('.text-danger').html(response.error.comments).show();
						 }
						 if(typeof response.error.message != 'undefined'){
							var errorMsg = '<div class="success error"><i class="fa fw fa-exclamation"></i><p>Submit Fail</p><h1>Something wrong in our end.</h1><button class="submit-btn">Try after sometime</button> </div>';
							hideForm('<div class="ms clearfix" style="color:red">'+response.error.message+'</div>');
						 }
					}
					  if(typeof response.success.message != 'undefined'){
						var successMsg = '<div class="success"><i class="fa fw fa-thumbs-up"></i><p>Success</p> <h1>Thank You!</h1><h2>Successfully Submitted</h2><h3>We Will Get Back To You Shortly</h3><div class="helpText">Don&apos;t worry your details are safe with us.</div></div>';
						hideForm('<div class="ms clearfix" style="color:green">'+successMsg+'</div>');
					}
				} catch(e){
					// do nothing
					//console.log(e);
				}
		});
	});
function hideForm(msg){
	$('#contact-form').slideUp(300);
	$('.people-contact').append(msg);
}
});

