import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_SECRET_KEY || "dummy-key",
});

/**
 * Compute confidence metrics for the analysis
 */
function computeConfidenceMetrics(profile, posts) {
  const completeness = (() => {
    let fields = 0;
    const keys = [
      "name",
      "title",
      "company",
      "location",
      "about",
      "experience",
      "education",
      "skills",
    ];
    keys.forEach((k) => {
      if (profile && profile[k]) fields++;
    });
    const fieldScore = Math.min(1, fields / keys.length);

    const postCount = (posts || []).length;
    const postScore = Math.min(1, postCount / 30);

    return 0.6 * fieldScore + 0.4 * postScore;
  })();

  const sampleQuality = (() => {
    if (!posts || posts.length === 0) return 0;
    let sum = 0;
    posts.forEach((p) => {
      const engagement = (p.likes || 0) + (p.comments || 0);
      sum += Math.log(1 + engagement);
    });
    const avg = sum / posts.length;
    return Math.tanh(avg / 3);
  })();

  const recency = (() => {
    if (!posts || posts.length === 0) return 0;
    const now = new Date();
    const ages = posts.map((p) => {
      const d = p.date ? new Date(p.date) : now;
      return Math.max(0, (now - d) / (1000 * 60 * 60 * 24));
    });
    const minAge = Math.min(...ages);
    return Math.max(0, 1 - minAge / 45);
  })();

  const agreement = (() => {
    if (!posts || posts.length === 0) return 0.5;
    const text = (
      (profile.about || "") +
      " " +
      (profile.title || "")
    ).toLowerCase();
    let hits = 0;
    posts.forEach((p) => {
      const pt = (p.content || p.text || "").toLowerCase();
      if (pt.split(" ").some((t) => text.includes(t) && t.length > 3)) hits++;
    });
    const frac = hits / Math.max(1, posts.length);
    return Math.min(1, 0.2 + 0.8 * frac);
  })();

  const signalStrength = (() => {
    if (!posts || posts.length === 0) return 0.4;
    const keywords = {
      D: ["lead", "decis", "drive", "deliver", "growth", "target"],
      I: [
        "connect",
        "celebrate",
        "fun",
        "story",
        "happy",
        "community",
        "network",
      ],
      S: ["team", "support", "steady", "reliable", "care", "consistent"],
      C: ["data", "analysis", "audit", "quality", "process", "detail"],
    };
    let counts = { D: 0, I: 0, S: 0, C: 0 };
    posts.forEach((p) => {
      const t = (p.content || p.text || "").toLowerCase();
      Object.keys(keywords).forEach((k) => {
        keywords[k].forEach((w) => {
          if (t.includes(w)) counts[k]++;
        });
      });
    });
    const vals = Object.values(counts);
    const total = vals.reduce((a, b) => a + b, 0) || 1;
    const sorted = vals.slice().sort((a, b) => b - a);
    const concentration = sorted[0] / total;
    return Math.min(1, 0.2 + concentration);
  })();

  return {
    completeness,
    sampleQuality,
    recency,
    agreement,
    signalStrength,
  };
}

/**
 * Build comprehensive prompt for LLM following updated algorithm
 */
function buildComprehensivePrompt(
  profile,
  posts,
  productDescription,
  productPrice,
  metrics
) {
  const postsSample = (posts || [])
    .slice(0, 8)
    .map((p) => {
      const snippet = (p.content || p.text || "")
        .slice(0, 260)
        .replace(/\n/g, " ");
      const date = p.date || p.createdAt || "no-date";
      return `- [${date}] ${snippet} (likes: ${p.likes || 0}, comments: ${
        p.comments || 0
      })`;
    })
    .join("\n");

    const profileText = `Name: ${profile.name || "—"}
Title: ${profile.title || "—"}
About: ${(profile.about || "—").slice(0, 300)}
Company: ${profile.company || "—"}
Location: ${profile.location || "—"}
Skills: ${(Array.isArray(profile.skills) ? profile.skills.slice(0, 10).join(", ") : "Not specified")}
Experience: ${Array.isArray(profile.experience) ? profile.experience.slice(0, 2).map(e => `${e.title} at ${e.company}`).join("; ") : "Not specified"}`;

  const metricsText = Object.entries(metrics)
    .map(([k, v]) => `${k}: ${(v * 100).toFixed(0)}%`)
    .join(", ");

  const userPrompt = `You are Sellinder, an expert sales intelligence writer. Generate a comprehensive, long-form SELLING-FOCUSED DISC report structured as JSON. This report must be detailed enough to render as a 3-5 page A4 document with rich, actionable content for sales professionals.

**INPUTS:**

Profile:
${profileText}

Recent Posts (sample, most recent first):
${postsSample || "- no posts provided -"}

Product Information:
Name/Description: ${productDescription}
Price: ${productPrice !== null ? `$${productPrice}` : "Not specified"}

Confidence Metrics (precomputed): ${metricsText}

**OUTPUT REQUIREMENTS (MANDATORY - Return valid JSON only):**

Return a single JSON object with these exact keys:

1. **executiveSummary**: 2-3 sentence overview for a sales rep approaching this prospect. Mention their role, company, and key selling angle.

2. **profileSummary**: 90-100 word narrative introducing the prospect from a sales perspective. Reference product relevance and tone specifically for opening the report.

3. **discPercentages**: Object with {D: int, I: int, S: int, C: int} where integers sum to exactly 100. Base this on profile traits, post content, and communication style.

4. **discDefinitions**: Object keyed by full trait names {"dominance": "...", "influence": "...", "steadiness": "...", "conscientiousness": "..."}. Provide 2-4 sentences per trait explaining what that DISC dimension means in communication and buying behavior (consumer-friendly language) and mention the abbreviation (e.g., "Dominance (D)").

5. **primaryStyle**: 50-70 word explanation of how to sell to the primary DISC type (focus on tone, pacing, value framing). Call out the trait name explicitly.

6. **secondaryStyle**: 50-70 word explanation of how to reinforce the pitch for their secondary DISC type, including risks to avoid. Call out the trait name explicitly.

7. **approachGuidance**: 3-4 paragraphs totaling 150-200 words that walk the rep through a full outreach flow (opening, framing value, handling resistance, closing next step) tailored to this prospect. Reference product${productPrice !== null ? ' and price point where relevant' : ''} naturally.

8. **personalityBullets**: Array of 3-5 concise bullet strings summarizing key personality traits relevant to sales approach (these will be displayed as key traits).

9. **talkingPoints**: Array of 4-6 objects, each with:
   - topic: string (short heading)
   - why: string (40-80 words explaining why this topic matters based on profile/posts)
   - whatToSay: string (60-120 words of suggested talking script mentioning product${
     productPrice !== null ? " and price" : ""
   } when relevant)
   - evidence: string (cite specific post snippet with date if applicable, otherwise "Profile-based")

10. **personalizationCues**: String of 400-500 words. SELLING-FOCUSED personalization including:
   - Opening phrases to use
   - Ways to mention price and ROI
   - Company initiatives to reference
   - Social proof suggestions
   - Micro-language and phrases the rep can copy-paste
   - Post references with specific dates where applicable
   - What to avoid saying

11. **openingScripts**: Object with:
   - linkedin_dm: array of 2 variant strings (each 40-80 words, personalized, mention product)
   - email: array of 2 objects {subject: string, body: string} (one short 80-word body, one long 150-word body)
   - phone: array of 3 variant strings (10-second opener, 20-second opener, 45-second pitch)
   - whatsapp: array of 2 variant strings (casual, professional)

12. **objectionHandling**: Array of 4-5 objects, each with:
   - objection: string (likely objection tailored to this prospect and product)
   - rationale: string (2-3 sentences why they'd say this based on profile/DISC)
   - response: string (2-4 sentence recommended reply mentioning product${
     productPrice !== null ? " and price comparison/ROI" : ""
   } where relevant)

13. **nextActions**: Array of 7 objects representing a day-0 to day-30 follow-up plan:
    - day: number (0, 1, 3, 7, 14, 21, 30)
    - action: string (specific action)
    - channel: string (LinkedIn, Email, Phone, etc.)
    - copy: string (40-80 words of suggested message/script)

14. **confidence**: Object with:
    - score: number 0-100 (use the precomputed metrics; weight: completeness 30%, sampleQuality 20%, recency 15%, agreement 20%, signalStrength 15%)
    - explanation: string (80-120 words explaining what the score means, limitations, and how to interpret it)

15. **rawRationale**: String of 4-8 sentences explaining your DISC scoring logic, referencing specific profile elements and post patterns.

**FORMATTING RULES:**
- Return ONLY valid JSON (no markdown code blocks, no extra text)
- All text fields should be substantive (no one-word answers)
- Use professional but conversational tone
- Include specific references to posts (dates, content snippets) where applicable
- Make whatToSay, personalizationCues, and opening scripts ready to copy-paste
- Ensure discPercentages integers sum to exactly 100

Generate the JSON now:`;

  return userPrompt;
}

/**
 * Parse and normalize LLM response
 */
function parseAndNormalizeLLMResponse(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    // Try to extract JSON from markdown or text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch (e) {
        return null;
      }
    } else {
      return null;
    }
  }

    // Normalize discPercentages to sum to 100
    if (parsed.discPercentages) {
        let disc = parsed.discPercentages;
        Object.keys(disc).forEach(k => disc[k] = Math.max(0, Math.round(Number(disc[k] || 0))));
        
        const sum = Object.values(disc).reduce((a, b) => a + b, 0) || 1;
        if (sum !== 100) {
            const corrected = {};
            const keys = Object.keys(disc);
            let acc = 0;
            keys.forEach((k, i) => {
                if (i === keys.length - 1) {
                    corrected[k] = 100 - acc;
                } else {
                    corrected[k] = Math.round(disc[k] / sum * 100);
                    acc += corrected[k];
                }
            });
            parsed.discPercentages = corrected;
        }
    }

  return parsed;
}

/**
 * Calculate final confidence score
 */
function calculateConfidenceScore(metrics, postsCount) {
  const weights = {
    completeness: 0.3,
    sampleQuality: 0.2,
    recency: 0.15,
    agreement: 0.2,
    signalStrength: 0.15,
  };

  let numeric = 0;
  Object.keys(weights).forEach(
    (k) => (numeric += (metrics[k] || 0) * weights[k])
  );

  // Apply caps based on post count
  if (postsCount === 0) numeric = Math.min(numeric, 0.45);
  else if (postsCount < 5) numeric = Math.min(numeric, 0.5);
  else if (postsCount < 10) numeric = Math.min(numeric, 0.65);

  return Math.round(numeric * 100);
}

/**
 * Generate programmatic fallback if LLM fails
 */
