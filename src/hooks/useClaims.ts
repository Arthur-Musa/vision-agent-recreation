import { useState, useEffect } from 'react';
import { claimsApi, type Claim, type ClaimStatus } from '@/services/claimsApi';

export const useClaim = (claimId: string) => {
  const [claim, setClaim] = useState<Claim | null>(null);
  const [status, setStatus] = useState<ClaimStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!claimId) return;

    const loadClaim = async () => {
      try {
        setLoading(true);
        const [claimData, statusData] = await Promise.all([
          claimsApi.getClaim(claimId),
          claimsApi.getClaimStatus(claimId)
        ]);
        setClaim(claimData);
        setStatus(statusData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load claim');
      } finally {
        setLoading(false);
      }
    };

    loadClaim();
  }, [claimId]);

  const startAnalysis = async () => {
    if (!claimId) return;
    
    try {
      await claimsApi.startAnalysis(claimId);
      // Refresh status after starting analysis
      const newStatus = await claimsApi.getClaimStatus(claimId);
      setStatus(newStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start analysis');
    }
  };

  const refreshStatus = async () => {
    if (!claimId) return;
    
    try {
      const newStatus = await claimsApi.getClaimStatus(claimId);
      setStatus(newStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh status');
    }
  };

  return {
    claim,
    status,
    loading,
    error,
    startAnalysis,
    refreshStatus
  };
};

export const useCreateClaim = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createClaim = async (claimData: any) => {
    try {
      setLoading(true);
      setError(null);
      const newClaim = await claimsApi.createClaim(claimData);
      return newClaim;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create claim';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    createClaim,
    loading,
    error
  };
};