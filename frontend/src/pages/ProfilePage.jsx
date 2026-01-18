import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { User, Mail, Wallet, Shield, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

const ProfilePage = () => {
    const { user, connectWallet } = useAuth();

    if (!user) {
        return <div className="p-8 text-center text-gray-400">Loading profile...</div>;
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'MMMM dd, yyyy');
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">My Profile</h1>
                <p className="text-gray-400 mt-2">Manage your account settings and preferences.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-brand-surface border-brand-surface/50">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-white">
                            <User className="h-5 w-5 text-brand-primary" />
                            <span>Personal Information</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start space-x-4 p-4 rounded-lg bg-brand-dark/50">
                            <div className="p-2 rounded-full bg-brand-primary/20 text-brand-primary">
                                <User className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-400">Username</p>
                                <p className="text-lg font-semibold text-white">{user.username}</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4 p-4 rounded-lg bg-brand-dark/50">
                            <div className="p-2 rounded-full bg-blue-500/20 text-blue-400">
                                <Mail className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-400">Email Address</p>
                                <p className="text-lg font-semibold text-white">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4 p-4 rounded-lg bg-brand-dark/50">
                            <div className="p-2 rounded-full bg-purple-500/20 text-purple-400">
                                <Shield className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-400">Account Role</p>
                                <p className="text-lg font-semibold text-white capitalize">{user.role}</p>
                            </div>
                        </div>
                         <div className="flex items-start space-x-4 p-4 rounded-lg bg-brand-dark/50">
                            <div className="p-2 rounded-full bg-yellow-500/20 text-yellow-400">
                                <Calendar className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-400">Member Since</p>
                                <p className="text-lg font-semibold text-white">{formatDate(user.createdAt)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-brand-surface border-brand-surface/50">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-white">
                            <Wallet className="h-5 w-5 text-green-400" />
                            <span>Wallet Connection</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-6 rounded-xl bg-gradient-to-br from-brand-dark to-brand-surface border border-brand-primary/10 text-center">
                            {user.walletAddress ? (
                                <div className="space-y-4">
                                    <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                                        <Wallet className="h-8 w-8 text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">Connected Wallet</p>
                                        <p className="text-md font-mono text-white break-all bg-black/30 p-2 rounded border border-white/5">
                                            {user.walletAddress}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-center space-x-2 text-green-400 text-sm">
                                        <span className="relative flex h-2 w-2">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                        </span>
                                        <span>Active Connection</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                     <div className="w-16 h-16 mx-auto rounded-full bg-gray-700/30 flex items-center justify-center">
                                        <Wallet className="h-8 w-8 text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="text-gray-300">No wallet connected</p>
                                        <p className="text-sm text-gray-500 mt-1">Connect your MetaMask wallet to mint and trade assets.</p>
                                    </div>
                                    <Button onClick={connectWallet} className="w-full">
                                        Connect Wallet / Social
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ProfilePage;
