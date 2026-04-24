$(document).ready(function () {

    function formatoMoneda(numero) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(numero);
    }

    function formatoFecha(fecha){
        return new Date(fecha).toLocaleDateString('es-CO');
    }

    // CARGAR VENTAS DISPONIBLES
    function cargarVentas() {

        $.ajax({
            url: "http://localhost:3000/ventas-disponibles",
            type: "GET",
            success: function (ventas) {

                var select = $('#ventaSelect');
                select.empty();
                select.append('<option value="">Seleccione una venta</option>');

                ventas.forEach(function (v) {

                    select.append(`
                        <option value="${v.id}" data-monto="${v.ganancia}">
                            ${v.id} - ${formatoMoneda(v.total)}
                        </option>
                    `);

                });

            }
        });

    }

    cargarVentas();

    // MOSTRAR MONTO AUTOMÁTICO
    $('#ventaSelect').on('change', function () {

        var monto = $(this).find(':selected').data('monto');

        if (!monto) {
            $('#montoIngreso').val('');
            return;
        }

        $('#montoIngreso').val(formatoMoneda(monto));
    });

    // GUARDAR INGRESO
    $('#guardarIngreso').on('click', function () {

        var venta_id = $('#ventaSelect').val();
        var fecha = $('#fechaIngreso').val();
        var monto = $('#ventaSelect').find(':selected').data('monto');

        if (!venta_id || !fecha) {
            alert("Seleccione venta y fecha");
            return;
        }

        $.ajax({
            url: "http://localhost:3000/ingresos",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                venta_id,
                fecha,
                monto
            }),
            success: function (res) {

                alert("Ingreso registrado\nID: " + res.id);

                $('#ventaSelect').val('');
                $('#montoIngreso').val('');
                $('#fechaIngreso').val('');

                cargarVentas();
                cargarHistorial();
            },
            error: function (err) {
                console.error(err);
                alert("Error al registrar ingreso");
            }
        });

    });

    // HISTORIAL
    function cargarHistorial() {

        $.ajax({
            url: "http://localhost:3000/ingresos",
            type: "GET",
            success: function (ingresos) {

                if ($.fn.DataTable.isDataTable('#tablaIngresos')) {
                    $('#tablaIngresos').DataTable().destroy();
                }

                var tabla = $('#tablaIngresos tbody');
                tabla.empty();

                ingresos.forEach(function (ing) {

                    tabla.append(`
                        <tr>
                            <td>${ing.id}</td>
                            <td>${ing.venta_id}</td>
                            <td>${formatoFecha(ing.fecha)}</td>
                            <td class="text-end">${formatoMoneda(ing.monto)}</td>
                        </tr>
                    `);

                });

                $('#tablaIngresos').DataTable({
                    language: {
                        url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json"
                    }
                });

            }
        });

    }

    cargarHistorial();

});