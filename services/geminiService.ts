
import { GoogleGenAI, Type } from "@google/genai";
import { Task, DailyMission } from "../types.ts";

// Initialisation différée pour éviter les erreurs de process.env au chargement du module
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key is missing!");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export async function generateMotivationalReminder(task: Task): Promise<string> {
  const ai = getAI();
  if (!ai) return `Il est temps de s'occuper de : ${task.title} ! 💪`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Transform this mundane task into a short, punchy, "battle-cry" style motivational reminder with an emoji in French.
      Task: "${task.title}" at ${task.time}.
      Keep it under 10 words. Make it sound like a coach or a hero's mentor.`,
      config: {
        temperature: 0.9,
      }
    });
    return response.text?.trim() || `Allez, on écrase ${task.title} ! 💪`;
  } catch (error) {
    console.error("Gemini Error:", error);
    return `C'est parti pour : "${task.title}" ! 🔥`;
  }
}

export async function generateDailyBriefing(): Promise<DailyMission> {
  const ai = getAI();
  const fallbackMission = {
    quote: "Le succès n'est pas final, l'échec n'est pas fatal : c'est le courage de continuer qui compte.",
    goal: "Aujourd'hui, concentrez-vous sur la discipline et la constance.",
    challenge: "Buvez 2L d'eau et terminez 3 missions avant midi."
  };

  if (!ai) return fallbackMission;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Génère un briefing matinal pour une application de productivité en français. Retourne exactement trois champs JSON : quote (une citation motivante), goal (un objectif de focus pour la journée), et challenge (un petit défi unique).",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quote: { type: Type.STRING },
            goal: { type: Type.STRING },
            challenge: { type: Type.STRING },
          },
          required: ["quote", "goal", "challenge"]
        }
      }
    });
    
    // Nettoyage de la réponse au cas où le modèle renvoie du markdown
    let text = response.text || "";
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Briefing Error:", error);
    return fallbackMission;
  }
}
