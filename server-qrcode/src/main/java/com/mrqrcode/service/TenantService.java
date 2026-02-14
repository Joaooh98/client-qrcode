package com.mrqrcode.service;

import com.mrqrcode.dto.TenantCreateRequest;
import com.mrqrcode.dto.TenantResponse;
import com.mrqrcode.entity.Tenant;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.BadRequestException;
import java.util.List;

@ApplicationScoped
public class TenantService {

    public TenantResponse getByToken(String token) {
        var tenant = Tenant.findActiveByToken(token)
            .orElseThrow(() -> new NotFoundException("Estabelecimento não encontrado"));
        return TenantResponse.from(tenant);
    }

    public List<TenantResponse> listAll() {
        List<Tenant> tenants = Tenant.find("active = true").list();
        return tenants.stream()
            .map(TenantResponse::from)
            .toList();
    }

    @Transactional
    public TenantResponse create(TenantCreateRequest request) {
        var tenant = new Tenant();
        tenant.businessName = request.businessName();
        tenant.instagramUrl = request.instagramUrl();
        tenant.googleReviewUrl = request.googleReviewUrl();
        tenant.logoUrl = request.logoUrl();
        tenant.backgroundUrl = request.backgroundUrl();
        tenant.sessionTimeoutMinutes = request.sessionTimeoutMinutes() != null
            ? request.sessionTimeoutMinutes()
            : 40;
        tenant.currentPassword = 0;
        tenant.currentServing = 0;

        tenant.persist();
        return TenantResponse.from(tenant);
    }

    @Transactional
    public TenantResponse update(String token, TenantCreateRequest request) {
        var tenant = Tenant.findActiveByToken(token)
            .orElseThrow(() -> new NotFoundException("Estabelecimento não encontrado"));

        tenant.businessName = request.businessName();
        if (request.instagramUrl() != null) tenant.instagramUrl = request.instagramUrl();
        if (request.googleReviewUrl() != null) tenant.googleReviewUrl = request.googleReviewUrl();
        if (request.logoUrl() != null) tenant.logoUrl = request.logoUrl();
        if (request.backgroundUrl() != null) tenant.backgroundUrl = request.backgroundUrl();
        if (request.sessionTimeoutMinutes() != null) {
            tenant.sessionTimeoutMinutes = request.sessionTimeoutMinutes();
        }

        tenant.persist();
        return TenantResponse.from(tenant);
    }

    @Transactional
    public void deactivate(String token) {
        var tenant = Tenant.findActiveByToken(token)
            .orElseThrow(() -> new NotFoundException("Estabelecimento não encontrado"));

        tenant.active = false;
        tenant.persist();
    }
}
