package com.aimentor.controller;

import com.aimentor.entity.CareerGoal;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/career-goals")
public class CareerGoalController {

    @GetMapping
    public ResponseEntity<List<String>> getCareerGoals() {

        List<String> goals = Arrays.stream(CareerGoal.values())
                .map(Enum::name)
                .toList();

        return ResponseEntity.ok(goals);
    }
}