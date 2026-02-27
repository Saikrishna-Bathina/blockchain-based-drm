import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { User, Mail, Wallet, Shield, Calendar, Clock, Copy, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

const ProfilePage = () => {
    const { user, connectWallet, disconnectWallet } = useAuth();

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'MMMM d, yyyy');
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-end justify-between border-b border-zinc-800 pb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Profile Settings</h1>
                    <p className="text-sm text-zinc-500 mt-1">Manage your account information and wallet connection.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                        {user.role || 'User'}
                    </span>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* PERSONAL INFO CARD */}
                <Card className="bg-black border border-zinc-800 rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/30 flex items-center gap-3">
                        <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-white">
                            <User className="h-4 w-4" />
                        </div>
                        <h3 className="font-semibold text-white text-sm">Personal Information</h3>
                    </div>
                    
                    <CardContent className="p-0">
                        <div className="grid divide-y divide-zinc-800/50">
                            <div className="p-6 flex items-center justify-between group hover:bg-zinc-900/20 transition-colors">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Username</p>
                                    <p className="text-sm font-medium text-white">{user.username}</p>
                                </div>
                            </div>

                            <div className="p-6 flex items-center justify-between group hover:bg-zinc-900/20 transition-colors">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Email Address</p>
                                    <p className="text-sm font-medium text-white">{user.email}</p>
                                </div>
                            </div>

                             <div className="p-6 flex items-center justify-between group hover:bg-zinc-900/20 transition-colors">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Member Since</p>
                                    <p className="text-sm font-medium text-zinc-400 font-mono">{formatDate(user.createdAt)}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* WALLET CONNECTION CARD */}
                <Card className="bg-black border border-zinc-800 rounded-lg overflow-hidden flex flex-col h-full">
                    <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/30 flex items-center gap-3">
                         <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-white">
                            <Wallet className="h-4 w-4" />
                        </div>
                        <h3 className="font-semibold text-white text-sm">Wallet Status</h3>
                    </div>

                    <CardContent className="p-6 flex flex-col items-center justify-center flex-1 text-center space-y-6">
                        {user.walletAddress ? (
                            <>
                                <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 relative group cursor-help">
                                    <Wallet className="h-8 w-8 text-white group-hover:scale-110 transition-transform" />
                                     <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-black flex items-center justify-center border border-zinc-800">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                     </div>
                                </div>
                                
                                <div className="w-full">
                                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2">Connected Address</p>
                                    <div className="flex items-center justify-center gap-2 p-3 bg-zinc-950 rounded border border-zinc-800 font-mono text-xs text-zinc-300 break-all">
                                        {user.walletAddress}
                                        <Copy className="h-3 w-3 text-zinc-600 hover:text-white cursor-pointer ml-auto" />
                                    </div>
                                </div>

                                 <Button 
                                    variant="outline" 
                                    onClick={disconnectWallet}
                                    className="w-full text-xs h-9 border-zinc-700 hover:bg-zinc-900 text-zinc-400"
                                >
                                    Disconnect Wallet
                                </Button>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6">
                                 <div className="w-16 h-16 rounded-full bg-zinc-900/50 flex items-center justify-center border border-zinc-800 border-dashed mb-4">
                                    <Wallet className="h-6 w-6 text-zinc-600" />
                                </div>
                                <h4 className="text-white font-medium mb-2">No Wallet Connected</h4>
                                <p className="text-xs text-zinc-500 max-w-xs mb-6 px-4">
                                    Connect your Ethereum wallet to verify assets and manage transactions.
                                </p>
                                <Button onClick={connectWallet} className="bg-white text-black hover:bg-zinc-200 w-full max-w-xs h-10 font-bold text-xs">
                                    Connect MetaMask
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ProfilePage;
