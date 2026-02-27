package com.irctc.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.AbstractRequestLoggingFilter;
import org.springframework.web.filter.CommonsRequestLoggingFilter;

import jakarta.servlet.http.HttpServletRequest;

@Configuration
public class RequestLoggingFilterConfig {

    @Bean
    public CommonsRequestLoggingFilter logFilter() {
        CommonsRequestLoggingFilter filter = new CommonsRequestLoggingFilter() {
            @Override
            protected void beforeRequest(HttpServletRequest request, String message) {
                // Log before the request is processed
                logger.debug("Before request: " + message);
            }

            @Override
            protected void afterRequest(HttpServletRequest request, String message) {
                // Log after the request is processed
                logger.debug("After request: " + message);
            }
        };
        
        filter.setIncludeQueryString(true);
        filter.setIncludePayload(true);
        filter.setMaxPayloadLength(10000);
        filter.setIncludeHeaders(true);
        filter.setAfterMessagePrefix("REQUEST DATA: ");
        return filter;
    }
}
