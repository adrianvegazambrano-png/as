import React, { useState, useEffect, useMemo } from 'react';
import { Wallet, ChevronLeft, ChevronRight } from 'lucide-react';
import { Income, MonthlyData } from './types';
import { IncomeForm } from './components/IncomeForm';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { AIReport } from './components/AIReport';

// Datos iniciales de demostración adaptados a las nuevas categorías y cifras negativas
const INITIAL_DATA: Income[] = [
  { id: '1', date: new Date().toISOString().split('T')[0], amount: 4500, category: 'Salario', description: 'Nómina quincenal' },
  { id: '2', date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], amount: 1500, category: 'Honorario', description: 'Asesoría de desarrollo de software' },
  { id: '3', date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0], amount: -350, category: 'Pasivo', description: 'Suscripción de herramientas de trabajo' },
  { id: '4', date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0], amount: 800, category: 'Inversión', description: 'Rendimientos de acciones' },
  { id: '5', date: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0], amount: -120, category: 'Servicio', description: 'Ajuste por devolución de servicio' },
];

export default function App() {
  // State
  const [incomes, setIncomes] = useState<Income[]>(() => {
    const saved = localStorage.getItem('income_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_DATA;
      }
    }
    return INITIAL_DATA;
  });

  // Current selected month (YYYY-MM format)
  const [currentMonthStr, setCurrentMonthStr] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Persist data
  useEffect(() => {
    localStorage.setItem('income_data', JSON.stringify(incomes));
  }, [incomes]);

  // Handlers
  const handleAddIncome = (newIncome: Omit<Income, 'id'>) => {
    const income: Income = {
      ...newIncome,
      id: crypto.randomUUID()
    };
    setIncomes(prev => [...prev, income]);
  };

  const handleDeleteIncome = (id: string) => {
    setIncomes(prev => prev.filter(inc => inc.id !== id));
  };

  const handlePrevMonth = () => {
    const [year, month] = currentMonthStr.split('-').map(Number);
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth === 0) {
      newMonth = 12;
      newYear -= 1;
    }
    setCurrentMonthStr(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [year, month] = currentMonthStr.split('-').map(Number);
    let newMonth = month + 1;
    let newYear = year;
    if (newMonth === 13) {
      newMonth = 1;
      newYear += 1;
    }
    setCurrentMonthStr(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  // Derived Data for current month
  const monthlyData = useMemo<MonthlyData>(() => {
    const filteredIncomes = incomes.filter(inc => inc.date.startsWith(currentMonthStr));
    
    const total = filteredIncomes.reduce((sum, inc) => sum + inc.amount, 0);
    
    const categoryMap = new Map<string, number>();
    filteredIncomes.forEach(inc => {
      categoryMap.set(inc.category, (categoryMap.get(inc.category) || 0) + inc.amount);
    });
    
    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort by value descending

    return {
      month: currentMonthStr,
      total,
      incomes: filteredIncomes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), // Sort newest first
      categoryBreakdown
    };
  }, [incomes, currentMonthStr]);

  // Format month for display
  const displayMonth = useMemo(() => {
    const [year, month] = currentMonthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase());
  }, [currentMonthStr]);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Finanzas<span className="text-blue-600">Pro</span></h1>
          </div>
          
          {/* Month Selector */}
          <div className="flex items-center gap-4 bg-gray-100 rounded-lg p-1">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-white rounded-md transition-colors text-gray-600">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-medium text-gray-800 min-w-[140px] text-center">
              {displayMonth}
            </span>
            <button onClick={handleNextMonth} className="p-1 hover:bg-white rounded-md transition-colors text-gray-600">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Top Section: Dashboard & AI */}
        <div className="space-y-8">
          <Dashboard data={monthlyData} />
          <AIReport month={currentMonthStr} incomes={monthlyData.incomes} />
        </div>

        {/* Bottom Section: Form & Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-3">
             <IncomeForm onAddIncome={handleAddIncome} />
          </div>
          <div className="lg:col-span-3">
            <TransactionList incomes={monthlyData.incomes} onDelete={handleDeleteIncome} />
          </div>
        </div>

      </main>
    </div>
  );
}
