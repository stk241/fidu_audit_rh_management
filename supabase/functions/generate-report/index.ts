import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Feedback {
  content: string;
  created_at: string;
  mission: string | null;
  author: {
    first_name: string;
    last_name: string;
  };
}

interface RequestBody {
  feedbacks: Feedback[];
  openaiApiKey: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { feedbacks, openaiApiKey }: RequestBody = await req.json();

    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!feedbacks || feedbacks.length === 0) {
      return new Response(
        JSON.stringify({ error: "No feedbacks provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const formattedFeedbacks = feedbacks
      .map((f, index) => {
        const date = new Date(f.created_at).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
        const mission = f.mission ? ` – Mission: ${f.mission}` : '';
        return `[Feedback ${index + 1} – ${date} – ${f.author.first_name} ${f.author.last_name}${mission}] : ${f.content}`;
      })
      .join('\n\n');

    const systemPrompt = `Rôle

Tu es un expert RH virtuel du cabinet FIDU AUDIT RH.
Ta mission est d'aider les managers (Admins et Chefs de Mission) à rédiger des rapports d'entretien annuel pour leurs collaborateurs.

Tâche

À partir d'une liste de feedbacks bruts, parfois incomplets, factuels ou rédigés rapidement au fil de l'eau durant la SAISON, tu dois produire un rapport d'évaluation structuré, clair, synthétique, cohérent et utilisable dans l'outil EasyRH.

Contraintes générales (IMPÉRATIVES)

Tu n'inventes rien.
Tu reformules, synthétises et organises l'information fournie, mais tu n'ajoutes aucun fait non présent dans les feedbacks.

Tu restes strictement factuel.
Si une rubrique manque d'informations, tu rédiges une phrase courte neutre, ou indiques "Non applicable" lorsque spécifié.

Ton utilisé :

Tutoiement impératif ("tu").

Style professionnel, bienveillant et constructif.

Pas de langue de bois ni de formulations blessantes.

Écrire des phrases courtes et simples.

Longueur :
Rédige un texte synthétique (idéalement moins de 2 000 caractères).
Pas de pavés.

Aucune mention de l'IA ou du processus de génération.

Structure attendue (FORMAT STRICT À RESPECTER)

Tu dois générer le rapport sous ce format exact :

    Bilan global de l'année

Bilan global : [Synthèse générale basée sur les feedbacks]

Principales satisfactions : [Points forts majeurs factuels]

Principales difficultés et actions : [Points d'attention + pistes d'amélioration concrètes]

Remarques éventuelles : [Autres points pertinents ou "RAS"]

    Ton activité

Synthèse poste/portefeuille : [Résumé du périmètre réellement constaté dans les feedbacks]

Classification et champs d'intervention : [Adéquation fiche de poste / interventions réelles]

Comités transverses : [Participation ou "Non applicable"]

Retour contrôle qualité : [Synthèse des retours techniques s'ils existent, sinon "RAS"]

    Tes compétences

3.1 Techniques : [Forces techniques + axes de progression concrets]

3.2 Organisationnelles : [Autonomie, efficacité, respect des délais]

3.3 Qualités personnelles/comportementales : [Relationnel, collaboration, attitude client]

3.4 Management : [Éléments présents OU indiquer « Non applicable »]

3.5 Adéquation classification/poste : [En phase / En écart]

    Objectifs pour l'année à venir

[Objectifs réalistes basés uniquement sur les axes d'amélioration identifiés]

    Avis global du manager

[Synthèse finale motivante, adressée en "tu", ton positif, orientée progression]`;

    const userPrompt = `Données d'entrée (feedbacks bruts)

Voici la liste des feedbacks structurés pour ce collaborateur :

${formattedFeedbacks}`;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('OpenAI API error:', errorData);
      console.error('OpenAI API status:', openaiResponse.status);
      return new Response(
        JSON.stringify({
          error: 'Failed to generate report with OpenAI',
          details: errorData,
          status: openaiResponse.status
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openaiData = await openaiResponse.json();
    const generatedReport = openaiData.choices[0]?.message?.content || '';

    return new Response(
      JSON.stringify({ report: generatedReport }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error('Error in generate-report function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});