package com.f3kitchen.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "app")
public record AppProperties(Admin admin, List<String> corsOrigins, String timezone) {
    public record Admin(String username, String password) {}
}
