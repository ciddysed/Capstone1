package com.caps.eteeapp.repository;

import com.caps.eteeapp.model.Evaluator;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EvaluatorRepository extends JpaRepository<Evaluator, Long> {
    Optional<Evaluator> findByEmail(String email);
}
