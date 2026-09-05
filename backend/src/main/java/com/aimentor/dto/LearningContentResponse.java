package com.aimentor.dto;

import com.aimentor.entity.LearningContent;

public class LearningContentResponse {

    private Long id;

    private Long moduleId;

    private String title;

    private String contentType;

    private String content;

    private String resourceUrl;

    private Integer contentOrder;

    private boolean completed;

    // =====================================================
    // DEFAULT CONSTRUCTOR
    // =====================================================

    public LearningContentResponse() {
    }

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public LearningContentResponse(
            LearningContent learningContent) {

        if (learningContent == null) {
            return;
        }

        this.id = learningContent.getId();

        if (learningContent.getModule() != null) {
            this.moduleId =
                    learningContent.getModule().getId();
        }

        this.title =
                learningContent.getTitle();

        if (learningContent.getContentType() != null) {
            this.contentType =
                    learningContent
                            .getContentType()
                            .name();
        }

        this.content =
                learningContent.getContent();

        this.resourceUrl =
                learningContent.getResourceUrl();

        this.contentOrder =
                learningContent.getContentOrder();

        this.completed =
                learningContent.isCompleted();
    }

    // =====================================================
    // GETTERS
    // =====================================================

    public Long getId() {
        return id;
    }

    public Long getModuleId() {
        return moduleId;
    }

    public String getTitle() {
        return title;
    }

    public String getContentType() {
        return contentType;
    }

    public String getContent() {
        return content;
    }

    public String getResourceUrl() {
        return resourceUrl;
    }

    public Integer getContentOrder() {
        return contentOrder;
    }

    public boolean isCompleted() {
        return completed;
    }
}