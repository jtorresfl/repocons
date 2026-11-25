package com.collectiverse.collectiverse.cu.user;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.collectiverse.collectiverse.cu.user.exception.DuplicateUserException;
import com.collectiverse.collectiverse.cu.user.exception.UserNotFoundException;
import com.collectiverse.collectiverse.cu.user.request.RequestUser;
import com.collectiverse.collectiverse.cu.user.response.ResponseUser;
import com.collectiverse.collectiverse.dominio.entity.UserAccount;
import com.collectiverse.collectiverse.dominio.repository.RepoUserAccount;

/** Caso de uso: registrar y consultar usuarios. */
@Service
public class UserUseCase {

    private final RepoUserAccount repository;
    private final PasswordEncoder encoder;

    public UserUseCase(RepoUserAccount repository, PasswordEncoder encoder) {
        this.repository = repository;
        this.encoder = encoder;
    }

    @Transactional(readOnly = true)
    public List<ResponseUser> listar() {
        return repository.findAll().stream().map(this::aResponse).toList();
    }

    @Transactional(readOnly = true)
    public ResponseUser consultar(String username) {
        return aResponse(repository.findById(username)
                .orElseThrow(() -> new UserNotFoundException(username)));
    }

    @Transactional
    public ResponseUser registrar(RequestUser request) {
        String username = request.username().trim();
        String email = request.email().trim().toLowerCase();
        if (repository.existsById(username)) {
            throw new DuplicateUserException("El usuario '" + username + "' ya existe");
        }
        if (repository.existsByEmail(email)) {
            throw new DuplicateUserException("El correo '" + email + "' ya está registrado");
        }
        UserAccount u = new UserAccount();
        u.setUsername(username);
        u.setEmail(email);
        u.setPhone(request.phone());
        u.setPassword(encoder.encode(request.password())); // se guarda el hash, nunca el texto
        return aResponse(repository.save(u));
    }

    private ResponseUser aResponse(UserAccount e) {
        return new ResponseUser(e.getUsername(), e.getEmail(), e.getPhone(), e.getEnabled());
    }
}