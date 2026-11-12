package com.f3kitchen.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class CustomerOrder {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String customerName;
    @Column(nullable = false)
    private String phone;

    @Enumerated(EnumType.STRING)
    private OrderType orderType;

    @Column(length = 500)
    private String address;
    @Column(length = 500)
    private String notes;

    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.NEW;

    private int total;
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "order_line")
    @OrderColumn(name = "sort_index")
    private List<OrderLine> lines = new ArrayList<>();

    public Long getId() { return id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public OrderType getOrderType() { return orderType; }
    public void setOrderType(OrderType orderType) { this.orderType = orderType; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; this.updatedAt = Instant.now(); }
    public int getTotal() { return total; }
    public void setTotal(int total) { this.total = total; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public List<OrderLine> getLines() { return lines; }
}
