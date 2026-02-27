package com.irctc.config;

import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.util.Base64;

public class JwtKeyGenerator {
    public static void main(String[] args) {
        SecretKey key = Keys.secretKeyFor(io.jsonwebtoken.SignatureAlgorithm.HS512);
        String encodedKey = Base64.getEncoder().encodeToString(key.getEncoded());
        System.out.println("Generated JWT Key: " + encodedKey);
        System.out.println("Key length (bits): " + (key.getEncoded().length * 8));
    }
}