import React, { useState } from 'react';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { generateFinancialReport } from '../services/aiService';
import { Income } from '../types';

interface AIReportProps {
  month: string;
  incomes: Income[];
}

export const AIReport: React.FC<AIReportProps> = ({ month, incomes }) => {
  const [report, setReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Format month for better prompt context (e.g., "2023-10" -> "Octubre 2023")
      const [year, monthNum] = month.split('-');
      const date = new Date(parseInt(year), parseInt(monthNum) - 1);
      const monthName = date.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

      const result = await generateFinancialReport(monthName, incomes);
      setReport(result);
    } catch (err) {
      setError("Hubo un problema al conectar con la IA.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple markdown parser for bold text and line breaks
  const renderMarkdown = (text: string) => {
    const paragraphs = text.split('\n\n');
    return paragraphs.map((p, i) => {
      // Handle bold text **text**
      const parts = p.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} className="mb-3 text-gray-700 leading-relaxed">
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
            }
            // Handle simple newlines within a paragraph
            return part.split('\n').map((line, k, arr) => (
              <React.Fragment key={`${j}-${k}`}>
                {line}
                {k < arr.length - 1 && <br />}
              </React.Fragment>
            ));
          })}
        </p>
      );
    });
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl shadow-sm border border-indigo-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          Análisis Inteligente (Gemini AI)
        </h3>
        <button
          onClick={handleGenerateReport}
          disabled={isLoading || incomes.length === 0}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analizando...
            </>
          ) : (
            'Generar Reporte'
          )}
        </button>
      </div>

      {incomes.length === 0 && !report && !isLoading && (
        <div className="text-sm text-indigo-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Agrega ingresos para generar un análisis.
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
          {error}
        </div>
      )}

      {report && !isLoading && (
        <div className="bg-white/60 backdrop-blur-sm p-5 rounded-lg border border-indigo-50">
          {renderMarkdown(report)}
        </div>
      )}
    </div>
  );
};