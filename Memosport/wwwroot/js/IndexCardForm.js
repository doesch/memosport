$(document).ready(function() {


    /*
     * delete image in edit mask, if button klicked
     */
    $('.delete-image').click(function() {
	
	$(this).replaceWith('<input type="hidden" name="data[IndexCard][delete_' + $(this).attr('data-field') +']" value="1">'); // add deletion
	$('#' + $(this).attr('data-field') + '_container').remove(); // remove complete image container
        $('#' + $(this).attr('data-field') + '_upload_container').show(); // show form input for upload new image
		
    });
	
    /*
     * transform box, if image selected in add-form
     */
    
    $("input:file").change(function (){
	var label = $("label[for='"+$(this).attr('id')+"']");
	label.text('Bild selektiert.');
     });
     
     
     /*
      * add cursor into add/edit field
      */
     
     $("#IndexCardQuestion").focus();
     
     /*
      * toogle image preview
      */
     
    $('#answer_image_container').click(function() {
       $('.answer-image-container').toggle();
    });
     
    $('#question_image_container').click(function() {
       $('.question-image-container').toggle();
    });
    
    /*
     * button close form
     */

    $('.bttn-close').click(function() {
	$(this).parent().css({"display": "none"});
    });
});