function generateFallbackAnalysis(
  profile,
  posts,
  productDescription,
  productPrice,
  metrics
) {
  // Simple programmatic DISC scoring
  const profileScore = { D: 25, I: 25, S: 25, C: 25 };

  const title = (profile.title || "").toLowerCase();
  if (
    title.includes("ceo") ||
    title.includes("founder") ||
    title.includes("director")
  )
    profileScore.D += 15;
  if (title.includes("vp") || title.includes("head") || title.includes("chief"))
    profileScore.D += 10;
  if (title.includes("marketing") || title.includes("sales"))
    profileScore.I += 10;
  if (title.includes("engineer") || title.includes("analyst"))
    profileScore.C += 10;
  if (title.includes("support") || title.includes("service"))
    profileScore.S += 10;

  // Normalize
  const sum = Object.values(profileScore).reduce((a, b) => a + b, 0);
  const disc = {};
  Object.keys(profileScore).forEach((k) => {
    disc[k] = Math.round((profileScore[k] / sum) * 100);
  });

  const sorted = Object.entries(disc).sort((a, b) => b[1] - a[1]);
  const primary = sorted[0][0];
  const secondary = sorted[1][0];
  const primaryPercentage = sorted[0][1];
  const secondaryPercentage = sorted[1][1];

  const confidenceScore = calculateConfidenceScore(metrics, posts.length);

    return {
        executiveSummary: `${profile.name || 'This prospect'} at ${profile.company || 'their company'} shows a ${getDISCTypeName(primary)}-primary personality. Approach with direct, results-focused messaging emphasizing ROI${productPrice ? ` at $${productPrice}` : ''}.`,
        discPercentages: disc,
        discDefinitions: {
            D: "Dominant - Direct, results-oriented, decisive. Prefers quick decisions and clear ROI.",
            I: "Influence - Enthusiastic, optimistic, people-oriented. Values relationships and social proof.",
            S: "Steadiness - Patient, loyal, supportive. Prefers stability and detailed information.",
            C: "Conscientiousness - Analytical, systematic, detail-oriented. Needs data and proof."
        },
        primarySecondaryElab: `As a ${getDISCTypeName(primary)}-primary with ${getDISCTypeName(secondary)} secondary, this prospect values efficiency and clear outcomes. Lead with benefits and data. Keep communications brief and actionable. Avoid overly emotional appeals.`,
        personalityBullets: [
            `Primary ${getDISCTypeName(primary)} - prefers direct communication`,
            `Secondary ${getDISCTypeName(secondary)} - values structured information`,
            `Likely to respond to data-driven pitches`,
            `Decision-making style: analytical and results-focused`
        ],
        talkingPoints: [
            {
                topic: profile.company ? `Role at ${profile.company}` : "Professional Role",
                why: `As ${profile.title || 'a professional'} at ${profile.company || 'their organization'}, they have decision-making authority and budget considerations.`,
                whatToSay: `Given your role, you're likely focused on ${productDescription}. Our solution${productPrice ? ` at $${productPrice}` : ''} has helped similar professionals achieve measurable results.`,
                evidence: "Profile-based"
            }
        ],
        personalizationCues: `Focus on efficiency and ROI. This prospect values time and clear outcomes. Open with a direct benefit statement. Reference their role and company context. ${productPrice ? `Mention the $${productPrice} price point early with ROI justification.` : ''} Use data points and case studies. Avoid lengthy preambles or overly casual language. Schedule calls efficiently (15-20 minutes max). Follow up with concise summaries.`,
        openingScripts: {
            linkedin_dm: [
                `Hi ${profile.name}, I noticed your work at ${profile.company}. Quick question: have you explored ${productDescription}? Would love to share how it's helped similar ${profile.title || 'professionals'}${productPrice ? ` achieve ROI at $${productPrice}` : ''}.`
            ],
            email: [
                {
                    subject: `Quick ROI opportunity for ${profile.company}`,
                    body: `Hi ${profile.name},\n\nI noticed your focus on results at ${profile.company}. Our ${productDescription}${productPrice ? ` ($${productPrice})` : ''} has helped similar organizations achieve measurable outcomes.\n\nWould a 15-min call this week work?\n\nBest,`
                }
            ],
            phone: [
                `Hi ${profile.name}, this is [Your Name]. Quick call about ${productDescription}${productPrice ? ` starting at $${productPrice}` : ''} - are you available?`
            ],
            whatsapp: [
                `Hi ${profile.name}, quick question about ${productDescription} for ${profile.company}?`
            ]
        },
        objectionHandling: [
            {
                objection: "Too busy right now",
                rationale: "Busy professionals prioritize urgent over important.",
                response: `I understand. This is about saving time long-term. How about a 10-minute call next week?`
            },
            {
                objection: "Need to think about it",
                rationale: "Analytical types need data before deciding.",
                response: `Absolutely. I can send a one-page ROI breakdown${productPrice ? ` showing how the $${productPrice} investment` : ''} pays back. Would that help?`
            }
        ],
        nextActions: [
            { day: 0, action: "Send connection request", channel: "LinkedIn", copy: "Personalized message referencing their recent post or company news." },
            { day: 1, action: "Follow up on connection", channel: "Email", copy: "Short value-focused email with case study." },
            { day: 3, action: "Share resource", channel: "LinkedIn", copy: "Send relevant article or insight." },
            { day: 7, action: "Schedule call", channel: "Phone", copy: "Call to schedule discovery meeting." },
            { day: 14, action: "Check-in", channel: "Email", copy: "Brief status update with new data point." },
            { day: 21, action: "Value reminder", channel: "LinkedIn", copy: "Share customer success story." },
            { day: 30, action: "Final touchpoint", channel: "Email", copy: "Last attempt with special offer or deadline." }
        ],
        confidence: {
            score: confidenceScore,
            explanation: `Score of ${confidenceScore}% based on available data. ${posts.length} posts analyzed. Confidence is ${confidenceScore < 50 ? 'moderate' : 'good'} - ${confidenceScore < 50 ? 'limited post activity means less behavioral signal' : 'sufficient data for reliable profiling'}. Use this as a directional guide; validate assumptions in early conversations.`
        },
        rawRationale: `DISC scores derived from job title keywords and profile content. ${primary} dominance indicated by ${title.includes('ceo') || title.includes('founder') ? 'leadership role' : title.includes('engineer') ? 'technical focus' : 'professional context'}. Limited post data means heavier reliance on profile signals.`
    };
}

/**
 * Main analysis function - Updated Algorithm V2
 */
export async function analyzeLinkedInProfile(
  profile,
  posts,
  productDescription,
  productPrice = null
) {
  try {
    // 1. Compute confidence metrics
    const metrics = computeConfidenceMetrics(profile, posts);

    // 2. Build comprehensive prompt
    const prompt = buildComprehensivePrompt(
      profile,
      posts,
      productDescription,
      productPrice,
      metrics
    );

    // 3. Call OpenAI with increased token budget for long-form output
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are Sellinder, an expert sales intelligence writer. You produce thorough, factual, and actionable reports. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 3500,
      temperature: 0.25,
    });

    const text = completion.choices?.[0]?.message?.content || "";

    // 4. Parse and normalize response
    let parsed = parseAndNormalizeLLMResponse(text);

    // 5. If parsing failed, use fallback
    if (!parsed) {
      console.warn("⚠️  LLM JSON parsing failed, using programmatic fallback");
      parsed = generateFallbackAnalysis(
        profile,
        posts,
        productDescription,
        productPrice,
        metrics
      );
    }

    return buildAnalysisResponse({ parsed, metrics, posts, profile, productPrice, productDescription });

    } catch (error) {
        if (error.status !== 429) {
            console.error("❌ Error in analyzeLinkedInProfile:", error.message);
        }
        // Return fallback on error
        const metrics = computeConfidenceMetrics(profile, posts);
        const fallback = generateFallbackAnalysis(profile, posts, productDescription, productPrice, metrics);
    return buildAnalysisResponse({ parsed: fallback, metrics, posts, profile, productPrice, productDescription });
    }
}

