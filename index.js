const express = require('express');
const {connectToMongoDB, disconnectFromMongoDB} = require('./src/mongodb');
const { json } = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res, next) => {
    res.header("Content-Type", "application/json; charset=utf-8");
    next();
});

app.get('/',(req,res)=>{
    res.status(200).end('¡Bienvenidos a la API del Segundo trabajo integrador! | Racca Valentin |');
});

app.get('/computacion', async (req, res) => {
    const client = await connectToMongoDB();
    if (!client) {
        res.status(500).send('Error al conectarse con MongoDB');
        return;
    };
    const collection = client.db('computacion').collection('computacion');
    const computacion = await collection.find().toArray();
    await disconnectFromMongoDB();
    res.status(200).json(computacion);
});

app.get('/computacion/codigo/:codigo', async (req, res) => {
    const productCode = parseInt(req.params.codigo) || 0;
    const client = await connectToMongoDB();
    if (!client) {
        return res.status(500).send('Error al conectarse con MongoDB');
    };

    const collection = client.db('computacion').collection('computacion');
    const producto = await collection.findOne({ codigo: productCode });

    await disconnectFromMongoDB();
    if (!producto) {
        return res.status(404).send('Producto no encontrado');
    };
    res.status(200).json(producto);
});

app.get('/computacion/nombre/:nombre', async (req, res) => {
    const productName = RegExp(req.params.nombre, 'i');
    const client = await connectToMongoDB();
    if (!client) {
        return res.status(500).send('Error al conectarse con MongoDB');
    };

    const collection = client.db('computacion').collection('computacion');
    const productos = await collection.find({ nombre: productName }).toArray();

    await disconnectFromMongoDB();
    if (productos.length > 0) {
        res.status(200).json(productos);
    } else {
        res.status(404).send('No se encontro ningun producto');
    }
});

app.get('/computacion/categoria/:categoria', async (req, res) => {
    const categoria = RegExp(req.params.categoria, 'i');
    const client = await connectToMongoDB();
    if (!client) {
        return res.status(500).send('Error al conectarse con MongoDB');
    };
    const collection = client.db('computacion').collection('computacion');
    const productos = await collection.find({categoria: categoria}).toArray();

    await disconnectFromMongoDB();
    if (productos.length > 0){
        res.status(200).json(productos);
    } else {
        res.status(404).send('No se econtraron productos de dicha categoria');
    }
});

app.post('/computacion', async (req, res) => {
    const nuevoProducto = req.body;
    if (nuevoProducto === undefined){
        return res.status(400).send('Error en el formato de los datos');
    };

    const client = await connectToMongoDB();
    if (!client) {
        return res.status(500).send('Error al conectrse a la Base de Datos');
    };

    try {
        const collection = client.db('computacion').collection('computacion');
        await collection.insertOne(nuevoProducto);
        console.log('Nuevo producto creado');
        res.status(201).send(nuevoProducto);
    } catch (error){
        console.error(error);
        res.status(500).send('Error al intentar agregar un nuevo producto');
    } finally {
        await disconnectFromMongoDB();
    };
});

app.patch('/computacion/codigo/:codigo', async (req, res) => {
    const productCode = parseInt(req.params.codigo) || 0;
    const nuevoPrecio = req.body.precio;
    if (!nuevoPrecio) {
        return res.status(400).send('Error en el formato de los datos');
    };

    const client = await connectToMongoDB();
    if (!client) {
        return res.status(500).send('Error al conectarse con MongoDB');
    };

    try {
        const collection = client.db('computacion').collection('computacion');
        await collection.updateOne({ codigo: productCode }, {$set: {precio: nuevoPrecio}});
        console.log('Producto modificado')
        res.status(200).send({codigo: productCode, precio: nuevoPrecio});
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al modificar el producto');
    } finally {
        await disconnectFromMongoDB();
    };
});

app.delete('/computacion/codigo/:codigo', async (req, res) => {
    const productCode = parseInt(req.params.codigo) || 0;
    const client = await connectToMongoDB();
    if (!client) {
        return res.status(500).send('Error al conectarse con MongoDB');
    };

    try {
        const collection = client.db('computacion').collection('computacion');
        const resultado = await collection.deleteOne({ codigo: productCode });
        if (resultado.deletedCount === 0) {
            res.status(404).send('No se encontro ningun producto con el id seleccionado');
        } else {
            console.log('Producto eliminado');
            res.status(200).send('Producto eliminado correctamente');
        };
    } catch (error) {
        console.error(error);
        res.status(500).send('Se produjo un error al intental eliminar el producto');
    } finally {
        await disconnectFromMongoDB();
    };
});

app.get('*',(req,res)=>{
    res.status(404).send('Pagina no encontrada');
});

app.listen(PORT, ()=>{
    console.log(`Servidor funcionando en el puerto ${PORT}`);
});
