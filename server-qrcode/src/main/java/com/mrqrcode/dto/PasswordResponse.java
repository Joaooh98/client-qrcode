package com.mrqrcode.dto;

public record PasswordResponse(
    int password,
    long waitingCount,
    String message
) {
    public static PasswordResponse of(int password, long waitingCount) {
        return new PasswordResponse(password, waitingCount, "Senha gerada com sucesso");
    }
}
