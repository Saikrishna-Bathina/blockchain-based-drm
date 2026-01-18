import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import api from '../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Constants for Localhost
  const LOCAL_CHAIN_ID_HEX = "0x7A69"; // 31337
  const LOCAL_CHAIN_ID_DEC = 31337;
  const LOCAL_RPC_URL = "http://127.0.0.1:8545"; // Standard Hardhat RPC

  useEffect(() => {
    checkUserLoggedIn();
    checkWalletConnection();

    // Listen for account changes
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', () => window.location.reload());
    }

    return () => {
        if (window.ethereum) {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
    };
  }, []);

  const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
          console.log("MetaMask Disconnected");
          setProvider(null);
          // Optional: Logout user from backend if wallet is required
      } else {
          console.log("Account changed:", accounts[0]);
          setProvider(window.ethereum);
      }
  };

  const checkUserLoggedIn = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Verify token with backend
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

  const checkWalletConnection = async () => {
      if (window.ethereum) {
          try {
              const accounts = await window.ethereum.request({ method: 'eth_accounts' });
              if (accounts.length > 0) {
                  setProvider(window.ethereum);
              }
          } catch (err) {
              console.error("Failed to check wallet connection:", err);
          }
      }
  };

  const switchNetwork = async () => {
      if (!window.ethereum) return;
      try {
          await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: LOCAL_CHAIN_ID_HEX }],
          });
      } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask.
          if (switchError.code === 4902) {
              try {
                  await window.ethereum.request({
                      method: 'wallet_addEthereumChain',
                      params: [
                          {
                              chainId: LOCAL_CHAIN_ID_HEX,
                              chainName: 'Hardhat Local',
                              rpcUrls: [LOCAL_RPC_URL],
                              nativeCurrency: {
                                  name: "ETH",
                                  symbol: "ETH", // 2-6 characters long
                                  decimals: 18,
                              },
                          },
                      ],
                  });
              } catch (addError) {
                  console.error("Failed to add network:", addError);
                  throw addError;
              }
          } else {
              console.error("Failed to switch network:", switchError);
              throw switchError;
          }
      }
  };

  const register = async (userData) => {
    console.log("DEBUG: AuthContext register called with:", userData);
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
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      // 1. Request Accounts
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const walletAddress = accounts[0];
      setProvider(window.ethereum); // Ensure provider is set immediately

      // 2. Check Network & Switch if needed
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (currentChainId !== LOCAL_CHAIN_ID_HEX) {
          try {
              await switchNetwork();
          } catch (e) {
              console.warn("Network switch failed or rejected:", e);
              // We continue, but warn. user might need to switch manually.
          }
      }

      // 3. Ethers Provider for Signing
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();

      // DEBUG: Log Balance to be sure
      const bal = await browserProvider.getBalance(walletAddress);
      console.log("DEBUG: Wallet Connected");
      console.log("DEBUG: Address:", walletAddress);
      console.log("DEBUG: Balance:", ethers.formatEther(bal));

      // 4. Sign Message & Backend Link
      const message = `Connect wallet to DRM System: ${Date.now()}`;
      const signature = await signer.signMessage(message);

      const { data } = await api.put('/auth/connect-wallet', {
          walletAddress,
          signature,
          message
      });

      setUser(data.data);
      return data.data;

    } catch (error) {
       console.error("Wallet connection failed:", error);
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
      provider, // Now checking window.ethereum
      connectWallet,
      switchNetwork
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
