import { Student, SurveyResponse, GraphNode, GraphLink, RiskAnalysis } from '../types';

/**
 * P.R.E. (Predictive Risk Estimator) Algorithm
 * 
 * Este módulo implementa un modelo de análisis de grafos dirigidos ponderados para
 * la detección temprana de riesgos psicosociales en el aula.
 * 
 * FUNDAMENTOS MATEMÁTICOS DEL MODELO:
 * 
 * 1. Definición del Grafo G = (V, E)
 *    Donde V son estudiantes y E son las interacciones (aristas).
 *    E se divide en E_pos (preferencias) y E_neg (rechazos/tensión).
 * 
 * 2. Cálculo de Centralidad (Degree Centrality):
 *    - In-Degree Positivo (IDP): Cantidad de elecciones recibidas (Popularidad).
 *    - In-Degree Negativo (IDN): Cantidad de rechazos recibidos (Conflictividad Pasiva).
 *    - Out-Degree (OD): Nivel de sociabilidad o integración activa.
 * 
 * 3. Factor de Aislamiento (F_iso):
 *    Se calcula invirtiendo la normalización del IDP.
 *    F_iso(v) = (1 - (IDP(v) / max(IDP))) * α + (OD(v) == 0 ? β : 0)
 *    Donde α=0.7 (peso de no ser elegido) y β=0.3 (peso de no elegir a nadie).
 * 
 * 4. Factor de Conflicto (F_conf):
 *    F_conf(v) = min(IDN(v) / Umbral_Critico, 1)
 *    Normaliza la cantidad de menciones negativas recibidas.
 * 
 * 5. Factor de Clima (F_clim):
 *    Percepción subjetiva invertida.
 *    F_clim(v) = (Max_Rating - Rating(v) + 1) / Max_Rating
 * 
 * 6. Score de Riesgo Integrado (R_score):
 *    R_score(v) = w1*F_conf(v) + w2*F_iso(v) + w3*F_clim(v)
 *    Pesos actuales: w1=0.5 (Conflicto es prioritario), w2=0.3, w3=0.2
 * 
 * @param students Lista del universo de estudiantes (Nodos)
 * @param responses Respuestas de la encuesta (Aristas y atributos)
 */
export const analyzeClassroomData = (students: Student[], responses: SurveyResponse[]): { nodes: GraphNode[], links: GraphLink[], analysis: RiskAnalysis } => {
  
  const nodes: GraphNode[] = students.map(s => ({
    ...s,
    inDegree: 0,
    outDegree: 0,
    conflictScore: 0,
    riskScore: 0,
    clusterId: 0
  }));

  const links: GraphLink[] = [];
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  // 1. Construcción del Grafo (Matriz de Adyacencia dispersa)
  responses.forEach(r => {
    const sourceNode = nodeMap.get(r.studentId);
    if (!sourceNode) return;

    // Aristas Positivas (Afinidad)
    r.preferredPeers.forEach(targetId => {
      const targetNode = nodeMap.get(targetId);
      if (targetNode) {
        links.push({ source: r.studentId, target: targetId, type: 'POSITIVE', weight: 1 });
        targetNode.inDegree++;
        sourceNode.outDegree++;
      }
    });

    // Aristas Negativas (Tensión/Rechazo)
    r.uncomfortablePeers.forEach(targetId => {
      const targetNode = nodeMap.get(targetId);
      if (targetNode) {
        links.push({ source: r.studentId, target: targetId, type: 'NEGATIVE', weight: 2 });
        targetNode.conflictScore += 1; // IDN (In-Degree Negativo)
      }
    });
  });

  // 2. Cálculo de Métricas y Riesgo (Ponderación vectorial)
  const maxInDegree = Math.max(...nodes.map(n => n.inDegree), 1);
  const tensionGroups: string[][] = [];

  nodes.forEach(n => {
    const response = responses.find(r => r.studentId === n.id);
    
    // Normalización de Clima (Escala 1-5 invertida: 1 es riesgoso, 5 es protector)
    // Formula: (6 - rating) / 5 -> 1=1.0 (Riesgo total), 5=0.2 (Riesgo bajo)
    const climateRisk = response ? (6 - response.climateRating) / 5 : 0.5;
    
    // Factor de Aislamiento
    const isolationRisk = (1 - (n.inDegree / maxInDegree)) * 0.7 + (n.outDegree === 0 ? 0.3 : 0);

    // Factor de Conflicto (Umbral suave en 3 menciones negativas)
    const conflictRisk = Math.min(n.conflictScore / 3, 1);

    // FORMULA FINAL DE RIESGO
    // R = 50% Conflicto directo + 30% Aislamiento estructural + 20% Percepción subjetiva
    n.riskScore = (conflictRisk * 50) + (isolationRisk * 30) + (climateRisk * 20);

    // Redondeo para visualización (0-100)
    n.riskScore = Math.round(n.riskScore);
  });

  // 3. Detección de Ciclos de Tensión (Díadas Conflictivas)
  // Si A rechaza a B Y B rechaza a A -> Riesgo Inminente de Violencia Escolar
  links.filter(l => l.type === 'NEGATIVE').forEach(l1 => {
    const reciprocal = links.find(l2 => 
      l2.type === 'NEGATIVE' && l2.source === l1.target && l2.target === l1.source
    );
    if (reciprocal) {
      // Ordenar IDs para evitar duplicados (ej: [A,B] es igual a [B,A])
      const pair = [l1.source, l1.target].sort();
      const exists = tensionGroups.some(g => g[0] === pair[0] && g[1] === pair[1]);
      if (!exists) tensionGroups.push(pair);
    }
  });

  // 4. Análisis Global del Curso
  const globalRisk = Math.round(nodes.reduce((acc, n) => acc + n.riskScore, 0) / nodes.length);
  
  // Umbral de corte para "Alto Riesgo" establecido en 60 puntos
  const atRiskStudents = nodes.filter(n => n.riskScore > 60).sort((a, b) => b.riskScore - a.riskScore);
  
  // Estudiantes estructuralmente aislados (In-Degree 0)
  const isolatedStudents = nodes.filter(n => n.inDegree === 0).sort((a, b) => a.outDegree - b.outDegree);

  return {
    nodes,
    links,
    analysis: {
      globalRisk,
      atRiskStudents,
      isolatedStudents,
      tensionGroups,
      recommendations: "" // Será llenado por el agente IA generativo
    }
  };
};
