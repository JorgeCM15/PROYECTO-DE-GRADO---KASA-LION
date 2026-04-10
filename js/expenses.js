$(document).ready(function(){

// FORMATO MONEDA
function formatoMoneda(numero){
    return new Intl.NumberFormat('es-CO',{
        style:'currency',
        currency:'COP',
        minimumFractionDigits:0
    }).format(numero);
}

// FORMATO FECHA
function formatoFecha(fecha){
    return new Date(fecha).toLocaleDateString('es-CO');
}

// REGISTRAR EGRESO
$('#guardarEgreso').on('click', function(){

    var categoria = $('#categoriaEgreso').val();
    var monto = $('#montoEgreso').val();
    var fecha = $('#fechaEgreso').val();

    if(categoria === "" || monto === "" || fecha === ""){
        alert("Complete todos los campos");
        return;
    }

    monto = Math.abs(Number(monto));

    if(monto <= 0){
        alert("El monto debe ser mayor a 0");
        return;
    }

    $.ajax({
        url: "http://localhost:3000/egresos",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            categoria,
            fecha,
            monto
        }),
        success: function(res){

            alert("Egreso registrado\nID: " + res.id);

            // limpiar
            $('#categoriaEgreso').val("");
            $('#montoEgreso').val("");
            $('#fechaEgreso').val("");

            cargarHistorialEgresos();
        },
        error: function(err){
            console.error(err);
            alert("Error al registrar egreso");
        }
    });

});

// CARGAR HISTORIAL
function cargarHistorialEgresos(){

    $.ajax({
        url: "http://localhost:3000/egresos",
        type: "GET",
        success: function(egresos){

            if ($.fn.DataTable.isDataTable('#tablaEgresos')) {
                $('#tablaEgresos').DataTable().destroy();
            }

            var tabla = $('#tablaEgresos tbody');
            tabla.empty();

            egresos.forEach(function(egreso){

                tabla.append(`
                <tr>
                    <td>${egreso.id}</td>
                    <td>${egreso.categoria}</td>
                    <td>${formatoFecha(egreso.fecha)}</td>
                    <td class="text-end">${formatoMoneda(egreso.monto)}</td>
                </tr>
                `);
            });

            $('#tablaEgresos').DataTable({
                language: {
                    url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json"
                }
            });

        }
    });

}

// INICIALIZAR
cargarHistorialEgresos();

});