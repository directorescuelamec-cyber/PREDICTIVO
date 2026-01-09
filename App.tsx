import React, { useState } from 'react';
import { MOCK_STUDENTS, MOCK_RESPONSES } from './constants';
import { Role, Student, SurveyResponse } from './types';
import StudentSurvey from './components/StudentSurvey';
import RiskDashboard from './components/RiskDashboard';

const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [currentUser, setCurrentUser] = useState<Student | null>(null);
  
  // State for survey data (initialized with mock data for the demo)
  const [responses, setResponses] = useState<SurveyResponse[]>(MOCK_RESPONSES);

  const handleLogin = (role: Role) => {
    setCurrentRole(role);
    if (role === Role.STUDENT) {
      // Pick a random student who hasn't answered yet, or just the first one for demo
      setCurrentUser(MOCK_STUDENTS[0]);
    }
  };

  const handleSurveySubmit = (response: SurveyResponse) => {
    setResponses(prev => [...prev.filter(r => r.studentId !== response.studentId), response]);
    alert("¡Encuesta enviada con éxito! Gracias por participar.");
    setCurrentRole(null);
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      
      {!currentRole ? (
        // LANDING / LOGIN SCREEN
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-mineduc-blue rounded-full flex items-center justify-center text-white text-2xl font-bold">
                PE
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">PredictrEscolar</h1>
            <p className="text-gray-500 mb-8">Plataforma de Gestión de Convivencia Escolar Inteligente</p>
            
            <div className="space-y-4">
              <button 
                onClick={() => handleLogin(Role.STUDENT)}
                className="w-full bg-white border-2 border-mineduc-blue text-mineduc-blue py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
              >
                <span>🎓</span> Soy Estudiante
              </button>
              
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">Acceso Administrativo</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <button 
                onClick={() => handleLogin(Role.COUNSELOR)}
                className="w-full bg-mineduc-blue text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
              >
                <span>📊</span> Equipo de Convivencia
              </button>
            </div>
            
            <div className="mt-8 text-xs text-gray-400">
              Cumplimiento Normativa Circular 482 y Ley 20.370.<br/>
              Datos protegidos y confidenciales.
            </div>
          </div>
        </div>
      ) : currentRole === Role.STUDENT && currentUser ? (
        // STUDENT VIEW
        <StudentSurvey 
          currentUser={currentUser} 
          onSubmit={handleSurveySubmit} 
          onCancel={() => setCurrentRole(null)} 
        />
      ) : (
        // DASHBOARD VIEW
        <RiskDashboard 
          students={MOCK_STUDENTS} 
          responses={responses} 
          onBack={() => setCurrentRole(null)} 
        />
      )}
    </div>
  );
};

export default App;
