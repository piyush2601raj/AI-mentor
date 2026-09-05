package com.aimentor.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "module_contents")
public class ModuleContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "module_id",
            nullable = false
    )
    private RoadmapModule module;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(length = 500)
    private String resourceUrl;

    @Column(name = "content_order", nullable = false)
    private Integer contentOrder;

    public ModuleContent() {
    }

    public ModuleContent(
            RoadmapModule module,
            String title,
            String content,
            String resourceUrl,
            Integer contentOrder) {

        this.module = module;
        this.title = title;
        this.content = content;
        this.resourceUrl = resourceUrl;
        this.contentOrder = contentOrder;
    }

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

    public void setContentOrder(Integer contentOrder) {
        this.contentOrder = contentOrder;
    }
}