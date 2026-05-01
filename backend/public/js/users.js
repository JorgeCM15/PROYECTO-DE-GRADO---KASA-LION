const API = window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://proyecto-de-grado-kasa-lion-production.up.railway.app/";

$(document).ready(function(){

    $('#guardarUsuario').on('click', function(){

        var nombres = $('#nombres').val().trim();
        var primerApellido = $('#primerApellido').val().trim();
        var segundoApellido = $('#segundoApellido').val().trim();
        var tipoDocumento = $('#tipoDocumento').val();
        var numeroDocumento = $('#numeroDocumento').val().trim();
        var correo = $('#correo').val().trim();
        var password = $('#password').val().trim();

        var permisos = [];

        $('.permiso:checked').each(function(){
            permisos.push($(this).val());
        });

        // Validación
        if(nombres === "" || primerApellido === "" || tipoDocumento === "" || numeroDocumento === "" || correo === "" || password === ""){
            alert("Complete todos los campos obligatorios");
            return;
        }

        $.ajax({
            url: `${API}/usuarios`, 
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                nombres: nombres,
                primerApellido: primerApellido,
                segundoApellido: segundoApellido,
                tipoDocumento: tipoDocumento,
                numeroDocumento: numeroDocumento,
                correo: correo,
                password: password,
                permisos: permisos
            }),
            success: function(respuesta){
                alert("Usuario creado correctamente");
                location.reload();
            },
            error: function(error){
                alert("Error al guardar usuario");
                console.error(error);
            }
        });

    });

});