import api from "./api";

// =====================================================
// GET LOGGED-IN STUDENT ROADMAPS
// =====================================================

export const getStudentRoadmaps = async () => {
    const response = await api.get(
        "/api/roadmaps/student"
    );

    return response.data;
};


// =====================================================
// GENERATE AI ROADMAP
// =====================================================

export const generateAIRoadmap = async (focusSkill) => {

    if (!focusSkill || !String(focusSkill).trim()) {
        throw new Error(
            "Please select a skill before generating the roadmap."
        );
    }

    const skill = String(focusSkill).trim();

    console.log("====================================");
    console.log("GENERATING GEMINI AI ROADMAP");
    console.log("FOCUS SKILL:", skill);
    console.log("====================================");

    const response = await api.post(
        "/api/ai/roadmaps/generate",
        null,
        {
            params: {
                focusSkill: skill
            }
        }
    );

    console.log("====================================");
    console.log("AI ROADMAP GENERATED");
    console.log("FOCUS SKILL:", skill);
    console.log("RESPONSE:", response.data);
    console.log("====================================");

    if (!response.data) {
        throw new Error(
            "Backend returned an empty roadmap."
        );
    }

    return response.data;
};


// =====================================================
// GET SINGLE ROADMAP
// =====================================================

export const getRoadmap = async (roadmapId) => {

    if (!roadmapId) {
        throw new Error("Roadmap ID is required.");
    }

    const response = await api.get(
        `/api/roadmaps/${roadmapId}`
    );

    return response.data;
};


// =====================================================
// GET ROADMAP PROGRESS
// =====================================================

export const getRoadmapProgress = async (roadmapId) => {

    if (!roadmapId) {
        throw new Error("Roadmap ID is required.");
    }

    const response = await api.get(
        `/api/roadmaps/${roadmapId}/progress`
    );

    return response.data;
};


// =====================================================
// GET ROADMAP MODULES
// =====================================================

export const getRoadmapModules = async (roadmapId) => {

    if (!roadmapId) {
        throw new Error("Roadmap ID is required.");
    }

    const response = await api.get(
        `/api/roadmaps/${roadmapId}/modules`
    );

    return response.data;
};


// =====================================================
// GET LEARNING FLOW
// =====================================================

export const getLearningFlow = async (roadmapId) => {

    if (!roadmapId) {
        throw new Error("Roadmap ID is required.");
    }

    const response = await api.get(
        `/api/roadmaps/${roadmapId}/learning-flow`
    );

    return response.data;
};


// =====================================================
// GET SINGLE MODULE
// =====================================================

export const getModule = async (moduleId) => {

    if (!moduleId) {
        throw new Error("Module ID is required.");
    }

    const response = await api.get(
        `/api/roadmaps/modules/${moduleId}`
    );

    return response.data;
};


// =====================================================
// COMPLETE MODULE
// =====================================================

export const completeModule = async (moduleId) => {

    if (!moduleId) {
        throw new Error("Module ID is required.");
    }

    const response = await api.put(
        `/api/roadmaps/modules/${moduleId}/complete`
    );

    return response.data;
};


// =====================================================
// UPDATE MODULE STATUS
// =====================================================

export const updateModuleStatus = async (
    moduleId,
    status
) => {

    if (!moduleId) {
        throw new Error("Module ID is required.");
    }

    if (!status) {
        throw new Error("Module status is required.");
    }

    const response = await api.put(
        `/api/roadmaps/modules/${moduleId}/status`,
        null,
        {
            params: {
                status
            }
        }
    );

    return response.data;
};


// =====================================================
// GET MODULE PROGRESS
// =====================================================

export const getModuleProgress = async (moduleId) => {

    if (!moduleId) {
        throw new Error("Module ID is required.");
    }

    const response = await api.get(
        `/api/roadmap-modules/${moduleId}/progress`
    );

    return response.data;
};


// =====================================================
// UPDATE MODULE PROGRESS
// =====================================================

export const updateModuleProgress = async (
    moduleId,
    status
) => {

    if (!moduleId) {
        throw new Error("Module ID is required.");
    }

    if (!status) {
        throw new Error("Module status is required.");
    }

    const response = await api.put(
        `/api/roadmap-modules/${moduleId}/progress`,
        null,
        {
            params: {
                status
            }
        }
    );

    return response.data;
};


// =====================================================
// DEFAULT EXPORT
// =====================================================

const roadmapService = {
    getStudentRoadmaps,
    generateAIRoadmap,
    getRoadmap,
    getRoadmapProgress,
    getRoadmapModules,
    getLearningFlow,
    getModule,
    completeModule,
    updateModuleStatus,
    getModuleProgress,
    updateModuleProgress
};

export default roadmapService;