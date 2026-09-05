package com.aimentor.service;

import com.aimentor.dto.ResourceResponse;
import com.aimentor.entity.Resource;
import com.aimentor.entity.StudentSkill;
import com.aimentor.repository.ResourceRepository;
import com.aimentor.repository.StudentSkillRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final StudentSkillRepository studentSkillRepository;

    public ResourceService(
            ResourceRepository resourceRepository,
            StudentSkillRepository studentSkillRepository
    ) {
        this.resourceRepository = resourceRepository;
        this.studentSkillRepository = studentSkillRepository;
    }

    // =====================================================
    // 1. PERSONALIZED RESOURCES
    // =====================================================

    @Transactional(readOnly = true)
    public List<ResourceResponse> getMyResources(Long studentId) {

        System.out.println(
                "📚 Loading personalized resources for student: "
                        + studentId
        );

        if (studentId == null) {
            return Collections.emptyList();
        }

        List<StudentSkill> studentSkills =
                studentSkillRepository.findByStudentIdWithSkill(studentId);

        if (studentSkills == null || studentSkills.isEmpty()) {

            System.out.println(
                    "⚠️ No skills found for student: " + studentId
            );

            return Collections.emptyList();
        }

        System.out.println(
                "🎯 Student skills found: "
                        + studentSkills.size()
        );

        List<Long> skillIds = studentSkills
                .stream()
                .filter(ss -> ss != null)
                .filter(ss -> ss.getSkill() != null)
                .map(ss -> ss.getSkill().getId())
                .filter(id -> id != null)
                .distinct()
                .toList();

        System.out.println(
                "🎯 Skill IDs: " + skillIds
        );

        if (skillIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<Resource> resources =
                resourceRepository.findResourcesBySkillIds(skillIds);

        if (resources == null || resources.isEmpty()) {

            System.out.println(
                    "⚠️ No resources found for skills: "
                            + skillIds
            );

            return Collections.emptyList();
        }

        System.out.println(
                "📚 Resources found: "
                        + resources.size()
        );

        return resources
                .stream()
                .filter(resource -> resource != null)
                .filter(resource -> resource.getSkill() != null)
                .filter(resource ->
                        resource.getSkill().getId() != null
                )
                .map(resource ->
                        toResponse(resource, studentSkills)
                )
                .filter(response -> response != null)
                .toList();
    }

    // =====================================================
    // 2. ALL RESOURCES
    // =====================================================

    @Transactional(readOnly = true)
    public List<Resource> getAllResources() {

        System.out.println("📚 Loading all resources");

        return resourceRepository.findAll();
    }

    // =====================================================
    // 3. RESOURCES BY SKILL
    // =====================================================

    @Transactional(readOnly = true)
    public List<Resource> getResourcesBySkill(Long skillId) {

        System.out.println(
                "🎯 Loading resources for skill: "
                        + skillId
        );

        if (skillId == null) {
            return Collections.emptyList();
        }

        return resourceRepository
                .findBySkillIdInOrderByIdDesc(
                        List.of(skillId)
                );
    }

    // =====================================================
    // 4. RESOURCES BY SKILL + TYPE
    // =====================================================

    @Transactional(readOnly = true)
    public List<Resource> getResourcesBySkillAndType(
            Long skillId,
            String type
    ) {

        System.out.println(
                "🎬 Loading resources | skill="
                        + skillId
                        + " | type="
                        + type
        );

        if (skillId == null || type == null || type.isBlank()) {
            return Collections.emptyList();
        }

        return resourceRepository
                .findBySkillIdInAndTypeIgnoreCaseOrderByIdDesc(
                        List.of(skillId),
                        type
                );
    }

    // =====================================================
    // 5. RESOURCES BY TYPE
    // =====================================================

    @Transactional(readOnly = true)
    public List<Resource> getResourcesByType(String type) {

        System.out.println(
                "📚 Loading resources by type: "
                        + type
        );

        if (type == null || type.isBlank()) {
            return Collections.emptyList();
        }

        /*
         * ResourceRepository currently has:
         *
         * findBySkillIdInAndTypeIgnoreCaseOrderByIdDesc()
         *
         * but no direct:
         *
         * findByTypeIgnoreCaseOrderByIdDesc()
         *
         * So this method uses a JPQL repository method.
         */

        return resourceRepository
                .findByTypeIgnoreCaseOrderByIdDesc(type);
    }

    // =====================================================
    // 6. RESOURCES BY CATEGORY
    // =====================================================

    @Transactional(readOnly = true)
    public List<Resource> getResourcesByCategory(
            String category
    ) {

        System.out.println(
                "📂 Loading resources by category: "
                        + category
        );

        if (category == null || category.isBlank()) {
            return Collections.emptyList();
        }

        return resourceRepository
                .findByCategoryIgnoreCaseOrderByIdDesc(
                        category
                );
    }

    // =====================================================
    // RESOURCE → DTO
    // =====================================================

    private ResourceResponse toResponse(
            Resource resource,
            List<StudentSkill> studentSkills
    ) {

        if (resource == null) {
            return null;
        }

        if (resource.getSkill() == null) {
            return null;
        }

        Long skillId =
                resource.getSkill().getId();

        if (skillId == null) {
            return null;
        }

        // -------------------------------------------------
        // FIND STUDENT SKILL
        // -------------------------------------------------

        StudentSkill studentSkill =
                studentSkills
                        .stream()
                        .filter(ss -> ss != null)
                        .filter(ss -> ss.getSkill() != null)
                        .filter(ss ->
                                ss.getSkill().getId() != null
                        )
                        .filter(ss ->
                                skillId.equals(
                                        ss.getSkill().getId()
                                )
                        )
                        .findFirst()
                        .orElse(null);

        // -------------------------------------------------
        // SKILL LEVEL
        // -------------------------------------------------

        String skillLevel = null;

        if (studentSkill != null
                && studentSkill.getSkillLevel() != null) {

            skillLevel =
                    studentSkill
                            .getSkillLevel()
                            .name();
        }

        // -------------------------------------------------
        // SKILL NAME
        // -------------------------------------------------

        String skillName =
                resource.getSkill().getName();

        // -------------------------------------------------
        // CREATE DTO
        // -------------------------------------------------

        return new ResourceResponse(
                resource.getId(),
                resource.getTitle(),
                resource.getDescription(),
                resource.getType(),
                resource.getCategory(),
                resource.getUrl(),
                resource.getThumbnailUrl(),
                skillId,
                skillName,
                skillLevel
        );
    }
}