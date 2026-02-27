package com.irctc.controller;

import com.irctc.model.Contact;
import com.irctc.repository.ContactRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/contact")
public class ContactController {
    @Autowired
    private ContactRepository contactRepository;

    @PostMapping
    public ResponseEntity<Contact> submitContact(@Valid @RequestBody Contact contact) {
        Contact savedContact = contactRepository.save(contact);
        return ResponseEntity.ok(savedContact);
    }
}