function buildAnalysisResponse({ parsed, metrics, posts, profile, productPrice, productDescription }) {
  const defaultDisc = { D: 25, I: 25, S: 25, C: 25 };
  const discPercentages = parsed.discPercentages ? { ...defaultDisc, ...parsed.discPercentages } : defaultDisc;
  const sorted = Object.entries(discPercentages)
    .map(([key, value]) => [key, Number.isFinite(value) ? value : 0])
    .sort((a, b) => b[1] - a[1]);

  const [primaryAbbr, primaryPercentage] = sorted[0] || ['D', 25];
  const [secondaryAbbr, secondaryPercentage] = sorted[1] || sorted[0] || ['I', 25];

  const confidenceScore = calculateConfidenceScore(metrics, posts.length);

  // Personalization cues: normalize into an array of short bullets
  const personalizationSource = parsed.personalizationCues;
  let personalizationCues = [];
  if (Array.isArray(personalizationSource) && personalizationSource.length) {
    personalizationCues = personalizationSource.slice(0, 12).map(s => String(s).trim()).filter(Boolean);
  } else if (typeof personalizationSource === "string" && personalizationSource.trim()) {
    // split by lines or long sentence boundaries into bullets
    personalizationCues = splitIntoBullets(personalizationSource).slice(0, 12);
  }
  if (personalizationCues.length < 4) {
    personalizationCues = [...personalizationCues, ...generateFallbackPersonalizationCues({ profile, productDescription: profile.productDescription || profile.product || productDescription, productPrice: productPrice || profile.productPrice || profile.productCost || null })].slice(0, 8);
  }

  // Convert abbreviated DISC (D/I/S/C) to full-name display
  const discDisplay = convertDiscToDisplay(discPercentages);

  // Build discBreakdown array
  const discBreakdown = sorted.map(([abbr, perc]) => ({ abbreviation: abbr, name: getDISCTypeName(abbr), percentage: perc }));

  // Normalize key trait and style fields from parsed result (support multiple possible keys)
  const keyTraits = Array.isArray(parsed.personalityBullets) ? parsed.personalityBullets : (Array.isArray(parsed.keyTraits) ? parsed.keyTraits : []);
  const primaryStyle = parsed.primaryStyle || parsed.primarySecondaryElab || fallbackPrimaryStyle(primaryAbbr, profile.productDescription || profile.product || undefined);
  const secondaryStyle = parsed.secondaryStyle || fallbackSecondaryStyle(secondaryAbbr);
  const approachGuidance = parsed.approachGuidance || parsed.approach || fallbackApproachGuidance(primaryAbbr, secondaryAbbr, profile.productDescription || profile.product || '', profile.productPrice || profile.productCost || null);

  // Ensure talkingPoints contains 4-6 items: prefer parsed, then fill with generated fallbacks
  const parsedTalking = Array.isArray(parsed.talkingPoints) ? parsed.talkingPoints : [];
  const fallbackTalking = generateFallbackTalkingPoints({ profile, productDescription, productPrice: productPrice || profile.productPrice || profile.productCost || null });
  const normalizedTalking = parsedTalking.slice(0, 8);
  for (let i = 0; normalizedTalking.length < 6 && i < fallbackTalking.length; i++) normalizedTalking.push(fallbackTalking[i]);
  const finalTalkingPoints = normalizedTalking.slice(0, 8);

  const finalTalkingPointsExpanded = ensureExpandedTalkingPoints(finalTalkingPoints, { profile, productDescription, productPrice });

  // Remove repetitive long company/description mentions across large text fields
  // Replace repeated occurrences after the first with a short reference
  removeRepeatedCompanyDescription({ parsed, profile, finalTalkingPointsExpanded });

  // Build quick summary for a one-page view
  const quickSummary = buildQuickSummary({ profile, primaryAbbr, primaryPercentage, finalTalkingPointsExpanded, metrics, posts });

  const actionableMetrics = buildActionableMetrics({ confidenceScore, postsCount: posts.length });

  const recencyFlags = [];
  const now = new Date();
  const postDates = Array.isArray(posts)
    ? posts
        .map((post) => {
          const value = post?.date || post?.createdAt || null;
          if (!value) return null;
          const parsed = new Date(value);
          if (Number.isNaN(parsed.getTime())) return null;
          return parsed;
        })
        .filter(Boolean)
    : [];

  if (postDates.length === 0) recencyFlags.push('Posts: No recent activity captured. Consider uploading fresh posts or verifying the prospect online.');
  if (postDates.length > 0) {
    const mostRecent = postDates.sort((a, b) => b.getTime() - a.getTime())[0];
    const ageDays = Math.floor((now.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24));
    if (ageDays > 45) recencyFlags.push(`Posts: Latest activity is ${ageDays} days old. Validate that priorities have not shifted.`);
  }

  const missingProfileFields = [];
  if (!profile?.about) missingProfileFields.push('About section');
  if (!profile?.experience || (Array.isArray(profile.experience) && profile.experience.length === 0)) missingProfileFields.push('Experience history');
  if (!profile?.skills || (Array.isArray(profile.skills) && profile.skills.length === 0)) missingProfileFields.push('Skills list');
  if (missingProfileFields.length) recencyFlags.push(`Profile: Missing ${missingProfileFields.join(', ')}. Ask the prospect or enrich the CRM before outreach.`);

  if ((metrics.sampleQuality || 0) < 0.2) recencyFlags.push('Engagement: Post reactions/comments are low. Treat tone signals as directional only.');

  // Build confidence warnings based on metrics
  const confidenceWarnings = Array.isArray(parsed.confidence?.warnings) ? parsed.confidence.warnings.slice() : [];
  if ((metrics.recency || 0) < 0.2) {
    confidenceWarnings.push('Data recency is low: recent post activity is limited or older than 45 days. Verify up-to-date signals before assuming behavior.');
  }
  if ((metrics.sampleQuality || 0) < 0.2) {
    confidenceWarnings.push('Sample quality is low: posts show minimal engagement which can reduce behavioral signal quality. Use early discovery to validate assumptions.');
  }

  const confidenceInterpretation = confidenceScore >= 70 ? 'High confidence' : confidenceScore >= 40 ? 'Moderate confidence' : 'Low confidence';

  const openingScriptsNormalized = parsed.openingScripts || { linkedin_dm: [], email: [], phone: [], whatsapp: [] };

  const reportAssessment = buildReportAssessment({
    recencyFlags,
    confidenceInterpretation,
    confidenceScore,
    personalizationCues,
    talkingPoints: finalTalkingPointsExpanded,
    openingScripts: openingScriptsNormalized,
    actionableMetrics,
    metrics
  });

  const preferenceSnapshot = buildPreferenceSnapshot({
    primaryAbbr,
    secondaryAbbr,
    posts,
    profile,
    personalizationCues,
    metrics,
    parsed
  });

  // Build Probability to Purchase Analysis
  const probabilityToPurchase = buildProbabilityToPurchase(
    { dominantTrait: primaryStyle }, 
    profile
  );

  // Build Common Ground & Shared Vision Analysis
  const commonGroundAndSharedVision = buildCommonGroundAndSharedVision(profile);

  // Build Confidence Explanation
  const confidenceExplanation = buildConfidenceExplanation(metrics, posts, profile, confidenceScore, confidenceInterpretation);

  // Build Executive Summary
  const executiveSummary = buildExecutiveSummary(
    profile, 
    primaryAbbr, 
    secondaryAbbr, 
    confidenceScore, 
    confidenceInterpretation, 
    probabilityToPurchase, 
    quickSummary
  );

  // Build Company Overview
  const companyOverview = buildCompanyOverview(productDescription);

  // Build Communication Strategy
  const communicationStrategy = buildCommunicationStrategy(primaryAbbr, secondaryAbbr, profile);

  // Build Next Steps (high-level actionable bullets)
  const nextSteps = buildNextSteps(parsed, profile, posts, productDescription);

  return {
    executive: parsed.executiveSummary || `Approach ${profile.name || 'the prospect'} with focus on results and efficiency.`,
    executiveSummary,
    starting: parsed.starting || {},
    linkedinPostsAnalyzed: posts.length,
    analysisGeneratedAt: new Date().toISOString(),
    analysisVersion: "v2",
    quickSummary,
    actionableMetrics,
    dataRecency: {
      recencyScore: safePercentage(metrics.recency),
      sampleQualityScore: safePercentage(metrics.sampleQuality),
      notes: confidenceWarnings.length ? confidenceWarnings : ['Data freshness and sample quality appear sufficient.'],
      flags: recencyFlags
    },
    personality: {
      disc: discDisplay,
      discBreakdown,
      discDefinitions: buildDiscDefinitions(parsed.discDefinitions || parsed.discDefinitions || {}),
      bullets: keyTraits,
      keyTraits,
      primaryType: getDISCTypeName(primaryAbbr),
      secondaryType: getDISCTypeName(secondaryAbbr),
      primary: {
        type: getDISCTypeName(primaryAbbr),
        name: getDISCTypeName(primaryAbbr),
        abbreviation: primaryAbbr,
        percentage: primaryPercentage,
        description: getDISCTypeDescription(primaryAbbr, primaryPercentage)
      },
      secondary: {
        type: getDISCTypeName(secondaryAbbr),
        name: getDISCTypeName(secondaryAbbr),
        abbreviation: secondaryAbbr,
        percentage: secondaryPercentage,
        description: getDISCTypeDescription(secondaryAbbr, secondaryPercentage)
      },
      primaryStyle,
      secondaryStyle,
      approachGuidance
    },
  talkingPoints: finalTalkingPointsExpanded,
  personalizationCues,
  openingScripts: openingScriptsNormalized,
  objectionHandling: normalizeObjectionHandling({ existing: parsed.objectionHandling, profile, productDescription, productPrice: productPrice || profile.productPrice || profile.productCost || null }).map(item => ({
    objection: item.objection,
    recommendedResponse: item.response || '',
    followUpTone: determineResponseTone(item.objection, item.response || '')
  })),
    nextActions: Array.isArray(parsed.nextActions) ? parsed.nextActions : [],
    confidence: {
      score: confidenceScore,
      breakdown: {
        completeness: safePercentage(metrics.completeness),
        sampleQuality: safePercentage(metrics.sampleQuality),
        recency: safePercentage(metrics.recency),
        agreement: safePercentage(metrics.agreement),
        signalStrength: safePercentage(metrics.signalStrength)
      },
      explanation: `Confidence score ${confidenceScore}% (${confidenceInterpretation}). ${posts.length === 0 ? 'No posts analyzed; rely on profile data.' : `${posts.length} posts analyzed with blended engagement.`}`,
      warnings: confidenceWarnings,
      interpretation: confidenceInterpretation,
      legend: {
        high: '70-100: High confidence — outreach guidance is well-supported by data.',
        medium: '40-69: Moderate confidence — validate key assumptions with discovery.',
        low: '0-39: Low confidence — treat recommendations as hypotheses and gather fresh inputs.'
      }
    },
    dataSources: [
      `profile_${profile._id || 'manual'}`,
      `posts_${posts.length}_items`,
      profile.about ? 'about_section' : null,
      profile.experience ? 'experience_section' : null,
      profile.skills ? 'skills_section' : null
    ].filter(Boolean),
    productSummary: {
      description: productDescription || profile.productDescription || profile.product || null,
      price: formatProductPrice(productPrice || profile.productPrice || profile.productCost || null)
    },
    topKeywords: extractTopKeywords(posts, 8),
    sentiment: { score: computeSentiment(posts), label: sentimentLabel(computeSentiment(posts)) },
    postEvidence: mapTalkingPointsToEvidence(finalTalkingPoints, posts),
    analysisMetadata: {
      profileFieldsUsed: countProfileFields(profile),
      postsAnalyzed: posts.length,
      avgPostEngagement: calculateAvgEngagement(posts),
      dominantTopics: (Array.isArray(parsed.talkingPoints) ? parsed.talkingPoints : []).slice(0, 5).map(t => t.topic),
      writingTone: determineWritingTone(posts),
      rawRationale: parsed.rawRationale || "Analysis based on available profile and post data."
    },
    reportAssessment,
    preferenceSnapshot,
    probabilityToPurchase,
    commonGroundAndSharedVision,
    confidenceExplanation,
    companyOverview,
    communicationStrategy,
    nextSteps
  };
}

// Split long text into short bullets using sentences and newlines
function splitIntoBullets(text) {
  if (!text) return [];
  // Normalize whitespace
  const t = String(text).replace(/\s+/g, ' ').trim();
  // Try splitting by newlines first
  const byLines = text.split(/\n+/).map(s => s.trim()).filter(Boolean);
  if (byLines.length >= 3) return byLines.map(b => shortify(b));

  // Otherwise split into sentences and make compact bullets
  const sents = t.match(/[^\.\!\?]+[\.\!\?]?/g) || [t];
  return sents.map(s => shortify(s)).filter(Boolean);

  function shortify(s) {
    const str = s.trim();
    if (str.length > 240) return str.slice(0, 237).trim() + '...';
    return str;
  }
}

function buildQuickSummary({ profile, primaryAbbr, primaryPercentage, finalTalkingPointsExpanded, metrics, posts }) {
  const top3 = (finalTalkingPointsExpanded || []).slice(0,3).map(tp => tp.topic || tp.title || (tp.whatToSay || '').split('\n')[0]).filter(Boolean);
  const bestChannel = determineBestChannel(posts);
  return {
    who: `${profile.name || 'Unknown'}${profile.company ? ' — ' + profile.company : ''}${profile.title ? ' ('+profile.title+')' : ''}`,
    primaryDISC: getDISCTypeName(primaryAbbr),
    topTalkingPoints: top3,
    bestOutreachChannel: bestChannel,
    preferredTone: determineWritingTone(posts) || 'Balanced'
  };
}

function determineBestChannel(posts) {
  // Simple heuristic: if many short, social posts then LinkedIn, if long form then Email
  if (!Array.isArray(posts) || posts.length === 0) return 'LinkedIn';
  const avgLen = posts.reduce((a,p)=> a + ((p.content||p.text||'').length), 0) / posts.length;
  const exclamations = posts.reduce((a,p)=> a + ((p.content||p.text||'').match(/!/g) || []).length, 0);
  if (avgLen < 200 && exclamations > posts.length) return 'LinkedIn';
  if (avgLen > 400) return 'Email';
  return 'LinkedIn';
}

function buildActionableMetrics({ confidenceScore, postsCount }) {
  const responseRateTarget = confidenceScore >= 70 ? '15-25%' : confidenceScore >= 50 ? '8-15%' : '3-8%';
  const meetingRateTarget = confidenceScore >= 70 ? '4-8% (meetings per outreach)' : confidenceScore >= 50 ? '2-5%' : '1-2%';

  // Return cadence as array of human-readable strings to match schema (followUpCadence: [String])
  const followUpCadence = [
    'Day 0: Connection/Intro (LinkedIn) — brief, personalized connection message',
    'Day 1: Short value email — 1-2 sentence hook + CTA',
    'Day 3: Social proof / content share — lightweight resource or case study',
    'Day 7: Phone/meeting request — propose a specific 20-min working session',
    'Day 14: Case study or ROI brief — send concise one-pager',
    'Day 21: Reminder — short status-check and new data point',
    'Day 30: Final offer or close — deadline or limited-time incentive'
  ];

  const engagementMilestones = [
    'Connection accepted — measure: accepted_connections / outreach_attempts',
    'Reply to first outreach — measure: replies / outreach_attempts',
    'Scheduled working session — measure: meetings_scheduled / outreach_attempts',
    'Shared ROI brief — measure: roi_briefs_sent',
    'Internal champion created — measure: champion_confirmations'
  ];

  return {
    responseRateTarget,
    meetingRateTarget,
    followUpCadence,
    engagementMilestones
  };
}

function removeRepeatedCompanyDescription({ parsed, profile, finalTalkingPointsExpanded }) {
  try {
    const companyDesc = (profile.about || '').trim();
    if (!companyDesc || companyDesc.length < 60) return;
    const shortRef = '(see company description above)';
    const firstN = companyDesc.slice(0, 300);
    let seen = 0;
    // helper to replace after first occurrence
    function replaceRepeated(text) {
      if (!text || typeof text !== 'string') return text;
      let out = text;
      let idx = out.indexOf(firstN);
      while (idx !== -1) {
        if (seen === 0) {
          // keep first occurrence
          seen++;
          idx = out.indexOf(firstN, idx + 1);
          continue;
        }
        out = out.replace(firstN, shortRef);
        idx = out.indexOf(firstN, idx + 1);
      }
      return out;
    }

    if (parsed.personalizationCues && typeof parsed.personalizationCues === 'string') parsed.personalizationCues = replaceRepeated(parsed.personalizationCues);
    if (Array.isArray(parsed.openingScripts?.linkedin_dm)) parsed.openingScripts.linkedin_dm = parsed.openingScripts.linkedin_dm.map(s => replaceRepeated(s));
    if (Array.isArray(parsed.openingScripts?.email)) parsed.openingScripts.email = parsed.openingScripts.email.map(e => (e && e.body) ? Object.assign({}, e, { body: replaceRepeated(e.body) }) : e);
    if (Array.isArray(parsed.talkingPoints)) parsed.talkingPoints = parsed.talkingPoints.map(tp => (tp && tp.whatToSay) ? Object.assign({}, tp, { whatToSay: replaceRepeated(tp.whatToSay) }) : tp);
    if (Array.isArray(finalTalkingPointsExpanded)) finalTalkingPointsExpanded.forEach(tp => { if (tp.whatToSay) tp.whatToSay = replaceRepeated(tp.whatToSay); });
  } catch (e) {
    // non-fatal
    return;
  }
}

