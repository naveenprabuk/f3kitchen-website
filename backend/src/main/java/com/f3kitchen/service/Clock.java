package com.f3kitchen.service;

import com.f3kitchen.config.AppProperties;
import org.springframework.stereotype.Component;

import java.time.*;

/** Restaurant-local time (Asia/Kolkata by default), regardless of the server's own timezone. */
@Component
public class Clock {
    private final ZoneId zone;
    public Clock(AppProperties props) {
        this.zone = ZoneId.of(props.timezone() == null ? "Asia/Kolkata" : props.timezone());
    }
    public ZoneId zone() { return zone; }
    public LocalTime nowTime() { return LocalTime.now(zone); }
    public LocalDate today() { return LocalDate.now(zone); }
    public ZonedDateTime now() { return ZonedDateTime.now(zone); }
    public Instant startOfToday() { return today().atStartOfDay(zone).toInstant(); }
}
