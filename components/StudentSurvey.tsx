import React, { useState } from 'react';
import { Student, SurveyResponse } from '../types';
import { MOCK_STUDENTS, SURVEY_QUESTIONS } from '../constants';

interface StudentSurveyProps {
  currentUser: Student;
  onSubmit: (response: SurveyResponse) => void;
  onCancel: () => void;
}

const StudentSurvey: React.FC<StudentSurveyProps> = ({ currentUser, onSubmit, onCancel }) => {
  const [step, setStep] = useState(0);
  const [preferred, setPreferred] = useState<string[]>([]);
  const [uncomfortable, setUncomfortable] = useState<string[]>([]);
  const [climate, setClimate] = useState<number>(3);
  const [comment, setComment] = useState("");

  const classmates = MOCK_STUDENTS.filter(s => s.id !== currentUser.id);

  const handleSubmit = () => {
    const response: SurveyResponse = {
      studentId: currentUser.id,
      timestamp: Date.now(),
      preferredPeers: preferred,
      uncomfortablePeers: uncomfortable,
      perceivedIsolated: [], // Simplified for this demo
      climateRating: climate,
      safetyRating: 4,
      belongingRating: 4,
      comments: comment
    };
    onSubmit(response);
  };

  const toggleSelection = (id: string, list: string[], setList: (l: string[]) => void, max: number) => {
    if (list.includes(id)) {
      setList(list.filter(item => item !== id));
    } else {
      if (list.length < max) {
        setList([...list, id]);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen sm:min-h-0 sm:rounded-xl sm:shadow-lg sm:my-8 overflow-hidden flex flex-col">
      <div className="bg-mineduc-blue p-6 text-white">
        <h2 className="text-xl font-bold">Encuesta de Convivencia</h2>
        <p className="text-sm opacity-90">Hola, {currentUser.name.split(' ')[0]}. Tus respuestas son confidenciales.</p>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        {step === 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 text-lg">1. Afinidades</h3>
            <p className="text-gray-600 text-sm mb-4">{SURVEY_QUESTIONS[0].text} (Máx 3)</p>
            <div className="space-y-2">
              {classmates.map(s => (
                <button
                  key={s.id}
                  onClick={() => toggleSelection(s.id, preferred, setPreferred, 3)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all flex items-center gap-3 ${
                    preferred.includes(s.id) ? 'border-mineduc-blue bg-blue-50 ring-1 ring-mineduc-blue' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                     <img src={s.avatar} alt="" className="w-full h-full object-cover"/>
                  </div>
                  <span className="text-sm font-medium">{s.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 text-lg">2. Dificultades</h3>
            <p className="text-gray-600 text-sm mb-4">{SURVEY_QUESTIONS[1].text} (Máx 2, Opcional)</p>
            <div className="space-y-2">
              {classmates.map(s => (
                <button
                  key={s.id}
                  onClick={() => toggleSelection(s.id, uncomfortable, setUncomfortable, 2)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all flex items-center gap-3 ${
                    uncomfortable.includes(s.id) ? 'border-red-500 bg-red-50 ring-1 ring-red-500' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                     <img src={s.avatar} alt="" className="w-full h-full object-cover"/>
                  </div>
                  <span className="text-sm font-medium">{s.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-800 text-lg mb-2">3. Clima del Curso</h3>
              <p className="text-gray-600 text-sm mb-4">{SURVEY_QUESTIONS[2].text}</p>
              <div className="flex justify-between gap-1">
                {[1, 2, 3, 4, 5].map(val => (
                  <button
                    key={val}
                    onClick={() => setClimate(val)}
                    className={`flex-1 py-3 rounded-lg border text-lg font-bold transition-colors ${
                      climate === val 
                        ? 'bg-mineduc-blue text-white border-mineduc-blue' 
                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2 px-1">
                <span>Muy Malo</span>
                <span>Muy Bueno</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">¿Algo más que quieras contar? (Opcional)</label>
              <textarea 
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-mineduc-blue focus:border-transparent outline-none"
                rows={3}
                placeholder="Me siento..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
        {step > 0 ? (
          <button onClick={() => setStep(step - 1)} className="text-gray-600 font-medium px-4 py-2 hover:bg-gray-200 rounded-lg">
            Atrás
          </button>
        ) : (
          <button onClick={onCancel} className="text-gray-500 font-medium px-4 py-2 hover:text-gray-700">
            Cancelar
          </button>
        )}
        
        {step < 2 ? (
          <button 
            onClick={() => setStep(step + 1)} 
            className="bg-mineduc-blue text-white px-6 py-2 rounded-lg font-medium shadow-md hover:bg-blue-800 transition-colors"
          >
            Siguiente
          </button>
        ) : (
          <button 
            onClick={handleSubmit}
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium shadow-md hover:bg-green-700 transition-colors"
          >
            Enviar Encuesta
          </button>
        )}
      </div>
    </div>
  );
};

export default StudentSurvey;
