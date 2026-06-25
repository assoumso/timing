import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Assistant client generator (lazy-loaded so it does not crash on bare server launch)
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('La clé GEMINI_API_KEY n’est pas configurée dans les variables d’environnement.');
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Analyser les corps de requête JSON
  app.use(express.json({ limit: '10mb' }));

  // API Route : Suggérer des modifications ou résoudre des conflits
  app.post('/api/gemini/suggest', async (req, res) => {
    try {
      const { courses, classes, teachers, rooms, prompt, conversationHistory } = req.body;

      let aiClient;
      try {
        aiClient = getGeminiClient();
      } catch (err: any) {
        return res.status(200).json({
          text: `**Assistant IA non disponible :** ${err.message}\n\n*Veuillez ajouter votre jeton dans l'onglet Secrets de la plateforme Google AI Studio.*`
        });
      }

      // Construit un contexte riche et précis pour que l'IA comprenne l'école et son état
      const systemInstruction = `
Vous êtes l'Assistant d'Ordonnancement de BARAKATPLANNING, un expert d'ajustement d'emplois du temps scolaires francophones.
Votre rôle est d'analyser l'emploi du temps d'une école, de repérer et d'expliquer les conflits (d'enseignant, de salle, de classe, ou de capacité) et de formuler des recommandations optimales claires et humaines de permutation de créneaux.

Données actuelles de l'établissement:
- Classes (id, nom, capacite): ${JSON.stringify(classes)}
- Enseignants (matières, indisponibilités): ${JSON.stringify(teachers)}
- Salles (id, nom, type, capacite): ${JSON.stringify(rooms)}
- Cours planifiés : ${JSON.stringify(courses)}

Règles d'affectation :
1. Pas de double réservation : Un prof ne peut pas assurer deux cours en même temps. Une classe ne peut pas avoir deux matières à la fois. Une salle ne peut contenir qu'un cours à la fois.
2. Indisponibilités : Éviter d'allouer un professeur sur un créneau marqué indisponible (les heures indisponibles d'un prof sont spécifiées au format dayId_slotId, exemple: Mon_M1 pour Lundi M1).
3. Capacité d'accueil : Signaler si le nombre d'élèves de la classe dépasse le nombre de places de la salle.

Instructions de mise en forme :
- Soyez direct, poli, professionnel, et formulez votre réponse en français.
- Identifiez les conflits s'il y en a et préconisez des choix concrets (ex: "Déplacez l'histoire-géo de 6A du Mardi M2 vers le Mercredi M3").
- Vos réponses doivent être de superbes réponses en Markdown (tableaux récapitulatifs, listes pointées, accentuation en gras). N'ajoutez pas de métadonnées ou de jargon hors de propos.
`;

      const contents: any[] = [];

      // Si un historique de conversation est passé, on l'injecte
      if (conversationHistory && Array.isArray(conversationHistory)) {
        for (const message of conversationHistory) {
          contents.push({
            role: message.role === 'user' ? 'user' : 'model',
            parts: [{ text: message.text || '' }]
          });
        }
      }

      // Requête / Question actuelle
      const userMessage = prompt || "Analyse mon emploi du temps actuel, identifie les conflits s'il y en a et propose-moi des suggestions d'optimisation.";
      contents.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({
        text: response.text || "Désolé, je n'ai pas pu générer de suggestions."
      });
    } catch (error: any) {
      console.error("Erreur de l'assistant Gemini:", error);
      res.status(500).json({
        error: "Erreur serveur lors de la communication de l'Assistant d'Ordonnancement.",
        details: error.message
      });
    }
  });

  // API Route : Auto-générateur d'emplois du temps (AI-Powered)
  app.post('/api/gemini/generate-auto', async (req, res) => {
    try {
      const { classes, teachers, rooms, currentCourses, requirementsToScheduleByClass } = req.body;

      let aiClient;
      try {
        aiClient = getGeminiClient();
      } catch (err: any) {
        return res.status(200).json({
          error: "Clé d'API manquante.",
          details: err.message
        });
      }

      const promptMsg = `
Données sur l'établissement :
- Classes : ${JSON.stringify(classes)}
- Professeurs : ${JSON.stringify(teachers)}
- Salles : ${JSON.stringify(rooms)}
- Emplacement des cours actuels déjà programmés : ${JSON.stringify(currentCourses)}

Votre travail consiste à planifier automatiquement et intelligemment une série de cours pour chaque classe selon l'expression de besoin suivante :
${JSON.stringify(requirementsToScheduleByClass)}

Veuillez trouver et attribuer des créneaux (dayId, slotId, roomId, teacherId) valides pour chacun d'eux.
Règles strictes :
1. Aucun conflit de salle, de prof, ou de groupe de classe (pas de double-réservation).
2. Vérifier les unavailableSlots du prof ! (ex: un cours ne peut pas être planifié le Lundi si le prof est indisponible Mon_M1 / Lundi M1).
3. Le professeur indiqué pour le cours doit être apte à enseigner cette matière (la matière doit figurer dans ses subjects).
4. La salle choisie doit pouvoir accueillir la classe (capacité de la salle >= capacité de la classe).

Format attendu : le résultat doit être UNIQUEMENT un tableau d'objets JSON valides, et rien d'autre. Chaque objet suit cette forme :
{
  "id": "gen_short_unique_id",
  "classId": "identifiant_de_la_classe",
  "teacherId": "identifiant_de_l_enseignant_attribue",
  "subjectId": "identifiant_de_la_matiere",
  "roomId": "identifiant_de_la_salle_attribuee",
  "dayId": "Mon" | "Tue" | "Wed" | "Thu" | "Fri",
  "slotId": "M1" | "M2" | "M3" | "M4" | "A1" | "A2" | "A3"
}
`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptMsg,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                classId: { type: Type.STRING },
                teacherId: { type: Type.STRING },
                subjectId: { type: Type.STRING },
                roomId: { type: Type.STRING },
                dayId: { type: Type.STRING },
                slotId: { type: Type.STRING },
              },
              required: ['id', 'classId', 'teacherId', 'subjectId', 'roomId', 'dayId', 'slotId'],
            },
          },
        },
      });

      const responseText = response.text || '[]';
      const results = JSON.parse(responseText.trim());
      res.json({ success: true, courses: results });
    } catch (error: any) {
      console.error("Erreur de génération automatique:", error);
      res.status(500).json({
        error: "Échec de la génération automatique d'emplois du temps par l'IA.",
        details: error.message
      });
    }
  });

  // Mode de développement ou de production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Écouter sur l'hôte standard pour Cloud Run et port obligatoire 3000
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BARAKATPLANNING] Serveur démarré sur http://localhost:${PORT}`);
  });
}

startServer();
