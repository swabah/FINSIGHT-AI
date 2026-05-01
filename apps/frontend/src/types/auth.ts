export interface User {
	id: string;
	username: string;
	email: string;
	token: string;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface RegisterRequest {
	username: string;
	email: string;
	password: string;
}

export interface AuthResponse {
	success: boolean;
	message: string;
	data: User;
}

export interface UserProfile {
	id: string;
	username: string;
	email: string;
	createdAt: string;
}

export interface UserProfileResponse {
	success: boolean;
	data: UserProfile;
}
