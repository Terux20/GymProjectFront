import { DialogType } from './dialog-type.enum';

export interface DialogData {
  type: DialogType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  item?: any;
  paymentMethods?: string[];
  showPaymentMethods?: boolean;
  additionalData?: any;
}