package com.tulonglink.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.Base64;

@Configuration
public class FirebaseConfig {

    @Value("${FIREBASE_SERVICE_ACCOUNT_BASE64:}")
    private String firebaseServiceAccountBase64;

    @PostConstruct
    public void initFirebase() throws Exception {
        if (FirebaseApp.getApps().isEmpty()) {
            InputStream serviceAccount;

            if (firebaseServiceAccountBase64 != null && !firebaseServiceAccountBase64.isEmpty()) {
                // Production: load from env var
                byte[] decoded = Base64.getDecoder().decode(firebaseServiceAccountBase64);
                serviceAccount = new ByteArrayInputStream(decoded);
            } else {
                // Local: load from file
                serviceAccount = getClass()
                    .getClassLoader()
                    .getResourceAsStream("firebase-service-account.json");
            }

            if (serviceAccount == null) {
                throw new RuntimeException("Firebase service account not found");
            }

            FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build();

            FirebaseApp.initializeApp(options);
        }
    }
}
