package com.mrqrcode.resource;

import com.mrqrcode.dto.AuthResponse;
import com.mrqrcode.dto.LoginRequest;
import com.mrqrcode.dto.RegisterRequest;
import com.mrqrcode.service.AuthService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

    @Inject
    AuthService authService;

    @POST
    @Path("/register")
    public Response register(@Valid RegisterRequest request) {
        AuthResponse auth = authService.register(request);
        return Response.status(Response.Status.CREATED).entity(auth).build();
    }

    @POST
    @Path("/login")
    public AuthResponse login(@Valid LoginRequest request) {
        return authService.login(request);
    }

    @GET
    @Path("/me")
    public AuthResponse me(@HeaderParam("Authorization") String authHeader) {
        var user = authService.validateToken(authHeader);
        return new AuthResponse(
            null, user.tenant.token, user.name, user.email,
            user.role.name(), user.tenant.businessName
        );
    }
}
