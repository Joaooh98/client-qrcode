package com.mrqrcode;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.TestMethodOrder;
import org.junit.jupiter.api.MethodOrderer;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;

@QuarkusTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class PasswordResourceTest {

    private static final String DEFAULT_TOKEN = "e8aaf53b-a549-423c-8349-f189f03d0b5c";

    @Test
    @Order(1)
    void takePasswordShouldReturnPassword() {
        given()
            .queryParam("token", DEFAULT_TOKEN)
            .when()
            .post("/password/take")
            .then()
            .statusCode(200)
            .body("password", is(1))
            .body("message", notNullValue());
    }

    @Test
    @Order(2)
    void takePasswordSecondTimeShouldIncrement() {
        given()
            .queryParam("token", DEFAULT_TOKEN)
            .when()
            .post("/password/take")
            .then()
            .statusCode(200)
            .body("password", is(2));
    }

    @Test
    @Order(3)
    void callNextShouldReturnFirstWaiting() {
        given()
            .queryParam("token", DEFAULT_TOKEN)
            .when()
            .post("/password/call-next")
            .then()
            .statusCode(200)
            .body("password", is(1));
    }

    @Test
    @Order(4)
    void getQueueShouldReturnStatus() {
        given()
            .queryParam("token", DEFAULT_TOKEN)
            .when()
            .get("/password/queue")
            .then()
            .statusCode(200)
            .body("currentServing", is(1))
            .body("waitingCount", is(1));
    }

    @Test
    @Order(5)
    void getQrCodeShouldReturnSvg() {
        given()
            .queryParam("token", DEFAULT_TOKEN)
            .when()
            .get("/password/qrcode")
            .then()
            .statusCode(200)
            .contentType("image/svg+xml")
            .body(containsString("<svg"));
    }

    @Test
    void takePasswordWithInvalidTokenShouldReturn404() {
        given()
            .queryParam("token", "invalid-token")
            .when()
            .post("/password/take")
            .then()
            .statusCode(404);
    }

    @Test
    void takePasswordWithoutTokenShouldReturn400() {
        given()
            .when()
            .post("/password/take")
            .then()
            .statusCode(400);
    }
}
