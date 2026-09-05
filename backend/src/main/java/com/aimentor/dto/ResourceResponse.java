package com.aimentor.dto;

public class ResourceResponse {

    private Long id;
    private String title;
    private String description;
    private String type;
    private String category;
    private String url;
    private String thumbnailUrl;
    private Long skillId;
    private String skillName;
    private String skillLevel;

    public ResourceResponse(
            Long id,
            String title,
            String description,
            String type,
            String category,
            String url,
            String thumbnailUrl,
            Long skillId,
            String skillName,
            String skillLevel
    ) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.type = type;
        this.category = category;
        this.url = url;
        this.thumbnailUrl = thumbnailUrl;
        this.skillId = skillId;
        this.skillName = skillName;
        this.skillLevel = skillLevel;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getType() {
        return type;
    }

    public String getCategory() {
        return category;
    }

    public String getUrl() {
        return url;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public Long getSkillId() {
        return skillId;
    }

    public String getSkillName() {
        return skillName;
    }

    public String getSkillLevel() {
        return skillLevel;
    }
}