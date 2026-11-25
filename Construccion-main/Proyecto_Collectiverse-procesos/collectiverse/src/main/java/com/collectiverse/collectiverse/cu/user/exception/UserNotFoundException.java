package com.collectiverse.collectiverse.cu.user.exception;

import com.collectiverse.collectiverse.cu.shared.exception.ResourceNotFoundException;

public class UserNotFoundException extends ResourceNotFoundException {
    public UserNotFoundException(String username) {
        super("Usuario no encontrado: " + username);
    }
}