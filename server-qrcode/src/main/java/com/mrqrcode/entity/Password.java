package com.mrqrcode.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "passwords")
public class Password extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "password_number", nullable = false)
    public int passwordNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    public Tenant tenant;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public PasswordStatus status = PasswordStatus.WAITING;

    @Column(name = "created_at", nullable = false, updatable = false)
    public LocalDateTime createdAt;

    @Column(name = "called_at")
    public LocalDateTime calledAt;

    @Column(name = "completed_at")
    public LocalDateTime completedAt;

    @PrePersist
    void onPersist() {
        createdAt = LocalDateTime.now();
    }

    public enum PasswordStatus {
        WAITING, CALLED, COMPLETED, CANCELLED
    }

    public static List<Password> findByTenantToday(Tenant tenant) {
        return find(
            "tenant = ?1 and createdAt >= ?2 order by passwordNumber asc",
            tenant,
            LocalDateTime.now().toLocalDate().atStartOfDay()
        ).list();
    }

    public static List<Password> findWaitingByTenant(Tenant tenant) {
        return find(
            "tenant = ?1 and status = ?2 and createdAt >= ?3 order by passwordNumber asc",
            tenant,
            PasswordStatus.WAITING,
            LocalDateTime.now().toLocalDate().atStartOfDay()
        ).list();
    }

    public static long countWaitingByTenant(Tenant tenant) {
        return count(
            "tenant = ?1 and status = ?2 and createdAt >= ?3",
            tenant,
            PasswordStatus.WAITING,
            LocalDateTime.now().toLocalDate().atStartOfDay()
        );
    }
}
