package com.dance.library.service;

import com.dance.library.dto.ChoreographyDTO;
import com.dance.library.dto.ShareLinkDTO;
import com.dance.library.entity.Choreography;
import com.dance.library.entity.ShareLink;
import com.dance.library.repository.ChoreographyRepository;
import com.dance.library.repository.ShareLinkRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShareLinkService {

    private final ShareLinkRepository shareLinkRepository;
    private final ChoreographyRepository choreographyRepository;
    private final ChoreographyService choreographyService;

    @Transactional
    public ShareLinkDTO generateShareLink(Long choreographyId) {
        Choreography choreography = choreographyRepository.findById(choreographyId)
                .orElseThrow(() -> new EntityNotFoundException("Choreography not found with id: " + choreographyId));

        ShareLink shareLink = new ShareLink();
        shareLink.setChoreography(choreography);
        shareLink.setShareCode(UUID.randomUUID().toString().replace("-", "").substring(0, 16));
        shareLink.setIsActive(true);
        shareLink = shareLinkRepository.save(shareLink);

        return toDTO(shareLink);
    }

    public ChoreographyDTO getChoreographyByShareCode(String shareCode) {
        ShareLink shareLink = shareLinkRepository.findByShareCode(shareCode)
                .orElseThrow(() -> new EntityNotFoundException("Share link not found with code: " + shareCode));

        if (!shareLink.getIsActive()) {
            throw new IllegalStateException("Share link is no longer active");
        }

        if (shareLink.getExpireAt() != null && shareLink.getExpireAt().isBefore(java.time.LocalDateTime.now())) {
            throw new IllegalStateException("Share link has expired");
        }

        return choreographyService.getById(shareLink.getChoreography().getId());
    }

    @Transactional
    public void deactivateShareLink(Long id) {
        ShareLink shareLink = shareLinkRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Share link not found with id: " + id));
        shareLink.setIsActive(false);
        shareLinkRepository.save(shareLink);
    }

    public List<ShareLinkDTO> listAll() {
        return shareLinkRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ShareLinkDTO> getByChoreographyId(Long choreographyId) {
        return shareLinkRepository.findByChoreographyId(choreographyId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private ShareLinkDTO toDTO(ShareLink shareLink) {
        ShareLinkDTO dto = new ShareLinkDTO();
        dto.setId(shareLink.getId());
        dto.setChoreographyId(shareLink.getChoreography().getId());
        dto.setShareCode(shareLink.getShareCode());
        dto.setIsActive(shareLink.getIsActive());
        dto.setExpireAt(shareLink.getExpireAt());
        dto.setChoreographyName(shareLink.getChoreography().getName());
        return dto;
    }
}
