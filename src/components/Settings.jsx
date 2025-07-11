import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, User, Bell, Mic, FileCog, LogOut } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VoiceSetup from '@/components/VoiceSetup';
import { useNavigate } from 'react-router-dom';
import DataPortability from '@/components/DataPortability';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Settings = () => {
    const { user, signOut } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [profile, setProfile] = useState({ 
        username: '', 
        full_name: '',
        avatar_url: '',
        notifications_push: false,
        notifications_email: false,
        notifications_quotes: true,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const fetchProfile = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('username, full_name, avatar_url, notifications_push, notifications_email, notifications_quotes')
                .eq('id', user.id)
                .maybeSingle();
            
            if (error) throw error;

            if (data) {
                setProfile(prev => ({...prev, ...data}));
            } else {
                // No profile found, let's create one silently
                const { error: insertError } = await supabase.from('user_profiles').insert({
                    id: user.id,
                    username: user.email.split('@')[0],
                    weekly_focus: [],
                });
                if(insertError) throw insertError;
                // re-fetch after creation
                await fetchProfile();
            }
        } catch (error) {
            toast({ title: 'Error handling profile', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        if (!user) return;
        setSaving(true);
        const { error } = await supabase
            .from('user_profiles')
            .update({ username: profile.username, full_name: profile.full_name })
            .eq('id', user.id);
        
        if (error) {
            toast({ title: 'Error updating profile', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: '✅ Profile Updated Successfully!' });
        }
        setSaving(false);
    };

    const uploadAvatar = async (event) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            let { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

            let { error: updateError } = await supabase.from('user_profiles').update({ avatar_url: publicUrl }).eq('id', user.id);

            if (updateError) {
                throw updateError;
            }

            setProfile(prev => ({...prev, avatar_url: publicUrl }));
            toast({ title: '✅ Avatar updated successfully!' });

        } catch (error) {
            toast({ title: 'Error uploading avatar', description: error.message, variant: 'destructive' });
        } finally {
            setUploading(false);
        }
    };
    
    const handleNotificationToggle = async (id) => {
        const newValue = !profile[id];
        setProfile(prev => ({ ...prev, [id]: newValue }));
        
        const { error } = await supabase
            .from('user_profiles')
            .update({ [id]: newValue })
            .eq('id', user.id);

        if (error) {
            toast({ title: 'Error updating notification settings', description: error.message, variant: 'destructive' });
            setProfile(prev => ({ ...prev, [id]: !newValue })); // Revert on error
        } else {
            toast({ title: '✅ Notification settings updated!' });
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/signin');
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Settings</h1>
                <p className="text-lg text-gray-400">Manage your account and app preferences.</p>
            </motion.div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" />Profile</TabsTrigger>
                    <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4" />Notifications</TabsTrigger>
                    <TabsTrigger value="voice"><Mic className="mr-2 h-4 w-4" />Voice</TabsTrigger>
                    <TabsTrigger value="data"><FileCog className="mr-2 h-4 w-4" />Data</TabsTrigger>
                </TabsList>
                <TabsContent value="profile" className="mt-6">
                    <motion.div className="glass-card p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h2 className="text-xl font-bold text-white mb-4">Profile Information</h2>
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={profile.avatar_url} alt={profile.username} />
                                    <AvatarFallback>{profile?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <Label htmlFor="avatar-upload" className="cursor-pointer text-primary hover:underline">
                                        {uploading ? 'Uploading...' : 'Upload new avatar'}
                                    </Label>
                                    <Input
                                        id="avatar-upload"
                                        type="file"
                                        className="hidden"
                                        onChange={uploadAvatar}
                                        disabled={uploading}
                                        accept="image/*"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={user?.email || ''} disabled className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="username">Username</Label>
                                <Input id="username" name="username" value={profile.username || ''} onChange={handleInputChange} className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="full_name">Full Name</Label>
                                <Input id="full_name" name="full_name" value={profile.full_name || ''} onChange={handleInputChange} className="mt-1" />
                            </div>
                            <Button type="submit" disabled={saving || uploading}>
                                {(saving || uploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </form>
                    </motion.div>
                </TabsContent>
                <TabsContent value="notifications" className="mt-6">
                    <motion.div className="glass-card p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h2 className="text-xl font-bold text-white mb-4">Notification Preferences</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="push-notifications" className="text-white">Push Notifications</Label>
                                <Switch id="push-notifications" checked={profile.notifications_push} onCheckedChange={() => handleNotificationToggle('notifications_push')} />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="email-notifications" className="text-white">Email Notifications</Label>
                                <Switch id="email-notifications" checked={profile.notifications_email} onCheckedChange={() => handleNotificationToggle('notifications_email')} />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="quotes-notifications" className="text-white">Motivational Quotes</Label>
                                <Switch id="quotes-notifications" checked={profile.notifications_quotes} onCheckedChange={() => handleNotificationToggle('notifications_quotes')} />
                            </div>
                        </div>
                    </motion.div>
                </TabsContent>
                <TabsContent value="voice" className="mt-6">
                    <VoiceSetup />
                </TabsContent>
                <TabsContent value="data" className="mt-6">
                    <DataPortability />
                </TabsContent>
            </Tabs>

            <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center"><LogOut className="mr-2 h-5 w-5" /> Sign Out</h2>
                <p className="text-muted-foreground mb-4">Are you sure you want to sign out of your account?</p>
                <Button variant="destructive" onClick={handleSignOut}>
                    Sign Out
                </Button>
            </motion.div>
        </div>
    );
};

export default Settings;