// Helper function to get auth token from cookie or localStorage
export const getAuthToken = () => {
    if (typeof window !== 'undefined') {
        // First try to get from cookie
        const cookieToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('auth-token='))
            ?.split('=')[1];

        if (cookieToken) {
            return cookieToken;
        }

        // Fallback to localStorage
        return localStorage.getItem('auth-token');
    }
    return null;
};

// Helper function to get current user from localStorage
export const getCurrentUser = () => {
    if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    }
    return null;
};

// Helper function to clear auth data
export const clearAuthData = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('auth-token');
        document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
};

// Helper function to logout
export const logout = () => {
    clearAuthData();
};