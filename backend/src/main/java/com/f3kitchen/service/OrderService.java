package com.f3kitchen.service;

import com.f3kitchen.model.*;
import com.f3kitchen.repo.MenuItemRepository;
import com.f3kitchen.repo.OrderRepository;
import com.f3kitchen.web.ApiException;
import com.f3kitchen.web.Dto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;
import java.util.Locale;

@Service
public class OrderService {
    private final OrderRepository orders;
    private final MenuItemRepository items;
    private final Clock clock;

    public OrderService(OrderRepository orders, MenuItemRepository items, Clock clock) {
        this.orders = orders;
        this.items = items;
        this.clock = clock;
    }

    /** Prices always come from the database, never from the browser. */
    @Transactional
    public CustomerOrder place(Dto.OrderRequest req) {
        if (req.orderType() == OrderType.DELIVERY && (req.address() == null || req.address().isBlank())) {
            throw ApiException.badRequest("Please enter a delivery address");
        }
        LocalTime now = clock.nowTime();
        CustomerOrder order = new CustomerOrder();
        int total = 0;
        for (Dto.OrderItemRequest line : req.items()) {
            MenuItem m = items.findById(line.itemId())
                    .orElseThrow(() -> ApiException.badRequest("A dish in your cart is no longer on the menu"));
            if (!m.isAvailable()) throw ApiException.badRequest(m.getName() + " is not available right now");
            Category c = m.getCategory();
            if (!c.isServingAt(now)) {
                throw ApiException.badRequest(m.getName() + " is served only from " + (c.getNote() != null ? c.getNote().replaceFirst("(?i)^.*available ", "") : "at certain hours"));
            }
            PriceOption opt = m.findOption(line.option());
            if (opt == null) throw ApiException.badRequest("Choose a valid size for " + m.getName());
            if (opt.getPrice() == null) throw ApiException.badRequest(m.getName() + " (" + opt.getLabel() + ") has no online price yet — please call to order it");
            OrderLine ol = new OrderLine(m.getId(), m.getName(), opt.getLabel(), opt.getPrice(), line.quantity());
            order.getLines().add(ol);
            total += ol.getLineTotal();
        }
        order.setCode(CodeGenerator.next("F3", clock.today(), orders::existsByCode));
        order.setCustomerName(req.customerName().trim());
        order.setPhone(normalizePhone(req.phone()));
        order.setOrderType(req.orderType());
        order.setAddress(req.orderType() == OrderType.DELIVERY ? req.address().trim() : null);
        order.setNotes(blankToNull(req.notes()));
        order.setTotal(total);
        return orders.save(order);
    }

    @Transactional(readOnly = true)
    public CustomerOrder track(String code, String phone) {
        CustomerOrder o = orders.findByCode(code.trim().toUpperCase(Locale.ROOT))
                .orElseThrow(() -> ApiException.notFound("We couldn't find that order"));
        if (phone == null || !normalizePhone(phone).equals(o.getPhone())) {
            throw ApiException.notFound("We couldn't find that order");
        }
        return o;
    }

    @Transactional(readOnly = true)
    public List<CustomerOrder> list(String status) {
        if (status == null || status.isBlank() || status.equalsIgnoreCase("ALL")) return orders.findAllByOrderByCreatedAtDesc();
        return orders.findByStatusOrderByCreatedAtDesc(parse(status));
    }

    @Transactional
    public CustomerOrder updateStatus(Long id, String status) {
        CustomerOrder o = orders.findById(id).orElseThrow(() -> ApiException.notFound("Order not found"));
        o.setStatus(parse(status));
        return o;
    }

    private static OrderStatus parse(String s) {
        try { return OrderStatus.valueOf(s.trim().toUpperCase(Locale.ROOT)); }
        catch (IllegalArgumentException e) { throw ApiException.badRequest("Unknown status: " + s); }
    }

    public static String normalizePhone(String phone) {
        String digits = phone.replaceAll("\\D", "");
        if (digits.length() == 12 && digits.startsWith("91")) digits = digits.substring(2);
        return digits;
    }

    static String blankToNull(String s) { return s == null || s.isBlank() ? null : s.trim(); }
}
