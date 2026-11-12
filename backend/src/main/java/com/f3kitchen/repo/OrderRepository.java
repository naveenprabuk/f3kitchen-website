package com.f3kitchen.repo;

import com.f3kitchen.model.CustomerOrder;
import com.f3kitchen.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<CustomerOrder, Long> {
    Optional<CustomerOrder> findByCode(String code);
    boolean existsByCode(String code);
    List<CustomerOrder> findAllByOrderByCreatedAtDesc();
    List<CustomerOrder> findByStatusOrderByCreatedAtDesc(OrderStatus status);
    List<CustomerOrder> findByCreatedAtAfter(Instant since);
}
