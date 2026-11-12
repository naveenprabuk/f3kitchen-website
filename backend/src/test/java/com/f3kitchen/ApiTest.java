package com.f3kitchen;

import com.f3kitchen.model.MenuItem;
import com.f3kitchen.repo.MenuItemRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ApiTest {
    @Autowired MockMvc mvc;
    @Autowired MenuItemRepository items;

    private Long idOf(String name) {
        return items.findAll().stream().filter(i -> i.getName().equals(name))
                .map(MenuItem::getId).findFirst().orElseThrow();
    }

    @Test
    void menuIsSeededFromCard() throws Exception {
        mvc.perform(get("/api/menu"))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.length()").value(11))
           .andExpect(jsonPath("$[0].name").value("Soup"))
           .andExpect(jsonPath("$[0].items[0].options[0].price").value(60));
    }

    @Test
    void orderTotalIsComputedOnServer() throws Exception {
        String body = """
            {"customerName":"Ravi","phone":"+91 98765 43210","orderType":"PICKUP",
             "items":[{"itemId":%d,"option":"Half","quantity":2},{"itemId":%d,"quantity":3}]}
            """.formatted(idOf("Classic Grill"), idOf("Butter Naan"));
        mvc.perform(post("/api/orders").contentType(MediaType.APPLICATION_JSON).content(body))
           .andExpect(status().isCreated())
           .andExpect(jsonPath("$.total").value(2 * 230 + 3 * 40))
           .andExpect(jsonPath("$.status").value("NEW"));
    }

    @Test
    void dishWithoutPriceCannotBeOrderedOnline() throws Exception {
        String body = """
            {"customerName":"Ravi","phone":"9876543210","orderType":"PICKUP","items":[{"itemId":%d,"quantity":1}]}
            """.formatted(idOf("Prawn Manchurian"));
        mvc.perform(post("/api/orders").contentType(MediaType.APPLICATION_JSON).content(body))
           .andExpect(status().isBadRequest());
    }

    @Test
    void phoneIsValidated() throws Exception {
        String body = """
            {"customerName":"Ravi","phone":"12345","orderType":"DELIVERY","items":[{"itemId":%d,"quantity":1}]}
            """.formatted(idOf("Naan"));
        mvc.perform(post("/api/orders").contentType(MediaType.APPLICATION_JSON).content(body))
           .andExpect(status().isBadRequest())
           .andExpect(jsonPath("$.errors.phone").exists());
    }

    @Test
    void reservationWorks() throws Exception {
        String body = """
            {"name":"Priya","phone":"9876543210","guests":4,"date":"%s","time":"20:00"}
            """.formatted(LocalDate.now().plusDays(2));
        mvc.perform(post("/api/reservations").contentType(MediaType.APPLICATION_JSON).content(body))
           .andExpect(status().isCreated())
           .andExpect(jsonPath("$.code").exists());
    }

    @Test
    void adminIsProtected() throws Exception {
        mvc.perform(get("/api/admin/orders")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/orders").with(httpBasic("admin", "wrong"))).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/summary").with(httpBasic("admin", "test-pass"))).andExpect(status().isOk());
    }
}
