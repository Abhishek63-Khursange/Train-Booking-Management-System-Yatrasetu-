package com.irctc.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;


public class SupportRequest {
    
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
    
    @NotBlank(message = "Issue description is required")
    @Size(min = 10, max = 2000, message = "Issue must be between 10 and 2000 characters")
    private String issue;

    
    
    
    public String getName() { return name; }
    
   
    public void setName(String name) { this.name = name; }
    
    
    public String getEmail() { return email; }
    
    
    public void setEmail(String email) { this.email = email; }
    
    
    public String getIssue() { return issue; }
    
   
    public void setIssue(String issue) { this.issue = issue; }
}
