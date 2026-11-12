package com.f3kitchen.model;

import jakarta.persistence.*;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Category {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String name;

    /** Menu-card page this category sits on, e.g. "Soup & Starters". */
    private String section;

    /** Short note shown under the heading, e.g. serving hours. */
    private String note;

    /** Optional serving window (restaurant local time). Window may cross midnight. */
    private LocalTime availableFrom;
    private LocalTime availableTo;

    private int sortOrder;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<MenuItem> items = new ArrayList<>();

    public boolean isServingAt(LocalTime t) {
        if (availableFrom == null || availableTo == null) return true;
        if (availableFrom.isBefore(availableTo)) {
            return !t.isBefore(availableFrom) && t.isBefore(availableTo);
        }
        // crosses midnight, e.g. 17:00 -> 02:00
        return !t.isBefore(availableFrom) || t.isBefore(availableTo);
    }

    public Long getId() { return id; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public LocalTime getAvailableFrom() { return availableFrom; }
    public void setAvailableFrom(LocalTime availableFrom) { this.availableFrom = availableFrom; }
    public LocalTime getAvailableTo() { return availableTo; }
    public void setAvailableTo(LocalTime availableTo) { this.availableTo = availableTo; }
    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
    public List<MenuItem> getItems() { return items; }
}
