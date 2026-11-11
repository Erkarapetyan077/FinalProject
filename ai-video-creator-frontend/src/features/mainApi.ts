import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE } from "../helpers/constants";

export const mainApi = createApi({
    reducerPath: 'mainApi',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as { auth: { token: string | null } }).auth.token
            if (token) headers.set('Authorization', `Bearer ${token}`)
            return headers
        },
    }),
    tagTypes: ['Projects'],
    endpoints: () => ({})
})
