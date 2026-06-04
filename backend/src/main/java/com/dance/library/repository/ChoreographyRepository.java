package com.dance.library.repository;

import com.dance.library.entity.Choreography;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChoreographyRepository extends JpaRepository<Choreography, Long> {
}
