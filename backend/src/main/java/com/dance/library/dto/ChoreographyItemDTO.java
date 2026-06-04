package com.dance.library.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChoreographyItemDTO {

    private Long id;
    private Long actionId;
    private String actionName;
    private Integer sortOrder;
    private Integer beatPosition;
    private String videoPath;
}
