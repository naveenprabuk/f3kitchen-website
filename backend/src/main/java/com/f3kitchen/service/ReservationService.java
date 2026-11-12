package com.f3kitchen.service;

import com.f3kitchen.model.Reservation;
import com.f3kitchen.model.ReservationStatus;
import com.f3kitchen.repo.ReservationRepository;
import com.f3kitchen.web.ApiException;
import com.f3kitchen.web.Dto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
public class ReservationService {
    private final ReservationRepository reservations;
    private final Clock clock;

    public ReservationService(ReservationRepository reservations, Clock clock) {
        this.reservations = reservations;
        this.clock = clock;
    }

    @Transactional
    public Reservation create(Dto.ReservationRequest req) {
        LocalDateTime when = LocalDateTime.of(req.date(), req.time());
        if (when.isBefore(clock.now().toLocalDateTime())) throw ApiException.badRequest("Please choose a time in the future");
        if (req.date().isAfter(clock.today().plusDays(60))) throw ApiException.badRequest("Bookings open up to 60 days ahead");
        Reservation r = new Reservation();
        r.setCode(CodeGenerator.next("TB", req.date(), reservations::existsByCode));
        r.setName(req.name().trim());
        r.setPhone(OrderService.normalizePhone(req.phone()));
        r.setGuests(req.guests());
        r.setDate(req.date());
        r.setTime(req.time());
        r.setNotes(OrderService.blankToNull(req.notes()));
        return reservations.save(r);
    }

    @Transactional(readOnly = true)
    public List<Reservation> list(boolean upcomingOnly) {
        return upcomingOnly
                ? reservations.findByDateGreaterThanEqualOrderByDateAscTimeAsc(clock.today())
                : reservations.findAllByOrderByDateDescTimeDesc();
    }

    @Transactional
    public Reservation updateStatus(Long id, String status) {
        Reservation r = reservations.findById(id).orElseThrow(() -> ApiException.notFound("Reservation not found"));
        try { r.setStatus(ReservationStatus.valueOf(status.trim().toUpperCase(Locale.ROOT))); }
        catch (IllegalArgumentException e) { throw ApiException.badRequest("Unknown status: " + status); }
        return r;
    }
}
