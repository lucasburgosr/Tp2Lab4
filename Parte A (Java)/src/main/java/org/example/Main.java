package org.example;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.sql.*;

public class Main {
    public static void main(String[] args) {

        //TP2 - PARTE A - Acceso a datos JSON y migración de la información

        //Credenciales de conexión con la base de datos
        String url = "jdbc:mysql://localhost:3306/tp2";
        String user = "root";
        String password = "root";

        for (int codigo = 0; codigo < 300; codigo++) {
            try {
                String apiUrl = "https://restcountries.com/v2/callingcode/" + codigo;

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(apiUrl))
                        .build();

                // Realizar la solicitud HTTP y obtener la respuesta
                HttpClient client = HttpClient.newHttpClient();
                HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

                // Verificar el código de estado de la respuesta
                if (response.statusCode() == 200) {

                    String responseBody = response.body();
                    JSONArray jsonArray = new JSONArray(responseBody);

                    // Extraer la información del JSON
                    JSONObject json = jsonArray.getJSONObject(0);
                    String nombrePais = json.getString("name");
                    String capital = json.optString("capital", null);
                    String region = json.optString("region", null);
                    int poblacion = json.optInt("population", 0);
                    double latitud = json.getJSONArray("latlng").optDouble(0, 0);
                    double longitud = json.getJSONArray("latlng").optDouble(1, 0);
                    JSONArray callingCodesArray = json.getJSONArray("callingCodes");
                    String codigoPais = callingCodesArray.getString(0);

                    // Conexión a la base de datos
                    try (Connection connection = DriverManager.getConnection(url, user, password)) {
                        // Buscar país en la base de datos filtrando por código de país
                        String query = "SELECT * FROM pais WHERE codigoPais = ?";
                        try (PreparedStatement preparedStatement = connection.prepareStatement(query)) {
                            preparedStatement.setString(1, codigoPais);
                            try (ResultSet resultSet = preparedStatement.executeQuery()) {
                                if (resultSet.next()) {
                                    // Si el país existe, ejecutar un update en la tabla país
                                    query = "UPDATE pais SET nombrePais = ?, capitalPais = ?, region = ?, poblacion = ?, latitud = ?, longitud = ? WHERE codigoPais = ?";
                                    try (PreparedStatement updateStatement = connection.prepareStatement(query)) {
                                        updateStatement.setString(1, nombrePais);
                                        updateStatement.setString(2, capital);
                                        updateStatement.setString(3, region);
                                        updateStatement.setInt(4, poblacion);
                                        updateStatement.setDouble(5, latitud);
                                        updateStatement.setDouble(6, longitud);
                                        updateStatement.setString(7, codigoPais);
                                        updateStatement.executeUpdate();
                                    }
                                } else {
                                    // Si el país no existe, ejecutar un insert en la tabla país
                                    query = "INSERT INTO pais(nombrePais, capitalPais, region, poblacion, latitud, longitud, codigoPais) VALUES (?, ?, ?, ?, ?, ?, ?)";
                                    try (PreparedStatement insertStatement = connection.prepareStatement(query)) {
                                        insertStatement.setString(1, nombrePais);
                                        insertStatement.setString(2, capital);
                                        insertStatement.setString(3, region);
                                        insertStatement.setInt(4, poblacion);
                                        insertStatement.setDouble(5, latitud);
                                        insertStatement.setDouble(6, longitud);
                                        insertStatement.setString(7, codigoPais);
                                        insertStatement.executeUpdate();
                                    }
                                }
                            }
                        }
                    }
                    System.out.println("Datos del país " + nombrePais + " insertados o actualizados correctamente.");
                } else {
                    System.out.println("No se encontraron datos para el código de país " + codigo + ". Continuando con el siguiente.");
                }
            } catch (IOException | InterruptedException | SQLException e) {
                e.printStackTrace();
            }
        }
    }
}
