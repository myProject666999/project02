package com.dance.library.controller;

import com.dance.library.dto.DanceActionDTO;
import com.dance.library.dto.DanceActionQueryDTO;
import com.dance.library.dto.Result;
import com.dance.library.service.DanceActionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/actions")
@CrossOrigin
@RequiredArgsConstructor
public class DanceActionController {

    private final DanceActionService danceActionService;

    @GetMapping
    public Result<List<DanceActionDTO>> list(DanceActionQueryDTO query) {
        if (hasAnyQueryParam(query)) {
            return Result.ok(danceActionService.search(query));
        }
        return Result.ok(danceActionService.listAll());
    }

    @GetMapping("/{id}")
    public Result<DanceActionDTO> getById(@PathVariable Long id) {
        return Result.ok(danceActionService.getById(id));
    }

    @PostMapping
    public Result<DanceActionDTO> create(@RequestBody DanceActionDTO dto) {
        return Result.ok(danceActionService.create(dto));
    }

    @PostMapping("/upload")
    public Result<String> uploadVideo(@RequestParam("file") MultipartFile file) {
        try {
            String path = danceActionService.uploadVideo(file);
            return Result.ok(path);
        } catch (IOException e) {
            return Result.error("File upload failed: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public Result<DanceActionDTO> update(@PathVariable Long id, @RequestBody DanceActionDTO dto) {
        return Result.ok(danceActionService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        danceActionService.delete(id);
        return Result.ok();
    }

    private boolean hasAnyQueryParam(DanceActionQueryDTO query) {
        return query != null && (
                query.getStyle() != null ||
                query.getBeat() != null ||
                query.getDifficulty() != null ||
                query.getBodyPart() != null ||
                query.getName() != null);
    }
}
