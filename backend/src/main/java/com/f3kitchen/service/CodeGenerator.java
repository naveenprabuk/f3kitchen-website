package com.f3kitchen.service;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.function.Predicate;

/** Short human-friendly codes like F3-301026-K7QM. */
public final class CodeGenerator {
    private static final String ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();
    private CodeGenerator() {}

    public static String next(String prefix, LocalDate day, Predicate<String> exists) {
        String date = day.format(DateTimeFormatter.ofPattern("ddMMyy"));
        for (int attempt = 0; attempt < 20; attempt++) {
            StringBuilder sb = new StringBuilder(prefix).append('-').append(date).append('-');
            for (int i = 0; i < 4; i++) sb.append(ALPHABET.charAt(RANDOM.nextInt(ALPHABET.length())));
            if (!exists.test(sb.toString())) return sb.toString();
        }
        throw new IllegalStateException("Could not generate a unique code");
    }
}
