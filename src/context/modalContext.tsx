// src/context/ModalContext.tsx
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export  type TransactionType = 'income' | 'expense';
export  type TransactionCallback = (amount: number, type: TransactionType, date:Date) => void;

interface ModalContextType {
  requestManualTransactionModal: () => void;
  registerManualTransactionHandler: (handler: TransactionCallback) => void;
  unregisterManualTransactionHandler: (handler: TransactionCallback) => void;
  isManualTransactionModalRequested: boolean;
  onManualTransactionModalClose: () => void;
  onManualTransactionModalSubmit: TransactionCallback;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [isManualTransactionModalRequested, setIsManualTransactionModalRequested] = useState(false);
  const [activeTransactionHandler, setActiveTransactionHandler] = useState<TransactionCallback | null>(null);

  const requestManualTransactionModal = useCallback(() => {
    setIsManualTransactionModalRequested(true);
  }, []);

  const registerManualTransactionHandler = useCallback((handler: TransactionCallback) => {
    setActiveTransactionHandler(() => handler);
  }, []);

  const unregisterManualTransactionHandler = useCallback((handler: TransactionCallback) => {
    setActiveTransactionHandler((prevHandler: TransactionCallback | null) => (prevHandler === handler ? null : prevHandler));
  }, []);

  const onManualTransactionModalSubmit = useCallback((amount: number, type: TransactionType, date: Date) => {
    if (activeTransactionHandler) {
      activeTransactionHandler(amount, type, date);
    }
    onManualTransactionModalClose();
  }, [activeTransactionHandler]);

  const onManualTransactionModalClose = useCallback(() => {
    setIsManualTransactionModalRequested(false);
  }, []);

  const value = {
    requestManualTransactionModal,
    registerManualTransactionHandler,
    unregisterManualTransactionHandler,
    isManualTransactionModalRequested,
    onManualTransactionModalClose,
    onManualTransactionModalSubmit,
  };

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
};