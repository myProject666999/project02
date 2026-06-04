package com.dance.library.repository;

import com.dance.library.entity.DanceAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DanceActionRepository extends JpaRepository<DanceAction, Long> {

    List<DanceAction> findByStyle(String style);

    List<DanceAction> findByBeat(Integer beat);

    List<DanceAction> findByDifficulty(Integer difficulty);

    List<DanceAction> findByBodyPart(String bodyPart);

    List<DanceAction> findByNameContaining(String name);

    @Query("SELECT da FROM DanceAction da WHERE " +
            "(:style IS NULL OR da.style = :style) AND " +
            "(:beat IS NULL OR da.beat = :beat) AND " +
            "(:difficulty IS NULL OR da.difficulty = :difficulty) AND " +
            "(:bodyPart IS NULL OR da.bodyPart = :bodyPart) AND " +
            "(:name IS NULL OR da.name LIKE %:name%)")
    List<DanceAction> findByConditions(
            @Param("style") String style,
            @Param("beat") Integer beat,
            @Param("difficulty") Integer difficulty,
            @Param("bodyPart") String bodyPart,
            @Param("name") String name);
}
