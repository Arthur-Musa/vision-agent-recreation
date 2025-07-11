export interface Tenant {
  id: string;
  name: string;
  domain: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  customCss?: string;
  settings: {
    allowRegistration: boolean;
    requireApproval: boolean;
    enableMfa: boolean;
    sessionTimeout: number;
  };
  branding: {
    companyName: string;
    supportEmail: string;
    supportPhone: string;
    termsUrl?: string;
    privacyUrl?: string;
  };
}

export interface TenantUser {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
  permissions: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface TenantConfig {
  tenant: Tenant;
  user: TenantUser | null;
  isLoading: boolean;
}