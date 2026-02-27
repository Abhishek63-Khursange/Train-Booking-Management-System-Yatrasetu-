package com.irctc.repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.irctc.model.Contact;

public interface ContactRepository extends JpaRepository<Contact, Long> {
}

