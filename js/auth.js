$(document).ready(function(){


// VALIDAR SESIÓN
var usuario = JSON.parse(localStorage.getItem("usuarioActivo"));

if(!usuario){
    window.location.href = "login.html";
    return;
}


usuario.permisos = usuario.modulos || [];


if(usuario.correo === "administrador@kasalion.com"){
    usuario.permisos = [
        "admin",
        "panel","ingresos","egresos",
        "ventas","productos","reportes"
    ];
}

// MOSTRAR NOMBRE
if(usuario.nombres){
    var nombreCompleto = usuario.nombres;
    $('.text-gray-600.small').text(nombreCompleto);
}

// OCULTAR TODO EL MENÚ
$('#menuPanel').hide();
$('#menuAdmin').hide();
$('#menuReportes').hide();
$('#menuVentas').hide();
$('#menuProductos').hide();
$('#menuFinanzas').hide();
$('#menuIngresos').hide();
$('#menuEgresos').hide();

// MOSTRAR SEGÚN PERMISOS
usuario.permisos.forEach(function(p){

    if(p === "panel") $('#menuPanel').show();

    if(p === "reportes") $('#menuReportes').show();

    if(p === "ventas") $('#menuVentas').show();

    if(p === "productos") $('#menuProductos').show();

    if(p === "ingresos"){
        $('#menuFinanzas').show();
        $('#menuIngresos').show();
    }

    if(p === "egresos"){
        $('#menuFinanzas').show();
        $('#menuEgresos').show();
    }

    if(p === "admin"){
        $('#menuAdmin').show();
        $('#menuPanel').show();
        $('#menuReportes').show();
        $('#menuVentas').show();
        $('#menuProductos').show();
        $('#menuFinanzas').show();
        $('#menuIngresos').show();
        $('#menuEgresos').show();
    }

});

// OCULTAR SECCIONES VACÍAS
$('.sidebar-heading').each(function(){

    var section = $(this);
    var nextItems = section.nextUntil('.sidebar-heading');

    var visible = false;

    nextItems.each(function(){
        if($(this).is(':visible')){
            visible = true;
        }
    });

    if(!visible){
        section.hide();
    }

});

// BLOQUEAR ACCESO POR URL
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

if(permisosPaginas[paginaActual]){

    var permisoNecesario = permisosPaginas[paginaActual];

    if(!usuario.permisos.includes(permisoNecesario) && !usuario.permisos.includes("admin")){
        alert("No tienes acceso a esta sección");
        window.location.href = "index.html";
    }
}

});
