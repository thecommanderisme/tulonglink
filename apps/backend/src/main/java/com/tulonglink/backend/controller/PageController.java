package com.tulonglink.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

@RestController
public class PageController {

    @GetMapping("/")
    public ResponseEntity<String> home() {
        return ResponseEntity.ok("<html><body><h1>TulongLink</h1><p>Trabaho, tulong, at balita para sa inyong komunidad.</p></body></html>");
    }

    @GetMapping("/privacy")
    public ResponseEntity<String> privacy() {
        return ResponseEntity.ok("<html><body><h1>Privacy Policy</h1><p>TulongLink collects phone numbers for authentication purposes only. We do not share your data with third parties.</p><p>Contact: dlhizonjr@gmail.com</p></body></html>");
    }

    @GetMapping("/terms")
    public ResponseEntity<String> terms() {
        return ResponseEntity.ok("<html><body><h1>Terms of Service</h1><p>By using TulongLink, you agree to use the app responsibly and not post fraudulent job listings.</p><p>Contact: dlhizonjr@gmail.com</p></body></html>");
    }
}
