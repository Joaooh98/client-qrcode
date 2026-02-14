package com.mrqrcode.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Entity
@Table(name = "tenants")
public class Tenant extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(nullable = false, unique = true)
    public String token;

    @Column(name = "business_name", nullable = false)
    public String businessName;

    @Column(name = "instagram_url")
    public String instagramUrl;

    @Column(name = "google_review_url")
    public String googleReviewUrl;

    @Column(name = "logo_url")
    public String logoUrl;

    @Column(name = "background_url")
    public String backgroundUrl;

    @Column(name = "current_password", nullable = false)
    public int currentPassword;

    @Column(name = "current_serving")
    public int currentServing;

    @Column(name = "session_timeout_minutes", nullable = false)
    public int sessionTimeoutMinutes = 40;

    @Column(nullable = false)
    public boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    public LocalDateTime createdAt;

    @Column(name = "updated_at")
    public LocalDateTime updatedAt;

    @PrePersist
    void onPersist() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
        if (token == null) {
            token = UUID.randomUUID().toString();
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public static Optional<Tenant> findByToken(String token) {
        return find("token", token).firstResultOptional();
    }

    public static Optional<Tenant> findActiveByToken(String token) {
        return find("token = ?1 and active = true", token).firstResultOptional();
    }

    public int nextPassword() {
        currentPassword++;
        return currentPassword;
    }

    public void resetPasswords() {
        currentPassword = 0;
        currentServing = 0;
    }
}
