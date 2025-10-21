'use client';

import { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
    Search,
    Send,
    MessageCircle,
    Circle,
    Paperclip,
    Image as ImageIcon,
    File,
    Download,
    X,
    Reply,
    MoreHorizontal,
    Phone,
    Video,
    ArrowLeft,
    Users,
    Settings,
    Mic
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent } from '@/components/ui/sheet';

// TypeScript interfaces
interface User {
    id: string;
    name: string;
    email: string;
    role?: string;
    status: 'online' | 'offline';
    avatar_url?: string;
}

interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    conversation_id?: string;
    reply_to_id?: string;
    message: string;
    message_type: 'text' | 'image' | 'file' | 'system';
    file_url?: string;