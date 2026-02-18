
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { QuizSettings, QuizQuestion, StudyPlanSettings, StudyPlan } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const quizSchema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      description: "Uma lista de questões para o simulado.",
      items: {
        type: Type.OBJECT,
        properties: {
          question: {
            type: Type.STRING,
            description: "O enunciado da questão."
          },
          banca: {
            type: Type.STRING,
            description: "A banca organizadora (ex: FGV, Cebraspe, FCC, Vunesp, Cesgranrio, AOCP, Quadrix, Consulplan, ESAF, IBFC, IBADE, IBAM)."
          },
          options: {
            type: Type.ARRAY,
            description: "Um array com 5 strings, representando as opções de resposta.",
            items: { type: Type.STRING }
          },
          correctAnswerIndex: {
            type: Type.NUMBER,
            description: "O índice (base 0) da resposta correta no array de opções."
          },
          explanation: {
            type: Type.STRING,
            description: "Uma explicação detalhada sobre a resposta correta."
          }
        },
        required: ["question", "banca", "options", "correctAnswerIndex", "explanation"]
      }
    }
  },
  required: ["questions"]
};

export async function generateQuiz(settings: QuizSettings): Promise<QuizQuestion[]> {
  const prompt = `
    Você é um especialista em criar simulados para concursos públicos no Brasil.
    Sua tarefa é criar um simulado com ${settings.numQuestions} questões de múltipla escolha.

    Tema do Simulado: "${settings.subject}"
    Nível de Dificuldade: ${settings.difficulty}

    Instruções:
    1.  Crie exatamente ${settings.numQuestions} questões.
    2.  Cada questão deve ter 5 opções de resposta (A, B, C, D, E).
    3.  Para cada questão, atribua uma BANCA de concurso realista que costuma cobrar esse tipo de conteúdo (ex: Cebraspe, FGV, FCC, Vunesp, Cesgranrio, AOCP, Quadrix, Consulplan, ESAF, IBFC, IBADE, IBAM).
    4.  Para cada questão, indique qual é a resposta correta e forneça uma explicação clara e detalhada.
    5.  As questões e explicações devem ser relevantes e de alta qualidade, adequadas para o nível de dificuldade especificado.
    6.  A saída deve ser um objeto JSON que corresponda estritamente ao schema fornecido. Não inclua markdown ou qualquer texto fora da estrutura JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
        temperature: 0.8,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    if (!result.questions || !Array.isArray(result.questions)) {
      throw new Error("Resposta da IA inválida: a propriedade 'questions' está ausente ou não é um array.");
    }

    return result.questions as QuizQuestion[];

  } catch (error) {
    console.error("Erro ao gerar o simulado com Gemini:", error);
    throw new Error("Falha na comunicação com a IA para gerar o simulado. Verifique o console para mais detalhes.");
  }
}

export async function generateSpeech(text: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Leia o seguinte texto de forma clara e pausada para um estudante de concurso: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("Não foi possível gerar o áudio.");
    }
    return base64Audio;
  } catch (error) {
    console.error("Erro ao gerar fala com Gemini:", error);
    throw error;
  }
}

const studyPlanSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "Um título para o plano de estudos, baseado no objetivo do usuário."
    },
    weeklyPlan: {
      type: Type.ARRAY,
      description: "Um array de objetos, onde cada objeto representa o plano para uma semana.",
      items: {
        type: Type.OBJECT,
        properties: {
          week: {
            type: Type.NUMBER,
            description: "O número da semana (ex: 1, 2, 3)."
          },
          focus: {
            type: Type.STRING,
            description: "O foco principal ou objetivo para esta semana."
          },
          dailySchedule: {
            type: Type.ARRAY,
            description: "Um array de objetos, um para cada dia da semana com atividades planejadas.",
            items: {
              type: Type.OBJECT,
              properties: {
                day: {
                  type: Type.STRING,
                  description: "O dia da semana (ex: Segunda-feira, Terça-feira)."
                },
                activities: {
                  type: Type.ARRAY,
                  description: "Uma lista de atividades de estudo para o dia.",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      subject: {
                        type: Type.STRING,
                        description: "A matéria a ser estudada."
                      },
                      activity: {
                        type: Type.STRING,
                        description: "A atividade específica (ex: Leitura, Resumos, Exercícios, Revisão)."
                      },
                      duration: {
                        type: Type.STRING,
                        description: "A duração sugerida para a atividade (ex: '1 hora', '90 minutos')."
                      }
                    },
                    required: ["subject", "activity", "duration"]
                  }
                }
              },
              required: ["day", "activities"]
            }
          }
        },
        required: ["week", "focus", "dailySchedule"]
      }
    }
  },
  required: ["title", "weeklyPlan"]
};

export async function generateStudyPlan(settings: StudyPlanSettings): Promise<StudyPlan> {
  const subjectList = settings.subjects.join(', ');
  const prompt = `
    Você é um coach especialista em preparação para concursos públicos no Brasil. Sua tarefa é criar um plano de estudos personalizado e detalhado.

    **Objetivo do Usuário:** ${settings.goal}
    **Matérias a Estudar:** ${subjectList}
    **Tempo Disponível:** ${settings.hoursPerWeek} horas por semana
    **Duração do Plano:** ${settings.durationInWeeks} semanas

    **Instruções:**
    1. Crie um plano de estudos semanal detalhado para a duração total especificada.
    2. Distribua o tempo de estudo semanal de forma equilibrada entre as matérias listadas.
    3. Para cada semana, defina um foco claro (ex: "Foco em Direito Constitucional e Revisão de Português").
    4. Para cada dia da semana com estudo planejado, detalhe as atividades: matéria, tipo de atividade (leitura de teoria, resolução de exercícios, criação de resumos, revisão) e a duração.
    5. Intercale diferentes tipos de atividades e matérias para otimizar o aprendizado (técnica de intercalação).
    6. Inclua sessões de revisão periódicas e tempo para simulados ou resolução de blocos de questões.
    7. Se o tempo semanal for baixo, sugira um plano realista, talvez focando em 1 ou 2 matérias por dia. Se for alto, pode incluir mais matérias por dia.
    8. A saída deve ser um objeto JSON que corresponda estritamente ao schema fornecido. Não inclua markdown ou qualquer texto fora da estrutura JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: studyPlanSchema,
        temperature: 0.7,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    if (!result.weeklyPlan || !Array.isArray(result.weeklyPlan)) {
      throw new Error("Resposta da IA inválida: a estrutura do plano de estudos está incorreta.");
    }

    return result as StudyPlan;

  } catch (error) {
    console.error("Erro ao gerar o plano de estudos com Gemini:", error);
    throw new Error("Falha na comunicação com a IA para gerar o plano. Verifique o console para mais detalhes.");
  }
}
