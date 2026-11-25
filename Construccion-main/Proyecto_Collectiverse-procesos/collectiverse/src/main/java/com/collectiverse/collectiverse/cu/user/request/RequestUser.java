package com.collectiverse.collectiverse.cu.user.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Datos que envía el cliente para registrarse. */
public record RequestUser(
        // max 50 porque las demás tablas guardan username en varchar(50)
        @NotBlank(message = "El nombre de usuario es obligatorio")
        @Size(max = 50, message = "El nombre de usuario no puede pasar de 50 caracteres")
        @Pattern(regexp = "^[A-Za-z0-9._-]+$", message = "El usuario solo admite letras, números, punto, guion y guion bajo")
        String username,
        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo no es válido")
        @Size(max = 150, message = "El correo no puede pasar de 150 caracteres")
        String email,
        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 8, max = 72, message = "La contraseña debe tener entre 8 y 72 caracteres")
        String password,
        @Pattern(regexp = "^\\+?[0-9]{7,15}$", message = "El teléfono debe tener entre 7 y 15 dígitos")
        String phone) { // opcional
}