package com.irctc.dto;

import lombok.Data;

@Data
public class EmailRequest {
    private String email;
    private String pnr;
    private String ticketImage;
}
