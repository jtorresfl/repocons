package com.collectiverse.collectiverse.cu.favorite.request;

import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/** Datos que envía el cliente en este caso de uso. */
public record RequestFavorite(
        @NotNull(message = "La publicación es obligatoria")
        Integer idPublication,
        @NotBlank(message = "username es obligatorio")
        @Size(max = 50, message = "username no puede pasar de 50 caracteres")
        String username) {
}
