package com.dance.library.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShareLinkDTO {

    private Long id;
    private Long choreographyId;
    private String shareCode;
    private Boolean isActive;
    private LocalDateTime expireAt;
    private String choreographyName;
}
