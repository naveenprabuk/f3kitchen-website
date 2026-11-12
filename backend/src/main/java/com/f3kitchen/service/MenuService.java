package com.f3kitchen.service;

import com.f3kitchen.model.Category;
import com.f3kitchen.model.MenuItem;
import com.f3kitchen.model.PriceOption;
import com.f3kitchen.repo.CategoryRepository;
import com.f3kitchen.repo.MenuItemRepository;
import com.f3kitchen.web.ApiException;
import com.f3kitchen.web.Dto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;

@Service
public class MenuService {
    private final CategoryRepository categories;
    private final MenuItemRepository items;
    private final Clock clock;

    public MenuService(CategoryRepository categories, MenuItemRepository items, Clock clock) {
        this.categories = categories;
        this.items = items;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<Dto.CategoryView> fullMenu() {
        LocalTime now = clock.nowTime();
        return categories.findAllByOrderBySortOrderAsc().stream().map(c -> new Dto.CategoryView(
                c.getId(), c.getSlug(), c.getName(), c.getSection(), c.getNote(),
                c.getAvailableFrom() == null ? null : c.getAvailableFrom().toString(),
                c.getAvailableTo() == null ? null : c.getAvailableTo().toString(),
                c.isServingAt(now),
                c.getItems().stream().map(Dto.ItemView::of).toList())).toList();
    }

    @Transactional
    public Dto.ItemView update(Long id, Dto.ItemUpdate u) {
        MenuItem m = items.findById(id).orElseThrow(() -> ApiException.notFound("Dish not found"));
        if (u.available() != null) m.setAvailable(u.available());
        if (u.signature() != null) m.setSignature(u.signature());
        if (u.veg() != null) m.setVeg(u.veg());
        if (u.name() != null && !u.name().isBlank()) m.setName(u.name().trim());
        if (u.options() != null) {
            if (u.options().isEmpty()) throw ApiException.badRequest("A dish needs at least one price");
            m.getOptions().clear();
            for (Dto.PriceView p : u.options()) {
                if (p.label() == null || p.label().isBlank()) throw ApiException.badRequest("Each price needs a label");
                if (p.price() != null && (p.price() < 0 || p.price() > 100000)) throw ApiException.badRequest("Price looks wrong");
                m.getOptions().add(new PriceOption(p.label().trim(), p.price()));
            }
        }
        return Dto.ItemView.of(m);
    }

    public Category categoryOf(MenuItem m) { return m.getCategory(); }
}
