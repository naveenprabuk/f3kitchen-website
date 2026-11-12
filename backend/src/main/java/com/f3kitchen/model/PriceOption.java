package com.f3kitchen.model;

import jakarta.persistence.Embeddable;

/** One price point of a dish, e.g. "Half" = 230. Price is null when not yet set. */
@Embeddable
public class PriceOption {
    private String label;
    private Integer price;

    public PriceOption() {}
    public PriceOption(String label, Integer price) { this.label = label; this.price = price; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public Integer getPrice() { return price; }
    public void setPrice(Integer price) { this.price = price; }
}
