import { GoogleGenAI } from '@google/genai';
import { Income } from '../types';

// Initialize the SDK. It relies on process.env.API_KEY being set in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });

export const generateFinancialReport = async (month: string, incomes: Income[]): Promise<string> => {
  if (!incomes || incomes.length === 0) {
    return "No hay datos de ingresos para este mes para analizar.";
  }

  // Calculate gross income, deductions, and net balance
  let grossIncome = 0;
  let deductions = 0;
  incomes.forEach(inc => {
    if (inc.amount > 0) {
      grossIncome += inc.amount;
    } else {
      deductions += inc.amount;
    }
  });
  const netIncome = grossIncome + deductions;
  
  // Prepare a concise summary of data for the prompt to save tokens
  const dataSummary = incomes.map(inc => {
    const sign = inc.amount >= 0 ? '+' : '';
    return `- ${inc.date}: ${sign}$${inc.amount} (${inc.category}) - ${inc.description}`;
  }).join('\n');

  const prompt = `
Eres un analista financiero experto. Analiza los siguientes datos de movimientos financieros del mes de ${month}.

Ten en cuenta que la aplicación permite registrar cifras negativas, las cuales representan pasivos, deducciones, devoluciones o ajustes de saldo. Las categorías disponibles son: Activo, Pasivo, Ventas, Inversión, Salario, Honorario, Servicio y Mensualidad.

Resumen financiero del mes:
- Ingresos Brutos (Suma de positivos): $${grossIncome}
- Deducciones / Pasivos (Suma de negativos): $${Math.abs(deductions)}
- Balance Neto (Total): $${netIncome}

Detalle de movimientos:
${dataSummary}

Proporciona un reporte financiero estructurado (máximo 3 párrafos cortos) que incluya:
1. Un análisis del balance neto del mes, evaluando el impacto de las deducciones/pasivos frente a los ingresos brutos.
2. Identificación de la principal fuente de ingresos positivos y el peso de los movimientos negativos.
3. Una recomendación estratégica y accionable para optimizar el flujo de caja, reducir pasivos o potenciar las categorías más rentables basándote en estos datos.

Usa un tono profesional, claro y motivador. Formatea la respuesta usando Markdown simple (negritas para resaltar, listas si es necesario). No uses bloques de código.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });
    
    return response.text || "No se pudo generar el reporte.";
  } catch (error) {
    console.error("Error generating AI report:", error);
    return "Ocurrió un error al intentar generar el reporte con IA. Por favor, inténtalo de nuevo más tarde.";
  }
};
