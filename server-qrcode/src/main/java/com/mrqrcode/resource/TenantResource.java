package com.mrqrcode.resource;

import com.mrqrcode.dto.TenantCreateRequest;
import com.mrqrcode.dto.TenantResponse;
import com.mrqrcode.service.TenantService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/tenants")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TenantResource {

    @Inject
    TenantService tenantService;

    @GET
    public List<TenantResponse> listAll() {
        return tenantService.listAll();
    }

    @GET
    @Path("/{token}")
    public TenantResponse getByToken(@PathParam("token") String token) {
        return tenantService.getByToken(token);
    }

    @POST
    public Response create(@Valid TenantCreateRequest request) {
        var tenant = tenantService.create(request);
        return Response.status(Response.Status.CREATED).entity(tenant).build();
    }

    @PUT
    @Path("/{token}")
    public TenantResponse update(
        @PathParam("token") String token,
        @Valid TenantCreateRequest request
    ) {
        return tenantService.update(token, request);
    }

    @DELETE
    @Path("/{token}")
    public Response deactivate(@PathParam("token") String token) {
        tenantService.deactivate(token);
        return Response.noContent().build();
    }
}
