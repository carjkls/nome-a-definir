'use client';

interface Bank {
  id: string;
  name: string;
  color?: string;
}

interface BankConnectorProps {
  banks: Bank[];
  onConnect: (bankId: string) => void;
  connectingBankId: string | null;
}

export function BankConnector({ banks, onConnect, connectingBankId }: BankConnectorProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {banks.map(bank => (
        <div
          key={bank.id}
          className="relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: bank.color || '#666' }}
            >
              {bank.name.charAt(0)}
            </div>
            <div className="font-semibold text-slate-800">{bank.name}</div>
          </div>
          <button
            onClick={() => onConnect(bank.id)}
            disabled={connectingBankId === bank.id}
            className={`mt-4 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              connectingBankId === bank.id
                ? 'bg-slate-400 text-white cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500'
            }`}
          >
            {connectingBankId === bank.id ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Conectando...
              </span>
            ) : (
              'Conectar'
            )}
          </button>
        </div>
      ))}
    </div>
  );
}