function extractTopKeywords(posts, limit = 6) {
  if (!Array.isArray(posts) || posts.length === 0) return [];
  const stop = new Set(["the","and","for","with","that","this","you","are","our","your","from","have","has","was","were","will","they","their","but","not","its","it's","what","which","who"]);
  const freq = Object.create(null);
  posts.forEach(p => {
    const text = (p.content || p.text || '').toLowerCase().replace(/[^a-z0-9\s]/g,' ');
    text.split(/\s+/).forEach(w => {
      if (!w || w.length < 3) return;
      if (stop.has(w)) return;
      freq[w] = (freq[w] || 0) + 1;
    });
  });
  return Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0, limit).map(e => e[0]);
}

function computeSentiment(posts) {
  if (!Array.isArray(posts) || posts.length === 0) return 0;
  const positive = ['good','great','success','win','improve','growth','gain','love','excellent','happy'];
  const negative = ['fail','problem','risk','issue','concern','delay','drop','loss','challenge','struggle'];
  let score = 0;
  posts.forEach(p => {
    const t = (p.content || p.text || '').toLowerCase();
    positive.forEach(word => { if (t.includes(word)) score += 1; });
    negative.forEach(word => { if (t.includes(word)) score -= 1; });
  });
  const norm = Math.max(-1, Math.min(1, score / Math.max(1, posts.length * 2)));
  return Math.round(norm * 100);
}

function sentimentLabel(score) {
  if (score >= 40) return 'positive';
  if (score <= -40) return 'negative';
  return 'neutral';
}

function mapTalkingPointsToEvidence(talkingPoints, posts) {
  if (!Array.isArray(talkingPoints) || talkingPoints.length === 0) return [];
  const results = talkingPoints.map(tp => ({ topic: tp.topic || tp.title || 'topic', evidence: 'Profile-based' }));
  talkingPoints.forEach((tp, idx) => {
    const key = (tp.topic || tp.why || tp.whatToSay || '').toLowerCase().split(/\s+/).slice(0,5).join(' ');
    for (let p of posts) {
      const text = (p.content || p.text || '').toLowerCase();
      if (!text) continue;
      if (key && text.includes(key)) {
        results[idx].evidence = `${(p.date || p.createdAt || 'no-date')}: ${(p.content || p.text || '').slice(0,120)}`;
        break;
      }
    }
  });
  return results;
}

function ensureExpandedTalkingPoints(talkingPoints, { profile, productDescription, productPrice }) {
  if (!Array.isArray(talkingPoints) || talkingPoints.length === 0) return talkingPoints;
  const MIN_CHARS = 220;
  return talkingPoints.map((tp) => {
    const item = Object.assign({}, tp);
    const existing = (item.whatToSay || item.description || '') .trim();
    const hasParagraphs = existing.includes('\n\n') || (existing.split(/\.|\!|\?/).filter(Boolean).length >= 3);
    if (existing.length >= MIN_CHARS || hasParagraphs) {
      item.whatToSay = existing;
      if (!item.why || item.why.length < 60) {
        item.why = item.why && item.why.length > 20 ? item.why : `This topic matters because it impacts measurable outcomes for the prospect's role.`;
      }
      return item;
    }

    const product = productDescription || profile?.productDescription || profile?.product || 'the solution';
    const price = productPrice ? formatProductPrice(productPrice) : null;
    const topic = item.topic || item.title || 'this topic';

    const para1 = existing || `Focus on ${topic} by leading with the core benefit: how ${product}${price ? ` at ${price}` : ''} directly reduces friction or improves a key metric for their role. Cite a measurable outcome (time saved, % improvement, or a concrete business result) and tie it to the prospect's likely priorities.`;

    const para2 = `Then provide an explicit next-step script: briefly state what you'll deliver in a short call, propose timing, and offer to share a one-page ROI brief. Example: "I can share a 10-min summary showing expected lift and the implementation steps — are you available for a 20-minute working session next week?"`;

    item.whatToSay = `${para1}\n\n${para2}`;
    if (!item.why || item.why.length < 60) {
      item.why = item.why && item.why.length > 20 ? item.why : `This topic matters because it addresses ${topic} which impacts measurable outcomes for the prospect's role.`;
    }
    return item;
  }).slice(0, 8);
}

function safePercentage(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, Math.round(numeric * 100)));
}

// Helper functions
function getDISCTypeName(letter) {
  const names = {
    D: "Dominance",
    I: "Influence",
    S: "Steadiness",
    C: "Conscientiousness",
  };
  return names[letter] || letter;
}

function getDISCTypeDescription(letter, percentage) {
  const descriptions = {
    D: `Dominance (${percentage}%) - Direct, results-oriented, and decisive. Prefers quick decisions and clear ROI. Values efficiency and measurable outcomes.`,
    I: `Influence (${percentage}%) - Enthusiastic, optimistic, and people-oriented. Values relationships and social proof. Prefers collaborative and engaging communication.`,
    S: `Steadiness (${percentage}%) - Patient, loyal, and supportive. Prefers stability and detailed information. Values consistency and reliable partnerships.`,
    C: `Conscientiousness (${percentage}%) - Analytical, systematic, and detail-oriented. Needs data and proof. Values accuracy and thorough analysis.`,
  };
  return descriptions[letter] || `${getDISCTypeName(letter)} (${percentage}%)`;
}

function buildDiscDefinitions(source) {
    const defaults = {
        dominance: "Dominance (D): Direct, results-oriented communicators focused on speed, clarity, and measurable ROI.",
        influence: "Influence (I): People-centric motivators who respond to enthusiasm, social proof, and collaborative language.",
        steadiness: "Steadiness (S): Patient, relationship-oriented partners who value predictability, trust, and practical assurances.",
        conscientiousness: "Conscientiousness (C): Analytical decision-makers who insist on precision, proof points, and well-structured plans."
    };

    const combined = { ...defaults, ...(source || {}) };

    const mappings = {
        dominance: combined.dominance || combined.D,
        influence: combined.influence || combined.I,
        steadiness: combined.steadiness || combined.S,
        conscientiousness: combined.conscientiousness || combined.C
    };

    return Object.entries(mappings).reduce((acc, [key, value]) => {
        const safeValue = value || defaults[key];
        if (/Dominance\s*\(D\)|Influence\s*\(I\)|Steadiness\s*\(S\)|Conscientiousness\s*\(C\)/i.test(safeValue)) {
            acc[key] = safeValue;
            return acc;
        }

        const abbreviationMap = {
            dominance: 'D',
            influence: 'I',
            steadiness: 'S',
            conscientiousness: 'C'
        };

        const label = `${getDISCTypeName(abbreviationMap[key])} (${abbreviationMap[key]}): ${safeValue}`;
        acc[key] = label;
        return acc;
    }, {});
}

function formatProductPrice(productPrice) {
  if (productPrice === null || productPrice === undefined) return "Not specified";

  const numericPrice = typeof productPrice === 'number' ? productPrice : Number(productPrice);
  if (!Number.isFinite(numericPrice)) return String(productPrice);

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: numericPrice % 1 === 0 ? 0 : 2,
    minimumFractionDigits: numericPrice % 1 === 0 ? 0 : 2
  });

  return formatter.format(numericPrice);
}

function generateFallbackPersonalizationCues({ profile, productDescription, productPrice }) {
  const contactName = profile?.name || 'the prospect';
  const company = profile?.company || 'their organization';
  const role = profile?.title || 'their role';
  const product = productDescription || profile?.productDescription || profile?.product || 'our solution';
  const price = productPrice ? formatProductPrice(productPrice) : null;
  return [
    `Open with a tailored compliment about ${company} and segue into how ${product} maps to the initiatives ${role} is likely steering.`,
    `Quantify a metric that ${contactName} can influence directly and connect it to the speed of implementing ${product}${price ? ` at ${price}` : ''}.`,
    `Reference a recent post or announcement, cite the exact date, and position ${product} as the lever to amplify that momentum.`,
    `Share a short social proof line featuring a peer-title, summarize the before-and-after metric, and outline the onboarding cadence in under three bullets.`,
    `Invite ${contactName} to a co-created working session and promise a recap template they can forward internally within minutes.`,
    `Flag one risk they repeatedly mention online and show how ${product}${price ? ` at ${price}` : ''} offsets it with measurable guardrails.`
  ];
}

function fallbackPrimaryStyle(primaryType, productDescription) {
    return `Lead with ${getDISCTypeName(primaryType)} priorities by opening with a quantified win they can champion, confirming how ${productDescription || 'the solution'} repays the effort within their current quarter, and setting the next checkpoint before they request it. Keep language decisive, demonstrate readiness to run the evaluation mechanics, and emphasize that momentum will cost them less than twenty disciplined minutes.`;
}

function fallbackSecondaryStyle(secondaryType) {
    return `Reinforce the message through the lens of ${getDISCTypeName(secondaryType)} instincts by layering collaborative phrasing, concise social proof, and easy-to-share collateral. Show that you respect their validation steps, outline how updates will flow, and offer a safe space to surface objections early so the process feels guided rather than pressured at every turn.`;
}

function fallbackApproachGuidance(primaryType, secondaryType, productDescription, productPrice) {
    const pricePhrase = productPrice ? ` priced at ${formatProductPrice(productPrice)}` : '';
    return `Open with a ${getDISCTypeName(primaryType)}-oriented hook that names the urgent outcome ${productDescription || 'your solution'} unlocks${pricePhrase}. Reference one proof point that mirrors their environment and reinforces credibility.

Shift into the ${getDISCTypeName(secondaryType)} perspective by outlining implementation clarity, stakeholder alignment, and available resources. Offer to share deeper documentation without overwhelming upfront.

Pre-empt likely objections by offering optional data or a short diagnostic session. Emphasize that the goal is to help them move faster, not create extra work.

Close with a confident ask for a 20-minute working session and confirm next steps immediately after the conversation.`;
}

function fallbackProfileSummary({ profile, primaryType, secondaryType, productDescription, productPrice }) {
    const name = profile?.name || 'This prospect';
    const company = profile?.company ? ` at ${profile.company}` : '';
    const role = profile?.title || 'senior operator';
    const pricePhrase = productPrice ? ` priced at ${formatProductPrice(productPrice)}` : '';

    return `${name}${company} operates with a ${getDISCTypeName(primaryType)} bias supported by ${getDISCTypeName(secondaryType)} discipline. They value pitches that translate effort into measurable wins and keep decision cycles tightly controlled. Frame ${productDescription || 'your solution'} as the fastest lever to protect headline metrics while unlocking credibility with stakeholders. Highlight implementation clarity, optional depth, and proof icons so they can champion the move without risking political capital${pricePhrase}. Close every touch by proposing a 20 minute working session and promising crisp summaries they can forward immediately.`;
}

function convertDiscToDisplay(discPercentages) {
    return {
        dominance: discPercentages.D ?? 0,
        influence: discPercentages.I ?? 0,
        steadiness: discPercentages.S ?? 0,
        conscientiousness: discPercentages.C ?? 0
    };
}

function countProfileFields(profile) {
  let count = 0;
  const fields = [
    "name",
    "title",
    "company",
    "location",
    "about",
    "experience",
    "education",
    "skills",
    "certifications",
    "languages",
  ];
  fields.forEach((field) => {
    if (profile[field]) {
      if (Array.isArray(profile[field]) && profile[field].length > 0) count++;
      else if (typeof profile[field] === "string" && profile[field].length > 0)
        count++;
    }
  });
  return count;
}

function calculateAvgEngagement(posts) {
  if (!Array.isArray(posts) || posts.length === 0) return 0;
  let total = 0;
  let count = 0;
  posts.forEach((post) => {
    const engagement = (post.likes || 0) + (post.comments || 0);
    if (engagement > 0) {
      total += engagement;
      count++;
    }
  });
  return count === 0 ? 0 : Math.round(total / count);
}

