package com.collectiverse.collectiverse.cu.user.response;

/** Lo que ve el cliente. Nunca incluye la contraseña. */
public record ResponseUser(String username, String email, String phone, Boolean enabled) {
}