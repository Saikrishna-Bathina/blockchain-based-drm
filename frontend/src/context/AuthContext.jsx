import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import api from '../lib/api';
import { createAppKit, useAppKit, useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { mainnet, sepolia } from '@reown/appkit/networks';

// 1. Get ProjectId at https://cloud.reown.com
const projectId = '8b588561e85200411f4a7da590564b60';

// 2. Set networks - Include mainnet to avoid "Network Not Found" if wallet is on mainnet
const networks = [mainnet, sepolia];

// 3. Create a metadata object - optional
const metadata = {
  name: 'Blockchain DRM Delivery',
  description: 'Secure Delivery System',
  url: 'http://localhost:5173', // Updated to match development env
  icons: ['https://avatars.githubusercontent.com/u/177284434']
};

// 4. Create the AppKit instance
const modal = createAppKit({
  adapters: [new EthersAdapter()],
  networks,
  defaultNetwork: sepolia, // Force Sepolia as default
  metadata,
  projectId,
  features: {
    analytics: true
  }
});

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [provider, setProvider] = useState(null);
  const isConnectedRef = React.useRef(false);
  const [chainId, setChainId] = useState(null);

  useEffect(() => {
    checkUserLoggedIn();
    
    // Subscribe to connection changes via modal
    const unsubscribe = modal.subscribeAccount(async (state) => {
        if (state.isConnected && state.address) {
            const currentChainId = modal.getChainId();
            console.log("AppKit ChainId (Account):", currentChainId, typeof currentChainId);
            setChainId(Number(currentChainId));
            
            if (!isConnectedRef.current) {
                console.log("Account connected via AppKit:", state.address);
                isConnectedRef.current = true;
            }
            const walletProvider = modal.getWalletProvider();
            if (walletProvider) {
                setProvider(new ethers.BrowserProvider(walletProvider));
            }
        } else if (!state.isConnected && isConnectedRef.current) {
            console.log("Account disconnected via AppKit");
            setChainId(null);
            setProvider(null);
            isConnectedRef.current = false;
        }
    });

    const unsubscribeNetwork = modal.subscribeNetwork((state) => {
        if (state.caipNetwork) {
            // Safe split in case ID is a number or formatted differently
            const rawId = String(state.caipNetwork.id || "");
            const id = rawId.includes(':') ? rawId.split(':').pop() : rawId;
            console.log("AppKit Network Change:", id, typeof id);
            setChainId(Number(id));
            
            // Re-sync provider on network change
            const walletProvider = modal.getWalletProvider();
            if (walletProvider) {
                setProvider(new ethers.BrowserProvider(walletProvider));
            }
        }
    });

    return () => {
        unsubscribe();
        unsubscribeNetwork();
    };
  }, []);

  const checkUserLoggedIn = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const { data } = await api.get('/auth/me');
        setUser(data.data);
      }
    } catch (err) {
      console.error("Session check failed", err);
      if (err.response?.status === 401) {
          localStorage.removeItem('token');
          setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
      throw err;
    }
  };

  const connectWallet = async () => {
    try {
      // 1. Open AppKit Modal
      await modal.open();

      // 2. Wait for connection (simple loop or state check)
      // This is slightly manual because we are in a context rather than a hook
      let account = modal.getAccount();
      
      // Wait up to 60s for user to connect
      let attempts = 0;
      while (!account.isConnected && attempts < 60) {
          await new Promise(r => setTimeout(r, 1000));
          account = modal.getAccount();
          attempts++;
      }

      if (!account.isConnected) {
          throw new Error("Wallet connection timed out or was rejected.");
      }

      // 3. Network Check & Switch (New)
      let currentChainId = modal.getChainId();
      console.log("ConnectWallet - Initial ChainId:", currentChainId, "Type:", typeof currentChainId);
      
      const targetId = Number(sepolia.id);
      
      if (Number(currentChainId) !== targetId) {
          console.log(`Wrong network detected (${currentChainId}), switching to Sepolia (${targetId})...`);
          try {
              // Try AppKit switch
              await modal.switchNetwork(targetId);
              
              // Fallback to direct request if needed
              const walletProvider = modal.getWalletProvider();
              if (walletProvider && Number(modal.getChainId()) !== targetId) {
                  console.log("AppKit switch did not change ID, sending direct provider request...");
                  await walletProvider.request({
                      method: 'wallet_switchEthereumChain',
                      params: [{ chainId: `0x${targetId.toString(16)}` }],
                  }).catch(e => console.warn("Direct switch request failed/rejected:", e));
              }
              
              // Wait for network switch to reflect in the state (up to 30s)
              let switchAttempts = 0;
              while (Number(modal.getChainId()) !== targetId && switchAttempts < 30) {
                  await new Promise(r => setTimeout(r, 1000));
                  switchAttempts++;
                  console.log(`Wait Loop - Attempt: ${switchAttempts}, Current: ${modal.getChainId()}`);
              }
              
              if (Number(modal.getChainId()) !== targetId) {
                  throw new Error("Failed to switch network. Please switch to Sepolia manually in your MetaMask mobile app.");
              }
          } catch (switchError) {
              console.error("Failed to switch network in connectWallet:", switchError);
              throw new Error("Please switch your wallet network to Sepolia and try again.");
          }
      }

      const walletAddress = account.address;
      const walletProvider = modal.getWalletProvider(); 
      if (!walletProvider) {
          throw new Error("Wallet provider not available. Please try reconnecting.");
      }
      const browserProvider = new ethers.BrowserProvider(walletProvider);
      
      // Update local state immediately
      setProvider(browserProvider);
      isConnectedRef.current = true;

      // 3. Ethers Provider for Signing
      const signer = await browserProvider.getSigner();

      // 4. Sign Message & Backend Link
      const message = `Connect wallet to DRM System: ${Date.now()}`;
      const signature = await signer.signMessage(message);

      const { data } = await api.put('/auth/connect-wallet', {
          walletAddress,
          signature,
          message
      });

      const updatedUser = data.data;
      setUser(updatedUser);
      return { user: updatedUser, provider: browserProvider };

    } catch (error) {
       console.error("Wallet connection failed:", error);
       throw error;
    }
  };

  const disconnectWallet = async () => {
    try {
      await modal.disconnect();
      await api.put('/auth/disconnect-wallet');
      setUser(prev => ({ ...prev, walletAddress: null }));
    } catch (error) {
       console.error("Wallet disconnection failed:", error);
       throw error;
    }
  };

  const logout = async () => {
    localStorage.removeItem('token');
    setUser(null);
    setProvider(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      register,
      login,
      logout,
      provider,
      chainId,
      connectWallet,
      disconnectWallet,
      switchNetwork: async () => {
          try {
              const targetId = 11155111;
              console.log("UI Triggered Switch to Sepolia...");
              await modal.switchNetwork(targetId);
              
              const walletProvider = modal.getWalletProvider();
              if (walletProvider && Number(modal.getChainId()) !== targetId) {
                  await walletProvider.request({
                      method: 'wallet_switchEthereumChain',
                      params: [{ chainId: `0x${targetId.toString(16)}` }],
                  }).catch(e => console.warn("UI Direct switch failed:", e));
              }
          } catch (err) {
              console.error("UI Switch failed:", err);
          }
      }
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
