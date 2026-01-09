import { GoogleGenAI } from "@google/genai";
import { GraphNode, RiskAnalysis } from "../types";

const API_KEY = process.env.API_KEY || ''; // In a real app, handled via backend proxy or env

/**
 * Generates a technical pedagogical report based on the calculated data.
 */
export const generateRiskReport = async (
  grade: string,
  analysis: RiskAnalysis,
  nodes: GraphNode[]
): Promise<string> => {
  if (!API_KEY) return "Clave de API no configurada. No se puede generar el informe de IA.";

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // Prepare anonymized summary for the prompt
  const riskSummary = analysis.atRiskStudents.map(s => 
    `- Estudiante ID ${s.id}: Riesgo ${s.riskScore}/100. (Popularidad: ${s.inDegree}, Conflictos recibidos: ${s.conflictScore})`
  ).join('\n');

  const tensionSummary = analysis.tensionGroups.map(g => 
    `- Tensión recíproca entre ID ${g[0]} y ID ${g[1]}`
  ).join('\n');

  const prompt = `
    Actúa como un experto en Convivencia Escolar en Chile (Psicólogo Educacional).
    Analiza los siguientes datos procesados de un curso de ${grade}.
    
    DATOS DEL MODELO PREDICTIVO:
    - Riesgo Global del Curso: ${analysis.globalRisk}/100
    - Estudiantes en Alto Riesgo (Score > 60):
    ${riskSummary}
    - Dinámicas de Conflicto (Pares con rechazo mutuo):
    ${tensionSummary}
    - Estudiantes Aislados (In-Degree 0): ${analysis.isolatedStudents.length}

    TAREA:
    Genera un breve informe técnico (máximo 3 párrafos y una lista de acciones).
    1. Diagnóstico: Interpreta el clima general.
    2. Alerta Temprana: Explica qué significan las tensiones detectadas.
    3. Plan de Acción: Sugiere 3 estrategias concretas basadas en la Política Nacional de Convivencia Escolar y Circular 482 (ej: mediación, intervención grupal, entrevista apoderados).
    
    Mantén un tono profesional, confidencial y preventivo. No menciones nombres reales, usa los IDs.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No se pudo generar el reporte.";
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Error al conectar con el servicio de IA. Verifique su conexión.";
  }
};
