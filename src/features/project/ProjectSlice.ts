import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Project} from '../../types/Project';
import {ProjectStage} from '../../enum/ProjectStage';
import {StoryBeat} from '../../types/StoryBeat';
import {RootState} from "../../store.ts";

interface ProjectState {
    projects: Project[];
    currentProjectId: string | null;
    loading: boolean;
    route: ProjectStage;
}

const initialState: ProjectState = {
    projects: [],
    currentProjectId: null,
    loading: false,
    route: ProjectStage.INITIAL,
};

const ProjectSlice = createSlice({
    name: 'project',
    initialState,
    reducers: {
        setRoute(state, action: PayloadAction<ProjectStage>) {
          state.route = action.payload;
        },
        addProject(state, action: PayloadAction<Project>) {
            state.projects.push(action.payload);
        },
        updateProject(state, action: PayloadAction<Project>) {
            const index = state.projects.findIndex(project => project.id === action.payload.id);
            if (index !== -1) {
                state.projects[index] = {
                    ...state.projects[index],
                    ...action.payload
                };
            }
        },
        deleteProject(state, action: PayloadAction<string>) {
            state.projects = state.projects.filter(project => project.id !== action.payload);
            if (state.currentProjectId === action.payload) {
                state.currentProjectId = null;
            }
        },
        setCurrentProject(state, action: PayloadAction<string | null>) {
            state.currentProjectId = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        updateProjectStage(state, action: PayloadAction<ProjectStage>) {
            if (state.projects && state.currentProjectId) {
                const index = state.projects.findIndex(project => project.id === state.currentProjectId);
                state.projects[index].projectStage = action.payload;
            }
        },
        updateBrainstorming(state, action: PayloadAction<{ projectId: string; text: string }>) {
            const project = state.projects.find(p => p.id === action.payload.projectId);
            if (project) {
                project.brainstorm = action.payload.text;
            }
        },
        addStoryBeat(state, action: PayloadAction<{ projectId: string; storyBeat: StoryBeat }>) {
            const project = state.projects.find(p => p.id === action.payload.projectId);
            if (project) {
                project.storyBeats.push(action.payload.storyBeat);
            }
        },
        updateStoryBeat(state, action: PayloadAction<{ projectId: string; storyBeat: StoryBeat }>) {
            const project = state.projects.find(p => p.id === action.payload.projectId);
            if (project) {
                const index = project.storyBeats.findIndex(b => b.id === action.payload.storyBeat.id);
                if (index !== -1) {
                    project.storyBeats[index] = action.payload.storyBeat;
                }
            }
        },
        updateStoryBeats(state, action: PayloadAction<{ projectId: string, storyBeats: StoryBeat[] }>) {
            const project = state.projects.find(p => p.id === action.payload.projectId);
            if (project) {
                project.storyBeats = action.payload.storyBeats;

            }
        },
        deleteStoryBeat(state, action: PayloadAction<{ projectId: string; storyBeatId: string }>) {
            const project = state.projects.find(p => p.id === action.payload.projectId);
            if (project) {
                project.storyBeats = project.storyBeats.filter(b => b.id !== action.payload.storyBeatId);
            }
        },
        resetStoryBeatLocks: (state, action: PayloadAction<{ projectId: string }>) => {
            const {projectId} = action.payload;
            const project = state.projects.find(p => p.id === projectId);
            if (project) {
                project.storyBeats = project.storyBeats.map(beat => ({
                    ...beat,
                    locked: false,
                }));
            }
        },
        updateStoryBeatImpulses(state, action: PayloadAction<{ projectId: string, storyBeatId: string, impulses: string[] }>) {
            const project = state.projects.find(p => p.id === action.payload.projectId);
            if (project) {
                const storyBeat = project.storyBeats.find(b => b.id === action.payload.storyBeatId);
                if (storyBeat) {
                    storyBeat.impulses = action.payload.impulses;
                }
            }
        },
        updateSuggestions(state, action: PayloadAction<{projectId: string, suggestions: string[]}>) {
            const project = state.projects.find(p => p.id === action.payload.projectId);
            if (project) {
                project.suggestions = action.payload.suggestions;
            }
        }
    },
});

export const selectRoute = (state: RootState) => state.projects.route;
export const selectProjects = (state: RootState) => state.projects.projects;
export const selectCurrentProject = (state: RootState) => state.projects.projects.find(project => project.id === state.projects.currentProjectId) || null;
export const selectLoading = (state: RootState) => state.projects.loading;

export const {
    setRoute,
    addProject,
    updateProject,
    deleteProject,
    setCurrentProject,
    setLoading,
    updateProjectStage,
    updateBrainstorming,
    addStoryBeat,
    updateStoryBeat,
    updateStoryBeats,
    deleteStoryBeat,
    resetStoryBeatLocks,
    updateStoryBeatImpulses,
    updateSuggestions
} = ProjectSlice.actions;

export default ProjectSlice.reducer;
