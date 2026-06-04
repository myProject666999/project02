package com.dance.library.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DanceActionQueryDTO {

    private String style;
    private Integer beat;
    private Integer difficulty;
    private String bodyPart;
    private String name;
}
