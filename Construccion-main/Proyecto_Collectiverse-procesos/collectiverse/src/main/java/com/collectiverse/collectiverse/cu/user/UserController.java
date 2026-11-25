package com.collectiverse.collectiverse.cu.user;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import com.collectiverse.collectiverse.cu.user.request.RequestUser;
import com.collectiverse.collectiverse.cu.user.response.ResponseUser;

/** Endpoints del caso de uso "Registrar y consultar usuarios". */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserUseCase useCase;

    public UserController(UserUseCase useCase) {
        this.useCase = useCase;
    }

    // GET /api/users -> lista todos
    @GetMapping
    public List<ResponseUser> listar() {
        return useCase.listar();
    }

    // GET /api/users/{username} -> consulta uno (404 si no existe)
    @GetMapping("/{username}")
    public ResponseUser consultar(@PathVariable String username) {
        return useCase.consultar(username);
    }

    // POST /api/users -> registra (201; 409 si el usuario o el correo ya existen)
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseUser registrar(@Valid @RequestBody RequestUser request) {
        return useCase.registrar(request);
    }
}