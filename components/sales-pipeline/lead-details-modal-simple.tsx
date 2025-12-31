'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface LeadDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  tenantKey: string;
  onLeadUpdated?: () => void;
}

const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({
  isOpen,
  onClose,
  leadId,
  tenantKey,
  onLeadUpdated
}) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="font-vazir text-xl">
            جزئیات سرنخ - {leadId}
          </DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p className="font-vazir">این یک کامپوننت ساده برای تست است.</p>
          <p className="font-vazir">Tenant: {tenantKey}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetailsModal;