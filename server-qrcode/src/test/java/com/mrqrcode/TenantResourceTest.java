package com.mrqrcode;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;

@QuarkusTest
class TenantResourceTest {

    private static final String DEFAULT_TOKEN = "e8aaf53b-a549-423c-8349-f189f03d0b5c";

    @Test
    void listTenantsShouldReturnAtLeastOne() {
        given()
            .when()
            .get("/tenants")
            .then()
            .statusCode(200)
            .body("size()", is(2));
    }

    @Test
    void getTenantByTokenShouldReturnDetails() {
        given()
            .when()
            .get("/tenants/" + DEFAULT_TOKEN)
            .then()
            .statusCode(200)
            .body("businessName", is("MR Barbearia"))
            .body("token", is(DEFAULT_TOKEN));
    }

    @Test
    void createTenantShouldReturn201() {
        given()
            .contentType("application/json")
            .body("""
                {
                    "businessName": "Nova Barbearia",
                    "instagramUrl": "https://instagram.com/nova",
                    "sessionTimeoutMinutes": 30
                }
            """)
            .when()
            .post("/tenants")
            .then()
            .statusCode(201)
            .body("businessName", is("Nova Barbearia"))
            .body("token", notNullValue());
    }

    @Test
    void getTenantWithInvalidTokenShouldReturn404() {
        given()
            .when()
            .get("/tenants/invalid-token")
            .then()
            .statusCode(404);
    }
}
