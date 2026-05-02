const API = window.location.origin;

$(document).ready(function () {

    $('#btnLogin').on('click', function (e) {

        e.preventDefault();

        var correo = $('#exampleInputEmail').val().trim();
        var password = $('#exampleInputPassword').val().trim();

        if (correo === "" || password === "") {
            alert("Ingrese correo y contraseña");
            return;
        }

        $('#btnLogin').prop('disabled', true).text("Ingresando...");

        $.ajax({
            url: `${API}/login`,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                correo: correo,
                password: password
            }),

            success: function (respuesta) {

                console.log("RESPUESTA LOGIN:", respuesta);

                if (respuesta.success) {

                    localStorage.setItem("token", respuesta.token);
                    localStorage.setItem("usuarioActivo", JSON.stringify(respuesta.usuario));

                    window.location.href = "index.html";

                } else {
                    alert(respuesta.error || "Error al iniciar sesión");
                }

                $('#btnLogin').prop('disabled', false).text("Ingresar");
            },

            error: function (xhr) {

                console.error("ERROR LOGIN:", xhr);

                if (xhr.status === 401) {
                    alert("Credenciales incorrectas");
                } else {
                    alert("Error del servidor");
                }

                $('#btnLogin').prop('disabled', false).text("Ingresar");
            }
        });

    });

});