package com.dance.library.controller;

import com.dance.library.dto.ChoreographyDTO;
import com.dance.library.dto.ChoreographyItemDTO;
import com.dance.library.dto.Result;
import com.dance.library.service.ChoreographyService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/choreographies")
@CrossOrigin
@RequiredArgsConstructor
public class ChoreographyController {

    private final ChoreographyService choreographyService;

    @GetMapping
    public Result<List<ChoreographyDTO>> list() {
        return Result.ok(choreographyService.listAll());
    }

    @GetMapping("/{id}")
    public Result<ChoreographyDTO> getById(@PathVariable Long id) {
        return Result.ok(choreographyService.getById(id));
    }

    @PostMapping
    public Result<ChoreographyDTO> create(@RequestBody ChoreographyDTO dto) {
        return Result.ok(choreographyService.create(dto));
    }

    @PutMapping("/{id}")
    public Result<ChoreographyDTO> update(@PathVariable Long id, @RequestBody ChoreographyDTO dto) {
        return Result.ok(choreographyService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        choreographyService.delete(id);
        return Result.ok();
    }

    @PostMapping("/{id}/items")
    public Result<ChoreographyItemDTO> addItem(@PathVariable Long id, @RequestBody ChoreographyItemDTO itemDTO) {
        return Result.ok(choreographyService.addItem(id, itemDTO));
    }

    @DeleteMapping("/{id}/items/{itemId}")
    public Result<Void> removeItem(@PathVariable Long id, @PathVariable Long itemId) {
        choreographyService.removeItem(id, itemId);
        return Result.ok();
    }

    @PutMapping("/{id}/items/reorder")
    public Result<Void> reorderItems(@PathVariable Long id, @RequestBody List<ChoreographyItemDTO> itemDTOs) {
        choreographyService.reorderItems(id, itemDTOs);
        return Result.ok();
    }
}
