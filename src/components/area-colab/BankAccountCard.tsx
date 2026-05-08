interface BankAccount {
  id: string;
  bankName: string;
  accountType: string;
  lastSync: string;
}

interface BankAccountCardProps {
  account: BankAccount;
}

export function BankAccountCard({ account }: BankAccountCardProps) {
  const lastSyncDate = new Date(account.lastSync).toLocaleDateString('pt-BR');

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{account.bankName}</p>
          <p className="font-semibold text-slate-900">{account.accountType}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Última sync</p>
          <p className="text-sm font-medium text-slate-700">{lastSyncDate}</p>
        </div>
      </div>
    </div>
  );
}