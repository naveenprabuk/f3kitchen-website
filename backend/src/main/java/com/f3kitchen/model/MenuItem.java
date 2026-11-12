package com.f3kitchen.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class MenuItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private Category category;

    private boolean veg;
    private boolean available = true;
    private boolean signature;
    private int sortOrder;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "menu_item_price")
    @OrderColumn(name = "sort_index")
    private List<PriceOption> options = new ArrayList<>();

    public PriceOption findOption(String label) {
        if (label == null || label.isBlank()) return options.isEmpty() ? null : options.get(0);
        return options.stream().filter(o -> o.getLabel().equalsIgnoreCase(label)).findFirst().orElse(null);
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public boolean isVeg() { return veg; }
    public void setVeg(boolean veg) { this.veg = veg; }
    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }
    public boolean isSignature() { return signature; }
    public void setSignature(boolean signature) { this.signature = signature; }
    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
    public List<PriceOption> getOptions() { return options; }
    public void setOptions(List<PriceOption> options) { this.options = options; }
}
