package com.f3kitchen.web;

import com.f3kitchen.model.Reservation;
import com.f3kitchen.service.MenuService;
import com.f3kitchen.service.OrderService;
import com.f3kitchen.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class PublicController {
    private final MenuService menu;
    private final OrderService orders;
    private final ReservationService reservations;

    public PublicController(MenuService menu, OrderService orders, ReservationService reservations) {
        this.menu = menu;
        this.orders = orders;
        this.reservations = reservations;
    }

    @GetMapping("/health")
    public Map<String, String> health() { return Map.of("status", "ok"); }

    @GetMapping("/menu")
    public List<Dto.CategoryView> menu() { return menu.fullMenu(); }

    @PostMapping("/orders")
    @ResponseStatus(HttpStatus.CREATED)
    public Dto.OrderTrackView placeOrder(@Valid @RequestBody Dto.OrderRequest req) {
        return Dto.OrderTrackView.of(orders.place(req));
    }

    @GetMapping("/orders/{code}")
    public Dto.OrderTrackView track(@PathVariable String code, @RequestParam String phone) {
        return Dto.OrderTrackView.of(orders.track(code, phone));
    }

    @PostMapping("/reservations")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> reserve(@Valid @RequestBody Dto.ReservationRequest req) {
        Reservation r = reservations.create(req);
        return Map.of("code", r.getCode(), "date", r.getDate().toString(), "time", r.getTime().toString(),
                "guests", r.getGuests(), "status", r.getStatus());
    }
}
