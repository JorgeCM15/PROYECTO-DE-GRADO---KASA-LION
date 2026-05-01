const API = window.location.origin;

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

                console.log("RESPUESTA LOGIN:", respuesta);

                if (respuesta.success) {

                    localStorage.setItem("usuarioActivo", JSON.stringify(respuesta.usuario));

                    window.location.href = "index.html";

                } else {
                    alert(respuesta.error || "Error al iniciar sesión");
                }
            },
            error: function(err){
                console.error("ERROR LOGIN:", err);
                alert("Error de conexión con el servidor");
            }
        });

    });

});