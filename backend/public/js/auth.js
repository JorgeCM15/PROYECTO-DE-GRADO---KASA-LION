// FUNCIONES GLOBALES

function cerrarSesion() {
    alert("Sesión cerrada");

    localStorage.removeItem("usuarioActivo");
    localStorage.removeItem("token");

    window.location.href = "login.html";
}

function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}

function validarToken() {
    const token = localStorage.getItem("token");

    if (!token) return false;

    const data = parseJwt(token);

    if (!data || !data.exp) return false;

    const ahora = Math.floor(Date.now() / 1000);

    if (data.exp < ahora) {
        cerrarSesion();
        return false;
    }

    return true;
}

// ENVIAR TOKEN EN AJAX
    $.ajaxSetup({
        beforeSend: function (xhr) {
            const token = localStorage.getItem("token");
            if (token) {
                xhr.setRequestHeader("Authorization", "Bearer " + token);
            }
        }
    });

// DOCUMENT READY
$(document).ready(function () {

    // VALIDAR SESIÓN
    var usuario = JSON.parse(localStorage.getItem("usuarioActivo"));
    var token = localStorage.getItem("token");

    if (!usuario || !token) {
        window.location.href = "login.html";
        return;
    }

    if (!validarToken()) {
        return;
    }

    // CONTROL DE INACTIVIDAD
    let tiempoInactividad;
    const LIMITE = 15 * 60 * 1000;

    function resetearTimer() {
        clearTimeout(tiempoInactividad);
        tiempoInactividad = setTimeout(cerrarSesion, LIMITE);
    }

    ["mousemove", "keydown", "click", "scroll"].forEach(function (event) {
        window.addEventListener(event, resetearTimer);
    });

    resetearTimer();

    // PERMISOS
    usuario.permisos = usuario.modulos || [];
    usuario.rol = usuario.rol || "auxiliar";

    if (usuario.rol === "admin") {
        usuario.permisos = [
            "panel",
            "ingresos",
            "egresos",
            "ventas",
            "productos",
            "reportes",
            "admin"
        ];
    }

    

    // MOSTRAR NOMBRE
    if (usuario.nombres) {
        $('.text-gray-600.small').text(usuario.nombres);
    }

    // MENÚS
    const menus = {
        panel: "#menuPanel",
        admin: "#menuAdmin",
        reportes: "#menuReportes",
        ventas: "#menuVentas",
        productos: "#menuProductos",
        ingresos: "#menuIngresos",
        egresos: "#menuEgresos"
    };

    Object.values(menus).forEach(menu => $(menu).hide());
    $("#menuFinanzas").hide();

    usuario.permisos.forEach(function (permiso) {

        if (menus[permiso]) {
            $(menus[permiso]).show();
        }

        if (permiso === "ingresos" || permiso === "egresos") {
            $("#menuFinanzas").show();
        }

        if (permiso === "admin") {
            Object.values(menus).forEach(menu => $(menu).show());
            $("#menuFinanzas").show();
        }
    });

    // OCULTAR SECCIONES VACÍAS
    $('.sidebar-heading').each(function () {

        var section = $(this);
        var nextItems = section.nextUntil('.sidebar-heading');

        var visible = false;

        nextItems.each(function () {
            if ($(this).is(':visible')) {
                visible = true;
            }
        });

        if (!visible) {
            section.hide();
        }
    });

    // BLOQUEO POR URL
    var paginaActual = window.location.pathname.split("/").pop();

    var permisosPaginas = {
        "index.html": "panel",
        "reports.html": "reportes",
        "new-sale.html": "ventas",
        "record.html": "ventas",
        "products.html": "productos",
        "income.html": "ingresos",
        "expenses.html": "egresos",
        "users.html": "admin",
        "admin-users.html": "admin"
    };

    var permisoRequerido = permisosPaginas[paginaActual];

    if (
        permisoRequerido &&
        !usuario.permisos.includes(permisoRequerido) &&
        usuario.rol !== "admin"
    ) {
        alert("No tienes acceso a esta sección");
        window.location.href = "index.html";
    }

});

$(document).ajaxError(function (event, jqxhr) {

    if (jqxhr.status === 401 || jqxhr.status === 403) {

        alert("Sesión expirada, inicia sesión nuevamente");

        localStorage.removeItem("token");
        localStorage.removeItem("usuarioActivo");

        window.location.href = "login.html";
    }

});