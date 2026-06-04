package com.dance.library.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DanceActionDTO {

    private Long id;
    private String name;
    private String videoPath;
    private String coverPath;
    private String style;
    private Integer beat;
    private Integer difficulty;
    private String bodyPart;
    private BigDecimal duration;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
