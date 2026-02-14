package com.mrqrcode.resource;

import com.mrqrcode.dto.PasswordResponse;
import com.mrqrcode.dto.QueueStatusResponse;
import com.mrqrcode.service.PasswordService;
import com.mrqrcode.service.QrCodeService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/password")
public class PasswordResource {

    @Inject
    PasswordService passwordService;

    @Inject
    QrCodeService qrCodeService;

    @POST
    @Path("/take")
    @Produces(MediaType.APPLICATION_JSON)
    public PasswordResponse takePassword(@QueryParam("token") String token) {
        if (token == null || token.isBlank()) {
            throw new BadRequestException("Token é obrigatório");
        }
        return passwordService.takePassword(token);
    }

    @POST
    @Path("/call-next")
    @Produces(MediaType.APPLICATION_JSON)
    public PasswordResponse callNext(@QueryParam("token") String token) {
        if (token == null || token.isBlank()) {
            throw new BadRequestException("Token é obrigatório");
        }
        return passwordService.callNext(token);
    }

    @GET
    @Path("/queue")
    @Produces(MediaType.APPLICATION_JSON)
    public QueueStatusResponse getQueue(@QueryParam("token") String token) {
        if (token == null || token.isBlank()) {
            throw new BadRequestException("Token é obrigatório");
        }
        return passwordService.getQueueStatus(token);
    }

    @POST
    @Path("/reset")
    @Produces(MediaType.APPLICATION_JSON)
    public Response resetQueue(@QueryParam("token") String token) {
        if (token == null || token.isBlank()) {
            throw new BadRequestException("Token é obrigatório");
        }
        passwordService.resetQueue(token);
        return Response.ok().entity("{\"message\":\"Fila resetada com sucesso\"}").build();
    }

    @GET
    @Path("/qrcode")
    @Produces("image/svg+xml")
    public String getQrCode(
        @QueryParam("token") String token,
        @QueryParam("baseUrl") @DefaultValue("https://www.mrqrcode.site") String baseUrl
    ) {
        if (token == null || token.isBlank()) {
            throw new BadRequestException("Token é obrigatório");
        }
        String url = baseUrl + "/" + token + "?autoTrigger=true";
        return qrCodeService.generateSvg(url);
    }
}
