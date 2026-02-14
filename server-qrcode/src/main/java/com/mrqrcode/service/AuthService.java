package com.mrqrcode.service;

import com.mrqrcode.dto.AuthResponse;
import com.mrqrcode.dto.LoginRequest;
import com.mrqrcode.dto.RegisterRequest;
import com.mrqrcode.entity.Tenant;
import com.mrqrcode.entity.User;
import com.mrqrcode.entity.User.UserRole;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotAuthorizedException;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;

@ApplicationScoped
public class AuthService {

    private static final String JWT_SECRET = System.getenv("JWT_SECRET") != null
        ? System.getenv("JWT_SECRET")
        : "mr-qrcode-secret-key-change-in-production-2024";
    private static final long TOKEN_EXPIRATION_HOURS = 24;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (User.findByEmail(request.email()).isPresent()) {
            throw new BadRequestException("Email já cadastrado");
        }

        var tenant = new Tenant();
        tenant.businessName = request.businessName();
        tenant.instagramUrl = request.instagramUrl();
        tenant.googleReviewUrl = request.googleReviewUrl();
        tenant.sessionTimeoutMinutes = request.sessionTimeoutMinutes() != null
            ? request.sessionTimeoutMinutes() : 40;
        tenant.currentPassword = 0;
        tenant.currentServing = 0;
        tenant.persist();

        var user = new User();
        user.name = request.name();
        user.email = request.email();
        user.passwordHash = hashPassword(request.password());
        user.role = UserRole.ADMIN;
        user.tenant = tenant;
        user.persist();

        String jwt = generateToken(user);
        return new AuthResponse(jwt, tenant.token, user.name, user.email,
            user.role.name(), tenant.businessName);
    }

    public AuthResponse login(LoginRequest request) {
        var user = User.findActiveByEmail(request.email())
            .orElseThrow(() -> new NotAuthorizedException("Email ou senha incorretos"));

        if (!verifyPassword(request.password(), user.passwordHash)) {
            throw new NotAuthorizedException("Email ou senha incorretos");
        }

        String jwt = generateToken(user);
        return new AuthResponse(jwt, user.tenant.token, user.name, user.email,
            user.role.name(), user.tenant.businessName);
    }

    public User validateToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new NotAuthorizedException("Token não fornecido");
        }

        String token = authHeader.substring(7);
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new NotAuthorizedException("Token inválido");
        }

        String headerPayload = parts[0] + "." + parts[1];
        String expectedSignature = hmacSha256(headerPayload);
        if (!parts[2].equals(expectedSignature)) {
            throw new NotAuthorizedException("Token inválido");
        }

        String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
        long exp = extractLongFromJson(payloadJson, "exp");
        if (Instant.now().getEpochSecond() > exp) {
            throw new NotAuthorizedException("Token expirado");
        }

        long userId = extractLongFromJson(payloadJson, "sub");
        return User.<User>findByIdOptional(userId)
            .orElseThrow(() -> new NotAuthorizedException("Usuário não encontrado"));
    }

    private String generateToken(User user) {
        String header = Base64.getUrlEncoder().withoutPadding()
            .encodeToString("{\"alg\":\"HS256\",\"typ\":\"JWT\"}".getBytes(StandardCharsets.UTF_8));

        long exp = Instant.now().plusSeconds(TOKEN_EXPIRATION_HOURS * 3600).getEpochSecond();
        String payloadJson = "{\"sub\":%d,\"email\":\"%s\",\"role\":\"%s\",\"tenant\":\"%s\",\"exp\":%d}"
            .formatted(user.id, user.email, user.role.name(), user.tenant.token, exp);

        String payload = Base64.getUrlEncoder().withoutPadding()
            .encodeToString(payloadJson.getBytes(StandardCharsets.UTF_8));

        String signature = hmacSha256(header + "." + payload);
        return header + "." + payload + "." + signature;
    }

    private String hmacSha256(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(JWT_SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar HMAC", e);
        }
    }

    private String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest((password + JWT_SECRET).getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao fazer hash da senha", e);
        }
    }

    private boolean verifyPassword(String password, String hash) {
        return hashPassword(password).equals(hash);
    }

    private long extractLongFromJson(String json, String key) {
        String search = "\"" + key + "\":";
        int start = json.indexOf(search) + search.length();
        int end = json.indexOf(',', start);
        if (end == -1) end = json.indexOf('}', start);
        return Long.parseLong(json.substring(start, end).trim());
    }
}
