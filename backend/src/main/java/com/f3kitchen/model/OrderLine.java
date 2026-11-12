package com.f3kitchen.model;

import jakarta.persistence.Embeddable;

/** Snapshot of a dish at the time of ordering, so later price edits don't change old orders. */
@Embeddable
public class OrderLine {
    private Long itemId;
    private String itemName;
    private String optionLabel;
    private int unitPrice;
    private int quantity;
    private int lineTotal;

    public OrderLine() {}
    public OrderLine(Long itemId, String itemName, String optionLabel, int unitPrice, int quantity) {
        this.itemId = itemId; this.itemName = itemName; this.optionLabel = optionLabel;
        this.unitPrice = unitPrice; this.quantity = quantity; this.lineTotal = unitPrice * quantity;
    }

    public Long getItemId() { return itemId; }
    public String getItemName() { return itemName; }
    public String getOptionLabel() { return optionLabel; }
    public int getUnitPrice() { return unitPrice; }
    public int getQuantity() { return quantity; }
    public int getLineTotal() { return lineTotal; }
}
