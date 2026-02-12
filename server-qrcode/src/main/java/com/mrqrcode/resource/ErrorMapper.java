package com.mrqrcode.resource;

import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.Logger;

@Provider
public class ErrorMapper implements ExceptionMapper<Exception> {

    private static final Logger LOG = Logger.getLogger(ErrorMapper.class);

    public record ErrorResponse(String error, int status) {}

    @Override
    public Response toResponse(Exception exception) {
        int status = 500;
        String message = "Erro interno do servidor";

        switch (exception) {
            case NotFoundException e -> {
                status = 404;
                message = e.getMessage();
            }
            case BadRequestException e -> {
                status = 400;
                message = e.getMessage();
            }
            case jakarta.validation.ConstraintViolationException e -> {
                status = 400;
                message = e.getConstraintViolations().stream()
                    .map(v -> v.getMessage())
                    .reduce((a, b) -> a + "; " + b)
                    .orElse("Dados inválidos");
            }
            default -> LOG.error("Erro não tratado", exception);
        }

        return Response.status(status)
            .entity(new ErrorResponse(message, status))
            .build();
    }
}
