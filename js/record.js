$(document).ready(function () {

    function formatoMoneda(numero) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(numero);
    }

    // 🔥 CARGAR HISTORIAL DESDE BACKEND
    $.ajax({
        url: "http://localhost:3000/ventas",
        type: "GET",
        success: function (ventas) {

            ventas.forEach(function (venta) {

                $('#tablaHistorial tbody').append(`
                    <tr>
                        <td>${venta.id}</td>
                        <td>${venta.cliente}</td>
                        <td>${venta.fecha}</td>
                        <td class="text-end">${formatoMoneda(venta.total)}</td>
                        <td>
                            <button class="btn btn-primary btn-sm verDetalle" data-id="${venta.id}">
                                Ver
                            </button>
                        </td>
                    </tr>
                `);

            });

            $('#tablaHistorial').DataTable({
                language: {
                    url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json"
                }
            });

        },
        error: function (err) {
            console.error("Error cargando ventas:", err);
        }
    });

    // 🔥 VER DETALLE DESDE BACKEND
    $(document).on('click', '.verDetalle', function () {

        var id = $(this).data('id');

        $.ajax({
            url: `http://localhost:3000/ventas/${id}`,
            type: "GET",
            success: function (data) {

                $('#detalleCliente').html(`
    <strong>ID Venta:</strong> ${data[0].id}<br>
    <strong>Cliente:</strong> 
        ${data[0].primer_nombre} 
        ${data[0].segundo_nombre || ""} 
        ${data[0].primer_apellido} 
        ${data[0].segundo_apellido || ""}<br>

    <strong>Tipo Documento:</strong> ${data[0].tipo_documento}<br>
    <strong>Número Documento:</strong> ${data[0].numero_documento}<br>
    <strong>Correo:</strong> ${data[0].correo}<br>
    <strong>Dirección:</strong> ${data[0].direccion}<br>
    <strong>Teléfono:</strong> ${data[0].telefono}<br>
    <strong>Fecha:</strong> ${data[0].fecha}
`);

                $('#detalleProductos').empty();

                data.forEach(function (item) {

                    $('#detalleProductos').append(`
                        <tr>
                            <td>${item.descripcion}</td>
                            <td class="text-end">${formatoMoneda(item.precio)}</td>
                            <td>${item.cantidad}</td>
                            <td class="text-end">${formatoMoneda(item.subtotal)}</td>
                        </tr>
                    `);

                });

                $('#detalleTotal').text(formatoMoneda(data[0].total));

                var modal = new bootstrap.Modal(document.getElementById('modalDetalle'));
                modal.show();
            }
        });

    });

});