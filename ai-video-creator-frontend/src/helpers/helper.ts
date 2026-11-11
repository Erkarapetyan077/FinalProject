export type SignupFormValues = {

    name: string
    email: string
    password: string
}

export type LoginRequest = {
    email: string,
    password: string
}

export type LoginResponse = {
    success: boolean,
    data: { token: string }
}

export type ChangePasswordResponse = {
    success: boolean,
    message: string
}

export type ChangePasswordRequest = {
    currentPassword: string,
    newPassword: string
}


export type ChangeAvatarResponse = {
    success: boolean,
    data: User

}



type User = {
    id: string,
    name: string,
    email: string,
    avatarUrl: string,
    createdAt: string,
    updatedAt: string
}

export type getMeResponse = {
    success: boolean,
    data: { user: User }
}

export type SigninFormValues = Omit<SignupFormValues, "name">


export type RegisterResponse = LoginResponse
export type RegisterRequest = SignupFormValues

export function getApiErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'object' && error !== null && 'data' in error) {
        const data = error.data
        if (typeof data === 'object' && data !== null && 'message' in data && typeof data.message === 'string') {
            return data.message
        }
    }
    return fallback
}


export type CreateProjectRequest = {
    title: string
    topic: string
    scriptText: string
}

export type Project = {
    id: string
    userId: string
    title: string
    topic: string
    scriptText: string
    status: 'draft'
    createdAt: string
    updatedAt: string
}

export type CreateProjectResponse = {
    success: true
    data: {
        project: Project
    }
}

export type GetProjectsResponse = {
    success: true;
    data: {
        items: Project[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
};