function determineWritingTone(posts) {
  if (!Array.isArray(posts) || posts.length === 0) return "Unknown";
  let formalScore = 0;
  let casualScore = 0;
  posts.forEach((post) => {
    const content = (post.content || post.text || "").toLowerCase();
    if (
      content.match(
        /\b(furthermore|therefore|accordingly|nevertheless|consequently)\b/g
      )
    )
      formalScore++;
    if (content.match(/\b(gonna|wanna|cool|awesome|yeah|nope)\b/g))
      casualScore++;
    const exclamations = (content.match(/!/g) || []).length;
    if (exclamations > 2) casualScore++;
    const avgWordLength =
      content.split(/\s+/).reduce((sum, word) => sum + word.length, 0) /
      content.split(/\s+/).length;
    if (avgWordLength > 6) formalScore++;
    else casualScore++;
  });
  if (formalScore > casualScore * 1.5) return "Formal";
  if (casualScore > formalScore * 1.5) return "Casual";
  return "Balanced";
}

function generateFallbackTalkingPoints({ profile, productDescription, productPrice }) {
  const company = profile?.company || 'their organization';
  const role = profile?.title || 'their role';
  const product = productDescription || profile?.productDescription || profile?.product || 'the solution';
  const price = productPrice ? formatProductPrice(productPrice) : null;
  return [
    {
      topic: company ? `Strategic outcomes at ${company}` : 'Strategic outcomes',
      why: `${role} is accountable for protecting headline metrics; anything that compresses time-to-impact is top priority.`,
      whatToSay: `You own the scoreboard for ${company}. ${product}${price ? ` at ${price}` : ''} cuts the cycle between idea and execution so you can report measurable impact this quarter.`,
      evidence: 'Profile-based'
    },
    {
      topic: 'Operational efficiency',
      why: 'Leaders stay alert to process drag and hidden coordination costs.',
      whatToSay: `${product} removes manual checkpoints, keeps stakeholders aligned, and frees capacity without adding headcount${price ? `, all within a ${price} envelope` : ''}.`,
      evidence: 'Profile-based'
    },
    {
      topic: 'Cross-functional alignment',
      why: 'Winning initiatives pair go-to-market velocity with delivery confidence.',
      whatToSay: `Frame the rollout as a co-owned sprint between GTM and Ops. Offer a shared dashboard template so everyone sees progress in real time.`,
      evidence: 'Internal alignment playbook'
    },
    {
      topic: 'Proof and comparables',
      why: 'Champions need peer validation to unlock internal approval.',
      whatToSay: `Share a quick hit case study with identical KPIs and call out the timeline from kickoff to first ROI signal. Provide references on request.`,
      evidence: 'Case study reference'
    },
    {
      topic: 'Budget framing',
      why: 'Stakeholders want to see cost mapped to stack consolidation or revenue lift.',
      whatToSay: `Position ${product} as a swap, not a net-new line item. Outline which spend it replaces and the forecasted payback date${price ? ` at ${price}` : ''}.`,
      evidence: 'Financial model'
    },
    {
      topic: 'Clear next steps',
      why: 'Momentum stalls without a guided path forward.',
      whatToSay: `Suggest a 20-minute working session with agenda, owners, and success criteria so we exit with an agreed evaluation plan.`,
      evidence: 'Process overview'
    }
  ];
}

function normalizeObjectionHandling({ existing, profile, productDescription, productPrice }) {
  const normalized = Array.isArray(existing) ? existing.filter((item) => item && item.objection && item.response) : [];
  const unique = new Map();
  normalized.forEach((item) => {
    if (!unique.has(item.objection)) unique.set(item.objection, item);
  });
  const fallback = generateFallbackObjectionHandling({ profile, productDescription, productPrice });
  fallback.forEach((item) => {
    if (!unique.has(item.objection) && unique.size < 6) unique.set(item.objection, item);
  });
  if (unique.size < 5) {
    fallback.forEach((item) => {
      if (unique.size >= 5) return;
      unique.set(`${item.objection} (${unique.size})`, item);
    });
  }
  return Array.from(unique.values()).slice(0, 6);
}

function buildReportAssessment({ recencyFlags, confidenceInterpretation, confidenceScore, personalizationCues, talkingPoints, openingScripts, actionableMetrics, metrics }) {
  const insightsStrong = Array.isArray(talkingPoints) && talkingPoints.length >= 4;

  const linkedinCount = Array.isArray(openingScripts?.linkedin_dm) ? openingScripts.linkedin_dm.filter(Boolean).length : 0;
  const phoneCount = Array.isArray(openingScripts?.phone) ? openingScripts.phone.filter(Boolean).length : 0;
  const whatsappCount = Array.isArray(openingScripts?.whatsapp) ? openingScripts.whatsapp.filter(Boolean).length : 0;
  const emailCount = Array.isArray(openingScripts?.email) ? openingScripts.email.filter((entry) => entry && (entry.subject || entry.body)).length : 0;
  const totalScripts = linkedinCount + phoneCount + whatsappCount + emailCount;
  const scriptQualityHigh = totalScripts >= 6;

  const cueSet = new Set(Array.isArray(personalizationCues) ? personalizationCues.map((c) => String(c).toLowerCase()) : []);
  const cueTotal = Array.isArray(personalizationCues) ? personalizationCues.length : 0;
  const repetitionRatio = cueTotal === 0 ? 1 : cueSet.size / cueTotal;
  const repetitionHigh = cueTotal > 0 && repetitionRatio < 0.75;

  const dataFresh = (metrics.recency || 0) >= 0.45 && (metrics.sampleQuality || 0) >= 0.35 && (!recencyFlags || recencyFlags.length === 0);

  const cadencePresent = Array.isArray(actionableMetrics?.followUpCadence) && actionableMetrics.followUpCadence.length >= 5;

  const rows = [
    {
      aspect: 'Prospect insights',
      assessment: insightsStrong ? 'Excellent' : 'Needs enrichment',
      suggestedAction: insightsStrong ? 'Keep' : 'Add 1-2 role-specific insights from recent wins.'
    },
    {
      aspect: 'Outreach scripts',
      assessment: scriptQualityHigh ? 'Highly useful' : 'Incomplete',
      suggestedAction: scriptQualityHigh ? 'Keep' : 'Add more channel variants with optional CTAs.'
    },
    {
      aspect: 'Repetition',
      assessment: repetitionHigh ? 'Too high' : 'Controlled',
      suggestedAction: repetitionHigh ? 'Reduce repeated cues; inject fresh proof points.' : 'Continue rotating social proof elements.'
    },
    {
      aspect: 'Data freshness',
      assessment: dataFresh ? 'Current' : 'Unclear',
      suggestedAction: dataFresh ? 'Monitor quarterly for shifts.' : 'Refresh stale sources or flag missing sections.'
    },
    {
      aspect: 'Report design',
      assessment: cadencePresent ? 'Structured' : 'Dense',
      suggestedAction: cadencePresent ? 'Keep summary + cadence handy before calls.' : 'Add a 1-page quick summary and clear follow-up cadence.'
    },
    {
      aspect: 'Confidence metrics',
      assessment: `${confidenceInterpretation} (${confidenceScore}%)`,
      suggestedAction: confidenceInterpretation === 'High confidence' ? 'Move to execution.' : 'Clarify scoring in discovery and capture fresh signals.'
    }
  ];

  const finalVerdict = dataFresh && !repetitionHigh && scriptQualityHigh
    ? 'The report is field-ready. Reps can use it directly before live outreach while monitoring data freshness quarterly.'
    : 'With minor cleanup (refresh stale data, trim repetitive cues, and surface the one-page summary), it becomes an ideal sales-enablement brief for live calls.';

  return {
    overview: rows,
    finalVerdict
  };
}

function buildPreferenceSnapshot({ primaryAbbr, secondaryAbbr, posts, profile, personalizationCues, metrics, parsed }) {
  const primaryLikes = {
    D: ['Innovation that produces measurable wins', 'Decisive execution paths', 'Clear ROI benchmarks', 'Momentum-focused collaboration'],
    I: ['Story-driven wins with public recognition', 'Collaborative working sessions', 'Social proof and community impact', 'Positive, forward-looking tone'],
    S: ['Trust-building routines and reliable partners', 'Step-by-step adoption plans', 'Supportive team cultures', 'Long-term relationship focus'],
    C: ['Data-backed case studies', 'Process clarity with risk controls', 'Structured onboarding', 'Clean documentation and proofs']
  };
  const primaryDislikes = {
    D: ['Vague or unquantified proposals', 'Slow decision cycles', 'Over-engineered slide decks without next steps', 'Lack of accountability on owners'],
    I: ['Overly technical or dry messaging', 'Minimal collaboration opportunities', 'Negative framing without solutions', 'Rigid scripts lacking human tone'],
    S: ['Aggressive disruption without guardrails', 'Chaotic rollout plans', 'Rapid changes that ignore team impact', 'Transactional communication'],
    C: ['Hand-wavy claims without data', 'Untested processes', 'Unclear metrics ownership', 'Last-minute scope changes']
  };

  const secondaryLikes = {
    D: ['Bold product vision', 'Competitive positioning'],
    I: ['Peer-led storytelling', 'Community amplification'],
    S: ['Consistency across functions', 'Predictable communication cadence'],
    C: ['Compliance proof points', 'Detailed feature walkthroughs']
  };

  const secondaryDislikes = {
    D: ['Micro-management', 'Decision drift'],
    I: ['Silence after outreach', 'Overly formal tone'],
    S: ['Unresolved conflicts', 'Overwhelming change requests'],
    C: ['Missing documentation', 'Loose change-control']
  };

  const likes = new Set(primaryLikes[primaryAbbr] || []);
  (secondaryLikes[secondaryAbbr] || []).forEach((item) => likes.add(item));

  const dislikes = new Set(primaryDislikes[primaryAbbr] || []);
  (secondaryDislikes[secondaryAbbr] || []).forEach((item) => dislikes.add(item));

  const keywords = extractTopKeywords(posts, 6);
  const sustainabilityHit = keywords.some((word) => ['sustainability', 'climate', 'esg'].includes(word));
  if (sustainabilityHit) likes.add('Sustainability-focused initiatives with measurable outcomes');

  const educationHit = keywords.some((word) => ['edu', 'education', 'learning'].includes(word));
  if (educationHit) likes.add('Programs that elevate learning impact for stakeholders');

  const personalizationHit = Array.isArray(personalizationCues) && personalizationCues.some((cue) => String(cue).toLowerCase().includes('mentorship'));
  if (personalizationHit) likes.add('Mentorship-led team development');

  if ((metrics.sampleQuality || 0) < 0.3) dislikes.add('Low-engagement messaging that cannot prove traction');

  const salesInsight = buildPreferenceSalesInsight({ primaryAbbr, secondaryAbbr, sustainabilityHit, educationHit, personalizationHit, metrics, parsed });

  return {
    likes: Array.from(likes).slice(0, 8),
    dislikes: Array.from(dislikes).slice(0, 8),
    salesInsight
  };
}

function buildPreferenceSalesInsight({ primaryAbbr, secondaryAbbr, sustainabilityHit, educationHit, personalizationHit, metrics, parsed }) {
  const traitLabel = `${getDISCTypeName(primaryAbbr)}${secondaryAbbr ? '/' + getDISCTypeName(secondaryAbbr) : ''}`;
  const anchors = [];
  if (sustainabilityHit) anchors.push('sustainability outcomes');
  if (educationHit) anchors.push('education impact');
  if (personalizationHit) anchors.push('mentorship culture');
  const anchorText = anchors.length ? anchors.join(', ') : 'core growth metrics they already champion';
  const certainty = (metrics.recency || 0) >= 0.45 ? 'Lean in with confidence on' : 'Lead with caution while validating';
  const base = `${certainty} ${traitLabel.toLowerCase()} priorities: tie value stories to ${anchorText}.`;
  const cue = ' Reinforce measurable outcomes and provide a crisp next milestone they can sponsor.';
  return base + cue;
}

