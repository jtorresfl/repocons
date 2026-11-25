package com.collectiverse.collectiverse.cu.report.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Datos que envía el cliente en este caso de uso. */
public record RequestReport(
        @NotNull(message = "La publicación es obligatoria")
        Integer idPublication,
        @NotBlank(message = "El motivo del reporte es obligatorio")
        @Size(max = 255, message = "El motivo no puede pasar de 255 caracteres")
        String reason,
        @NotBlank(message = "username es obligatorio")
        @Size(max = 50, message = "username no puede pasar de 50 caracteres")
        String username) {
}
