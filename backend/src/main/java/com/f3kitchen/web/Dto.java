package com.f3kitchen.web;

import com.f3kitchen.model.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/** Request / response shapes for the REST API. */
public final class Dto {
    private Dto() {}

    public static final String PHONE_REGEX = "^(\\+?91[\\s-]?)?[6-9](?:[\\s-]?\\d){9}$";

    // ---------- menu ----------
    public record PriceView(String label, Integer price) {}

    public record ItemView(Long id, String name, boolean veg, boolean available, boolean signature,
                           List<PriceView> options) {
        public static ItemView of(MenuItem m) {
            return new ItemView(m.getId(), m.getName(), m.isVeg(), m.isAvailable(), m.isSignature(),
                    m.getOptions().stream().map(o -> new PriceView(o.getLabel(), o.getPrice())).toList());
        }
    }

    public record CategoryView(Long id, String slug, String name, String section, String note,
                               String availableFrom, String availableTo, boolean servingNow,
                               List<ItemView> items) {}

    // ---------- orders ----------
    public record OrderItemRequest(@NotNull Long itemId, String option,
                                   @Min(value = 1, message = "Quantity must be at least 1")
                                   @Max(value = 50, message = "Quantity is too large") int quantity) {}

    public record OrderRequest(
            @NotBlank(message = "Please enter your name") @Size(max = 80) String customerName,
            @NotBlank(message = "Please enter your phone number")
            @Pattern(regexp = PHONE_REGEX, message = "Please enter a valid 10-digit mobile number") String phone,
            @NotNull(message = "Choose pickup, delivery or dine-in") OrderType orderType,
            @Size(max = 500) String address,
            @Size(max = 500) String notes,
            @NotEmpty(message = "Your cart is empty") @Size(max = 60) List<@Valid OrderItemRequest> items) {}

    public record OrderView(Long id, String code, String customerName, String phone, OrderType orderType,
                            String address, String notes, OrderStatus status, int total,
                            Instant createdAt, Instant updatedAt, List<OrderLine> lines) {
        public static OrderView of(CustomerOrder o) {
            return new OrderView(o.getId(), o.getCode(), o.getCustomerName(), o.getPhone(), o.getOrderType(),
                    o.getAddress(), o.getNotes(), o.getStatus(), o.getTotal(), o.getCreatedAt(), o.getUpdatedAt(),
                    List.copyOf(o.getLines()));
        }
    }

    /** What a customer sees when tracking: no phone/address echoed back. */
    public record OrderTrackView(String code, OrderType orderType, OrderStatus status, int total,
                                 Instant createdAt, Instant updatedAt, List<OrderLine> lines) {
        public static OrderTrackView of(CustomerOrder o) {
            return new OrderTrackView(o.getCode(), o.getOrderType(), o.getStatus(), o.getTotal(),
                    o.getCreatedAt(), o.getUpdatedAt(), List.copyOf(o.getLines()));
        }
    }

    // ---------- reservations ----------
    public record ReservationRequest(
            @NotBlank(message = "Please enter your name") @Size(max = 80) String name,
            @NotBlank(message = "Please enter your phone number")
            @Pattern(regexp = PHONE_REGEX, message = "Please enter a valid 10-digit mobile number") String phone,
            @Min(value = 1, message = "At least 1 guest") @Max(value = 30, message = "For more than 30 guests, please call us") int guests,
            @NotNull(message = "Choose a date") LocalDate date,
            @NotNull(message = "Choose a time") LocalTime time,
            @Size(max = 500) String notes) {}

    // ---------- admin ----------
    public record StatusUpdate(@NotBlank String status) {}

    public record ItemUpdate(Boolean available, Boolean signature, Boolean veg, String name,
                             List<PriceView> options) {}

    public record Summary(long ordersToday, long openOrders, int salesToday, long upcomingReservations) {}
}
