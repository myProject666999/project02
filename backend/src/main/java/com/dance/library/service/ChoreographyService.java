package com.dance.library.service;

import com.dance.library.dto.ChoreographyDTO;
import com.dance.library.dto.ChoreographyItemDTO;
import com.dance.library.entity.Choreography;
import com.dance.library.entity.ChoreographyItem;
import com.dance.library.entity.DanceAction;
import com.dance.library.repository.ChoreographyItemRepository;
import com.dance.library.repository.ChoreographyRepository;
import com.dance.library.repository.DanceActionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChoreographyService {

    private final ChoreographyRepository choreographyRepository;
    private final ChoreographyItemRepository choreographyItemRepository;
    private final DanceActionRepository danceActionRepository;

    @Transactional
    public ChoreographyDTO create(ChoreographyDTO dto) {
        Choreography choreography = new Choreography();
        choreography.setName(dto.getName());
        choreography.setTotalBeats(dto.getTotalBeats());
        choreography.setDescription(dto.getDescription());
        choreography = choreographyRepository.save(choreography);
        return toDTO(choreography);
    }

    @Transactional
    public ChoreographyDTO update(Long id, ChoreographyDTO dto) {
        Choreography choreography = choreographyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Choreography not found with id: " + id));
        choreography.setName(dto.getName());
        choreography.setTotalBeats(dto.getTotalBeats());
        choreography.setDescription(dto.getDescription());
        choreography = choreographyRepository.save(choreography);
        return toDTO(choreography);
    }

    @Transactional
    public void delete(Long id) {
        if (!choreographyRepository.existsById(id)) {
            throw new EntityNotFoundException("Choreography not found with id: " + id);
        }
        choreographyRepository.deleteById(id);
    }

    public ChoreographyDTO getById(Long id) {
        Choreography choreography = choreographyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Choreography not found with id: " + id));
        return toDTO(choreography);
    }

    public List<ChoreographyDTO> listAll() {
        return choreographyRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ChoreographyItemDTO addItem(Long choreographyId, ChoreographyItemDTO itemDTO) {
        Choreography choreography = choreographyRepository.findById(choreographyId)
                .orElseThrow(() -> new EntityNotFoundException("Choreography not found with id: " + choreographyId));
        DanceAction action = danceActionRepository.findById(itemDTO.getActionId())
                .orElseThrow(() -> new EntityNotFoundException("DanceAction not found with id: " + itemDTO.getActionId()));

        ChoreographyItem item = new ChoreographyItem();
        item.setChoreography(choreography);
        item.setAction(action);
        item.setSortOrder(itemDTO.getSortOrder());
        item.setBeatPosition(itemDTO.getBeatPosition());
        item = choreographyItemRepository.save(item);

        return toItemDTO(item);
    }

    @Transactional
    public void removeItem(Long choreographyId, Long itemId) {
        choreographyItemRepository.deleteByChoreographyIdAndId(choreographyId, itemId);
    }

    @Transactional
    public void reorderItems(Long choreographyId, List<ChoreographyItemDTO> itemDTOs) {
        List<ChoreographyItem> items = choreographyItemRepository
                .findByChoreographyIdOrderBySortOrder(choreographyId);

        for (ChoreographyItemDTO dto : itemDTOs) {
            items.stream()
                    .filter(i -> i.getId().equals(dto.getId()))
                    .findFirst()
                    .ifPresent(i -> {
                        i.setSortOrder(dto.getSortOrder());
                        i.setBeatPosition(dto.getBeatPosition());
                        choreographyItemRepository.save(i);
                    });
        }
    }

    private ChoreographyDTO toDTO(Choreography choreography) {
        ChoreographyDTO dto = new ChoreographyDTO();
        dto.setId(choreography.getId());
        dto.setName(choreography.getName());
        dto.setTotalBeats(choreography.getTotalBeats());
        dto.setDescription(choreography.getDescription());
        dto.setItems(choreography.getItems().stream()
                .map(this::toItemDTO)
                .collect(Collectors.toList()));
        return dto;
    }

    private ChoreographyItemDTO toItemDTO(ChoreographyItem item) {
        ChoreographyItemDTO dto = new ChoreographyItemDTO();
        dto.setId(item.getId());
        dto.setActionId(item.getAction().getId());
        dto.setActionName(item.getAction().getName());
        dto.setSortOrder(item.getSortOrder());
        dto.setBeatPosition(item.getBeatPosition());
        dto.setVideoPath(item.getAction().getVideoPath());
        return dto;
    }
}
