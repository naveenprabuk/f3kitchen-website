package com.f3kitchen.config;

import com.f3kitchen.model.Category;
import com.f3kitchen.model.MenuItem;
import com.f3kitchen.model.PriceOption;
import com.f3kitchen.repo.CategoryRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.time.LocalTime;

/** Loads menu.json (transcribed from the printed menu card) into an empty database. */
@Component
public class MenuSeeder implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(MenuSeeder.class);
    private final CategoryRepository categories;
    private final ObjectMapper mapper;

    public MenuSeeder(CategoryRepository categories, ObjectMapper mapper) {
        this.categories = categories;
        this.mapper = mapper;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (categories.count() > 0) return;
        try (InputStream in = new ClassPathResource("menu.json").getInputStream()) {
            JsonNode root = mapper.readTree(in);
            int c = 0, total = 0;
            for (JsonNode cn : root) {
                Category cat = new Category();
                cat.setSlug(cn.get("slug").asText());
                cat.setName(cn.get("name").asText());
                cat.setSection(cn.path("section").asText(null));
                cat.setNote(cn.path("note").asText(null));
                if (cn.hasNonNull("availableFrom")) cat.setAvailableFrom(LocalTime.parse(cn.get("availableFrom").asText()));
                if (cn.hasNonNull("availableTo")) cat.setAvailableTo(LocalTime.parse(cn.get("availableTo").asText()));
                cat.setSortOrder(c++);
                int i = 0;
                for (JsonNode in2 : cn.get("items")) {
                    MenuItem item = new MenuItem();
                    item.setName(in2.get("name").asText());
                    item.setVeg(in2.path("veg").asBoolean(false));
                    item.setSortOrder(i++);
                    item.setCategory(cat);
                    for (JsonNode o : in2.get("options")) {
                        Integer price = o.get(1).isNull() ? null : o.get(1).asInt();
                        item.getOptions().add(new PriceOption(o.get(0).asText(), price));
                    }
                    cat.getItems().add(item);
                    total++;
                }
                categories.save(cat);
            }
            log.info("Seeded menu: {} categories, {} dishes", c, total);
        }
    }
}
