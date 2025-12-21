import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export interface AdminUser {
    id: number;
    email: string;
    name: string;
    role: 'super_admin';
}

/**
 * اعتبارسنجی توکن admin از request
 */
export async function verifyAdminToken(request: NextRequest): Promise<AdminUser | null> {
    try {
        console.log('🔍 Debug: Checking admin token...');
        console.log('🔍 Debug: Request URL:', request.url);
        console.log('🔍 Debug: Request headers:', Object.fromEntries(request.headers.entries()));
        
        // بررسی تمام کوکی‌ها
        const allCookies = request.cookies.getAll();
        console.log('🔍 Debug: All cookies:', allCookies);
        
        const token = request.cookies.get('admin_token')?.value;
        console.log('🔍 Debug: Token from cookie:', token ? `${token.substring(0, 50)}...` : 'NOT FOUND');

        if (!token) {
            console.log('❌ Debug: No token found in cookies');
            return null;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as any;
        console.log('✅ Debug: Token decoded successfully:', { id: decoded.id, email: decoded.email });

        return {
            id: decoded.id,
            email: decoded.email,
            name: decoded.name,
            role: 'super_admin'
        };

    } catch (error) {
        console.log('❌ Debug: Token verification failed:', error instanceof Error ? error.message : 'Unknown error');
        return null;
    }
}

/**
 * Middleware helper برای محافظت از admin routes
 */
export function requireAdmin(handler: (request: NextRequest, admin: AdminUser) => Promise<Response>) {
    return async (request: NextRequest) => {
        console.log('🔒 RequireAdmin middleware called for:', request.url);
        
        const admin = await verifyAdminToken(request);

        if (!admin) {
            console.log('❌ RequireAdmin: Authentication failed');
            return new Response(
                JSON.stringify({ success: false, message: 'غیر مجاز - لطفاً وارد شوید' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }

        console.log('✅ RequireAdmin: Authentication successful, calling handler');
        return handler(request, admin);
    };
}