function determineResponseTone(objection, response) {
  const objectionLower = (objection || '').toLowerCase();
  const responseLower = (response || '').toLowerCase();
  
  if (objectionLower.includes('vendor') || objectionLower.includes('existing') || objectionLower.includes('already have')) {
    return 'Confident, collaborative';
  }
  if (objectionLower.includes('budget') || objectionLower.includes('quarter') || objectionLower.includes('timing')) {
    return 'Reassuring';
  }
  if (objectionLower.includes('roi') || objectionLower.includes('proof') || objectionLower.includes('evidence')) {
    return 'Data-backed';
  }
  if (objectionLower.includes('stakeholder') || objectionLower.includes('buy-in') || objectionLower.includes('approval')) {
    return 'Supportive';
  }
  if (responseLower.includes('understand') || responseLower.includes('totally fair')) {
    return 'Empathetic';
  }
  if (responseLower.includes('data') || responseLower.includes('case study') || responseLower.includes('%')) {
    return 'Data-backed';
  }
  if (responseLower.includes('pilot') || responseLower.includes('14-day') || responseLower.includes('trial')) {
    return 'Reassuring';
  }
  
  return 'Professional';
}

function generateFallbackObjectionHandling({ profile, productDescription, productPrice }) {
  const role = profile?.title || 'I';
  const company = profile?.company || 'our team';
  const price = productPrice ? formatProductPrice(productPrice) : null;
  return [
    {
      objection: 'We already have a tool for this',
      rationale: `${role} likely owns an existing vendor and fears duplicating spend or change fatigue at ${company}.`,
      response: `Totally fair. Most teams we help started with overlapping tools. We map our solution against your current stack, show the duplicate workflows we remove, and document the exit plan so your net cost${price ? ` stays near ${price}` : ''} is ROI-positive.`
    },
    {
      objection: 'Timing is tough right now',
      rationale: `${role} is juggling launches and wants to avoid adding lift mid-quarter.`,
      response: `Understood. We scope a 14-day pilot, handle 80% of the lift, and pause if the milestones slip. That way you de-risk timing while still proving value with minimal effort.`
    },
    {
      objection: 'Budget is locked',
      rationale: `${role} needs a crisp business case tied to current budgeting cycles.`,
      response: `Makes sense. We outline which existing spend our solution consolidates, surface a cost-neutral option${price ? ` near ${price}` : ''}, and equip you with the quick ROI brief finance expects.`
    },
    {
      objection: 'Need stakeholder buy-in first',
      rationale: `Cross-functional partners must understand impact before committing resources.`,
      response: `Let’s co-create a two-slide deck highlighting team-specific wins, include your stakeholders’ names, and offer to join the call to cover the heavy lifting.`
    },
    {
      objection: 'Not convinced on ROI yet',
      rationale: `${role} wants proof tied to their KPIs before advocating internally.`,
      response: `We will bring metric-level benchmarks, share a customer intro, and build a forecast with your assumptions so you see exactly when the solution hits break-even.`
    }
  ];
}

function ensureObjectionResponsesLength(list, { profile, productDescription, productPrice }) {
  if (!Array.isArray(list)) return [];
  const desiredSentences = 6;
  return list.map((item) => {
    const out = Object.assign({}, item);
    let resp = (out.response || '').replace(/\n+/g, ' ').trim();
    // split into sentences
    const sentences = resp.match(/[^\.\!\?]+[\.\!\?]+/g) || (resp ? [resp] : []);
    if (sentences.length >= desiredSentences) {
      out.response = sentences.slice(0, desiredSentences).join(' ').trim();
      return out;
    }

    const price = productPrice ? formatProductPrice(productPrice) : null;
    const extras = [
      `I understand budget and timing are important; we design our approach to deliver clear ROI with minimal disruption.`,
      `We prioritize fast validation: a short pilot or focused proof-of-concept shows value without requiring full commitment.`,
      `Our onboarding minimizes internal lift and includes explicit success criteria so stakeholders can measure impact quickly.`,
      `We can provide concise case studies from similar customers and metric-level benchmarks to support decision-making.`,
      `If helpful, we scope a 14-day pilot with predetermined outcomes to de-risk the evaluation.`,
      `Would a 20-minute working session to review a one-page ROI brief be useful for your team?`
    ];

    const need = desiredSentences - sentences.length;
    const add = extras.slice(0, need).join(' ');
    resp = (resp + ' ' + add).trim();
    // Ensure single paragraph, no newlines
    resp = resp.replace(/\s*\n+\s*/g, ' ');
    out.response = resp;
    return out;
  }).slice(0, 6);
}

function buildProbabilityToPurchase(discData, linkedinData) {
  const factors = [];
  let totalScore = 0;
  let maxScore = 0;

  // Decision Authority Analysis
  const authorityScore = determineAuthorityScore(linkedinData);
  factors.push({
    factor: 'Decision Authority',
    influence: authorityScore.level,
    impact: authorityScore.description
  });
  totalScore += authorityScore.score;
  maxScore += 5;

  // Budget Control Analysis  
  const budgetScore = determineBudgetControl(linkedinData, discData);
  factors.push({
    factor: 'Budget Control',
    influence: budgetScore.level,
    impact: budgetScore.description
  });
  totalScore += budgetScore.score;
  maxScore += 5;

  // Product Alignment Analysis
  const alignmentScore = determineProductAlignment(linkedinData);
  factors.push({
    factor: 'Product Alignment',
    influence: alignmentScore.level,
    impact: alignmentScore.description
  });
  totalScore += alignmentScore.score;
  maxScore += 5;

  // Existing Vendor Ties Analysis
  const vendorScore = determineVendorTies(linkedinData);
  factors.push({
    factor: 'Existing Vendor Ties',
    influence: vendorScore.level,
    impact: vendorScore.description
  });
  totalScore += vendorScore.score;
  maxScore += 5;

  // Openness to New Ideas Analysis
  const opennessScore = determineOpenness(discData, linkedinData);
  factors.push({
    factor: 'Openness to New Ideas',
    influence: opennessScore.level,
    impact: opennessScore.description
  });
  totalScore += opennessScore.score;
  maxScore += 5;

  // Calculate probability percentage
  const probabilityPercentage = Math.round((totalScore / maxScore) * 100);
  
  // Determine buyer likelihood category
  let buyerCategory;
  let outcomeDescription;
  
  if (probabilityPercentage >= 75) {
    buyerCategory = 'Highly Likely Buyer';
    outcomeDescription = 'High authority and strong alignment suggest excellent purchase probability';
  } else if (probabilityPercentage >= 60) {
    buyerCategory = 'Likely Buyer';
    outcomeDescription = 'Good potential with some factors requiring attention';
  } else if (probabilityPercentage >= 40) {
    buyerCategory = 'Moderate Potential';
    outcomeDescription = 'Mixed signals requiring strategic approach';
  } else {
    buyerCategory = 'Low Probability';
    outcomeDescription = 'Significant barriers to purchase identified';
  }

  // Generate personality-based reasoning
  const personalityReasoning = generatePersonalityReasoning(discData, linkedinData);

  return {
    factors,
    predictedOutcome: {
      percentage: probabilityPercentage,
      category: buyerCategory,
      description: outcomeDescription
    },
    reasoning: personalityReasoning
  };
}

function determineAuthorityScore(linkedinData) {
  const position = linkedinData.current_position?.title?.toLowerCase() || '';
  const company = linkedinData.current_position?.company?.toLowerCase() || '';
  
  if (position.includes('ceo') || position.includes('founder') || position.includes('president')) {
    return { score: 5, level: 'High', description: 'Executive decision-making authority' };
  } else if (position.includes('director') || position.includes('vp') || position.includes('head of')) {
    return { score: 4, level: 'High', description: 'Senior leadership with decision influence' };
  } else if (position.includes('manager') || position.includes('lead')) {
    return { score: 3, level: 'Medium', description: 'Management level with approval requirements' };
  } else {
    return { score: 2, level: 'Low', description: 'Limited decision-making authority' };
  }
}

function determineBudgetControl(linkedinData, discData) {
  const position = linkedinData.current_position?.title?.toLowerCase() || '';
  const dominantTrait = discData.dominantTrait?.toLowerCase() || '';
  
  let score = 2;
  let level = 'Low';
  let description = 'Limited budget influence';
  
  if (position.includes('cfo') || position.includes('finance') || position.includes('budget')) {
    score = 5;
    level = 'High';
    description = 'Direct control over financial decisions';
  } else if (position.includes('director') || position.includes('vp')) {
    score = 4;
    level = 'High';
    description = 'Manages departmental budgets and investments';
  } else if (dominantTrait === 'dominance' && position.includes('manager')) {
    score = 3;
    level = 'Medium';
    description = 'Influence over team and project budgets';
  }
  
  return { score, level, description };
}

function determineProductAlignment(linkedinData) {
  const position = linkedinData.current_position?.title?.toLowerCase() || '';
  const company = linkedinData.current_position?.company?.toLowerCase() || '';
  const experience = linkedinData.experience || [];
  
  let alignmentKeywords = ['technology', 'digital', 'innovation', 'ai', 'software', 'saas', 'tech'];
  let hasAlignment = false;
  let score = 2;
  
  // Check current role alignment
  if (alignmentKeywords.some(keyword => position.includes(keyword))) {
    hasAlignment = true;
    score = 4;
  }
  
  // Check company alignment
  if (alignmentKeywords.some(keyword => company.includes(keyword))) {
    hasAlignment = true;
    score = Math.max(score, 3);
  }
  
  // Check experience alignment
  const techExperience = experience.filter(exp => 
    alignmentKeywords.some(keyword => 
      exp.title?.toLowerCase().includes(keyword) || 
      exp.company?.toLowerCase().includes(keyword)
    )
  );
  
  if (techExperience.length >= 2) {
    score = 5;
    return { score, level: 'Strong', description: 'Extensive technology background aligns with solution needs' };
  } else if (hasAlignment) {
    return { score, level: 'Medium', description: 'Some alignment with technology and innovation focus' };
  } else {
    return { score: 2, level: 'Low', description: 'Limited alignment with technology solutions' };
  }
}

function determineVendorTies(linkedinData) {
  const experience = linkedinData.experience || [];
  const currentCompany = linkedinData.current_position?.company?.toLowerCase() || '';
  
  // Look for indicators of vendor relationships
  const hasLongTenure = experience.some(exp => {
    const duration = exp.duration || '';
    return duration.includes('year') && parseInt(duration) >= 5;
  });
  
  const hasVendorExperience = experience.some(exp => 
    exp.company?.toLowerCase().includes('microsoft') || 
    exp.company?.toLowerCase().includes('oracle') ||
    exp.company?.toLowerCase().includes('salesforce') ||
    exp.company?.toLowerCase().includes('ibm')
  );
  
  if (hasVendorExperience && hasLongTenure) {
    return { score: 2, level: 'High', description: 'Strong existing vendor relationships may create switching barriers' };
  } else if (hasLongTenure) {
    return { score: 3, level: 'Medium', description: 'Long-standing partnerships may slow onboarding process' };
  } else {
    return { score: 4, level: 'Low', description: 'Flexible vendor relationships support new partnerships' };
  }
}

function determineOpenness(discData, linkedinData) {
  const dominantTrait = discData.dominantTrait?.toLowerCase() || '';
  const position = linkedinData.current_position?.title?.toLowerCase() || '';
  const experience = linkedinData.experience || [];
  
  let score = 3;
  let level = 'Medium';
  let description = 'Moderate openness to new solutions';
  
  // High openness indicators
  if (dominantTrait === 'influence' || dominantTrait === 'dominance') {
    score = 4;
    level = 'High';
    description = 'Personality type embraces innovation and new opportunities';
  }
  
  // Position-based openness
  if (position.includes('innovation') || position.includes('strategy') || position.includes('growth')) {
    score = 5;
    level = 'High';
    description = 'Role focuses on innovation and emerging technologies';
  }
  
  // Experience-based openness
  const diverseExperience = experience.length >= 3 && 
    new Set(experience.map(exp => exp.company)).size >= 3;
  
  if (diverseExperience) {
    score = Math.max(score, 4);
    level = 'High';
    description = 'Diverse experience indicates openness to change and collaboration';
  }
  
  return { score, level, description };
}

