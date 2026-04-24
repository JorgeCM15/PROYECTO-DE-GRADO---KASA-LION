const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();


app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log("🚀 Iniciando servidor...");

pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Error conexión DB:", err);
  } else {
    console.log("✅ Conectado a MySQL");
    connection.release();
  }
});

// REGISTRAR USUARIOS
app.post('/usuarios', (req, res) => {

    const {
        nombres,
        primerApellido,
        segundoApellido,
        tipoDocumento,
        numeroDocumento,
        correo,
        password,
        permisos
    } = req.body;

    const sqlUsuario = `
        INSERT INTO usuarios
        (nombres, primer_apellido, segundo_apellido, tipo_documento, numero_documento, correo, password)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    pool.query(sqlUsuario, [
        nombres,
        primerApellido,
        segundoApellido,
        tipoDocumento,
        numeroDocumento,
        correo,
        password
    ], (err, result) => {

        if (err) {
            console.error(err);
            return res.status(500).json({ error: err });
        }

        const usuarioId = result.insertId;

        // 🔹 Insertar módulos (permisos)
        if (permisos && permisos.length > 0) {

            const valores = permisos.map(moduloId => [usuarioId, moduloId]);

            const sqlPermisos = `
                INSERT INTO usuario_modulos (usuario_id, modulo_id)
                VALUES ?
            `;

            pool.query(sqlPermisos, [valores], (err2) => {
                if (err2) {
                    console.error(err2);
                    return res.status(500).json({ error: err2 });
                }

                res.json({ success: true });
            });

        } else {
            res.json({ success: true });
        }

    });

});


//LOGIN

app.post('/login', (req, res) => {

    const { correo, password } = req.body;

    const sql = "SELECT * FROM usuarios WHERE correo = ?";

    pool.query(sql, [correo], (err, results) => {

        if (err) {
            console.error(err);
            return res.status(500).json({ error: err });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: "Usuario no encontrado" });
        }

        const usuario = results[0];

        // Comparación simple
        if (usuario.password !== password) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        // Obtener módulos
        const sqlModulos = `
            SELECT m.nombre
            FROM usuario_modulos um
            JOIN modulos m ON um.modulo_id = m.id
            WHERE um.usuario_id = ?
        `;

        pool.query(sqlModulos, [usuario.id], (err2, modulos) => {

            if (err2) {
                console.error(err2);
                return res.status(500).json({ error: err2 });
            }

            res.json({
                success: true,
                usuario: {
                    id: usuario.id,
                    nombres: usuario.nombres,
                    correo: usuario.correo,
                    modulos: modulos.map(m => m.nombre)
                }
            });

        });

    });

});

app.get('/usuarios', (req, res) => {

    const sql = `
        SELECT u.id, u.nombres, u.primer_apellido, u.segundo_apellido,
               u.tipo_documento, u.numero_documento, u.correo,
               GROUP_CONCAT(m.nombre) as permisos
        FROM usuarios u
        LEFT JOIN usuario_modulos um ON u.id = um.usuario_id
        LEFT JOIN modulos m ON um.modulo_id = m.id
        GROUP BY u.id
    `;

    pool.query(sql, (err, results) => {

        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }

        res.json(results);
    });

});

// ELIMINAR USUARIOS
app.delete('/usuarios/:id', (req, res) => {

    const id = req.params.id;

    pool.query('DELETE FROM usuario_modulos WHERE usuario_id = ?', [id], () => {

        pool.query('DELETE FROM usuarios WHERE id = ?', [id], (err) => {

            if (err) return res.status(500).json(err);

            res.json({ success: true });
        });

    });

});

//ACTUAIZAR PERMISOS
app.post('/actualizar-permisos', (req, res) => {

    const { usuario_id, permisos } = req.body;

    // Eliminar permisos actuales
    pool.query('DELETE FROM usuario_modulos WHERE usuario_id = ?', [usuario_id], (err) => {

        if(err){
            console.error("Error eliminando permisos:", err);
            return res.status(500).json(err);
        }

        // Si no hay permisos, terminar
        if(!permisos || permisos.length === 0){
            return res.json({ success: true });
        }

        // Insertar usando nombres
        const sql = `
            INSERT INTO usuario_modulos (usuario_id, modulo_id)
            SELECT ?, id FROM modulos WHERE nombre IN (?)
        `;

        pool.query(sql, [usuario_id, permisos], (err2) => {

            if(err2){
                console.error("Error insertando permisos:", err2);
                return res.status(500).json(err2);
            }

            res.json({ success: true });
        });

    });

});

// MOSTRAR PRODUCTOS
app.get('/productos', (req, res) => {

    pool.query('SELECT * FROM productos', (err, results) => {

        if (err) {
            console.error("Error en GET:", err);
            return res.status(500).json(err);
        }

        res.json(results);
    });

});

// CREAR PRODUCTO
app.post('/productos', (req, res) => {
    console.log(req.body);

    const { codigo, descripcion, categoria, precio, costo, fecha } = req.body;

    const sql = `
        INSERT INTO productos (codigo, descripcion, categoria, precio, costo, fecha)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    pool.query(sql, [codigo, descripcion, categoria, precio, costo, fecha], (err) => {

        if (err) {
            console.error("Error en POST:", err);
            return res.status(500).json(err);
        }

        res.json({ success: true });
    });

});

