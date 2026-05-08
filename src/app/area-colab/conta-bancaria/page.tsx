'use client';

import { useState } from 'react';
import { BankConnector } from '@/components/area-colab/BankConnector';
import { BankAccountCard } from '@/components/area-colab/BankAccountCard';
import { TransactionTable } from '@/components/area-colab/TransactionTable';

const MOCK_BANKS = [
  { id: '1', name: 'Banco do Brasil', color: '#003366' },
  { id: '2', name: 'Itaú', color: '#ff7f00' },
  { id: '3', name: 'Bradesco', color: '#cc0000' },
  { id: '4', name: 'Santander', color: '#ec0000' },
  { id: '5', name: 'Caixa', color: '#003da5' },
];

const MOCK_ACCOUNTS = [
  { id: 'a1', bankName: 'Banco do Brasil', accountType: 'Corrente', lastSync: new Date().toISOString() },
];

const MOCK_TRANSACTIONS = [
  { id: 't1', description: 'Pagamento Fornecedor XPTO', amount: -1500.00, date: '2025-05-01', category: 'Fornecedores' },
  { id: 't2', description: 'Recebimento Cliente ABC', amount: 3500.00, date: '2025-05-02', category: 'Vendas' },
  { id: 't3', description: 'Tarifa manutenção', amount: -30.00, date: '2025-05-03', category: 'Taxas' },
];

export default function ContaBancariaPage() {
  const [banks] = useState(MOCK_BANKS);
  const [accounts, setAccounts] = useState(MOCK_ACCOUNTS);
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [connectingBankId, setConnectingBankId] = useState<string | null>(null);

  const handleConnect = async (bankId: string) => {
    setConnectingBankId(bankId);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const bank = banks.find(b => b.id === bankId);
    if (bank) {
      const newAccount = {
        id: `acc-${Date.now()}`,
        bankName: bank.name,
        accountType: 'Corrente',
        lastSync: new Date().toISOString(),
      };
      setAccounts(prev => [...prev, newAccount]);
      const newTransactions = [
        { id: `t-${Date.now()}`, description: `Conexão com ${bank.name} estabelecida`, amount: 0, date: new Date().toISOString().split('T')[0], category: 'Sistema' },
      ];
      setTransactions(prev => [...newTransactions, ...prev]);
    }
    setConnectingBankId(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Conexão Bancária</h1>
      <p className="text-slate-600">Conecte suas contas bancárias para importar transações automaticamente via Open Finance.</p>
      <BankConnector
        banks={banks}
        onConnect={handleConnect}
        connectingBankId={connectingBankId}
      />
      {accounts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-800">Contas Conectadas</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map(acc => (
              <BankAccountCard key={acc.id} account={acc} />
            ))}
          </div>
        </div>
      )}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-800">Transações Recentes</h2>
        <TransactionTable transactions={transactions} />
      </div>
    </div>
  );
}