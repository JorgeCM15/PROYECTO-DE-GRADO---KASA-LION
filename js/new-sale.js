$(document).ready(function () {

    var productos = [];
    var total = 0;
    var detalleVenta = [];

    function formatoMoneda(numero) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(numero);
    }

    // MAYÚSCULAS automáticas
    $('.nombre-mayus').on('input', function () {
        this.value = this.value.toUpperCase();
    });

    // 🔥 CARGAR PRODUCTOS DESDE BACKEND
    $.ajax({
        url: "http://localhost:3000/productos",
        type: "GET",
        success: function (data) {

            productos = data;

            data.forEach(function (prod) {

                $('#productoSelect').append(`
                    <option value="${prod.id}">
                        ${prod.descripcion} - ${formatoMoneda(prod.precio)}
                    </option>
                `);

            });

        },
        error: function (err) {
            console.error("Error cargando productos:", err);
        }
    });

    // Agregar producto
    $('#agregarProducto').click(function () {

        var idSeleccionado = $('#productoSelect').val();
        var cantidad = parseInt($('#cantidad').val());

        if (idSeleccionado === "" || isNaN(cantidad) || cantidad <= 0) {
            alert("Seleccione producto y cantidad válida");
            return;
        }

        var producto = productos.find(p => p.id == idSeleccionado);

        var subtotal = producto.precio * cantidad;

        var item = {
            producto_id: producto.id,
            producto: producto.descripcion,
            precio: Number(producto.precio),
            cantidad: cantidad,
            subtotal: subtotal
        };

        detalleVenta.push(item);

        actualizarTabla();
        $('#cantidad').val('');
    });

    function actualizarTabla() {

        $('#tablaVenta tbody').empty();
        total = 0;

        detalleVenta.forEach(function (item, index) {

            total += item.subtotal;

            $('#tablaVenta tbody').append(`
                <tr>
                    <td>${item.producto}</td>
                    <td class="text-end">${formatoMoneda(item.precio)}</td>
                    <td>${item.cantidad}</td>
                    <td class="text-end">${formatoMoneda(item.subtotal)}</td>
                    <td>
                        <button class="btn btn-danger btn-sm eliminar" data-index="${index}">
                            X
                        </button>
                    </td>
                </tr>
            `);
        });

        $('#totalVenta').text(formatoMoneda(total));
    }

    // Eliminar producto
    $(document).on('click', '.eliminar', function () {
        var index = $(this).data('index');
        detalleVenta.splice(index, 1);
        actualizarTabla();
    });

    // GENERAR ID
    function generarIdVenta() {
        var fecha = new Date();
        var anio = fecha.getFullYear();
        var mes = String(fecha.getMonth() + 1).padStart(2, '0');
        var random = Math.floor(Math.random() * 1000);
        return `${anio}${mes}VENTA${random}`;
    }

    // 🔥 GUARDAR VENTA EN BACKEND
    $('#guardarVenta').click(function () {

        var primerNombre = $('#primerNombre').val().trim();
        var primerApellido = $('#primerApellido').val().trim();
        var tipoDocumento = $('#tipoDocumento').val();
        var numeroDocumento = $('#numeroDocumento').val().trim();
        var correo = $('#correo').val().trim();
        var direccion = $('#direccion').val().trim();
        var telefono = $('#telefono').val().trim();
        var fecha = $('#fechaVenta').val();

        if (
            primerNombre === "" ||
            primerApellido === "" ||
            tipoDocumento === "" ||
            numeroDocumento === "" ||
            correo === "" ||
            direccion === "" ||
            telefono === "" ||
            fecha === ""
        ) {
            alert("Por favor complete todos los campos obligatorios");
            return;
        }

        if (detalleVenta.length === 0) {
            alert("Debe agregar al menos un producto");
            return;
        }

        var venta = {
            
            primerNombre: primerNombre.toUpperCase(),
            segundoNombre: $('#segundoNombre').val().toUpperCase(),
            primerApellido: primerApellido.toUpperCase(),
            segundoApellido: $('#segundoApellido').val().toUpperCase(),
            tipoDocumento: tipoDocumento,
            numeroDocumento: numeroDocumento,
            correo: correo.toLowerCase(),
            direccion: direccion.toUpperCase(),
            telefono: telefono,
            fecha: fecha,
            total: total
        };

        $.ajax({
            url: "http://localhost:3000/ventas",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                venta: venta,
                detalle: detalleVenta
            }),
            success: function () {
                alert("Venta guardada correctamente");
                location.reload();
            },
            error: function (err) {
                console.error(err);
                alert("Error guardando venta");
            }
        });

    });

});