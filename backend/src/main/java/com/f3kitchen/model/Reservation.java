package com.f3kitchen.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
public class Reservation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false)
    private String phone;
    private int guests;
    @Column(name = "reserved_date")
    private LocalDate date;
    @Column(name = "reserved_time")
    private LocalTime time;
    @Column(length = 500)
    private String notes;

    @Enumerated(EnumType.STRING)
    private ReservationStatus status = ReservationStatus.PENDING;
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public int getGuests() { return guests; }
    public void setGuests(int guests) { this.guests = guests; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public LocalTime getTime() { return time; }
    public void setTime(LocalTime time) { this.time = time; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public ReservationStatus getStatus() { return status; }
    public void setStatus(ReservationStatus status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
}
