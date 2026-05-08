interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Data</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Descrição</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Categoria</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Valor</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {transactions.map(tx => (
            <tr key={tx.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{tx.date}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{tx.description}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{tx.category}</td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {tx.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}