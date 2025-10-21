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
        const token = request.cookies.get('admin_token')?.value;

        if (!token) {
            return null;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as any;

        return {
            id: decoded.id,
            email: decoded.email,
            name: decoded.name,
            role: 'super_admin'
        };

    } catch (error) {
        return null;
    }
}

/**
 * Middleware helper برای محافظت از admin routes
 */
export function requireAdmin(handler: (request: NextRequest, admin: AdminUser) => Promise<Response>) {
    return async (request: NextRequest) => {
        const admin = await verifyAdminToken(request);

        if (!admin) {
            return new Response(
                JSON.stringify({ success: false, message: 'دسترسی غیرمجاز' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return handler(request, admin);
    };
}