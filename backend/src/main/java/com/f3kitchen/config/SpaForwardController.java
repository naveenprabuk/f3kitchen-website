package com.f3kitchen.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * When the React build is copied into resources/static (single-jar deployment),
 * send browser routes like /menu or /admin to index.html so React Router can handle them.
 */
@Controller
public class SpaForwardController {
    @GetMapping({"/menu", "/order", "/reserve", "/contact", "/track", "/admin", "/admin/**"})
    public String forward() {
        return "forward:/index.html";
    }
}
