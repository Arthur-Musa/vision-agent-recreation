interface ProcessedClaim {
  id: string;
  type: string;
  status: 'completed' | 'processing' | 'pending' | 'flagged' | 'error';
  insuredName: string;
  policyNumber: string;
  estimatedAmount: number;
  createdAt: string;
  completedAt: string | null;
  agent: string;
  files: Array<{
    name: string;
    type: string;
    size: number;
    extractedData: Record<string, any>;
  }>;
  extractedData: Record<string, any>;
  description: string;
}

class LocalStorageService {
  private readonly CLAIMS_KEY = 'olga_processed_claims';
  private readonly JOBS_KEY = 'olga_spreadsheet_jobs';

  // Claims management
  saveClaim(claim: ProcessedClaim): void {
    const claims = this.getAllClaims();
    const existingIndex = claims.findIndex(c => c.id === claim.id);
    
    if (existingIndex >= 0) {
      claims[existingIndex] = claim;
    } else {
      claims.push(claim);
    }
    
    localStorage.setItem(this.CLAIMS_KEY, JSON.stringify(claims));
    this.updateSpreadsheetJobs();
  }

  getAllClaims(): ProcessedClaim[] {
    const claims = localStorage.getItem(this.CLAIMS_KEY);
    return claims ? JSON.parse(claims) : [];
  }

  getClaim(id: string): ProcessedClaim | null {
    const claims = this.getAllClaims();
    return claims.find(c => c.id === id) || null;
  }

  deleteClaim(id: string): void {
    const claims = this.getAllClaims();
    const filtered = claims.filter(c => c.id !== id);
    localStorage.setItem(this.CLAIMS_KEY, JSON.stringify(filtered));
    this.updateSpreadsheetJobs();
  }

  // Convert claims to spreadsheet format
  private updateSpreadsheetJobs(): void {
    const claims = this.getAllClaims();
    const jobs = claims.map(claim => ({
      id: claim.id,
      type: claim.type,
      status: claim.status,
      insuredName: claim.insuredName,
      policyNumber: claim.policyNumber,
      estimatedAmount: claim.estimatedAmount,
      createdAt: claim.createdAt,
      completedAt: claim.completedAt,
      agent: claim.agent
    }));
    
    localStorage.setItem(this.JOBS_KEY, JSON.stringify(jobs));
  }

  // Spreadsheet jobs
  getSpreadsheetJobs() {
    const jobs = localStorage.getItem(this.JOBS_KEY);
    return jobs ? JSON.parse(jobs) : [];
  }

  // Analytics
  getClaimsStats() {
    const claims = this.getAllClaims();
    return {
      total: claims.length,
      completed: claims.filter(c => c.status === 'completed').length,
      processing: claims.filter(c => c.status === 'processing').length,
      pending: claims.filter(c => c.status === 'pending').length,
      flagged: claims.filter(c => c.status === 'flagged').length,
      totalValue: claims.reduce((sum, c) => sum + c.estimatedAmount, 0)
    };
  }

  // Clear all data
  clearAllData(): void {
    localStorage.removeItem(this.CLAIMS_KEY);
    localStorage.removeItem(this.JOBS_KEY);
  }
}

export const localStorageService = new LocalStorageService();
export type { ProcessedClaim };