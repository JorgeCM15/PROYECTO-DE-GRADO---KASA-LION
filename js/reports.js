$(document).ready(function(){

    $('#generarExcel').on('click', function(){

        var meses = [
            "Enero","Febrero","Marzo","Abril","Mayo","Junio",
            "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
        ];

        var tipo = $('#tipoReporte').val();
        var mesSeleccionado = Number($('#mesReporte').val()) + 1;

        var inicio = 1;
        var fin = (tipo === "quincenal") ? 15 : 31;

        $.ajax({
            url: `http://localhost:3000/reporte?mes=${mesSeleccionado}&inicio=${inicio}&fin=${fin}`,
            type: "GET",
            success: function(data){

                let ws_data = [];

                // ENCABEZADOS
                let headers = [
                    "TIPO","ID","FECHA","PRIMER NOMBRE","SEGUNDO NOMBRE",
                    "PRIMER APELLIDO","SEGUNDO APELLIDO","DOCUMENTO",
                    "CORREO","CATEGORÍA","MONTO"
                ];

                ws_data.push(headers);

                let totalIngresos = 0;
                let totalEgresos = 0;

                data.forEach(function(item){

                    ws_data.push([
                        item.tipo,
                        item.id,
                        item.fecha,
                        item.primer_nombre || "NA",
                        item.segundo_nombre || "NA",
                        item.primer_apellido || "NA",
                        item.segundo_apellido || "NA",
                        item.numero_documento || "NA",
                        item.correo || "NA",
                        item.categoria,
                        Number(item.monto)
                    ]);

                    if(item.tipo === "Ingreso"){
                        totalIngresos += Number(item.monto);
                    } else {
                        totalEgresos += Number(item.monto);
                    }
                });

                let utilidad = totalIngresos - totalEgresos;

                ws_data.push([]);
                ws_data.push(["","","","","","","","","","TOTAL INGRESOS", totalIngresos]);
                ws_data.push(["","","","","","","","","","TOTAL EGRESOS", totalEgresos]);
                ws_data.push(["","","","","","","","","","UTILIDAD", utilidad]);

                let ws = XLSX.utils.aoa_to_sheet(ws_data);

                // 🔥 ESTILO ENCABEZADO (FILA 1)
                headers.forEach((_, colIndex) => {
                    let cell = XLSX.utils.encode_cell({ r: 0, c: colIndex });
                    if(ws[cell]){
                        ws[cell].s = {
                            font: { bold: true, color: { rgb: "FFFFFF" } },
                            fill: { fgColor: { rgb: "4F81BD" } },
                            alignment: { horizontal: "center" },
                            border: {
                                top: { style: "thin" },
                                bottom: { style: "thin" },
                                left: { style: "thin" },
                                right: { style: "thin" }
                            }
                        };
                    }
                });

                // 🔥 ESTILO GENERAL (bordes)
                let range = XLSX.utils.decode_range(ws['!ref']);
                for(let R = 1; R <= range.e.r; ++R){
                    for(let C = 0; C <= range.e.c; ++C){

                        let cell = XLSX.utils.encode_cell({ r: R, c: C });

                        if(ws[cell]){
                            ws[cell].s = {
                                border: {
                                    top: { style: "thin" },
                                    bottom: { style: "thin" },
                                    left: { style: "thin" },
                                    right: { style: "thin" }
                                }
                            };
                        }
                    }
                }

                // 🔥 AUTO WIDTH
                ws['!cols'] = headers.map((h, i) => ({
                    wch: Math.max(
                        h.length,
                        ...ws_data.map(row => (row[i] ? row[i].toString().length : 10))
                    ) + 2
                }));

                let wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Reporte");

                let nombreArchivo = `Reporte_${meses[mesSeleccionado - 1]}_${tipo}.xlsx`;

                XLSX.writeFile(wb, nombreArchivo);
            }
        });

    });

});