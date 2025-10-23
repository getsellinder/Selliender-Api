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

        return buildAnalysisResponse({ parsed, metrics, posts, profile, productPrice });

    } catch (error) {
        if (error.status !== 429) {
            console.error("❌ Error in analyzeLinkedInProfile:", error.message);
        }
        // Return fallback on error
        const metrics = computeConfidenceMetrics(profile, posts);
        const fallback = generateFallbackAnalysis(profile, posts, productDescription, productPrice, metrics);
        return buildAnalysisResponse({ parsed: fallback, metrics, posts, profile, productPrice });
    }
}

function buildAnalysisResponse({ parsed, metrics, posts, profile, productPrice }) {
    const defaultDisc = { D: 25, I: 25, S: 25, C: 25 };
    const disc = parsed.discPercentages ? { ...defaultDisc, ...parsed.discPercentages } : defaultDisc;
    const sorted = Object.entries(disc)
        .map(([key, value]) => [key, Number.isFinite(value) ? value : 0])
        .sort((a, b) => b[1] - a[1]);

    const [primaryType, primaryPercentage] = sorted[0] || ['D', 25];
    const [secondaryType, secondaryPercentage] = sorted[1] || sorted[0] || ['I', 25];

  const confidenceScore = calculateConfidenceScore(metrics, posts.length);

    const personalizationSource = parsed.personalizationCues;
    let personalizationCues;
    if (Array.isArray(personalizationSource)) {
        personalizationCues = personalizationSource.length > 0 ? personalizationSource : ["Focus on direct, results-oriented messaging."];
    } else {
        personalizationCues = [personalizationSource || "Focus on direct, results-oriented messaging."];
    }

    return {
        executive: parsed.executiveSummary || `Approach ${profile.name || 'the prospect'} with focus on results and efficiency.`,
        personality: {
            disc,
            bullets: parsed.personalityBullets || [],
            primaryType,
            secondaryType,
            primary: {
                type: primaryType,
                name: getDISCTypeName(primaryType),
                percentage: primaryPercentage,
                description: getDISCTypeDescription(primaryType, primaryPercentage)
            },
            secondary: {
                type: secondaryType,
                name: getDISCTypeName(secondaryType),
                percentage: secondaryPercentage,
                description: getDISCTypeDescription(secondaryType, secondaryPercentage)
            },
            discDefinitions: parsed.discDefinitions || {},
            primarySecondaryElab: parsed.primarySecondaryElab || ""
        },
        talkingPoints: Array.isArray(parsed.talkingPoints) ? parsed.talkingPoints : [],
        personalizationCues,
        openingScripts: parsed.openingScripts || { linkedin_dm: [], email: [], phone: [], whatsapp: [] },
        objectionHandling: Array.isArray(parsed.objectionHandling) ? parsed.objectionHandling : [],
        nextActions: Array.isArray(parsed.nextActions) ? parsed.nextActions : [],
        confidence: {
            score: confidenceScore,
            breakdown: {
                completeness: Math.round(metrics.completeness * 100),
                sampleQuality: Math.round(metrics.sampleQuality * 100),
                recency: Math.round(metrics.recency * 100),
                agreement: Math.round(metrics.agreement * 100),
                signalStrength: Math.round(metrics.signalStrength * 100)
            },
            explanation: parsed.confidence?.explanation || `Confidence score of ${confidenceScore}% based on ${posts.length} posts analyzed.`,
            warnings: parsed.confidence?.warnings || []
        },
        dataSources: [
            `profile_${profile._id || 'manual'}`,
            `posts_${posts.length}_items`,
            profile.about ? 'about_section' : null,
            profile.experience ? 'experience_section' : null,
            profile.skills ? 'skills_section' : null
        ].filter(Boolean),
        analysisMetadata: {
            profileFieldsUsed: countProfileFields(profile),
            postsAnalyzed: posts.length,
            avgPostEngagement: calculateAvgEngagement(posts),
            dominantTopics: (Array.isArray(parsed.talkingPoints) ? parsed.talkingPoints : []).slice(0, 5).map(t => t.topic),
            writingTone: determineWritingTone(posts),
            rawRationale: parsed.rawRationale || "Analysis based on available profile and post data."
        }
    };
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