function generatePersonalityReasoning(discData, linkedinData) {
  const dominantTrait = discData.dominantTrait?.toLowerCase() || '';
  const position = linkedinData.current_position?.title?.toLowerCase() || '';
  
  let reasoning = '';
  
  switch(dominantTrait) {
    case 'dominance':
      reasoning = 'High-drive personality values results and efficiency, but requires clear ROI demonstration and quick implementation timelines.';
      break;
    case 'influence':
      reasoning = 'People-focused approach values collaboration and innovation, but needs peer validation and social proof for decision confidence.';
      break;
    case 'steadiness':
      reasoning = 'Stability-oriented personality prefers proven solutions and gradual implementation, requiring trust-building and risk mitigation.';
      break;
    case 'conscientiousness':
      reasoning = 'Detail-oriented approach demands thorough evaluation and comprehensive documentation before committing to new solutions.';
      break;
    default:
      reasoning = 'Personality profile suggests balanced approach to decision-making with focus on both results and relationships.';
  }
  
  return reasoning;
}

function buildCommonGroundAndSharedVision(linkedinData) {
  const areas = [];
  
  // Extract key information from profile
  const position = linkedinData.current_position?.title?.toLowerCase() || '';
  const company = linkedinData.current_position?.company?.toLowerCase() || '';
  const about = linkedinData.about?.toLowerCase() || '';
  const experience = linkedinData.experience || [];
  
  // Innovation Approach Analysis
  const hasInnovationFocus = position.includes('innovation') || 
                           position.includes('technology') || 
                           position.includes('digital') ||
                           about.includes('innovation') ||
                           about.includes('technology');
  
  if (hasInnovationFocus) {
    areas.push({
      area: 'Innovation Approach',
      commonality: `Both ${company || 'the organization'} and modern solutions prioritize scalable technology approaches for measurable impact.`
    });
  }
  
  // Sustainability Vision Analysis
  const hasSustainabilityFocus = about.includes('sustainability') ||
                               about.includes('environment') ||
                               about.includes('green') ||
                               about.includes('climate') ||
                               position.includes('sustainability');
  
  if (hasSustainabilityFocus) {
    areas.push({
      area: 'Sustainability Vision',
      commonality: 'Shared focus on responsible technology development and environmental consciousness.'
    });
  }
  
  // Education & Growth Analysis
  const hasEducationFocus = about.includes('education') ||
                          about.includes('learning') ||
                          about.includes('development') ||
                          about.includes('training') ||
                          position.includes('education');
  
  if (hasEducationFocus) {
    areas.push({
      area: 'Education & Growth',
      commonality: 'Both support continuous learning and professional development enablement.'
    });
  }
  
  // Leadership & Culture Analysis
  const hasLeadershipRole = position.includes('ceo') ||
                          position.includes('president') ||
                          position.includes('director') ||
                          position.includes('head') ||
                          position.includes('manager');
  
  if (hasLeadershipRole) {
    areas.push({
      area: 'Leadership Culture',
      commonality: 'Both value strategic execution with focus on long-term partnerships and results.'
    });
  }
  
  // Industry Expertise Analysis
  const industryKeywords = ['financial', 'healthcare', 'technology', 'manufacturing', 'retail', 'consulting'];
  const matchingIndustry = industryKeywords.find(keyword => 
    company.includes(keyword) || position.includes(keyword) || about.includes(keyword)
  );
  
  if (matchingIndustry) {
    areas.push({
      area: 'Industry Expertise',
      commonality: `Deep ${matchingIndustry} sector experience creates natural alignment with solution requirements.`
    });
  }
  
  // Fallback areas if no specific matches found
  if (areas.length === 0) {
    areas.push(
      {
        area: 'Professional Excellence',
        commonality: 'Both prioritize delivering exceptional results and maintaining high professional standards.'
      },
      {
        area: 'Solution Focus',
        commonality: 'Shared commitment to finding practical solutions that drive measurable business outcomes.'
      }
    );
  }
  
  // Generate sales insight based on the commonalities found
  const salesInsight = generateCommonGroundSalesInsight(areas, company || 'their organization');
  
  return {
    areas,
    salesInsight
  };
}

function generateCommonGroundSalesInsight(areas, companyName) {
  if (areas.length === 0) return 'Focus on shared professional values and solution-oriented mindset to build rapport.';
  
  const primaryArea = areas[0];
  
  let insight = 'Use this overlap to create emotional resonance. Example:\n';
  
  switch(primaryArea.area) {
    case 'Innovation Approach':
      insight += `"Like ${companyName}'s focus on innovation, we share the principle that technology should drive measurable impact and scalable results."`;
      break;
    case 'Sustainability Vision':
      insight += `"Similar to ${companyName}'s sustainability initiatives, we're committed to responsible practices that support long-term environmental goals."`;
      break;
    case 'Education & Growth':
      insight += `"Just as ${companyName} invests in learning and development, we believe in empowering teams through knowledge-driven insights and continuous improvement."`;
      break;
    case 'Leadership Culture':
      insight += `"Like ${companyName}'s leadership approach, we focus on strategic execution and building partnerships that deliver lasting value."`;
      break;
    case 'Industry Expertise':
      insight += `"Given ${companyName}'s deep industry expertise, we understand the unique challenges and opportunities in your sector."`;
      break;
    default:
      insight += `"Like ${companyName}, we're built on the foundation of delivering exceptional results through practical, solution-focused approaches."`;
  }
  
  return insight;
}

function buildConfidenceExplanation(metrics, posts, profile, existingConfidenceScore, existingConfidenceInterpretation) {
  const parameters = [];
  
  // Completeness Parameter
  const completenessScore = safePercentage(metrics.completeness);
  const completenessReasoning = getCompletenessReasoning(profile, completenessScore);
  parameters.push({
    parameter: 'Completeness',
    score: `${completenessScore}%`,
    reasoning: completenessReasoning
  });
  
  // Agreement Parameter  
  const agreementScore = safePercentage(metrics.agreement);
  const agreementReasoning = getAgreementReasoning(agreementScore);
  parameters.push({
    parameter: 'Agreement',
    score: `${agreementScore}%`,
    reasoning: agreementReasoning
  });
  
  // Recency Parameter
  const recencyScore = safePercentage(metrics.recency);
  const recencyReasoning = getRecencyReasoning(posts, recencyScore);
  parameters.push({
    parameter: 'Recency',
    score: `${recencyScore}%`,
    reasoning: recencyReasoning
  });
  
  // Signal Strength Parameter
  const signalStrengthScore = safePercentage(metrics.signalStrength);
  const signalStrengthReasoning = getSignalStrengthReasoning(posts, signalStrengthScore);
  parameters.push({
    parameter: 'Signal Strength',
    score: `${signalStrengthScore}%`,
    reasoning: signalStrengthReasoning
  });
  
  // Sample Quality Parameter
  const sampleQualityScore = safePercentage(metrics.sampleQuality);
  const sampleQualityReasoning = getSampleQualityReasoning(posts, sampleQualityScore);
  parameters.push({
    parameter: 'Sample Quality',
    score: `${sampleQualityScore}%`,
    reasoning: sampleQualityReasoning
  });
  
  // Use existing confidence score instead of recalculating
  const overallScore = existingConfidenceScore;
  const overallCategory = getConfidenceCategory(overallScore);
  const overallReasoning = getOverallConfidenceReasoning(overallScore, overallCategory);
  
  // Generate interpretation using existing confidence score
  const interpretation = generateConfidenceInterpretation(overallScore, overallCategory, parameters);
  
  return {
    parameters,
    overallConfidence: {
      score: overallScore,
      category: overallCategory,
      reasoning: overallReasoning
    },
    interpretation
  };
}

function getCompletenessReasoning(profile, score) {
  if (score >= 90) return 'Full professional and activity data identified';
  if (score >= 70) return 'Most professional data available with minor gaps';
  if (score >= 50) return 'Moderate data completeness with some missing elements';
  return 'Limited profile data available for analysis';
}

function getAgreementReasoning(score) {
  if (score >= 80) return 'Behavioral patterns strongly align with DISC mapping';
  if (score >= 60) return 'Behavioral patterns align with DISC mapping';
  if (score >= 40) return 'Moderate alignment between behavior and DISC traits';
  return 'Limited behavioral alignment with DISC assessment';
}

function getRecencyReasoning(posts, score) {
  if (score >= 80) return 'Recent activity within 30 days indicates current behavioral patterns';
  if (score >= 60) return 'Activity within 2 months shows recent engagement patterns';
  if (score >= 40) return 'Profile updated within 6 months';
  if (score >= 20) return 'Activity data is 6-12 months old, may need verification';
  return 'Limited recent activity data available';
}

function getSignalStrengthReasoning(posts, score) {
  if (score >= 80) return 'Strong, consistent communication tone across multiple channels';
  if (score >= 60) return 'Consistent communication tone across channels';
  if (score >= 40) return 'Moderate signal consistency with some variation';
  return 'Limited or inconsistent communication signals';
}

function getSampleQualityReasoning(posts, score) {
  const engagementLevel = calculateAvgEngagement(posts);
  
  if (score >= 80) return 'High-quality content with strong engagement and depth';
  if (score >= 60) return 'Good quality posts with moderate engagement levels';
  if (score >= 40) return 'Basic content quality with limited engagement data';
  if (posts.length > 0) return 'Limited qualitative content or low engagement signals';
  return 'Limited qualitative interviews or media signals';
}

function getConfidenceCategory(score) {
  if (score >= 80) return 'High';
  if (score >= 60) return 'Moderate';
  if (score >= 40) return 'Fair';
  return 'Low';
}

function getOverallConfidenceReasoning(score, category) {
  switch(category) {
    case 'High':
      return 'Reliable for outreach personalization and tone matching';
    case 'Moderate':
      return 'Good foundation for outreach with some verification recommended';
    case 'Fair':
      return 'Basic insights available, additional discovery needed';
    default:
      return 'Limited confidence, extensive validation required';
  }
}

function generateConfidenceInterpretation(score, category, parameters) {
  let interpretation = `A confidence score of ${score} indicates ${category.toLowerCase()} reliability in personality and engagement insights.`;
  
  // Identify areas of concern
  const lowScoreParams = parameters.filter(p => parseInt(p.score) < 50);
  
  if (lowScoreParams.length > 0) {
    const concerns = lowScoreParams.map(p => p.parameter.toLowerCase()).join(' and ');
    interpretation += ` Minor uncertainty arises from ${concerns}, so verifying the latest initiatives before outreach is recommended.`;
  } else if (score >= 80) {
    interpretation += ' High confidence enables direct personalization without additional verification.';
  } else {
    interpretation += ' Moderate confidence supports targeted outreach with standard validation practices.';
  }
  
  return interpretation;
}

function buildExecutiveSummary(profile, primaryAbbr, secondaryAbbr, confidenceScore, confidenceInterpretation, probabilityToPurchase, quickSummary) {
  // Determine company type based on profile information
  const companyType = determineCompanyType(profile);
  
  // Get confidence category
  const confidenceCategory = confidenceScore >= 70 ? 'High Confidence' : confidenceScore >= 40 ? 'Moderate Confidence' : 'Low Confidence';
  
  // Get purchase probability details
  const purchasePercentage = probabilityToPurchase?.predictedOutcome?.percentage || 0;
  const purchaseCategory = probabilityToPurchase?.predictedOutcome?.category || 'Unknown';
  
  // Determine communication tone based on DISC type
  const communicationTone = determineCommunicationTone(primaryAbbr, secondaryAbbr);
  
  // Get best outreach channels from quick summary or determine from DISC
  const bestChannels = quickSummary?.bestOutreachChannel ? 
    getBestOutreachChannels(quickSummary.bestOutreachChannel) : 
    getBestOutreachChannelsFromDISC(primaryAbbr);
  
  // Generate next step recommendation
  const nextStep = generateNextStepRecommendation(primaryAbbr, bestChannels);
  
  return {
    profileName: profile.name || 'Unknown',
    title: profile.current_position?.title || profile.title || 'Unknown',
    companyType: companyType,
    primaryDISCType: `${getDISCTypeName(primaryAbbr)} (${primaryAbbr})`,
    secondaryDISCType: `${getDISCTypeName(secondaryAbbr)} (${secondaryAbbr})`,
    confidenceScore: `${confidenceScore} / 100 (${confidenceCategory})`,
    purchaseProbability: `${purchasePercentage}% (${purchaseCategory})`,
    communicationTone: communicationTone,
    bestOutreachChannels: bestChannels,
    nextStep: nextStep
  };
}

