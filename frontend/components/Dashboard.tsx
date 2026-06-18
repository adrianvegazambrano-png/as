import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Scale } from 'lucide-react';
import { MonthlyData } from '../types';

interface DashboardProps {
  data: MonthlyData;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b'];

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  // Calculate Gross Income (positive values) and Deductions (negative values)
  const { grossIncome, deductions, netIncome } = useMemo(() => {
    let gross = 0;
    let ded = 0;
    data.incomes.forEach(inc => {
      if (inc.amount > 0) {
        gross += inc.amount;
      } else {
        ded += inc.amount; // amount is negative, so this accumulates negative sum
      }
    });
    return {
      grossIncome: gross,
      deductions: Math.abs(ded),
      netIncome: gross + ded
    };
  }, [data.incomes]);

  // Filter category breakdown for Pie Chart (Pie charts only support positive values)
  const positiveCategoryBreakdown = useMemo(() => {
    return data.categoryBreakdown
      .filter(cat => cat.value > 0)
      .map(cat => ({ name: cat.name, value: cat.value }));
  }, [data.categoryBreakdown]);

  // Top positive category
  const topCategory = useMemo(() => {
    if (positiveCategoryBreakdown.length === 0) return { name: 'N/A', value: 0 };
    return positiveCategoryBreakdown.reduce((prev, current) => (prev.value > current.value) ? prev : current);
  }, [positiveCategoryBreakdown]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Gross Income Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Ingresos Brutos</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(grossIncome)}</p>
          </div>
        </div>
        
        {/* Deductions / Passive Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Deducciones / Pasivos</p>
            <p className="text-2xl font-bold text-red-600">-{formatCurrency(deductions)}</p>
          </div>
        </div>

        {/* Net Balance Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Balance Neto</p>
            <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(netIncome)}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart (Positive Distribution) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Distribución de Ingresos Brutos</h3>
            <p className="text-xs text-gray-500">Solo incluye categorías con saldo positivo acumulado</p>
          </div>
          {positiveCategoryBreakdown.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={positiveCategoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {positiveCategoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No hay ingresos positivos para mostrar en el gráfico circular
            </div>
          )}
        </div>

        {/* Bar Chart (Bidirectional - Handles positive and negative categories) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Balance Neto por Categoría</h3>
            <p className="text-xs text-gray-500">Muestra el saldo neto acumulado por cada categoría</p>
          </div>
           {data.categoryBreakdown.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.categoryBreakdown} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" tickFormatter={(val) => `$${val}`} />
                  <YAxis dataKey="name" type="category" width={90} tick={{fontSize: 11}} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <ReferenceLine x={0} stroke="#94a3b8" />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                     {data.categoryBreakdown.map((entry, index) => {
                       // Use red/orange tones for negative categories, standard colors for positive
                       const isNegative = entry.value < 0;
                       return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={isNegative ? '#ef4444' : COLORS[index % COLORS.length]} 
                        />
                       );
                     })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
           ) : (
             <div className="h-64 flex items-center justify-center text-gray-400">
              No hay datos para mostrar
            </div>
           )}
        </div>
      </div>
    </div>
  );
};
