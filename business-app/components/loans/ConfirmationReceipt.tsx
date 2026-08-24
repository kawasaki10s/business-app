'use client';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { formatUZS } from '@/lib/serialize';
import { CheckCircle2, CreditCard, Banknote } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  open: boolean;
  onClose: () => void;
  amount: number;
  userName: string;
  method: 'CARD' | 'CASH';
  lastFour?: string;
  createdAt: Date;
}

export function ConfirmationReceipt({ open, onClose, amount, userName, method, lastFour, createdAt }: Props) {
  return (
    <Modal open={open} onClose={onClose} disableBackdropClose>
      <div className="w-[300px] overflow-hidden rounded-2xl bg-cream shadow-modal">
        <div className="flex flex-col items-center px-6 pb-6 pt-8 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border-2 border-success bg-white">
            <CheckCircle2 className="h-8 w-8 text-success" strokeWidth={1.75} />
          </div>
          <p className="font-display text-lg italic text-coffee-dark">Qarz tasdiqlandi</p>

          <p className="font-money mt-4 text-3xl font-semibold text-danger">-{formatUZS(amount)}</p>

          <div className="mt-5 w-full space-y-1.5 border-t border-dashed border-brown/40 pt-4 text-left text-sm">
            <div className="flex justify-between">
              <span className="text-ink-soft">Kim</span>
              <span className="font-medium text-ink">{userName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">Sana</span>
              <span className="font-money text-ink">{format(createdAt, 'dd.MM.yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">Vaqt</span>
              <span className="font-money text-ink">{format(createdAt, 'HH:mm')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">Usul</span>
              <span className="flex items-center gap-1.5 font-medium text-ink">
                {method === 'CARD' ? <CreditCard className="h-3.5 w-3.5" /> : <Banknote className="h-3.5 w-3.5" />}
                {method === 'CARD' ? `**** ${lastFour}` : 'Naqd'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">Status</span>
              <span className="font-medium text-success">Tasdiqlandi</span>
            </div>
          </div>
        </div>

        {/* signature perforated tear-off edge */}
        <div className="receipt-perforation bg-cream" />

        <div className="bg-cream px-6 pb-6 pt-4">
          <Button onClick={onClose} className="w-full">TAYYOR</Button>
        </div>
      </div>
    </Modal>
  );
}
