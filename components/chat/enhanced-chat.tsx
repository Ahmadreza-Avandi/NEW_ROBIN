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
    file_name?: string;
    file_size?: number;
    is_edited: boolean;
    is_deleted: boolean;
    created_at: string;
    edited_at?: string;
    read_at?: string;
    sender_name: string;
    sender_email: string;
    receiver_name: string;
    receiver_email: string;
    reply_to_message?: string;
    reply_to_sender_name?: string;
}

interface EnhancedChatProps {
    currentUserId: string;
    selectedUserId?: string;
    selectedUserName?: string;
}

export default function EnhancedChat({
    currentUserId,
    selectedUserId,
    selectedUserName
}: EnhancedChatProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [replyTo, setReplyTo] = useState<Message | null>(null);
    const [showImagePreview, setShowImagePreview] = useState<string | null>(null);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [lastFetchTime, setLastFetchTime] = useState<number>(0);
    const [isMobile, setIsMobile] = useState(false);
    const [showUsersList, setShowUsersList] = useState(false);

    const { toast } = useToast();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    // Get auth token
    const getAuthToken = () => {
        return document.cookie
            .split('; ')
            .find(row => row.startsWith('auth-token='))
            ?.split('=')[1];
    };
    useEffect(() => {
        fetchUsers();
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (selectedUserId && users.length > 0) {
            const user = users.find(u => u.id === selectedUserId);
            if (user) setSelectedUser(user);
        }
    }, [selectedUserId, users]);

    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser.id, true);
            const interval = setInterval(() => fetchMessages(selectedUser.id), 5000);
            return () => clearInterval(interval);
        }
    }, [selectedUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = getAuthToken();
            const response = await fetch('/api/chat/users', {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Cookie': document.cookie,
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });
            
            console.log('Chat users API response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Chat users API data:', data);
                
                if (data.success && data.data) {
                    setUsers(data.data);
                    console.log(`Loaded ${data.data.length} users for chat`);
                } else {
                    console.error('Users API error:', data.message);
                    toast({
                        title: "خطا",
                        description: data.message || "خطا در دریافت لیست کاربران",
                        variant: "destructive"
                    });
                }
            } else {
                console.error('Users API HTTP error:', response.status);
                toast({
                    title: "خطا در احراز هویت",
                    description: "لطفاً دوباره وارد شوید",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast({
                title: "خطا",
                description: "خطا در ارتباط با سرور",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (userId: string, force: boolean = false) => {
        try {
            const now = Date.now();
            if (!force && now - lastFetchTime < 2000) return;
            setLastFetchTime(now);

            const token = getAuthToken();
            const response = await fetch(`/api/chat/messages?userId=${userId}`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Cookie': document.cookie,
                    'x-user-id': currentUserId,
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setMessages(data.data || []);
                } else {
                    console.error('Messages API error:', data.message);
                }
            } else {
                console.error('Messages API HTTP error:', response.status);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSendMessage = async () => {
        if (!selectedUser || !newMessage.trim()) return;

        setSending(true);
        const messageContent = newMessage.trim();
        setNewMessage('');

        try {
            const token = getAuthToken();
            const response = await fetch('/api/chat/messages', {
                method: 'POST',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Cookie': document.cookie,
                    'x-user-id': currentUserId,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    receiverId: selectedUser.id,
                    message: messageContent,
                    messageType: 'text',
                    replyToId: replyTo?.id || null
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setReplyTo(null);
                    fetchMessages(selectedUser.id, true);
                    toast({ title: "موفق", description: "پیام ارسال شد" });
                } else {
                    throw new Error(data.message);
                }
            } else {
                throw new Error('خطا در ارسال پیام');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast({
                title: "خطا",
                description: "خطا در ارسال پیام",
                variant: "destructive"
            });
            setNewMessage(messageContent);
        } finally {
            setSending(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !selectedUser) return;

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "خطا",
                description: "حجم فایل نباید بیشتر از ۵ مگابایت باشد",
                variant: "destructive"
            });
            return;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            toast({
                title: "خطا",
                description: "فقط فایل‌های تصویری مجاز هستند",
                variant: "destructive"
            });
            return;
        }

        await uploadFile(file, 'image');
        event.target.value = '';
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !selectedUser) return;

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast({
                title: "خطا",
                description: "حجم فایل نباید بیشتر از ۱۰ مگابایت باشد",
                variant: "destructive"
            });
            return;
        }

        await uploadFile(file, 'file');
        event.target.value = '';
    };

    const uploadFile = async (file: File, type: 'image' | 'file') => {
        if (!selectedUser) return;

        setUploadingFile(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('receiverId', selectedUser.id);
            formData.append('messageType', type);

            const token = getAuthToken();
            const response = await fetch('/api/chat/upload', {
                method: 'POST',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    fetchMessages(selectedUser.id, true);
                    toast({
                        title: "موفق",
                        description: type === 'image' ? "تصویر ارسال شد" : "فایل ارسال شد"
                    });
                } else {
                    throw new Error(data.message);
                }
            } else {
                throw new Error('خطا در آپلود فایل');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            toast({
                title: "خطا",
                description: "خطا در ارسال فایل",
                variant: "destructive"
            });
        } finally {
            setUploadingFile(false);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('fa-IR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderMessage = (message: Message) => {
        const isCurrentUser = message.sender_id === currentUserId;
        return (
            <div key={message.id} className={`flex items-start gap-3 mb-4 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-primary/10 text-primary font-vazir text-xs">
                        {isCurrentUser ? 'من' : message.sender_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                </Avatar>
                <div className={`max-w-[70%] ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                    {message.reply_to_message && (
                        <div className="mb-2 p-2 bg-muted/50 rounded-lg border-r-2 border-primary text-sm">
                            <p className="text-muted-foreground font-vazir">پاسخ به {message.reply_to_sender_name}:</p>
                            <p className="font-vazir truncate">{message.reply_to_message}</p>
                        </div>
                    )}
                    <div className={`rounded-2xl p-3 ${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        {message.message_type === 'image' && message.file_url ? (
                            <div className="space-y-2">
                                <img 
                                    src={message.file_url} 
                                    alt="تصویر ارسالی"
                                    className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => setShowImagePreview(message.file_url!)}
                                />
                                {message.message && (
                                    <p className="text-sm font-vazir whitespace-pre-wrap">{message.message}</p>
                                )}
                            </div>
                        ) : message.message_type === 'file' && message.file_url ? (
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 p-3 bg-background/10 rounded-lg">
                                    <File className="h-8 w-8 text-muted-foreground" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{message.file_name || 'فایل'}</p>
                                        {message.file_size && (
                                            <p className="text-xs opacity-70">
                                                {(message.file_size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        )}
                                    </div>
                                    <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        onClick={() => window.open(message.file_url, '_blank')}
                                        className="h-8 w-8 p-0"
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </div>
                                {message.message && (
                                    <p className="text-sm font-vazir whitespace-pre-wrap">{message.message}</p>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm font-vazir whitespace-pre-wrap">{message.message}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-xs opacity-70 font-vazir">
                                {formatTime(message.created_at)}
                                {message.is_edited && ' • ویرایش شده'}
                            </span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                        <MoreHorizontal className="h-3 w-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setReplyTo(message)}>
                                        <Reply className="h-4 w-4 ml-2" />
                                        پاسخ
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-[calc(100vh-120px)] flex bg-background">
            {/* Desktop Users Sidebar */}
            {!isMobile && (
                <div className="w-80 border-l border-border flex flex-col">
                    <div className="p-4 border-b border-border">
                        <h2 className="text-lg font-semibold font-vazir mb-4">چت با همکاران</h2>
                        <div className="relative">
                            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="جستجوی همکار..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pr-10 font-vazir"
                            />
                        </div>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="space-y-1 p-2">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="animate-pulse p-3 rounded-lg">
                                        <div className="flex items-center space-x-3 space-x-reverse">
                                            <div className="w-10 h-10 bg-muted rounded-full"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-muted rounded w-3/4"></div>
                                                <div className="h-3 bg-muted rounded w-1/2"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className={`flex items-center space-x-3 space-x-reverse p-3 rounded-lg cursor-pointer transition-all duration-300 ${selectedUser?.id === user.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'
                                            }`}
                                        onClick={() => setSelectedUser(user)}
                                    >
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={user.avatar_url} />
                                            <AvatarFallback className="bg-primary/10 text-primary font-vazir">
                                                {user.name.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium font-vazir truncate">{user.name}</p>
                                                {user.role && <Badge variant="secondary" className="text-xs">{user.role}</Badge>}
                                            </div>
                                            <div className="flex items-center space-x-2 space-x-reverse text-xs text-muted-foreground mt-1">
                                                <Circle className={`h-2 w-2 ${user.status === 'online' ? 'fill-green-500 text-green-500' : 'fill-gray-500 text-gray-500'}`} />
                                                <span className="font-vazir">{user.status === 'online' ? 'آنلاین' : 'آفلاین'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-muted-foreground p-4">
                                    <p className="font-vazir">همکاری یافت نشد</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            )}
            {/* Mobile Users Sheet */}
            {isMobile && (
                <Sheet open={showUsersList} onOpenChange={setShowUsersList}>
                    <SheetContent side="right" className="w-80 p-0">
                        <div className="flex flex-col h-full">
                            <div className="p-4 border-b border-border">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold font-vazir">چت با همکاران</h2>
                                    <Button size="sm" variant="ghost" onClick={() => setShowUsersList(false)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="relative">
                                    <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="جستجوی همکار..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pr-10 font-vazir"
                                    />
                                </div>
                            </div>
                            <ScrollArea className="flex-1">
                                <div className="space-y-1 p-2">
                                    {filteredUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg cursor-pointer hover:bg-muted/50"
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setShowUsersList(false);
                                            }}
                                        >
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={user.avatar_url} />
                                                <AvatarFallback className="bg-primary/10 text-primary font-vazir">
                                                    {user.name.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium font-vazir truncate">{user.name}</p>
                                                <div className="flex items-center space-x-2 space-x-reverse text-xs text-muted-foreground mt-1">
                                                    <Circle className={`h-2 w-2 ${user.status === 'online' ? 'fill-green-500 text-green-500' : 'fill-gray-500 text-gray-500'}`} />
                                                    <span className="font-vazir">{user.status === 'online' ? 'آنلاین' : 'آفلاین'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </SheetContent>
                </Sheet>
            )}
            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-border">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 space-x-reverse">
                                    {isMobile && (
                                        <Button size="sm" variant="ghost" onClick={() => setShowUsersList(true)} className="mr-2">
                                            <ArrowLeft className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={selectedUser.avatar_url} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-vazir">
                                            {selectedUser.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-semibold font-vazir">{selectedUser.name}</h3>
                                        <p className="text-sm text-muted-foreground font-vazir">{selectedUser.role}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 space-x-reverse">
                                    <Button size="sm" variant="ghost"><Phone className="h-4 w-4" /></Button>
                                    <Button size="sm" variant="ghost"><Video className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {messages.length === 0 ? (
                                    <div className="text-center text-muted-foreground py-12">
                                        <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                        <p className="font-vazir text-lg">هنوز پیامی رد و بدل نشده</p>
                                        <p className="font-vazir text-sm mt-2">اولین پیام را ارسال کنید</p>
                                    </div>
                                ) : (
                                    messages.map(renderMessage)
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>

                        {/* Reply indicator */}
                        {replyTo && (
                            <div className="px-4 py-2 bg-muted/50 border-t">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm text-muted-foreground font-vazir">پاسخ به {replyTo.sender_name}:</p>
                                        <p className="text-sm font-vazir truncate">{replyTo.message}</p>
                                    </div>
                                    <Button size="sm" variant="ghost" onClick={() => setReplyTo(null)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Message Input */}
                        <div className="p-4 border-t border-border">
                            <div className="flex items-end space-x-2 space-x-reverse">
                                <div className="flex-1">
                                    <Textarea
                                        placeholder="پیام خود را بنویسید..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        className="font-vazir resize-none"
                                        rows={1}
                                        dir="rtl"
                                    />
                                </div>
                                <div className="flex items-center space-x-1 space-x-reverse">
                                    <input
                                        ref={imageInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                    <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        disabled={uploadingFile}
                                        onClick={() => imageInputRef.current?.click()}
                                        title="ارسال تصویر"
                                    >
                                        <ImageIcon className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        disabled={uploadingFile}
                                        onClick={() => fileInputRef.current?.click()}
                                        title="ارسال فایل"
                                    >
                                        <Paperclip className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" title="ضبط صدا">
                                        <Mic className="h-4 w-4" />
                                    </Button>
                                    <Button onClick={handleSendMessage} disabled={!newMessage.trim() || sending} size="sm">
                                        {sending ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        ) : (
                                            <Send className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center text-muted-foreground max-w-md mx-auto p-8">
                            {isMobile && (
                                <Button onClick={() => setShowUsersList(true)} className="mb-6">
                                    <Users className="h-4 w-4 mr-2" />
                                    مشاهده لیست همکاران
                                </Button>
                            )}
                            <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <h3 className="font-vazir text-xl font-semibold mb-2">
                                {selectedUserName ? `در حال بارگذاری چت با ${selectedUserName}...` : 'شروع گفتگو'}
                            </h3>
                            <p className="font-vazir text-muted-foreground">
                                {!selectedUserName && 'یک همکار را برای شروع گفتگو انتخاب کنید'}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Image Preview Dialog */}
            <Dialog open={!!showImagePreview} onOpenChange={() => setShowImagePreview(null)}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle className="font-vazir">پیش‌نمایش تصویر</DialogTitle>
                    </DialogHeader>
                    {showImagePreview && (
                        <div className="flex justify-center">
                            <img src={showImagePreview} alt="پیش‌نمایش" className="max-w-full max-h-[70vh] object-contain" />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}