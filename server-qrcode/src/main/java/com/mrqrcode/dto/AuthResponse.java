package com.mrqrcode.dto;

public record AuthResponse(
    String token,
    String tenantToken,
    String name,
    String email,
    String role,
    String businessName
) {}
