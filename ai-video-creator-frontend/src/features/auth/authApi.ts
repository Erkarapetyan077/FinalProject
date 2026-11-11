import { mainApi } from "../mainApi";
import type { ChangeAvatarResponse, ChangePasswordRequest, ChangePasswordResponse, getMeResponse, LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../../helpers/helper';


const authApi = mainApi.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<LoginResponse, LoginRequest>({
            query: (loginForm) => ({
                url: '/auth/login',
                method: "POST",
                body: loginForm
            })
        }),
        register: builder.mutation<RegisterResponse, RegisterRequest>({
            query: (registerForm) => ({
                url: '/auth/register',
                method: 'POST',
                body: registerForm
            })
        }),
        getMe: builder.query<getMeResponse, void>({
            query: () => ({
                url: '/auth/me',
                method: 'GET',
            })

        }),

        changeName: builder.mutation<getMeResponse, { name: string }>({
            query: (name) => ({
                url: '/auth/me',
                method: 'PATCH',
                body: name
            })
        }),


        changePassword: builder.mutation<ChangePasswordResponse, ChangePasswordRequest>({
            query: (passwordForm) => ({
                url: '/auth/password',
                method: 'PATCH',
                body: passwordForm
            })
        }),

        changeAvatar: builder.mutation<ChangeAvatarResponse, FormData>({
            query: (avatarForm) => ({
                url: '/auth/avatar',
                method: 'POST',
                body: avatarForm
            })
        }),

        deleteAvatar: builder.mutation<void, void>({
            query: () => ({
                url: '/auth/avatar',
                method: 'DELETE',
            }),
        }),

    })

})

export const {
    useLoginMutation,
    useRegisterMutation,
    useGetMeQuery,
    useChangeNameMutation,
    useChangePasswordMutation,
    useChangeAvatarMutation,
    useDeleteAvatarMutation
} = authApi;
