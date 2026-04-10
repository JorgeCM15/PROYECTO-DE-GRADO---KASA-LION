$(document).ready(function(){

function cargarUsuarios(){

    $.ajax({
        url: "http://localhost:3000/usuarios",
        type: "GET",
        success: function(usuarios){

            console.log("Usuarios:", usuarios); // 🔥 DEBUG

            var tabla = $('#tablaUsuarios tbody');
            tabla.empty();

            if(!usuarios || usuarios.length === 0){
                tabla.append(`<tr><td colspan="5" class="text-center">No hay usuarios</td></tr>`);
                return;
            }

            usuarios.forEach(u => {

                var nombreCompleto = `${u.nombres} ${u.primer_apellido} ${u.segundo_apellido || ""}`;

                var permisos = u.permisos ? u.permisos.split(",") : [];

                tabla.append(`
                <tr>
                    <td>${nombreCompleto}</td>
                    <td>${u.tipo_documento} - ${u.numero_documento}</td>
                    <td>${u.correo}</td>

                    <td>

                        <label><input type="checkbox" class="permiso" data-id="${u.id}" value="panel" ${permisos.includes("panel") ? "checked" : ""}> Panel</label><br>

                        <label><input type="checkbox" class="permiso" data-id="${u.id}" value="ingresos" ${permisos.includes("ingresos") ? "checked" : ""}> Ingresos</label><br>

                        <label><input type="checkbox" class="permiso" data-id="${u.id}" value="egresos" ${permisos.includes("egresos") ? "checked" : ""}> Egresos</label><br>

                        <label><input type="checkbox" class="permiso" data-id="${u.id}" value="ventas" ${permisos.includes("ventas") ? "checked" : ""}> Ventas</label><br>

                        <label><input type="checkbox" class="permiso" data-id="${u.id}" value="productos" ${permisos.includes("productos") ? "checked" : ""}> Productos</label><br>

                        <label><input type="checkbox" class="permiso" data-id="${u.id}" value="reportes" ${permisos.includes("reportes") ? "checked" : ""}> Reportes</label>

                    </td>

                    <td>
                        <button class="btn btn-success btn-sm guardar" data-id="${u.id}">Guardar</button>
                        <button class="btn btn-danger btn-sm eliminar" data-id="${u.id}">Eliminar</button>
                    </td>
                </tr>
                `);

            });

        },
        error: function(err){
            console.error("Error cargando usuarios:", err);
        }
    });

}

cargarUsuarios();


// 🔥 GUARDAR PERMISOS EN BD
$(document).on('click', '.guardar', function(){

    var id = $(this).data('id');

    var permisos = [];

    $(`.permiso[data-id="${id}"]:checked`).each(function(){
        permisos.push($(this).val());
    });

    $.ajax({
        url: "http://localhost:3000/actualizar-permisos",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            usuario_id: id,
            permisos: permisos
        }),
        success: function(){
            alert("Permisos actualizados");
            cargarUsuarios(); 

        },
        error: function(err){
            console.error(err);
        }
    });

});


// 🔥 ELIMINAR
$(document).on('click', '.eliminar', function(){

    var id = $(this).data('id');

    if(!confirm("¿Eliminar usuario?")) return;

    $.ajax({
        url: `http://localhost:3000/usuarios/${id}`,
        type: "DELETE",
        success: function(){
            alert("Usuario eliminado");
            cargarUsuarios();
        }
    });

});

});