// ELIMINAR PRODUCTO
app.delete('/productos/:id', (req, res) => {

    const { id } = req.params;

    pool.query('DELETE FROM productos WHERE id = ?', [id], (err) => {

        if (err) {
            console.error("Error en DELETE:", err);
            return res.status(500).json(err);
        }

        res.json({ success: true });
    });

});

// VENTAS
app.post('/ventas', (req, res) => {

    const { venta, detalle } = req.body;

    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');

    const prefijo = `${anio}${mes}VENTA`;

    // 🔥 BUSCAR ÚLTIMO ID
    const sqlUltimo = `
        SELECT id FROM ventas 
        WHERE id LIKE '${prefijo}%'
        ORDER BY id DESC 
        LIMIT 1
    `;

    pool.query(sqlUltimo, (err, result) => {

        if (err) return res.status(500).json(err);

        let consecutivo = 1;

        if (result.length > 0) {
            let ultimoId = result[0].id;
            let num = parseInt(ultimoId.slice(-2));
            consecutivo = num + 1;
        }

        const nuevoId = `${prefijo}${String(consecutivo).padStart(2, '0')}`;

        // INSERTAR VENTA
        const sqlVenta = `
            INSERT INTO ventas (
                id, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
                tipo_documento, numero_documento, correo, direccion, telefono, fecha, total
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        pool.query(sqlVenta, [
            nuevoId,
            venta.primerNombre,
            venta.segundoNombre,
            venta.primerApellido,
            venta.segundoApellido,
            venta.tipoDocumento,
            venta.numeroDocumento,
            venta.correo,
            venta.direccion,
            venta.telefono,
            venta.fecha,
            venta.total
        ], (err2) => {

            if (err2) return res.status(500).json(err2);

            // DETALLE
            const sqlDetalle = `
                INSERT INTO detalle_ventas 
                (venta_id, producto_id, cantidad, precio, costo, subtotal)
                VALUES ?
                `;

            const valores = detalle.map(item => [
                nuevoId,
                item.producto_id,
                item.cantidad,
                item.precio,
                item.costo,
                item.subtotal
            ]);
            console.log("Entrando a detalle de venta");
            console.log("Detalle insertado correctamente");
            pool.query(sqlDetalle, [valores], (err3) => {

    if (err3) return res.status(500).json(err3);

    // 🔥 CALCULAR COSTO TOTAL
    const costoTotal = detalle.reduce((acc, item) => {
        return acc + (item.costo * item.cantidad);
    }, 0);
    console.log("DETALLE:", detalle);
    console.log("COSTO TOTAL:", costoTotal);

    // 🔥 GENERAR EGRESO AUTOMÁTICO
    const fechaActual = venta.fecha;

    const f = new Date(fechaActual);
    const anio = f.getFullYear();
    const mes = String(f.getMonth() + 1).padStart(2, '0');

    const prefijo = `${anio}${mes}COS`;

    const sqlUltimoEgreso = `
    SELECT id FROM egresos 
    WHERE id LIKE '${prefijo}%'
    ORDER BY id DESC LIMIT 1
`;

    pool.query(sqlUltimoEgreso, (err4, result) => {

        if (err4) return res.status(500).json(err4);

        let consecutivo = 1;

        if (result.length > 0) {
            let ultimo = result[0].id;
            let num = parseInt(ultimo.slice(-2));
            consecutivo = num + 1;
        }

        const nuevoIdEgreso = `${prefijo}${String(consecutivo).padStart(2, '0')}`;

        const sqlEgreso = `
            INSERT INTO egresos (id, categoria, fecha, monto)
            VALUES (?, ?, ?, ?)
        `;

        pool.query(sqlEgreso, [
            nuevoIdEgreso,
            "Compras",
            fechaActual,
            costoTotal
        ], (err5) => {

            if (err5) return res.status(500).json(err5);

            // ✅ RESPUESTA FINAL AQUÍ
            console.log("✅ EGRESO GENERADO:", nuevoIdEgreso);
            res.json({ success: true, id: nuevoId });


        });

    });

});

        });

    });

});

//HISTORIAL
app.get('/ventas', (req, res) => {

    const sql = `
        SELECT 
            id,
            CONCAT(primer_nombre, ' ', primer_apellido) AS cliente,
            fecha,
            total
        FROM ventas
        ORDER BY fecha DESC
    `;

    pool.query(sql, (err, results) => {

        if (err) return res.status(500).json(err);

        res.json(results);
    });

});

app.get('/ventas/:id', (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT 
            v.*,
            p.descripcion,
            d.cantidad,
            d.precio,
            d.subtotal
        FROM ventas v
        JOIN detalle_ventas d ON v.id = d.venta_id
        JOIN productos p ON d.producto_id = p.id
        WHERE v.id = ?
    `;

    pool.query(sql, [id], (err, results) => {

        if (err) return res.status(500).json(err);

        res.json(results);
    });

});

//INGRESOS
app.get('/ventas-disponibles', (req, res) => {

    const sql = `
    SELECT 
        v.id, 
        v.total,
        IFNULL(SUM(d.costo * d.cantidad), 0) AS costo_total,
        (v.total - IFNULL(SUM(d.costo * d.cantidad), 0)) AS ganancia
    FROM ventas v
    LEFT JOIN detalle_ventas d ON v.id = d.venta_id
    LEFT JOIN ingresos i ON v.id = i.venta_id
    WHERE i.venta_id IS NULL
    GROUP BY v.id
    `;

    pool.query(sql, (err, results) => {

        if (err) return res.status(500).json(err);

        res.json(results);
    });

});

//ingreso con ID automatico
app.post('/ingresos', (req, res) => {

    const { venta_id, fecha, monto } = req.body;

    const f = new Date(fecha);
    const anio = f.getFullYear();
    const mes = String(f.getMonth() + 1).padStart(2, '0');

    const prefijo = `${anio}${mes}ING`;

    const sqlUltimo = `
        SELECT id FROM ingresos 
        WHERE id LIKE '${prefijo}%'
        ORDER BY id DESC LIMIT 1
    `;

    pool.query(sqlUltimo, (err, result) => {

        if (err) return res.status(500).json(err);

        let consecutivo = 1;

        if (result.length > 0) {
            let ultimo = result[0].id;
            let num = parseInt(ultimo.slice(-2));
            consecutivo = num + 1;
        }

        const nuevoId = `${prefijo}${String(consecutivo).padStart(2, '0')}`;

        const sqlInsert = `
            INSERT INTO ingresos (id, venta_id, fecha, monto)
            VALUES (?, ?, ?, ?)
        `;

        pool.query(sqlInsert, [nuevoId, venta_id, fecha, monto], (err2) => {

            if (err2) return res.status(500).json(err2);

            res.json({ success: true, id: nuevoId });
        });

    });

});

//historial de ingresos
app.get('/ingresos', (req, res) => {

    const sql = `
        SELECT i.id, i.venta_id, i.fecha, i.monto
        FROM ingresos i
        ORDER BY i.fecha DESC
    `;

    pool.query(sql, (err, results) => {

        if (err) return res.status(500).json(err);

        res.json(results);
    });

});

//EGRESOS
app.post('/egresos', (req, res) => {

    const { categoria, fecha, monto } = req.body;

    const f = new Date(fecha);
    const anio = f.getFullYear();
    const mes = String(f.getMonth() + 1).padStart(2, '0');

    // 🔥 CODIGO CATEGORIA
    const codigos = {
        "Nomina": "NOM",
        "Servicios": "SRV",
        "Mantenimiento": "MNT",
        "Compras": "COM",
        "Impuestos": "IMP"
    };

    const codigo = codigos[categoria] || "GEN";

    const prefijo = `${anio}${mes}${codigo}`;

    const sqlUltimo = `
        SELECT id FROM egresos 
        WHERE id LIKE '${prefijo}%'
        ORDER BY id DESC LIMIT 1
    `;

    pool.query(sqlUltimo, (err, result) => {

        if (err) return res.status(500).json(err);

        let consecutivo = 1;

        if (result.length > 0) {
            let ultimo = result[0].id;
            let num = parseInt(ultimo.slice(-2));
            consecutivo = num + 1;
        }

        const nuevoId = `${prefijo}${String(consecutivo).padStart(2, '0')}`;

        const sqlInsert = `
            INSERT INTO egresos (id, categoria, fecha, monto)
            VALUES (?, ?, ?, ?)
        `;

        pool.query(sqlInsert, [nuevoId, categoria, fecha, monto], (err2) => {

            if (err2) return res.status(500).json(err2);

            res.json({ success: true, id: nuevoId });
        });

    });

});

//historial de egresos
app.get('/egresos', (req, res) => {

    const sql = `
        SELECT * FROM egresos
        ORDER BY fecha DESC
    `;

    pool.query(sql, (err, results) => {

        if (err) return res.status(500).json(err);

        res.json(results);
    });

});

//REPORTES
app.get('/reporte', (req, res) => {

    const { mes, inicio, fin } = req.query;

    const sql = `
        SELECT 
            'Ingreso' AS tipo,
            i.id,
            i.fecha,
            v.primer_nombre,
            v.segundo_nombre,
            v.primer_apellido,
            v.segundo_apellido,
            v.numero_documento,
            v.correo,
            'Venta' AS categoria,
            i.monto
        FROM ingresos i
        JOIN ventas v ON i.venta_id = v.id
        WHERE MONTH(i.fecha) = ? AND DAY(i.fecha) BETWEEN ? AND ?

        UNION ALL

        SELECT 
            'Egreso' AS tipo,
            e.id,
            e.fecha,
            'NA','NA','NA','NA',
            'NA','NA',
            e.categoria,
            e.monto
        FROM egresos e
        WHERE MONTH(e.fecha) = ? AND DAY(e.fecha) BETWEEN ? AND ?

        ORDER BY fecha ASC
    `;

    pool.query(sql, [mes, inicio, fin, mes, inicio, fin], (err, results) => {

        if (err) return res.status(500).json(err);

        res.json(results);
    });

});

//INDEX

app.get('/dashboard', (req, res) => {

    const hoy = new Date();
    const mes = hoy.getMonth() + 1;
    const anio = hoy.getFullYear();

    const sql = `
        SELECT 
            'ingreso' as tipo,
            fecha,
            monto
        FROM ingresos
        WHERE MONTH(fecha) = ? AND YEAR(fecha) = ?

        UNION ALL

        SELECT 
            'egreso' as tipo,
            fecha,
            monto
        FROM egresos
        WHERE MONTH(fecha) = ? AND YEAR(fecha) = ?
    `;

    pool.query(sql, [mes, anio, mes, anio], (err, results) => {

        if (err) return res.status(500).json(err);

        res.json(results);
    });

});

const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
  res.send('API funcionando 🚀');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
