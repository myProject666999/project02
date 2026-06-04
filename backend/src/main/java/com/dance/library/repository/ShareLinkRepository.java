package com.dance.library.repository;

import com.dance.library.entity.ShareLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShareLinkRepository extends JpaRepository<ShareLink, Long> {

    Optional<ShareLink> findByShareCode(String shareCode);

    List<ShareLink> findByChoreographyId(Long choreographyId);
}
