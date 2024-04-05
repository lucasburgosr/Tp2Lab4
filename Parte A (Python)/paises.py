import requests
import pymysql

# Establecer la conexión a la base de datos MySQL
conexion = pymysql.connect(
    host="localhost",
    user="root",
    password="root",
    database="tp2",
)
cursor = conexion.cursor()

for codigo in range(1, 301):
    url = f"https://restcountries.com/v2/callingcode/{codigo}"
    response = requests.get(url)
    
    if response.status_code == 200:
        datos_json = response.json()
        
        if datos_json:  # Verificar si hay datos
            pais = datos_json[0]
            nombre_pais = pais.get("name")
            capital_pais = pais.get("capital")
            region = pais.get("region")
            poblacion = pais.get("population")
            latitud = pais.get("latlng")[0] if "latlng" in pais else None
            longitud = pais.get("latlng")[1] if "latlng" in pais else None
            codigo_pais = pais.get("callingCodes")[0] if "callingCodes" in pais and pais.get("callingCodes") else None

            if capital_pais is None:
                # Asignar un valor predeterminado o saltar la inserción
                continue

            cursor.execute("SELECT * FROM Pais WHERE codigoPais = %s", (codigo_pais,))
            pais_existente = cursor.fetchone()

            if pais_existente:
                cursor.execute("UPDATE Pais SET nombrePais = %s, capitalPais = %s, region = %s, poblacion = %s, latitud = %s, longitud = %s WHERE codigoPais = %s",
                               (nombre_pais, capital_pais, region, poblacion, latitud, longitud, codigo_pais))
            else:
                cursor.execute("INSERT INTO Pais (codigoPais, nombrePais, capitalPais, region, poblacion, latitud, longitud) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                               (codigo_pais, nombre_pais, capital_pais, region, poblacion, latitud, longitud))

            conexion.commit()
        else:
            print(f"No hay datos disponibles para el código {codigo}. Continuando con el siguiente código...")


# Cerrar conexión a la base de datos
cursor.close()
conexion.close()
