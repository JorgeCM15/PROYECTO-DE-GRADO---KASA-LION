const API = window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://proyecto-de-grado-kasa-lion-production.up.railway.app/";

$(document).ready(function(){

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    $('#btnCambiar').on('click', function(){

        const pass1 = $('#newPassword').val().trim();
        const pass2 = $('#confirmPassword').val().trim();

        if(pass1 === "" || pass2 === ""){
            alert("Complete todos los campos");
            return;
        }

        if(pass1 !== pass2){
            alert("Las contraseñas no coinciden");
            return;
        }

        $.ajax({
            url: `${API}/cambiar-password`,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                token: token,
                password: pass1
            }),
            success: function(){
                alert("Contraseña actualizada correctamente");
                window.location.href = "login.html";
            },
            error: function(){
                alert("Token inválido o expirado");
            }
        });

    });

});