package com.mrqrcode.dto;

import jakarta.validation.constraints.NotBlank;

public record TenantCreateRequest(
    @NotBlank(message = "Nome do estabelecimento é obrigatório")
    String businessName,
    String instagramUrl,
    String googleReviewUrl,
    String logoUrl,
    String backgroundUrl,
    Integer sessionTimeoutMinutes
) {}
