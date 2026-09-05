package com.aimentor.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "learning_contents")
public class LearningContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =====================================================
    // MODULE
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "module_id",
            nullable = false
    )
    private RoadmapModule module;

    // =====================================================
    // TITLE
    // =====================================================

    @Column(
            nullable = false,
            length = 200
    )
    private String title;

    // =====================================================
    // CONTENT TYPE
    // =====================================================

    @Enumerated(EnumType.STRING)
    @Column(
            name = "content_type",
            nullable = false,
            length = 50
    )
    private LearningContentType contentType;

    // =====================================================
    // CONTENT
    // =====================================================

    @Column(columnDefinition = "TEXT")
    private String content;

    // =====================================================
    // RESOURCE URL
    // =====================================================

    @Column(length = 500)
    private String resourceUrl;

    // =====================================================
    // ORDER
    // =====================================================

    @Column(
            name = "content_order",
            nullable = false
    )
    private Integer contentOrder;

    // =====================================================
    // COMPLETED
    // =====================================================

    @Column(nullable = false)
    private boolean completed = false;

    // =====================================================
    // DEFAULT CONSTRUCTOR
    // =====================================================

    public LearningContent() {
    }

    // =====================================================
    // PARAMETERIZED CONSTRUCTOR
    // =====================================================

    public LearningContent(
            RoadmapModule module,
            String title,
            LearningContentType contentType,
            String content,
            String resourceUrl,
            Integer contentOrder
    ) {

        this.module = module;
        this.title = title;
        this.contentType = contentType;
        this.content = content;
        this.resourceUrl = resourceUrl;
        this.contentOrder = contentOrder;
        this.completed = false;
    }

    // =====================================================
    // GETTERS / SETTERS
    // =====================================================

    public Long getId() {
        return id;
    }

    public RoadmapModule getModule() {
        return module;
    }

    public void setModule(RoadmapModule module) {
        this.module = module;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public LearningContentType getContentType() {
        return contentType;
    }

    public void setContentType(
            LearningContentType contentType
    ) {
        this.contentType = contentType;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getResourceUrl() {
        return resourceUrl;
    }

    public void setResourceUrl(String resourceUrl) {
        this.resourceUrl = resourceUrl;
    }

    public Integer getContentOrder() {
        return contentOrder;
    }

    public void setContentOrder(
            Integer contentOrder
    ) {
        this.contentOrder = contentOrder;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(
            boolean completed
    ) {
        this.completed = completed;
    }
}