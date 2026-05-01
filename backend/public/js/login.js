const API = window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://proyecto-de-grado-kasa-lion-production.up.railway.app/";

$(document).ready(function(){

    $('#btnLogin').on('click', function(e){

        e.preventDefault();

        var correo = $('#exampleInputEmail').val().trim();
        var password = $('#exampleInputPassword').val().trim();

        if(correo === "" || password === ""){
            alert("Ingrese correo y contraseña");
            return;
        }

        $.ajax({
            url: `${API}/login`,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                correo: correo,
                password: password
            }),
            success: function(respuesta){

                // Guardar sesión
                localStorage.setItem("usuarioActivo", JSON.stringify(respuesta.usuario));

                // Redirigir
                window.location.href = "index.html";
            },
            error: function(err){
                alert("Correo o contraseña incorrectos");
                console.error(err.responseText);
            }
        });

    });

});