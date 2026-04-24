$(document).ready(function(){

function formatoMoneda(valor){
    return new Intl.NumberFormat('es-CO',{
        style:'currency',
        currency:'COP',
        minimumFractionDigits:0
    }).format(valor);
}

// 🔥 VARIABLES GLOBALES
let datosGlobales = [];
let egresosGlobales = [];

let chartLinea, chartIngresos, chartEgresos, chartPieMensual, chartPieAnual;

// 📅 FECHA ACTUAL
let hoy = new Date();
let mesActual = hoy.getMonth();
let anioActual = hoy.getFullYear();

// 🔥 LLENAR FILTROS
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

    // 🔹 LLENAR AÑOS
    aniosSet.forEach(a=>{
        $('#filtroAnioDiario, #filtroAnioIngresos, #filtroAnioEgresos, #filtroAnioPie, #filtroAnioPie-2')
        .append(`<option value="${a}">${a}</option>`);
    });

    // 🔹 CAMBIO DE AÑO → CARGAR MESES
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

    // 🔥 SELECCIÓN AUTOMÁTICA

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

// 🔁 RENDER GENERAL
function renderTodo(){
    renderCards();
    renderLinea();
    renderComparativos();
    renderPieMensual();
    renderPieAnual();
}

// 💰 CARDS
function renderCards(){

    let mes = $('#filtroMesDiario').val();
    let anio = $('#filtroAnioDiario').val();

    if(!mes || !anio) return;

    let ingresos = 0;
    let egresos = 0;

    datosGlobales.forEach(item=>{
        let f = new Date(item.fecha);

        if(f.getMonth() == mes && f.getFullYear() == anio){

            if(item.tipo === "ingreso"){
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

// 📊 LINEA
function renderLinea(){

    let mes = $('#filtroMesDiario').val();
    let anio = $('#filtroAnioDiario').val();

    if(!mes || !anio) return;

    if(chartLinea) chartLinea.destroy();

    let diasEnMes = new Date(anio, Number(mes)+1, 0).getDate();

    let ingresos = new Array(diasEnMes).fill(0);
    let egresos = new Array(diasEnMes).fill(0);

    datosGlobales.forEach(item=>{
        let f = new Date(item.fecha);

        if(f.getMonth() == mes && f.getFullYear() == anio){
            let dia = f.getDate() - 1;

            if(item.tipo === "ingreso"){
                ingresos[dia] += Number(item.monto);
            } else {
                egresos[dia] += Number(item.monto);
            }
        }
    });

    let dias = Array.from({length:diasEnMes},(_,i)=>i+1);

    chartLinea = new Chart(document.getElementById('graficoBarras'), {
        type:'line',
        data:{
            labels:dias,
            datasets:[
                {
                    label:'Ingresos',
                    data:ingresos,
                    borderColor:'green',
                    backgroundColor:'rgba(0,255,0,0.2)',
                    fill:true,
                    tension:0.3
                },
                {
                    label:'Egresos',
                    data:egresos,
                    borderColor:'red',
                    backgroundColor:'rgba(255,0,0,0.2)',
                    fill:true,
                    tension:0.3
                }
            ]
        },
        options:{
            responsive:true,
            maintainAspectRatio:false,
            scales:{
                yAxes:[{
                    ticks:{
                        beginAtZero:true,
                        callback:value=>formatoMoneda(value)
                    }
                }]
            }
        }
    });
}

// 📊 COMPARATIVOS
function renderComparativos(){

    let anioIng = $('#filtroAnioIngresos').val();
    let anioEgr = $('#filtroAnioEgresos').val();

    if(!anioIng || !anioEgr) return;

    if(chartIngresos) chartIngresos.destroy();
    if(chartEgresos) chartEgresos.destroy();

    let ingA=0, ingAnt=0, egA=0, egAnt=0;

    datosGlobales.forEach(item=>{
        let f=new Date(item.fecha);
        let anio=f.getFullYear();

        if(item.tipo==="ingreso"){
            if(anio==anioIng) ingA+=Number(item.monto);
            if(anio==anioIng-1) ingAnt+=Number(item.monto);
        }

        if(item.tipo==="egreso"){
            if(anio==anioEgr) egA+=Number(item.monto);
            if(anio==anioEgr-1) egAnt+=Number(item.monto);
        }
    });

    chartIngresos=new Chart(document.getElementById('graficoIngresosComparativo'),{
        type:'bar',
        data:{
            labels:['Año Anterior','Año Actual'],
            datasets:[{data:[ingAnt,ingA],backgroundColor:['gray','green']}]
        }
    });

    chartEgresos=new Chart(document.getElementById('graficoEgresosComparativo'),{
        type:'bar',
        data:{
            labels:['Año Anterior','Año Actual'],
            datasets:[{data:[egAnt,egA],backgroundColor:['gray','red']}]
        }
    });
}

// 🥧 PIE MENSUAL
function renderPieMensual(){

    let mes=$('#filtroMesPie').val();
    let anio=$('#filtroAnioPie').val();

    if(!mes || !anio) return;

    if(chartPieMensual) chartPieMensual.destroy();

    let obj={};

    egresosGlobales.forEach(item=>{
        let f=new Date(item.fecha);

        if(f.getMonth()==mes && f.getFullYear()==anio){
            let cat=item.categoria||"Otros";
            obj[cat]=(obj[cat]||0)+Number(item.monto);
        }
    });

    chartPieMensual=new Chart(document.getElementById('graficoTortaEgresos'),{
        type:'doughnut',
        data:{
            labels:Object.keys(obj),
            datasets:[{
                data:Object.values(obj),
                backgroundColor:['#e74a3b','#f6c23e','#36b9cc','#1cc88a','#858796']
            }]
        },
        options:{
            plugins:{
                legend:{position:'bottom'},
                datalabels:{
                    color:'#fff',
                    formatter:(value,ctx)=>{
                        let total=ctx.chart.data.datasets[0].data.reduce((a,b)=>a+b,0);
                        return ((value/total)*100).toFixed(1)+'%';
                    }
                }
            }
        }
    });
}

// 🥧 PIE ANUAL
function renderPieAnual(){

    let anio=$('#filtroAnioPie-2').val();
    if(!anio) return;

    if(chartPieAnual) chartPieAnual.destroy();

    let obj={};

    egresosGlobales.forEach(item=>{
        let f=new Date(item.fecha);

        if(f.getFullYear()==anio){
            let cat=item.categoria||"Otros";
            obj[cat]=(obj[cat]||0)+Number(item.monto);
        }
    });

    chartPieAnual=new Chart(document.getElementById('graficoTortaEgresosAnual'),{
        type:'doughnut',
        data:{
            labels:Object.keys(obj),
            datasets:[{
                data:Object.values(obj),
                backgroundColor:['#4e73df','#1cc88a','#36b9cc','#f6c23e','#e74a3b']
            }]
        },
        options:{
            plugins:{
                legend:{position:'bottom'},
                datalabels:{
                    color:'#fff',
                    formatter:(value,ctx)=>{
                        let total=ctx.chart.data.datasets[0].data.reduce((a,b)=>a+b,0);
                        return ((value/total)*100).toFixed(1)+'%';
                    }
                }
            }
        }
    });
}

// 🔁 EVENTOS
$('select').on('change', renderTodo);

// 🔥 DATOS
$.get("http://localhost:3000/dashboard",data=>{
    datosGlobales=data;
    llenarFiltros(data);
    renderTodo();
});

$.get("http://localhost:3000/egresos",data=>{
    egresosGlobales=data;
    renderTodo();
});

});