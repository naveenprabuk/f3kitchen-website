package com.f3kitchen.repo;

import com.f3kitchen.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    boolean existsByCode(String code);
    List<Reservation> findAllByOrderByDateDescTimeDesc();
    List<Reservation> findByDateGreaterThanEqualOrderByDateAscTimeAsc(LocalDate from);
}
