package com.f3kitchen.web;

import com.f3kitchen.model.CustomerOrder;
import com.f3kitchen.model.OrderStatus;
import com.f3kitchen.model.Reservation;
import com.f3kitchen.model.ReservationStatus;
import com.f3kitchen.repo.OrderRepository;
import com.f3kitchen.repo.ReservationRepository;
import com.f3kitchen.service.Clock;
import com.f3kitchen.service.MenuService;
import com.f3kitchen.service.OrderService;
import com.f3kitchen.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.EnumSet;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final OrderService orders;
    private final ReservationService reservations;
    private final MenuService menu;
    private final OrderRepository orderRepo;
    private final ReservationRepository reservationRepo;
    private final Clock clock;

    public AdminController(OrderService orders, ReservationService reservations, MenuService menu,
                           OrderRepository orderRepo, ReservationRepository reservationRepo, Clock clock) {
        this.orders = orders;
        this.reservations = reservations;
        this.menu = menu;
        this.orderRepo = orderRepo;
        this.reservationRepo = reservationRepo;
        this.clock = clock;
    }

    @GetMapping("/me")
    public Map<String, String> me(Authentication auth) { return Map.of("username", auth.getName()); }

    @GetMapping("/summary")
    public Dto.Summary summary() {
        List<CustomerOrder> today = orderRepo.findByCreatedAtAfter(clock.startOfToday());
        EnumSet<OrderStatus> open = EnumSet.of(OrderStatus.NEW, OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY);
        long openCount = orderRepo.findAll().stream().filter(o -> open.contains(o.getStatus())).count();
        int sales = today.stream().filter(o -> o.getStatus() != OrderStatus.CANCELLED).mapToInt(CustomerOrder::getTotal).sum();
        long upcoming = reservationRepo.findByDateGreaterThanEqualOrderByDateAscTimeAsc(clock.today()).stream()
                .filter(r -> r.getStatus() == ReservationStatus.PENDING || r.getStatus() == ReservationStatus.CONFIRMED).count();
        return new Dto.Summary(today.size(), openCount, sales, upcoming);
    }

    @GetMapping("/orders")
    public List<Dto.OrderView> orders(@RequestParam(required = false) String status) {
        return orders.list(status).stream().map(Dto.OrderView::of).toList();
    }

    @PatchMapping("/orders/{id}/status")
    public Dto.OrderView orderStatus(@PathVariable Long id, @Valid @RequestBody Dto.StatusUpdate body) {
        return Dto.OrderView.of(orders.updateStatus(id, body.status()));
    }

    @GetMapping("/reservations")
    public List<Reservation> reservations(@RequestParam(defaultValue = "true") boolean upcoming) {
        return reservations.list(upcoming);
    }

    @PatchMapping("/reservations/{id}/status")
    public Reservation reservationStatus(@PathVariable Long id, @Valid @RequestBody Dto.StatusUpdate body) {
        return reservations.updateStatus(id, body.status());
    }

    @GetMapping("/menu")
    public List<Dto.CategoryView> menu() { return menu.fullMenu(); }

    @PatchMapping("/menu/items/{id}")
    public Dto.ItemView updateItem(@PathVariable Long id, @RequestBody Dto.ItemUpdate body) {
        return menu.update(id, body);
    }
}
