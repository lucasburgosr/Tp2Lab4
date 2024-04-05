const { MongoClient } = require("mongodb");
const fetch = require("node-fetch");

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri, { useUnifiedTopology: true });

async function migrateData() {
  try {
    await client.connect();

    const db = client.db("paises_db");

    for (let codigo = 1; codigo <= 300; codigo++) {
      const url = `https://restcountries.com/v2/callingcode/${codigo}`;
      const response = await fetch(url);
      const countryDataList = await response.json();

      if (countryDataList.length > 0) {
        for (let countryData of countryDataList) {
          const nombrePais = countryData.name || null;
          const capitalPais = countryData.capital || null;
          const region = countryData.region || null;
          const poblacion = countryData.population || null;
          const latitud = countryData.latlng ? countryData.latlng[0] : null;
          const longitud = countryData.latlng ? countryData.latlng[1] : null;
          const codigoPais = countryData.callingCodes
            ? countryData.callingCodes[0]
            : null;

          const existingCountry = await db
            .collection("paises")
            .findOne({ codigoPais });

          if (existingCountry) {
            await db.collection("paises").updateOne(
              { codigoPais },
              {
                $set: {
                  nombrePais,
                  capitalPais,
                  region,
                  poblacion,
                  latitud,
                  longitud,
                },
              }
            );
          } else {
            await db.collection("paises").insertOne({
              codigoPais,
              nombrePais,
              capitalPais,
              region,
              poblacion,
              latitud,
              longitud,
            });
          }
        }
      }
    }

    console.log("Proceso de migración completado");
  } catch (error) {
    console.error("Error durante la migración de datos:", error);
  } finally {
    await client.close();
  }
}

//migrateData();

async function regionAmerica() {
  try {
    await client.connect();
    const db = client.db("paises_db");

    const paisesEnAmerica = await db
      .collection("paises")
      .find({ region: "Americas" })
      .toArray();

    console.log("Países en la región Americas:");
    console.log(paisesEnAmerica);
  } catch (error) {
    console.error("Error al seleccionar países por región:", error);
  } finally {
    await client.close();
  }
}

//regionAmerica();

async function americaMax(region, populationThreshold) {
  try {
    await client.connect();

    const db = client.db("paises_db");
    const collection = db.collection("paises");

    const paisesEnAmerica = await db
      .collection("paises")
      .find({ region: "Americas" })
      .toArray();

    const query = { region: region, poblacion: { $gt: populationThreshold } };

    console.log(
      "Países en la región",
      region,
      "con población mayor a",
      populationThreshold,
      ":"
    );

    result = await collection.find(query).toArray();

    console.log(
      "Países en la región",
      region,
      "con población mayor a",
      populationThreshold,
      ":",
      result
    );
  } catch (error) {
    console.error("Error al buscar países por región y población:", error);
  } finally {
    await client.close();
  }
}

//americaMax('Americas', 10000000);

async function sinAfrica() {
  try {
    await client.connect();

    const db = client.db("paises_db");
    const collection = db.collection("paises");

    const query = { region: { $ne: "Africa" } };
    const result = await collection.find(query).toArray();

    console.log("Países cuya región no es Africa:");
    console.log(result);

    return result;
  } catch (error) {
    console.error("Error al seleccionar países por región:", error);
  } finally {
    await client.close();
  }
}

//sinAfrica();
async function ActualizarEgipto() {
  try {
    await client.connect();

    const db = client.db("paises_db");
    const collection = db.collection("paises");

    const filter = { nombrePais: "Egypt" };

    const updateDoc = {
      $set: {
        nombrePais: "Egipto",
        poblacion: 95000000,
      },
    };

    const result = await collection.updateOne(filter, updateDoc);

    console.log("Resultado:");
    console.log(result);

    const updatedDocument = await collection.findOne({ nombrePais: "Egipto" });
    console.log("Documento actualizado:");
    console.log(updatedDocument);

    return updatedDocument;
  } catch (error) {
    console.error("Error al actualizar el país y mostrar el cambio:", error);
  } finally {
    await client.close();
  }
}

