package com.dance.library.repository;

import com.dance.library.entity.ChoreographyItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChoreographyItemRepository extends JpaRepository<ChoreographyItem, Long> {

    List<ChoreographyItem> findByChoreographyIdOrderBySortOrder(Long choreographyId);

    void deleteByChoreographyIdAndId(Long choreographyId, Long itemId);
}
