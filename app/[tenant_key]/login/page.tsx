import TenantLoginForm from '@/components/auth/TenantLoginForm';
import Image from 'next/image';

export default function TenantLoginPage({ params }: { params: { tenant_key: string } }) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-secondary/20 via-transparent to-transparent"></div>
      </div>

      {/* Floating elements for visual appeal */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-primary/5 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-secondary/5 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-10 w-24 h-24 bg-accent/5 rounded-full blur-xl animate-pulse delay-500"></div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-[420px]">
          {/* Logo and title section */}
          <div className="mb-10 text-center">
            <div className="relative mb-6">
              <div className="w-[160px] h-[160px] mx-auto relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-lg"></div>
                <div className="relative w-full h-full bg-background/80 backdrop-blur-sm rounded-full border border-border/50 flex items-center justify-center shadow-lg">
                  <Image
                    src="https://uploadkon.ir/uploads/5c1f19_25x-removebg-preview.png"
                    alt="رابین تجارت"
                    width={120}
                    height={120}
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl font-bold font-vazir bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                رابین تجارت
              </h1>
              <p className="text-muted-foreground font-vazir text-lg">
                سیستم مدیریت ارتباط با مشتری
              </p>
              <p className="text-sm text-muted-foreground font-vazir">
                Tenant: <span className="font-mono font-bold">{params.tenant_key}</span>
              </p>
              <div className="w-16 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
            </div>
          </div>

          {/* Login form */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl blur-xl"></div>
            <TenantLoginForm tenantKey={params.tenant_key} />
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground font-vazir">
              
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
