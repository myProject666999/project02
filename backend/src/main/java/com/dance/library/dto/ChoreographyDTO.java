package com.dance.library.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChoreographyDTO {

    private Long id;
    private String name;
    private Integer totalBeats;
    private String description;
    private List<ChoreographyItemDTO> items;
}