//ActualizarEgipto();
async function Eliminar258(code) {
  try {
    await client.connect();

    const db = client.db("paises_db");
    const collection = db.collection("paises");

    const filter = { codigoPais: code };
    console.log(filter);
    const result = await collection.deleteOne(filter);

    console.log("Resultado de la eliminación:");
    console.log(result);

    return result;
  } catch (error) {
    console.error("Error al eliminar el país:", error);
  } finally {
    await client.close();
  }
}

//Eliminar258("258");

//5.6
//Cuando el método drop() se aplica a una colección en MongoDB, se borra por completo esa colección y todos sus documentos, junto con cualquier índice o configuración relacionada.
//Por otro lado, al ejecutar el método drop() en una base de datos en MongoDB, se elimina la base de datos completa, incluidas todas las colecciones, índices y configuraciones asociadas.
//Tanto en bases de datos como en colecciones, esta operación es irreversible y eliminará todos los datos de manera permanente.

async function poblacionDist() {
  try {
    await client.connect();

    const db = client.db("paises_db");
    const collection = db.collection("paises");

    const query = { poblacion: { $gt: 50000000, $lt: 150000000 } };

    const result = await collection.find(query).toArray();

    console.log("Países con población entre 50,000,000 y 150,000,000:");
    console.log(result);

    return result;
  } catch (error) {
    console.error("Error al seleccionar países por población:", error);
  } finally {
    await client.close();
  }
}

//poblacionDist();

async function nombreAscendente() {
  try {
    await client.connect();

    const db = client.db("paises_db");
    const collection = db.collection("paises");

    const query = {};
    const options = { sort: { nombrePais: 1 } };

    const result = await collection.find(query, options).toArray();

    console.log("Países ordenados por nombre de forma ascendente:");
    console.log(result);

    return result;
  } catch (error) {
    console.error("Error al seleccionar y ordenar países por nombre:", error);
  } finally {
    await client.close();
  }
}
//nombreAscendente();

//El método skip() en MongoDB se emplea para descartar un número específico de documentos en una colección y obtener los documentos restantes a partir de ese punto.
//Por ejemplo, si tenemos una colección de países y deseamos obtener los países ordenados por nombre, pero sin incluir los primeros 5 países, podemos utilizar skip(5) para lograrlo.
async function skip() {
  try {
    await client.connect();

    const db = client.db("paises_db");
    const collection = db.collection("paises");

    const query = {};
    const options = { skip: 5 };
    const result = await collection.find(query, options).toArray();

    console.log("Países sin los primeros 5:");
    console.log(result);

    return result;
  } catch (error) {
    console.error("Error al omitir países:", error);
  } finally {
    await client.close();
  }
}

//skip();

//5.10
//En MongoDB, las expresiones regulares se emplean para buscar patrones en los datos, de manera similar al uso de LIKE en SQL.
//Por ejemplo, para buscar todos los países que contienen la palabra "Republic" en su nombre, utilizaríamos una expresión regular /Republic/ en MongoDB. En SQL, sería similar al uso de LIKE '%Republic%' para lograr el mismo resultado..
//Las expresiones regulares en MongoDB ofrecen más flexibilidad y potencia para realizar búsquedas complejas.

async function createIndex() {
  try {
    await client.connect();

    const db = client.db("paises_db");
    const collection = db.collection("paises");

    await collection.createIndex(
      { codigoPais: 1 },
      { name: "codigoPais_index" }
    );

    console.log("Índice creado correctamente.");
  } catch (error) {
    console.error("Error al crear el índice:", error);
  } finally {
    await client.close();
  }
}

//createIndex();

//5.12
//Para hacer un backup de la base de datos países_db, podemos utilizar el comando mongodump desde la línea de comandos. Por ejemplo:
//mongodump --db países_db --out /ruta/del/respaldo
