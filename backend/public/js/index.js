const API = window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://sgestionfinanciera-kasalion.up.railway.app";

$(document).ready(function(){
    
function formatoMoneda(valor){
    return new Intl.NumberFormat('es-CO',{
        style:'currency',
        currency:'COP',
        minimumFractionDigits:0
    }).format(valor);
}

// VARIABLES GLOBALES
let datosGlobales = [];
let egresosGlobales = [];

let chartLinea, chartIngresos, chartEgresos, chartPieMensual, chartPieAnual;

// FECHA ACTUAL
let hoy = new Date();
let mesActual = hoy.getMonth();
let anioActual = hoy.getFullYear();

// LLENAR FILTROS
function llenarFiltros(data){

    let aniosSet = new Set();
    let mesesPorAnio = {};

    data.forEach(item => {
        let f = new Date(item.fecha);
        let anio = f.getFullYear();
        let mes = f.getMonth();

        aniosSet.add(anio);

        if(!mesesPorAnio[anio]){
            mesesPorAnio[anio] = new Set();
        }

        mesesPorAnio[anio].add(mes);
    });

    let mesesTexto = [
        "Enero","Febrero","Marzo","Abril","Mayo","Junio",
        "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
    ];

    // LLENAR AÑOS
    aniosSet.forEach(a=>{
        $('#filtroAnioDiario, #filtroAnioIngresos, #filtroAnioEgresos, #filtroAnioPie, #filtroAnioPie-2')
        .append(`<option value="${a}">${a}</option>`);
    });

    // CAMBIO DE AÑO → CARGAR MESES
    $('#filtroAnioDiario, #filtroAnioPie').on('change', function(){

        let anioSeleccionado = $(this).val();

        let selectMes = $(this).attr('id') === 'filtroAnioDiario'
            ? $('#filtroMesDiario')
            : $('#filtroMesPie');

        selectMes.empty();
        selectMes.append(`<option value="" disabled selected>Mes</option>`);

        if(mesesPorAnio[anioSeleccionado]){
            mesesPorAnio[anioSeleccionado].forEach(m=>{
                selectMes.append(`<option value="${m}">${mesesTexto[m]}</option>`);
            });
        }
    });

    // SELECCIÓN AUTOMÁTICA

    // Año diario
    if($('#filtroAnioDiario option[value="'+anioActual+'"]').length){
        $('#filtroAnioDiario').val(anioActual).trigger('change');
    } else {
        $('#filtroAnioDiario').prop('selectedIndex',1).trigger('change');
    }

    // Mes diario
    setTimeout(()=>{
        let mesStr = mesActual.toString();

        if($('#filtroMesDiario option[value="'+mesStr+'"]').length){
            $('#filtroMesDiario').val(mesStr).trigger('change');
        } else {
            $('#filtroMesDiario').prop('selectedIndex',1).trigger('change');
        }
    },100);

    // Año pie
    if($('#filtroAnioPie option[value="'+anioActual+'"]').length){
        $('#filtroAnioPie').val(anioActual).trigger('change');
    } else {
        $('#filtroAnioPie').prop('selectedIndex',1).trigger('change');
    }

    // Mes pie
    setTimeout(()=>{
        let mesStr = mesActual.toString();

        if($('#filtroMesPie option[value="'+mesStr+'"]').length){
            $('#filtroMesPie').val(mesStr).trigger('change');
        } else {
            $('#filtroMesPie').prop('selectedIndex',1).trigger('change');
        }
    },100);

    // Otros filtros
    $('#filtroAnioIngresos').prop('selectedIndex',1);
    $('#filtroAnioEgresos').prop('selectedIndex',1);
    $('#filtroAnioPie-2').prop('selectedIndex',1);
}

// RENDER GENERAL
function renderTodo(){
    renderCards();
    renderLinea();
    renderComparativoIngresos();
    renderComparativoEgresos();
    renderPieMensual();
    renderPieAnual();
}

// CARDS
function renderCards(){

    let mes = $('#filtroMesDiario').val();
    let anio = $('#filtroAnioDiario').val();

    if(!mes || !anio) return;

    let ingresos = 0;
    let egresos = 0;

    datosGlobales.forEach(item=>{
        let f = new Date(item.fecha);

        if(f.getMonth() == mes && f.getFullYear() == anio){

            if(item.tipo?.toLowerCase().trim() === "ingreso"){
                ingresos += Number(item.monto);
            } else {
                egresos += Number(item.monto);
            }
        }
    });

    $('#totalIngresos').text(formatoMoneda(ingresos));
    $('#totalEgresos').text(formatoMoneda(egresos));
    $('#balance').text(formatoMoneda(ingresos - egresos));
}

// LINEA
function renderLinea(){

    let mes = $('#filtroMesDiario').val();
    let anio = $('#filtroAnioDiario').val();
    if(!mes || !anio) return;

    let canvas = document.getElementById('graficoBarras');
    if(!canvas) return;

    if(chartLinea) chartLinea.destroy();

    let diasEnMes = new Date(anio, Number(mes) + 1, 0).getDate();

    let ingresos = new Array(diasEnMes).fill(0);
    let egresos = new Array(diasEnMes).fill(0);

    datosGlobales.forEach(item => {
        let f = new Date(item.fecha);

        if(f.getMonth() == mes && f.getFullYear() == anio){

            let dia = f.getDate() - 1;

            if(item.tipo?.toLowerCase().trim() === "ingreso"){
                ingresos[dia] += Number(item.monto);
            } else {
                egresos[dia] += Number(item.monto);
            }
        }
    });

    let dias = Array.from({length: diasEnMes}, (_, i) => i + 1);

    chartLinea = new Chart(canvas, {
        type: 'line',
        data: {
            labels: dias,
            datasets: [
                {
                    label: 'Ingresos',
                    data: ingresos,
                    borderColor: 'green',
                    backgroundColor: 'rgba(0,255,0,0.2)',
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Egresos',
                    data: egresos,
                    borderColor: 'red',
                    backgroundColor: 'rgba(255,0,0,0.2)',
                    fill: true,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: v => new Intl.NumberFormat('es-CO').format(v)
                    }
                }
            }
        }
    });
}

// COMPARATIVOS
function renderComparativoIngresos(){

    let anio = $('#filtroAnioIngresos').val();
    if(!anio) return;

    let canvas = document.getElementById('graficoIngresosComparativo');
    if(!canvas) return;

    if(chartIngresos) chartIngresos.destroy();

    let actual = 0;
    let anterior = 0;

    datosGlobales.forEach(item => {
        let f = new Date(item.fecha);

        if(item.tipo?.toLowerCase().trim() === "ingreso"){

            if(f.getFullYear() == anio) actual += Number(item.monto);
            if(f.getFullYear() == (Number(anio) - 1)) anterior += Number(item.monto);
        }
    });

    chartIngresos = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: ['Año anterior', 'Año actual'],
            datasets: [{
                label: 'Ingresos',
                data: [anterior, actual],
                backgroundColor: ['#1cc88a', '#1cc88a']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function renderComparativoEgresos(){

    let anio = $('#filtroAnioEgresos').val();
    if(!anio) return;

    let canvas = document.getElementById('graficoEgresosComparativo');
    if(!canvas) return;

    if(chartEgresos) chartEgresos.destroy();

    let actual = 0;
    let anterior = 0;

    datosGlobales.forEach(item => {
        let f = new Date(item.fecha);

        if(item.tipo?.toLowerCase().trim() === "egreso"){

            if(f.getFullYear() == anio) actual += Number(item.monto);
            if(f.getFullYear() == (Number(anio) - 1)) anterior += Number(item.monto);
        }
    });

    chartEgresos = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: ['Año anterior', 'Año actual'],
            datasets: [{
                label: 'Egresos',
                data: [anterior, actual],
                backgroundColor: ['#e74a3b', '#e74a3b']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// PIE MENSUAL
function renderPieMensual(){

    let mes = $('#filtroMesPie').val();
    let anio = $('#filtroAnioPie').val();
    if(!mes || !anio) return;

    let canvas = document.getElementById('graficoTortaEgresos');
    if(!canvas) return;

    if(chartPieMensual) chartPieMensual.destroy();

    let obj = {};

    egresosGlobales.forEach(item => {
        let f = new Date(item.fecha);

        if(f.getMonth() == mes && f.getFullYear() == anio){

            let cat = item.categoria || "Otros";
            obj[cat] = (obj[cat] || 0) + Number(item.monto);
        }
    });

    chartPieMensual = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: Object.keys(obj),
            datasets: [{
                data: Object.values(obj),
                backgroundColor: ['#e74a3b','#f6c23e','#36b9cc','#1cc88a','#858796']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

// PIE ANUAL
function renderPieAnual(){

    let anio = $('#filtroAnioPie-2').val();
    if(!anio) return;

    let canvas = document.getElementById('graficoTortaEgresosAnual');
    if(!canvas) return;

    if(chartPieAnual) chartPieAnual.destroy();

    let obj = {};

    egresosGlobales.forEach(item => {
        let f = new Date(item.fecha);

        if(f.getFullYear() == anio){

            let cat = item.categoria || "Otros";
            obj[cat] = (obj[cat] || 0) + Number(item.monto);
        }
    });

    chartPieAnual = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: Object.keys(obj),
            datasets: [{
                data: Object.values(obj),
                backgroundColor: ['#4e73df','#1cc88a','#36b9cc','#f6c23e','#e74a3b']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

// EVENTOS
$('select').on('change', renderTodo);

// DATOS
$.get(`${API}/dashboard`, data=>{
    datosGlobales=data;
    llenarFiltros(data);
    renderTodo();
});

$.get(`${API}/egresos`, data=>{
    egresosGlobales=data;
    renderTodo();
});

});