import React from 'react';
import { DiscordInstructionModal, PurchaseItem } from './DiscordInstructionModal';

export type CheckoutItem = PurchaseItem;

interface CheckoutModalProps {
  item: CheckoutItem | null;
  onClose: () => void;
  onOpenHatBox?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ item, onClose }) => {
  return <DiscordInstructionModal item={item} onClose={onClose} />;
};
