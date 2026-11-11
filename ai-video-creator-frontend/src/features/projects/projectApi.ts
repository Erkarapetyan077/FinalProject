import type { CreateProjectRequest, CreateProjectResponse, GetProjectsResponse } from "../../helpers/helper";
import { mainApi } from "../mainApi";


const projectApi = mainApi.injectEndpoints({
    endpoints: (builder) => ({

        createProjects: builder.mutation<CreateProjectResponse, CreateProjectRequest>({
            query: (projectForm) => ({
                url: '/projects',
                method: 'POST',
                body: projectForm
            }),
            invalidatesTags: ['Projects']
        }),
        listProject: builder.query<GetProjectsResponse, { page: number; limit: number }>({
            query: ({ page, limit }) => ({
                url: '/projects',
                method: 'GET',
                params: { page, limit }
            }),
            providesTags: ['Projects']
        })

    })
})

export const {
    useCreateProjectsMutation,
    useListProjectQuery
} = projectApi;