function determineCompanyType(profile) {
  const company = profile.current_position?.company?.toLowerCase() || profile.company?.toLowerCase() || '';
  const title = profile.current_position?.title?.toLowerCase() || profile.title?.toLowerCase() || '';
  const about = profile.about?.toLowerCase() || '';
  
  if (company.includes('microsoft') || company.includes('google') || company.includes('apple') || company.includes('amazon')) {
    return 'Global Technology & Innovation';
  } else if (company.includes('bank') || company.includes('financial') || title.includes('finance')) {
    return 'Financial Services';
  } else if (company.includes('health') || company.includes('medical') || title.includes('health')) {
    return 'Healthcare & Life Sciences';
  } else if (company.includes('consult') || title.includes('consult')) {
    return 'Professional Services';
  } else if (title.includes('technology') || title.includes('engineer') || about.includes('technology')) {
    return 'Technology & Software';
  } else if (title.includes('sales') || title.includes('marketing')) {
    return 'Sales & Marketing';
  } else if (title.includes('ceo') || title.includes('president') || title.includes('founder')) {
    return 'Executive Leadership';
  } else {
    return 'Professional Services';
  }
}

function determineCommunicationTone(primaryAbbr, secondaryAbbr) {
  switch(primaryAbbr) {
    case 'D':
      return 'Concise, confident, ROI-driven';
    case 'I':
      return 'Engaging, enthusiastic, relationship-focused';
    case 'S':
      return 'Patient, supportive, relationship-building';
    case 'C':
      return 'Detailed, analytical, data-driven';
    default:
      return 'Professional, balanced approach';
  }
}

function getBestOutreachChannels(preferredChannel) {
  switch(preferredChannel?.toLowerCase()) {
    case 'linkedin':
      return 'LinkedIn → Email → Call';
    case 'email':
      return 'Email → LinkedIn → Call';
    case 'phone':
      return 'Call → LinkedIn → Email';
    default:
      return 'LinkedIn → Email → Call';
  }
}

function getBestOutreachChannelsFromDISC(primaryAbbr) {
  switch(primaryAbbr) {
    case 'D':
      return 'Call → LinkedIn → Email';
    case 'I':
      return 'LinkedIn → Email → Call';
    case 'S':
      return 'Email → LinkedIn → Call';
    case 'C':
      return 'Email → LinkedIn → Call';
    default:
      return 'LinkedIn → Email → Call';
  }
}

function generateNextStepRecommendation(primaryAbbr, channels) {
  const primaryChannel = channels.split(' → ')[0];
  
  switch(primaryAbbr) {
    case 'D':
      return `Send direct ${primaryChannel.toLowerCase()} message with clear ROI; schedule call within 24 hours`;
    case 'I':
      return `Send personalized ${primaryChannel.toLowerCase()} message; follow-up email in 48 hours`;
    case 'S':
      return `Send warm ${primaryChannel.toLowerCase()} introduction; gentle follow-up in 3-5 days`;
    case 'C':
      return `Send detailed ${primaryChannel.toLowerCase()} with data/case study; follow-up in 1 week`;
    default:
      return `Send personalized ${primaryChannel.toLowerCase()} message; follow-up email in 48 hours`;
  }
}

function buildCompanyOverview(productDescription) {
  if (!productDescription) {
    return null;
  }

  // Extract company information from product description
  const overview = {
    companyName: extractCompanyName(productDescription),
    specializations: extractSpecializations(productDescription),
    keyFeatures: extractKeyFeatures(productDescription),
    pricingModel: extractPricingModel(productDescription)
  };

  return overview;
}

function extractCompanyName(text) {
  // Look for company names in various formats
  const patterns = [
    /([A-Z][a-zA-Z0-9\s]+(?:Inc\.|LLC|Ltd\.|Pvt\. Ltd\.|Corp\.|Corporation|Enterprises|Solutions|Technologies|Systems))/gi,
    /([A-Z][a-zA-Z0-9]+(?:flake|tech|soft|ware|labs|works|hub|nest|flow|sync|cloud|net|web|app|pro|max|plus))/gi,
    /^([A-Z][a-zA-Z0-9\s]{2,20}(?=\s(?:specializes|offers|provides|develops|builds|creates)))/gim
  ];
  
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      return matches[0].trim();
    }
  }
  
  return null;
}

function extractSpecializations(text) {
  const specializations = [];
  const patterns = [
    /specializes?\s+in\s+([^.]+)/gi,
    /(?:expert|expertise)\s+in\s+([^.]+)/gi,
    /(?:focus|focuses)\s+on\s+([^.]+)/gi,
    /(?:develop|development|building)\s+([^.]+)/gi
  ];
  
  patterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        specializations.push(match[1].trim().replace(/,$/, ''));
      }
    }
  });
  
  return specializations.length > 0 ? specializations : null;
}

function extractKeyFeatures(text) {
  const features = [];
  const sentences = text.split(/[.!?]+/);
  
  sentences.forEach(sentence => {
    sentence = sentence.trim();
    if (sentence.length > 20 && sentence.length < 150) {
      // Look for feature-indicating words
      const featureKeywords = ['support', 'maintenance', 'scalable', 'powered', 'built', 'design', 'solutions', 'security', 'transparent', 'deployment'];
      const hasFeatureKeyword = featureKeywords.some(keyword => 
        sentence.toLowerCase().includes(keyword)
      );
      
      if (hasFeatureKeyword) {
        features.push(sentence.trim());
      }
    }
  });
  
  return features.length > 0 ? features.slice(0, 4) : null; // Limit to 4 key features
}

function extractPricingModel(text) {
  const pricingPatterns = [
    /\$[\d,]+/g,
    /(?:priced?\s+at|starting\s+at|costs?\s+around|budget\s+of)\s*\$?[\d,]+/gi,
    /(?:transparent|standard|fixed|competitive)\s+pricing/gi,
    /engagement\s+model[^.]*\$[\d,]+/gi
  ];
  
  for (const pattern of pricingPatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      return matches.join('; ');
    }
  }
  
  return null;
}

function buildNextSteps(parsed, profile, posts, productDescription) {
  // Prefer explicit nextSteps from LLM if present
  if (Array.isArray(parsed.nextSteps) && parsed.nextSteps.length) {
    return parsed.nextSteps.map(s => String(s).trim()).filter(Boolean).slice(0, 8);
  }
  if (typeof parsed.nextSteps === 'string' && parsed.nextSteps.trim()) {
    return splitIntoBullets(parsed.nextSteps).slice(0, 8);
  }

  // Fallback: try deriving concise next steps from parsed.nextActions if available
  if (Array.isArray(parsed.nextActions) && parsed.nextActions.length) {
    const mapping = parsed.nextActions.slice(0, 6).map(na => {
      const day = na.day !== undefined ? `Day ${na.day}: ` : '';
      const action = na.action || na.objective || na.copy || na.channel || '';
      return `${day}${String(action).trim()}`.trim();
    }).filter(Boolean);
    if (mapping.length) return mapping;
  }

  // Default recommended next steps (short, actionable bullets)
  return [
    'Validate recent posts or initiatives before outreach.',
    'Personalize the LinkedIn message using Likes/Common Ground.',
    'Use DISC insights to adapt tone dynamically.',
    'Log activity and outcomes within Sellinder dashboard.'
  ];
}

function buildCommunicationStrategy(primaryAbbr, secondaryAbbr, profile) {
  const recommendedSequence = generateRecommendedSequence(primaryAbbr, profile);
  const toneGuidance = generateToneGuidance(primaryAbbr, secondaryAbbr);
  
  return {
    recommendedSequence,
    toneGuidance
  };
}

function generateRecommendedSequence(primaryAbbr, profile) {
  const sequence = [];
  
  switch(primaryAbbr) {
    case 'D': // Dominance - Direct, results-focused
      sequence.push(
        { day: 1, channel: 'LinkedIn', objective: 'Direct connection request with ROI-focused value proposition' },
        { day: 2, channel: 'Email', objective: 'Present solution with clear metrics and immediate benefits' },
        { day: 4, channel: 'Phone', objective: 'Schedule demo with specific outcomes and timeline' },
        { day: 7, channel: 'Follow-up', objective: 'Decision timeline and next steps confirmation' }
      );
      break;
      
    case 'I': // Influence - Social, relationship-focused
      sequence.push(
        { day: 1, channel: 'LinkedIn', objective: 'Establish connection with value-based note' },
        { day: 2, channel: 'Email', objective: 'Present solution in alignment with team goals and collaboration' },
        { day: 5, channel: 'Phone', objective: 'Discuss team benefits and social proof from similar clients' },
        { day: 8, channel: 'Follow-up', objective: 'Share success stories and peer recommendations' }
      );
      break;
      
    case 'S': // Steadiness - Patient, relationship-building
      sequence.push(
        { day: 1, channel: 'LinkedIn', objective: 'Warm introduction with mutual connection reference' },
        { day: 3, channel: 'Email', objective: 'Present solution emphasizing stability and support' },
        { day: 7, channel: 'Phone', objective: 'Discuss implementation timeline and ongoing support' },
        { day: 10, channel: 'Follow-up', objective: 'Address concerns and provide detailed transition plan' }
      );
      break;
      
    case 'C': // Conscientiousness - Analytical, detail-oriented  
      sequence.push(
        { day: 1, channel: 'LinkedIn', objective: 'Connect with detailed case study or white paper' },
        { day: 3, channel: 'Email', objective: 'Present comprehensive solution analysis with data points' },
        { day: 7, channel: 'Phone', objective: 'Technical discussion with detailed ROI calculations' },
        { day: 10, channel: 'Follow-up', objective: 'Provide additional documentation and implementation details' }
      );
      break;
      
    default:
      sequence.push(
        { day: 1, channel: 'LinkedIn', objective: 'Establish connection with value-based note' },
        { day: 2, channel: 'Email', objective: 'Present solution in alignment with business goals' },
        { day: 5, channel: 'Phone', objective: 'Reinforce ROI and measurable results' },
        { day: 8, channel: 'Follow-up', objective: 'Short message referencing previous discussion' }
      );
  }
  
  return sequence;
}

function generateToneGuidance(primaryAbbr, secondaryAbbr) {
  let guidance = '';
  
  switch(primaryAbbr) {
    case 'D':
      guidance = 'Assertive, respectful, confident — focus on impact and efficiency, not features.';
      break;
    case 'I':
      guidance = 'Enthusiastic, engaging, collaborative — emphasize team benefits and social validation.';
      break;
    case 'S':
      guidance = 'Patient, supportive, trustworthy — build relationship gradually with consistent follow-through.';
      break;
    case 'C':
      guidance = 'Professional, detailed, factual — provide comprehensive information and logical reasoning.';
      break;
    default:
      guidance = 'Professional, balanced approach — adapt tone based on their response and engagement level.';
  }
  
  // Add secondary trait influence if different from primary
  if (secondaryAbbr && secondaryAbbr !== primaryAbbr) {
    switch(secondaryAbbr) {
      case 'D':
        guidance += ' Include decisive language and clear action steps.';
        break;
      case 'I':
        guidance += ' Add personal touches and relationship-building elements.';
        break;
      case 'S':
        guidance += ' Emphasize stability and long-term partnership value.';
        break;
      case 'C':
        guidance += ' Support claims with data and detailed explanations.';
        break;
    }
  }
  
  return guidance;
}
