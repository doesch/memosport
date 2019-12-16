$(document).ready(function() { 
     
    /*
    * add cursor into add/edit field
    */
     
    $("#IndexCardBoxName").focus();

});

/// <summary> Reset the state of all index card boxes which state is > 2 to 2 </summary>
/// <remarks> Doetsch, 11.07.2018. </remarks>
/// <returns> . </returns>
function IndexCardBoxResetState() {

    if (confirm('Möchtest du wirklich alle Karteikarten in dieser Box noch mal lernen?'))
    {        
        $.ajax({
            url: "/IndexCardBox/ResetState",
            data: { pBoxId: IndexCardBoxId },
            type: "POST",
            dataType: "JSON",
            beforeSend: function () {
                document.getElementById("bttn-reset-state").disabled = true;
            },
            complete: function () {
                document.getElementById("bttn-reset-state").disabled = false;
            },
            success: function () {
                alert("Die Karteikarten wurden erfolgreich zurück gesetzt");
            },
            error: function () {
                alert("Ein Fehler ist aufgetreten. Bitte versuche es später erneut.");
            }
        });        
    }
};
