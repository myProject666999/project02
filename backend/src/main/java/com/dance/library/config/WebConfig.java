package com.dance.library.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload.video-dir:static/videos/}")
    private String videoDir;

    @Value("${file.upload.cover-dir:static/covers/}")
    private String coverDir;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String videoAbsolutePath = Paths.get(videoDir).toAbsolutePath().toUri().toString();
        String coverAbsolutePath = Paths.get(coverDir).toAbsolutePath().toUri().toString();

        registry.addResourceHandler("/videos/**")
                .addResourceLocations(videoAbsolutePath);

        registry.addResourceHandler("/covers/**")
                .addResourceLocations(coverAbsolutePath);
    }
}
