$(document).ready(function(){
    $("#tokenbutton").click(function(){

        $.post("mytoken",function(data){
            if(data==='done') {
                window.location.href="/plaid";
            }
            else
                setFormMessage(loginForm, "error", "Invalid username or password");
        });
    });
});