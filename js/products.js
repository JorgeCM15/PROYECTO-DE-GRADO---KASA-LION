
$(document).ready(function () {

    var table = $('#dataTable').DataTable({
    autoWidth: false,
    columnDefs: [
        { width: "10%", targets: 0 }, // Código
        { width: "35%", targets: 1 }, // Descripción (más grande)
        { width: "10%", targets: 2 }, // Categoría
        { width: "15%", targets: 3 }, // Precio
        { width: "15%", targets: 4 }, // Fecha
        { width: "5%",  targets: 5 }  // Acción (más pequeño)
    ]
});

    function formatoContable(numero) {
        numero = Number(numero);

        if (isNaN(numero)) {
            return "$ 0";
        }

        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(numero);
    }

    //cargar productos

    function cargarProductos() {

    $.ajax({
        url: "http://localhost:3000/productos",
        type: "GET",
        success: function(productos){

            table.clear();

            productos.forEach(function (prod) {

                table.row.add([
                    prod.codigo,
                    prod.descripcion,
                    prod.categoria,
                    formatoContable(prod.precio),
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
    var fecha = $('#fecha').val();

    if (!codigo || !descripcion || !categoria || !fecha || isNaN(precio) || precio <= 0) {
        alert("Complete todos los campos correctamente.");
        return;
    }

    $.ajax({
        url: "http://localhost:3000/productos",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            codigo,
            descripcion,
            categoria,
            precio,
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
        url: `http://localhost:3000/productos/${id}`,
        type: "DELETE",
        success: function(){
            cargarProductos();
        }
    });

});

});
