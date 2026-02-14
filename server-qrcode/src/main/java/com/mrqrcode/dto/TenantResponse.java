package com.mrqrcode.dto;

import com.mrqrcode.entity.Tenant;

public record TenantResponse(
    String token,
    String businessName,
    String instagramUrl,
    String googleReviewUrl,
    String logoUrl,
    String backgroundUrl,
    int sessionTimeoutMinutes,
    int currentServing
) {
    public static TenantResponse from(Tenant tenant) {
        return new TenantResponse(
            tenant.token,
            tenant.businessName,
            tenant.instagramUrl,
            tenant.googleReviewUrl,
            tenant.logoUrl,
            tenant.backgroundUrl,
            tenant.sessionTimeoutMinutes,
            tenant.currentServing
        );
    }
}
