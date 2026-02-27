package com.irctc.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;


@Entity
@Table(name = "support_tickets")
@Getter
@Setter
public class Support {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(nullable = false, length = 2000)
    private String issue;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SupportStatus status = SupportStatus.OPEN;

    @Column(length = 4000)
    private String response;

    @Column(nullable = false)
    private boolean resolved = false;

    @CreationTimestamp
    @Column(name = "submitted_at", nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    @Column(length = 1000)
    private String adminNotes;

    @Column(length = 100)
    private String priority = "NORMAL"; 

    @Column(length = 50)
    private String category; 

    public Support() {
        
    }

    public Support(String name, String email, String issue) {
        this.name = name;
        this.email = email;
        this.issue = issue;
        this.status = SupportStatus.OPEN;
        this.resolved = false;
    }

   
    public void setStatus(SupportStatus status) {
        this.status = status;
        if (status == SupportStatus.RESOLVED || status == SupportStatus.CLOSED) {
            this.resolved = true;
        }
    }
}
