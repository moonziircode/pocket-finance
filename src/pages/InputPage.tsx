import React from 'react';
import { RapidTransactionForm } from '../components/RapidTransactionForm';
import type { 
  MetadataResponse, 
  SpecialModeType, 
  TransactionType 
} from '../types';

interface InputPageProps {
  metadata: MetadataResponse | null;
  mode?: SpecialModeType;
  preset?: any;
  onSubmit: (tx: {
    date: string;
    type: TransactionType;
    category: string;
    description: string;
    account: string;
    amount: number;
  }) => Promise<boolean>;
  onCancel?: () => void;
}

export const InputPage: React.FC<InputPageProps> = ({
  metadata,
  mode = 'normal',
  preset = null,
  onSubmit,
  onCancel
}) => {
  return (
    <div className="pb-24 pt-1">
      <RapidTransactionForm
        accounts={metadata?.accounts ?? []}
        budgetedCategories={metadata?.budgetedCategories ?? []}
        allCategories={metadata?.allCategories ?? []}
        initialMode={mode}
        initialPreset={preset}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    </div>
  );
};
