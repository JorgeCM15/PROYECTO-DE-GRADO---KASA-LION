const API = window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://TU-APP.up.railway.app";

$(document).ready(function () {

    var table = $('#dataTable').DataTable({
        autoWidth: false,
        columnDefs: [
            { width: "10%", targets: 0 },
            { width: "35%", targets: 1 },
            { width: "10%", targets: 2 },
            { width: "15%", targets: 3 },
            { width: "15%", targets: 4 },
            { width: "15%", targets: 5 },
            { width: "5%", targets: 6 }
        ]
    });

    function formatoContable(numero) {
        numero = Number(numero);

        if (isNaN(numero)) return "$ 0";

        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(numero);
    }

    function cargarProductos() {

        $.ajax({
            url: `${API}/productos`,
            type: "GET",
            success: function(productos){

                table.clear();

                productos.forEach(function (prod) {

                    table.row.add([
                        prod.codigo,
                        prod.descripcion,
                        prod.categoria,
                        formatoContable(prod.precio),
                        formatoContable(prod.costo),
                        new Date(prod.fecha).toLocaleDateString('es-CO'),
                        `<button class="btn btn-danger btn-sm eliminar" data-id="${prod.id}">X</button>`
                    ]);

                });

                table.draw();
            },
            error: function(err){
                console.error("Error cargando productos:", err);
            }
        });

    }

    $('#formProducto').on('submit', function (e) {
        e.preventDefault();

        var codigo = $('#codigo').val().trim().toUpperCase();
        var descripcion = $('#descripcion').val().trim().toUpperCase();
        var categoria = $('#categoria').val().trim().toUpperCase();
        var precio = Number($('#precio').val());
        var costo = Number($('#costo').val());
        var fecha = $('#fecha').val();

        if (!codigo || !descripcion || !categoria || !fecha || isNaN(precio) || precio <= 0 || isNaN(costo) || costo <= 0) {
            alert("Complete todos los campos correctamente.");
            return;
        }

        $.ajax({
            url: `${API}/productos`,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                codigo,
                descripcion,
                categoria,
                precio,
                costo,
                fecha
            }),
            success: function(){
                $('#formProducto')[0].reset();
                cargarProductos();
            },
            error: function(err){
                console.error(err);
                alert("Error al guardar producto");
            }
        });

    });

    cargarProductos();

    $(document).on('click', '.eliminar', function () {

        var id = $(this).data('id');

        if(!confirm("¿Eliminar producto?")) return;

        $.ajax({
            url: `${API}/productos/${id}`,
            type: "DELETE",
            success: function(){
                cargarProductos();
            }
        });

    });

});
