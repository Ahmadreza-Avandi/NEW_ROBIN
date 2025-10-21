import { TenantProvider } from '@/lib/tenant-context';

export default function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { tenant_key: string };
}) {
  return (
    <TenantProvider tenantKey={params.tenant_key}>
      {children}
    </TenantProvider>
  );
}
