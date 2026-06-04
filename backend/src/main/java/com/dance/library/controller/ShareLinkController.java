package com.dance.library.controller;

import com.dance.library.dto.ChoreographyDTO;
import com.dance.library.dto.Result;
import com.dance.library.dto.ShareLinkDTO;
import com.dance.library.service.ShareLinkService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/share")
@CrossOrigin
@RequiredArgsConstructor
public class ShareLinkController {

    private final ShareLinkService shareLinkService;

    @GetMapping
    public Result<List<ShareLinkDTO>> listAll() {
        return Result.ok(shareLinkService.listAll());
    }

    @PostMapping("/{choreographyId}")
    public Result<ShareLinkDTO> generateShareLink(@PathVariable Long choreographyId) {
        return Result.ok(shareLinkService.generateShareLink(choreographyId));
    }

    @GetMapping("/{shareCode}")
    public Result<ChoreographyDTO> getChoreographyByShareCode(@PathVariable String shareCode) {
        return Result.ok(shareLinkService.getChoreographyByShareCode(shareCode));
    }

    @DeleteMapping("/{id}")
    public Result<Void> deactivateShareLink(@PathVariable Long id) {
        shareLinkService.deactivateShareLink(id);
        return Result.ok();
    }
}
