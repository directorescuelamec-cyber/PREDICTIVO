import { Student, SurveyResponse } from './types';

// Simulate a 6th Grade Class (6º Básico)
export const MOCK_STUDENTS: Student[] = Array.from({ length: 20 }, (_, i) => ({
  id: `s-${i + 1}`,
  name: [
    "Juan Pérez", "María González", "Pedro Soto", "Ana Silva", "Diego López",
    "Sofía Muñoz", "Carlos Ruiz", "Valentina Rojas", "Luis Díaz", "Camila Castro",
    "Benjamín Torres", "Martina Herrera", "Joaquín Medina", "Catalina Morales", "Lucas Flores",
    "Isidora Romero", "Tomás Salazar", "Florencia Espinoza", "Gabriel Molina", "Javiera Lagos"
  ][i],
  grade: "6º Básico A",
  avatar: `https://picsum.photos/seed/${i + 1}/100/100`
}));

// Generate some mock survey data with specific patterns (Isolation, Conflict)
export const MOCK_RESPONSES: SurveyResponse[] = MOCK_STUDENTS.map((student, i) => {
  const others = MOCK_STUDENTS.filter(s => s.id !== student.id);
  
  // Pattern: Student 0 (Juan) and 1 (María) are popular
  // Pattern: Student 19 (Javiera) is isolated
  // Pattern: Student 4 (Diego) and 5 (Sofía) have mutual conflict
  
  let preferred: string[] = [];
  let uncomfortable: string[] = [];
  
  if (i === 19) {
    // Javiera picks people, but no one picks her (simulated later)
    preferred = [others[0].id, others[1].id];
  } else if (i === 4) {
    uncomfortable = [others.find(s => s.name.includes("Sofía"))?.id || ""];
    preferred = [others[6].id, others[7].id];
  } else if (i === 5) {
    uncomfortable = [others.find(s => s.name.includes("Diego"))?.id || ""];
    preferred = [others[1].id, others[2].id];
  } else {
    // Random distribution favoring popular kids
    preferred = [others[0].id, others[1].id, others[Math.floor(Math.random() * others.length)].id].slice(0, 3);
    if (Math.random() > 0.8) {
      uncomfortable = [others[Math.floor(Math.random() * others.length)].id];
    }
  }

  return {
    studentId: student.id,
    timestamp: Date.now(),
    preferredPeers: [...new Set(preferred)],
    uncomfortablePeers: [...new Set(uncomfortable)].filter(id => id !== ""),
    perceivedIsolated: i % 5 === 0 ? ["s-20"] : [], // Some notice Javiera is isolated
    climateRating: Math.floor(Math.random() * 2) + 3, // 3-5 range usually
    safetyRating: Math.floor(Math.random() * 2) + 3,
    belongingRating: i === 19 ? 1 : 4,
    comments: ""
  };
});

export const SURVEY_QUESTIONS = [
  {
    id: "preferred",
    text: "¿Con qué compañeros/as te gusta más juntarte en los recreos o trabajos grupales?",
    type: "select-multi",
    max: 3
  },
  {
    id: "uncomfortable",
    text: "¿Con qué compañeros/as NO te sientes cómodo/a o has tenido problemas recientes?",
    type: "select-multi",
    max: 2
  },
  {
    id: "climate",
    text: "En general, ¿cómo sientes el ambiente de tu curso este mes?",
    type: "rating",
    min: 1,
    max: 5,
    labels: ["Muy Malo", "Malo", "Regular", "Bueno", "Muy Bueno"]
  }
];
