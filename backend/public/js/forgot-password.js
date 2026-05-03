const API = window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://sgestionfinanciera-kasalion.up.railway.app";

console.log("forgot-password.js cargado");

$(document).ready(function(){

    console.log("DOM listo");

    $('#btnRecuperar').on('click', function(){

        console.log("CLICK DETECTADO");

        const correo = $('#exampleInputEmail').val().trim().toLowerCase();

        if(correo === ""){
            alert("Ingrese su correo");
            return;
        }

        $.ajax({
            url: `${API}/recuperar-password`,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ correo }),

            success: function(){
                alert("Revisa tu correo para recuperar la contraseña");
            },

            error: function(xhr){
                console.log("ERROR:", xhr.responseText);
                alert(xhr.responseJSON?.error || "Error en el servidor");
            }
        });

    });

});