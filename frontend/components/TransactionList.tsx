import React from 'react';
import { Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Income } from '../types';

interface TransactionListProps {
  incomes: Income[];
  onDelete: (id: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ incomes, onDelete }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Math.abs(value));
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    // Add timezone offset to prevent off-by-one day errors when parsing YYYY-MM-DD
    const date = new Date(dateString + 'T12:00:00');
    return date.toLocaleDateString('es-ES', options);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">Historial de Movimientos</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
              <th className="p-4 font-medium">Fecha</th>
              <th className="p-4 font-medium">Descripción</th>
              <th className="p-4 font-medium">Categoría</th>
              <th className="p-4 font-medium text-right">Monto</th>
              <th className="p-4 font-medium text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {incomes.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">
                  No hay movimientos registrados en este mes.
                </td>
              </tr>
            ) : (
              incomes.map((income) => {
                const isNegative = income.amount < 0;
                return (
                  <tr key={income.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(income.date)}
                    </td>
                    <td className="p-4 text-sm text-gray-800 font-medium">
                      {income.description}
                    </td>
                    <td className="p-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isNegative 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {income.category}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-right whitespace-nowrap">
                      <div className={`inline-flex items-center gap-1 font-bold ${
                        isNegative ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {isNegative ? (
                          <>
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                            <span>-{formatCurrency(income.amount)}</span>
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            <span>+{formatCurrency(income.amount)}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => onDelete(income.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
