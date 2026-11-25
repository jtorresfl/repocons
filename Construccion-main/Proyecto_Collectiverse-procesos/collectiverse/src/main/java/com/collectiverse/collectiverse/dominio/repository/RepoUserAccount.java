package com.collectiverse.collectiverse.dominio.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.collectiverse.collectiverse.dominio.entity.UserAccount;

public interface RepoUserAccount extends JpaRepository<UserAccount, String> {
    boolean existsByEmail(String email);
}