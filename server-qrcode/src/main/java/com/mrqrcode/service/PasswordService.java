package com.mrqrcode.service;

import com.mrqrcode.dto.PasswordResponse;
import com.mrqrcode.dto.QueueStatusResponse;
import com.mrqrcode.entity.Password;
import com.mrqrcode.entity.Password.PasswordStatus;
import com.mrqrcode.entity.Tenant;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.BadRequestException;
import java.time.LocalDateTime;

@ApplicationScoped
public class PasswordService {

    @Transactional
    public PasswordResponse takePassword(String token) {
        var tenant = findActiveTenant(token);

        int nextNumber = tenant.nextPassword();

        var password = new Password();
        password.passwordNumber = nextNumber;
        password.tenant = tenant;
        password.status = PasswordStatus.WAITING;
        password.persist();

        tenant.persist();

        long waiting = Password.countWaitingByTenant(tenant);
        return PasswordResponse.of(nextNumber, waiting);
    }

    @Transactional
    public PasswordResponse callNext(String token) {
        var tenant = findActiveTenant(token);

        var waitingList = Password.findWaitingByTenant(tenant);
        if (waitingList.isEmpty()) {
            throw new BadRequestException("Não há senhas na fila de espera");
        }

        var next = waitingList.getFirst();
        next.status = PasswordStatus.CALLED;
        next.calledAt = LocalDateTime.now();
        next.persist();

        tenant.currentServing = next.passwordNumber;
        tenant.persist();

        long remaining = Password.countWaitingByTenant(tenant);
        return new PasswordResponse(next.passwordNumber, remaining, "Próxima senha chamada");
    }

    public QueueStatusResponse getQueueStatus(String token) {
        var tenant = findActiveTenant(token);

        var waiting = Password.findWaitingByTenant(tenant);
        var waitingNumbers = waiting.stream()
            .map(p -> p.passwordNumber)
            .toList();

        return new QueueStatusResponse(
            tenant.currentServing,
            waitingNumbers.size(),
            waitingNumbers
        );
    }

    @Transactional
    public void resetQueue(String token) {
        var tenant = findActiveTenant(token);

        Password.update(
            "status = ?1 where tenant = ?2 and status = ?3 and createdAt >= ?4",
            PasswordStatus.CANCELLED,
            tenant,
            PasswordStatus.WAITING,
            LocalDateTime.now().toLocalDate().atStartOfDay()
        );

        tenant.resetPasswords();
        tenant.persist();
    }

    private Tenant findActiveTenant(String token) {
        return Tenant.findActiveByToken(token)
            .orElseThrow(() -> new NotFoundException("Estabelecimento não encontrado ou inativo"));
    }
}
