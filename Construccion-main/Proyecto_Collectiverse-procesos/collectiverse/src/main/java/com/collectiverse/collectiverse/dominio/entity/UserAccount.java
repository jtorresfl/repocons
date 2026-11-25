package com.collectiverse.collectiverse.dominio.entity;

import jakarta.persistence.*;

/** Usuario del sistema. Mapea la tabla existente "users" (esquema estándar de Spring Security + email y phone). */
@Entity
@Table(name = "users")
public class UserAccount {

    @Id
    @Column(name = "username", length = 100)
    private String username;

    @Column(name = "password", nullable = false, length = 255)
    private String password; // siempre el hash BCrypt

    @Column(name = "enabled", nullable = false)
    private Boolean enabled = true;

    @Column(name = "email", nullable = false, length = 150, unique = true)
    private String email;

    @Column(name = "phone", length = 20)
    private String phone;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}