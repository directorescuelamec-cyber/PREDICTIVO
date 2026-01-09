import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Student, SurveyResponse, GraphNode, GraphLink, RiskAnalysis } from '../types';
import { analyzeClassroomData } from '../utils/graphLogic';
import NetworkGraph from './NetworkGraph';
import { generateRiskReport } from '../services/geminiService';

interface RiskDashboardProps {
  students: Student[];
  responses: SurveyResponse[];
  onBack: () => void;
}

const RiskDashboard: React.FC<RiskDashboardProps> = ({ students, responses, onBack }) => {
  const [data, setData] = useState<{ nodes: GraphNode[], links: GraphLink[], analysis: RiskAnalysis } | null>(null);
  const [activeTab, setActiveTab] = useState<'GRAPH' | 'METRICS' | 'AI'>('GRAPH');
  const [aiReport, setAiReport] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    // Run local predictive logic
    const results = analyzeClassroomData(students, responses);
    setData(results);
  }, [students, responses]);

  const handleGenerateAI = async () => {
    if (!data) return;
    setLoadingAi(true);
    const report = await generateRiskReport("6º Básico A", data.analysis, data.nodes);
    setAiReport(report);
    setLoadingAi(false);
  };

  if (!data) return <div className="p-10 text-center">Procesando datos...</div>;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm z-10">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Panel de Gestión Convivencia Escolar</h1>
          <p className="text-sm text-gray-500">Curso: 6º Básico A | Encuestas Recibidas: {responses.length}/{students.length}</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            Riesgo Global: <span className={data.analysis.globalRisk > 50 ? 'text-red-600' : 'text-green-600'}>{data.analysis.globalRisk}%</span>
          </div>
          <button onClick={onBack} className="text-gray-500 hover:text-gray-800">Salir</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col md:flex-row">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-white border-r flex flex-row md:flex-col shrink-0 overflow-x-auto md:overflow-visible">
          <button 
            onClick={() => setActiveTab('GRAPH')}
            className={`p-4 text-left border-b-2 md:border-b-0 md:border-l-4 transition-all whitespace-nowrap ${activeTab === 'GRAPH' ? 'border-mineduc-blue bg-blue-50 text-mineduc-blue font-semibold' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
          >
            Sociograma (Grafo)
          </button>
          <button 
            onClick={() => setActiveTab('METRICS')}
            className={`p-4 text-left border-b-2 md:border-b-0 md:border-l-4 transition-all whitespace-nowrap ${activeTab === 'METRICS' ? 'border-mineduc-blue bg-blue-50 text-mineduc-blue font-semibold' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
          >
            Métricas de Riesgo
          </button>
          <button 
            onClick={() => setActiveTab('AI')}
            className={`p-4 text-left border-b-2 md:border-b-0 md:border-l-4 transition-all whitespace-nowrap ${activeTab === 'AI' ? 'border-purple-600 bg-purple-50 text-purple-700 font-semibold' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
          >
            Asesor IA
          </button>
        </aside>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Tab: Graph */}
          {activeTab === 'GRAPH' && (
            <div className="h-full flex flex-col">
              <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                <div className="flex gap-4 text-sm mb-2">
                  <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span> Riesgo Bajo</div>
                  <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> Riesgo Medio</div>
                  <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span> Riesgo Alto</div>
                </div>
                <NetworkGraph nodes={data.nodes} links={data.links} width={800} height={500} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
                    <h3 className="font-bold text-gray-800 mb-2">Alertas de Tensión</h3>
                    {data.analysis.tensionGroups.length === 0 ? (
                      <p className="text-sm text-gray-500">No se detectaron conflictos recíprocos directos.</p>
                    ) : (
                      <ul className="space-y-2">
                        {data.analysis.tensionGroups.map((group, idx) => (
                          <li key={idx} className="text-sm text-red-700 bg-red-50 p-2 rounded">
                            Conflicto mutuo: <strong>{data.nodes.find(n => n.id === group[0])?.name}</strong> ↔ <strong>{data.nodes.find(n => n.id === group[1])?.name}</strong>
                          </li>
                        ))}
                      </ul>
                    )}
                 </div>
                 <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
                    <h3 className="font-bold text-gray-800 mb-2">Riesgo de Aislamiento</h3>
                    {data.analysis.isolatedStudents.length === 0 ? (
                      <p className="text-sm text-gray-500">Todos los estudiantes tienen al menos un vínculo positivo.</p>
                    ) : (
                      <ul className="space-y-2">
                        {data.analysis.isolatedStudents.map(s => (
                          <li key={s.id} className="text-sm text-yellow-800 bg-yellow-50 p-2 rounded flex justify-between">
                            <span>{s.name}</span>
                            <span className="text-xs font-semibold px-2 py-0.5 bg-white rounded border border-yellow-200">Sin menciones recibidas</span>
                          </li>
                        ))}
                      </ul>
                    )}
                 </div>
              </div>
            </div>
          )}

          {/* Tab: Metrics */}
          {activeTab === 'METRICS' && (
            <div className="space-y-6">
               <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="font-bold text-lg mb-4">Top 10 Riesgo Calculado</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left">Estudiante</th>
                          <th className="px-4 py-2 text-center">Score Riesgo</th>
                          <th className="px-4 py-2 text-center">Popularidad (In)</th>
                          <th className="px-4 py-2 text-center">Conflictos (In)</th>
                          <th className="px-4 py-2 text-center">Clima Percibido</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.analysis.atRiskStudents.slice(0, 10).map(s => (
                          <tr key={s.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">{s.name}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ${s.riskScore > 60 ? 'bg-red-500' : 'bg-yellow-500'}`}>
                                {s.riskScore}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center text-gray-600">{s.inDegree}</td>
                            <td className="px-4 py-3 text-center text-red-600 font-semibold">{s.conflictScore}</td>
                            <td className="px-4 py-3 text-center">
                               {responses.find(r => r.studentId === s.id)?.climateRating || '-'} / 5
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>

               <div className="bg-white p-6 rounded-lg shadow-sm h-80">
                  <h3 className="font-bold text-lg mb-4">Distribución del Riesgo en el Curso</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.nodes}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={false} label={{ value: 'Estudiantes', position: 'insideBottom', offset: -5 }} />
                      <YAxis label={{ value: 'Índice de Riesgo', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Bar dataKey="riskScore" fill="#004A80" name="Score Riesgo" />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>
          )}

          {/* Tab: AI Advisor */}
          {activeTab === 'AI' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-purple-600 text-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-2">Asistente IA de Convivencia</h2>
                <p className="opacity-90">Este sistema analiza patrones complejos de exclusión y conflicto para sugerir medidas preventivas alineadas con la normativa vigente.</p>
              </div>

              {aiReport ? (
                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-gray-900 font-bold text-xl mb-4 border-b pb-2">Informe Técnico Generado</h3>
                  <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
                    {aiReport}
                  </div>
                  <div className="mt-6 pt-4 border-t flex justify-end">
                    <button onClick={() => setAiReport("")} className="text-sm text-gray-500 hover:underline">Generar nuevo análisis</button>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
                  <div className="mb-4 text-6xl">🤖</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">¿Necesitas orientación?</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    La IA analizará el grafo relacional, los índices de aislamiento y los conflictos declarados para redactar un informe con sugerencias pedagógicas.
                  </p>
                  <button 
                    onClick={handleGenerateAI}
                    disabled={loadingAi}
                    className="bg-purple-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
                  >
                    {loadingAi ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analizando Datos...
                      </>
                    ) : (
                      "Generar Informe con IA"
                    )}
                  </button>
                  <p className="mt-4 text-xs text-gray-400">
                    * Los datos son procesados de forma anónima respetando la Ley 20.370.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RiskDashboard;
