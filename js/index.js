$(document).ready(function(){

    function formatoMoneda(valor){
        return new Intl.NumberFormat('es-CO',{
            style:'currency',
            currency:'COP',
            minimumFractionDigits:0
        }).format(valor);
    }

    var hoy = new Date();
    var mesActual = hoy.getMonth();
    var anioActual = hoy.getFullYear();
    var diasEnMes = new Date(anioActual, mesActual + 1, 0).getDate();

    // 🔥 TRAER DATOS DEL BACKEND
    $.ajax({
        url: "http://localhost:3000/dashboard",
        type: "GET",
        success: function(data){

            let totalIngresos = 0;
            let totalEgresos = 0;

            let ingresosPorDia = new Array(diasEnMes).fill(0);
            let egresosPorDia = new Array(diasEnMes).fill(0);

            data.forEach(item => {

                let fecha = new Date(item.fecha);
                let dia = fecha.getDate();

                if(item.tipo === "ingreso"){
                    totalIngresos += Number(item.monto);
                    ingresosPorDia[dia - 1] += Number(item.monto);
                } else {
                    totalEgresos += Number(item.monto);
                    egresosPorDia[dia - 1] += Number(item.monto);
                }

            });

            let balance = totalIngresos - totalEgresos;

            // MOSTRAR TARJETAS
            $('#totalIngresos').text(formatoMoneda(totalIngresos));
            $('#totalEgresos').text(formatoMoneda(totalEgresos));
            $('#balance').text(formatoMoneda(balance));

            // CREAR GRAFICA
            let dias = Array.from({length: diasEnMes}, (_, i) => i + 1);

            var ctx = document.getElementById('graficoBarras');

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: dias,
                    datasets: [
                        {
                            label: 'Ingresos',
                            data: ingresosPorDia,
                            backgroundColor: 'rgba(0, 200, 0, 0.6)'
                        },
                        {
                            label: 'Egresos',
                            data: egresosPorDia,
                            backgroundColor: 'rgba(200, 0, 0, 0.6)'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top'
                        }
                    }
                }
            });

        },
        error: function(err){
            console.error("Error dashboard:", err);
        }
    });

});