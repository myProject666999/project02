package com.dance.library.service;

import com.dance.library.dto.DanceActionDTO;
import com.dance.library.dto.DanceActionQueryDTO;
import com.dance.library.entity.DanceAction;
import com.dance.library.repository.DanceActionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DanceActionService {

    private final DanceActionRepository danceActionRepository;

    @Value("${file.upload.video-dir:static/videos/}")
    private String videoDir;

    @Value("${file.upload.cover-dir:static/covers/}")
    private String coverDir;

    @Transactional
    public DanceActionDTO create(DanceActionDTO dto) {
        DanceAction action = new DanceAction();
        BeanUtils.copyProperties(dto, action, "id", "createdAt", "updatedAt");
        action = danceActionRepository.save(action);
        return toDTO(action);
    }

    @Transactional
    public DanceActionDTO update(Long id, DanceActionDTO dto) {
        DanceAction action = danceActionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("DanceAction not found with id: " + id));
        BeanUtils.copyProperties(dto, action, "id", "createdAt", "updatedAt");
        action = danceActionRepository.save(action);
        return toDTO(action);
    }

    @Transactional
    public void delete(Long id) {
        if (!danceActionRepository.existsById(id)) {
            throw new EntityNotFoundException("DanceAction not found with id: " + id);
        }
        danceActionRepository.deleteById(id);
    }

    public DanceActionDTO getById(Long id) {
        DanceAction action = danceActionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("DanceAction not found with id: " + id));
        return toDTO(action);
    }

    public List<DanceActionDTO> listAll() {
        return danceActionRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<DanceActionDTO> search(DanceActionQueryDTO query) {
        return danceActionRepository.findByConditions(
                query.getStyle(),
                query.getBeat(),
                query.getDifficulty(),
                query.getBodyPart(),
                query.getName()
        ).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public String uploadVideo(MultipartFile file) throws IOException {
        return uploadFile(file, videoDir);
    }

    public String uploadCover(MultipartFile file) throws IOException {
        return uploadFile(file, coverDir);
    }

    private String uploadFile(MultipartFile file, String dir) throws IOException {
        Path dirPath = Paths.get(dir);
        if (!Files.exists(dirPath)) {
            Files.createDirectories(dirPath);
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = UUID.randomUUID().toString() + extension;

        Path filePath = dirPath.resolve(filename);
        file.transferTo(filePath.toFile());

        return dir + filename;
    }

    private DanceActionDTO toDTO(DanceAction action) {
        DanceActionDTO dto = new DanceActionDTO();
        BeanUtils.copyProperties(action, dto);
        return dto;
    }
}
