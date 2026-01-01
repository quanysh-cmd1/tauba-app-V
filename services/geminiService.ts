
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedContent, Language } from "../types";

// Always initialize with the named parameter apiKey from process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const MODEL_NAME = 'gemini-3-flash-preview';
const IMAGE_MODEL_NAME = 'gemini-2.5-flash-image';

export const getDailyHadith = async (lang: Language, topic?: string): Promise<GeneratedContent | null> => {
  try {
    const languageName = lang === 'kk' ? 'Kazakh' : (lang === 'ru' ? 'Russian' : 'English');
    const prompt = `
      STRICT REQUIREMENT: Generate only an authentic Islamic Hadith (saying of Prophet Muhammad PBUH).
      Language: ${languageName}.
      Context: Sunni Islam, suitable for a Kazakh audience.
      Source: Must be from Sahih al-Bukhari, Sahih Muslim, or other major authentic collections.
      Topic: ${topic || 'General ethics, kindness, prayer, or knowledge'}.
      Format: JSON.
      Required Fields: title, content, reference.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            reference: { type: Type.STRING },
          },
          required: ["title", "content", "reference"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as GeneratedContent;
    }
    return null;
  } catch (error) {
    console.error("AI Error (Hadith):", error);
    return null;
  }
};

export const getRiwayat = async (lang: Language): Promise<GeneratedContent | null> => {
  try {
    const languageName = lang === 'kk' ? 'Kazakh' : (lang === 'ru' ? 'Russian' : 'English');
    const prompt = `
      Write a short, inspiring Islamic story or wisdom (Riwayat/Qissa/Qissa-ul-Anbiya) from the lives of Sahaba, Prophets, or righteous predecessors.
      Language: ${languageName}.
      Context: Educational and heart-softening, suitable for Kazakh Muslims.
      Format: JSON.
      Required Fields: title, content, reference.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            reference: { type: Type.STRING },
          },
          required: ["title", "content"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as GeneratedContent;
    }
    return null;
  } catch (error) {
    console.error("AI Error (Riwayat):", error);
    return null;
  }
};

export const askAIImam = async (question: string, lang: Language): Promise<string> => {
  try {
    const languageName = lang === 'kk' ? 'Kazakh' : (lang === 'ru' ? 'Russian' : 'English');
    const prompt = `
      Act as a wise and moderate Islamic scholar (Imam).
      Question: "${question}"
      Language: ${languageName}.
      Guidelines: 
      - Follow the Sunni path (Hanafi school of thought is standard in Kazakhstan).
      - Be compassionate, concise, and clear.
      - If it's a very complex Fatawa issue, advise consulting a local Muftyat office.
      - Start with a polite Islamic greeting.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text || "Error generating response.";
  } catch (error) {
    console.error("AI Error (Imam):", error);
    return "Қате орын алды. / Ошибка.";
  }
};

export const getAyahTafsir = async (surahName: string, ayahNumber: number, ayahText: string, lang: Language): Promise<string> => {
  try {
    const languageName = lang === 'kk' ? 'Kazakh' : (lang === 'ru' ? 'Russian' : 'English');
    const prompt = `
      Provide a short Tafsir (explanation) for this Quran verse in ${languageName}.
      Surah: ${surahName}, Ayah: ${ayahNumber}.
      Text: "${ayahText}".
      Source: Reliable classical sources like Ibn Kathir or modern moderate explanations.
      Keep it simple, inspiring and practical for daily life.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text || "Тәпсір жасалмады.";
  } catch (error) {
    console.error("AI Error (Tafsir):", error);
    if (lang === 'kk') return "AI қызметі уақытша қолжетімсіз. Кейінірек көріңіз.";
    return "Сервис ИИ временно недоступен.";
  }
};

export const generateZikirRewardImage = async (count: number): Promise<string | null> => {
  try {
    const prompt = "Minimalist Islamic art background. Soft gradients, simple geometric lines. Colors: Sage green, cream, white, gold. Vast empty negative space in the center. Serene, spiritual, high quality, 4k. No text, no letters.";
    
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL_NAME,
      contents: prompt,
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("AI Error (Zikir Image):", error);
    return null;
  }
};
