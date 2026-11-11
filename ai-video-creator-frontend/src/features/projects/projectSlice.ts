import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type ProjectState = {
    selectedProjectId: string | null
}

const initialState: ProjectState = {
    selectedProjectId: null,
}

const projectSlice = createSlice({
    name: 'project',
    initialState,
    reducers: {
        selectProject(state, action: PayloadAction<string>) {
            state.selectedProjectId = action.payload
        },
    },
})

export const { selectProject } = projectSlice.actions
export default projectSlice.reducer