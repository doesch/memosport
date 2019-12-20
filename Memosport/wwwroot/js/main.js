// global Vars

var Global = {};
Global.Uploads = "/uploads/"; // upload path (e.g,. for images)
Global.BlankImg = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D"; // Blank Image
Global.NoImg = "//:0"; // No image -> use alt text
Global.CookiePrefix = "memosport";

$(document).ready(function() {
	
	/*
	 * button go to top of page
	 */
	
	$('#bttn-start').click(function() {
	   $(document).scrollTop(0);
	});
	
	
	/*
	 * software trainer: user changes options → mark start-button
	 */
        
	$('.software form').change(function() {  
           
	   $('#software-bttn-start').addClass('mark-start-button');       
	});
	
	// remove class on click
	$('#software-bttn-start').click(function() {
	    $('#software-bttn-start').removeClass('mark-start-button');
	});
        
        
        /*
	 * toggle menu
	 */
        
        $('#bttn-menu').click(function(e) {

           $('#menu').toggle(); 
        });
        
        
        /*
	 * toggle submenu
	 */
        
        $('#menu li.submenu a').click(function(e) {
            
           $(this).next('ul').toggle(); 
        });
        
});


/* 
 * cookies
 */

function SetCookie(name,value,days) {
    
    if(!days)
        days = 7;
    
    var date = new Date();
    date.setTime(date.getTime()+(days*24*60*60*1000));
    var expires = "; expires="+date.toGMTString();
    
    document.cookie = name+"="+value+expires+"; path=/";
}

function SaveAllCookie(pNamespace, pObject){
    
    /// save all attributes of an object literal in cookie using a prefix as namespace
    
    // check params
    if(typeof(pNamespace) == 'undefined' && typeof(pObject) == 'undefined')
        throw new Exception('Missing Parameter');
    
    $.each(pObject, function(k, v)
    {
        SetCookie(Global.CookiePrefix + '[' + pNamespace + '][' + k + ']', v);
    });  
}

function GetCookiesByNamespace(pNamespace)
{
    var lCookies = document.cookie.split(';');
    var lObj = {};
    
    $.each(lCookies, function(k,v){
        
        var lNamespace = v.replace(Global.CookiePrefix + '[', '').split(']');
        
        // remove blanks from key
        lNamespace[0] = lNamespace[0].replace(/ /g,'');
        
        // if found in namespace, add to result
        if(lNamespace[0] === pNamespace)
        {          
            var lKey = lNamespace[1].replace('[', '');
            lObj[lKey] = v.split("=")[1];
        }
    });
    
    return lObj;
}

function GetCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function DeleteCookie(name) {
    createCookie(name,"",-1);
}

