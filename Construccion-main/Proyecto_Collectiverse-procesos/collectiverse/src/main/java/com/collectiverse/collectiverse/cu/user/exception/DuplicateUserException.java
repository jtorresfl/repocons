package com.collectiverse.collectiverse.cu.user.exception;

import com.collectiverse.collectiverse.cu.shared.exception.ConflictException;

public class DuplicateUserException extends ConflictException {
    public DuplicateUserException(String message) {
        super(message);
    }
}