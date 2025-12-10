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
 * Clean company or title string - remove | separators and Ex- prefixes
 * Also filter out certifications that appear as company names
 * e.g., "Global Logic| Ex - LTIMindtree | Ex - TELUS International" -> "Global Logic"
 */
function cleanCompanyOrTitle(value, type = 'company') {
  if (!value) return type === 'company' ? 'their organization' : 'their role';
  let cleaned = String(value).trim();
  
  // If contains |, take only the first part (current company/role)
  if (cleaned.includes('|')) {
    cleaned = cleaned.split('|')[0].trim();
  }
  
  // Remove "Ex -" or "Ex-" prefixes
  cleaned = cleaned.replace(/^Ex\s*-?\s*/i, '').trim();
  
  // Remove " at " company suffix if it's a title
  if (type === 'title' && cleaned.toLowerCase().includes(' at ')) {
    cleaned = cleaned.split(/\s+at\s+/i)[0].trim();
  }
  
  // Filter out certification names that mistakenly appear as company
  if (type === 'company') {
    const certificationPatterns = [
      /^AWS Certified/i,
      /^Azure Certified/i,
      /^Google Certified/i,
      /^PMP Certified/i,
      /^Certified\s/i,
      /^Certification$/i,
      /^Professional Certification/i
    ];
    
    for (const pattern of certificationPatterns) {
      if (pattern.test(cleaned)) {
        return 'their organization';
      }
    }
  }
  
  return cleaned || (type === 'company' ? 'their organization' : 'their role');
}

/**
 * Detect the type of product from description
 */
function detectProductType(productDescription) {
  if (!productDescription) return 'General Product/Service';
  const desc = String(productDescription).toLowerCase();
  
  // Count keyword matches for each category to find best match
  const categoryScores = {};
  
  // Software/SaaS keywords - CHECK FIRST as it's common in B2B
  const saasKeywords = [
    // Core software terms
    'software', 'saas', 'platform', 'api', 'application', 'app', 'system', 'solution',
    // Development terms
    'development', 'developing', 'developer', 'develop', 'programming', 'programmer', 'code', 'coding', 'coder',
    'web development', 'mobile development', 'app development', 'product development',
    // Maintenance and support
    'maintenance', 'software maintenance', 'support', 'technical support', 'bug fix', 'bug fixing', 'debugging',
    'upgrade', 'update', 'patch', 'version', 'release', 'deployment',
    // Project terms
    'project', 'projects', 'it project', 'tech project', 'sprint', 'milestone', 'deliverable',
    // Technology terms
    'technology', 'tech', 'it ', 'it service', 'it solution', 'digital', 'digital transformation',
    'automation', 'integration', 'migration', 'implementation',
    // Architecture & infrastructure
    'backend', 'frontend', 'full stack', 'fullstack', 'database', 'server', 'hosting', 'cloud',
    'microservices', 'architecture', 'infrastructure', 'devops', 'ci/cd', 'containerization',
    // Business software
    'crm', 'erp', 'analytics', 'dashboard', 'reporting', 'enterprise software', 'business software',
    // Specialized domains
    'cybersecurity', 'security', 'fintech', 'healthtech', 'edtech', 'iot', 'ai ', 'machine learning', 'ml ',
    'data science', 'big data', 'blockchain',
    // Methodologies
    'agile', 'scrum', 'kanban', 'waterfall', 'sdlc', 'software development life cycle',
    // Team/company types
    'it company', 'software company', 'tech company', 'technology company', 'startup', 'tech startup',
    'it firm', 'software firm', 'development team', 'tech team',
    // Services
    'custom software', 'bespoke software', 'tailored solution', 'it consulting', 'tech consulting',
    'software consulting', 'outsourcing', 'offshore', 'nearshore', 'onshore',
    // Quality
    'testing', 'qa', 'quality assurance', 'unit test', 'automation testing', 'manual testing',
    // Web/Mobile specific
    'website', 'web app', 'mobile app', 'ios', 'android', 'react', 'angular', 'vue', 'node',
    'python', 'java', 'javascript', '.net', 'php', 'ruby', 'golang', 'rust',
    // General tech
    'scalable', 'robust', 'efficient', 'optimize', 'performance', 'user experience', 'ux', 'ui',
    'interface', 'module', 'feature', 'functionality', 'requirement', 'specification'
  ];
  categoryScores['Software/SaaS'] = saasKeywords.filter(kw => desc.includes(kw)).length;
  
  // Real Estate keywords
  const realEstateKeywords = ['apartment', 'bhk', 'sq.ft', 'sqft', 'floor plan', 'tower', 'bedroom', 'bathroom', 'furnished', 'parking space', 'amenities', 'clubhouse', 'swimming pool', 'gymnasium', 'real estate', 'property', 'villa', 'flat', 'residential', 'plot', 'land', 'builder', 'pooja room', 'balcony', 'terrace', 'ready to move', 'under construction', 'rera', 'carpet area', 'super built-up'];
  categoryScores['Real Estate Property'] = realEstateKeywords.filter(kw => desc.includes(kw)).length;
  
  // Automotive keywords - be more specific to avoid false positives
  const autoKeywords = ['car ', 'cars ', 'vehicle', 'sedan', 'suv', 'mileage', 'engine cc', 'horsepower', 'automotive', 'bike', 'motorcycle', 'scooter', 'diesel', 'petrol', 'electric vehicle', 'ev ', 'hybrid car', 'transmission', 'airbag', 'test drive', 'showroom', 'dealership', 'on-road price', 'ex-showroom'];
  categoryScores['Automotive'] = autoKeywords.filter(kw => desc.includes(kw)).length;
  
  // Financial/Insurance keywords
  const financeKeywords = ['insurance', 'policy', 'premium', 'coverage', 'mutual fund', 'loan', 'mortgage', 'emi', 'interest rate', 'returns', 'portfolio', 'wealth management', 'term plan', 'life cover', 'health insurance', 'investment plan', 'sip', 'fixed deposit', 'fd', 'nps', 'pension'];
  categoryScores['Financial Product'] = financeKeywords.filter(kw => desc.includes(kw)).length;
  
  // Education keywords
  const eduKeywords = ['course', 'certification', 'training program', 'degree', 'diploma', 'education', 'learning', 'curriculum', 'bootcamp', 'coaching', 'tuition', 'classes', 'workshop', 'seminar', 'webinar', 'masterclass', 'online course', 'e-learning', 'instructor', 'student', 'placement'];
  categoryScores['Education/Training'] = eduKeywords.filter(kw => desc.includes(kw)).length;
  
  // Healthcare/Wellness keywords
  const healthKeywords = ['health care', 'medical', 'hospital', 'clinic', 'treatment', 'therapy', 'wellness', 'fitness center', 'gym membership', 'yoga class', 'nutrition', 'diet plan', 'supplement', 'medicine', 'doctor', 'consultation', 'patient', 'diagnosis', 'prescription'];
  categoryScores['Healthcare/Wellness'] = healthKeywords.filter(kw => desc.includes(kw)).length;
  
  // Travel/Hospitality keywords
  const travelKeywords = ['travel package', 'hotel', 'resort', 'vacation', 'trip', 'tour package', 'flight booking', 'holiday', 'destination', 'cruise', 'accommodation', 'tourism', 'itinerary', 'visa', 'passport'];
  categoryScores['Travel/Hospitality'] = travelKeywords.filter(kw => desc.includes(kw)).length;
  
  // Consumer Electronics keywords
  const electronicsKeywords = ['smartphone', 'laptop', 'computer', 'tablet', 'television', 'tv ', 'camera', 'gadget', 'device', 'appliance', 'electronic', 'smart home', 'speaker', 'headphone', 'wireless', 'bluetooth', 'charger', 'accessories'];
  categoryScores['Consumer Electronics'] = electronicsKeywords.filter(kw => desc.includes(kw)).length;
  
  // Fashion/Lifestyle keywords
  const fashionKeywords = ['clothing', 'fashion', 'apparel', 'jewelry', 'watch', 'accessories', 'footwear', 'shoes', 'bag', 'luxury brand', 'designer', 'collection', 'wardrobe', 'style', 'outfit'];
  categoryScores['Fashion/Lifestyle'] = fashionKeywords.filter(kw => desc.includes(kw)).length;
  
  // Food/Beverages keywords - be specific to avoid matching "delivery" in other contexts
  const foodKeywords = ['food delivery', 'restaurant', 'catering', 'beverage', 'organic food', 'gourmet', 'cuisine', 'meal plan', 'snack', 'drink', 'coffee shop', 'tea', 'bakery', 'chef', 'menu', 'recipe'];
  categoryScores['Food/Beverages'] = foodKeywords.filter(kw => desc.includes(kw)).length;
  
  // B2B Services keywords
  const b2bKeywords = ['consulting', 'consultancy', 'agency', 'marketing agency', 'advertising', 'hr service', 'recruitment', 'staffing', 'outsourcing', 'management consulting', 'business solution', 'professional service'];
  categoryScores['B2B Services'] = b2bKeywords.filter(kw => desc.includes(kw)).length;
  
  // Find the category with highest score
  let maxScore = 0;
  let detectedType = 'General Product/Service';
  
  for (const [category, score] of Object.entries(categoryScores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedType = category;
    }
  }
  
  // Only return detected type if we have at least 2 keyword matches for confidence
  if (maxScore >= 2) {
    return detectedType;
  }
  
  // Fallback: check for single strong indicators
  if (desc.includes('software') || desc.includes('web application') || desc.includes('mobile application') || desc.includes('technology company') || desc.includes('saas') || desc.includes('digital solution')) {
    return 'Software/SaaS';
  }
  if (desc.includes('apartment') || desc.includes('bhk') || desc.includes('real estate') || desc.includes('property')) {
    return 'Real Estate Property';
  }
  if (desc.includes('car') || desc.includes('vehicle') || desc.includes('automotive')) {
    return 'Automotive';
  }
  
  return 'General Product/Service';
}

/**
 * Get product-type specific context for the prompt
 */
function getProductTypeContext(productType, productDescription, productPrice) {
  const formattedPrice = productPrice ? formatProductPrice(productPrice) : 'price not specified';
  
  // Extract key details from product description for context
  const productSummary = productDescription ? String(productDescription).slice(0, 200) : 'Product details not provided';
  
  switch (productType) {
    case 'Real Estate Property':
      return `**REAL ESTATE CONTEXT:**
- This is a residential property sale. Focus on lifestyle benefits, location advantages, investment value, and emotional appeal.
- Talking points should cover: family lifestyle, neighborhood benefits, investment appreciation, amenities enjoyment, proximity to work/schools, space utilization, home ownership dreams.
- Objections will be about: price/budget, location concerns, timing of purchase, comparison with other properties, loan/financing, resale value.
- Scripts should connect the prospect's life stage, career stability, and family needs to property benefits.
- Price point: ${formattedPrice} - position this as a long-term investment and lifestyle upgrade.`;
    
    case 'Automotive':
      return `**AUTOMOTIVE CONTEXT:**
- This is a vehicle sale. Focus on lifestyle fit, daily commute, family needs, status, and practical benefits.
- Talking points should cover: reliability, fuel efficiency, safety features, comfort, resale value, brand prestige, after-sales service.
- Objections will be about: price, maintenance costs, fuel economy, comparison with competitors, financing options.
- Scripts should connect the prospect's professional image, commute needs, and family requirements to vehicle benefits.
- Price point: ${formattedPrice}`;
    
    case 'Financial Product':
      return `**FINANCIAL PRODUCT CONTEXT:**
- This is a financial/insurance product. Focus on security, returns, risk management, and long-term planning.
- Talking points should cover: financial security, tax benefits, returns comparison, risk coverage, family protection, wealth creation.
- Objections will be about: returns, lock-in period, trustworthiness, comparison with other options, liquidity.
- Scripts should connect the prospect's financial goals, family security needs, and investment horizon.
- Price point: ${formattedPrice}`;
    
    case 'Education/Training':
      return `**EDUCATION CONTEXT:**
- This is an education/training product. Focus on career advancement, skill development, and ROI on learning.
- Talking points should cover: career growth, industry relevance, certification value, networking opportunities, placement support.
- Objections will be about: time commitment, relevance to current role, cost vs value, alternative options.
- Scripts should connect the prospect's career aspirations, current skill gaps, and professional growth to the program benefits.
- Price point: ${formattedPrice}`;
    
    case 'Healthcare/Wellness':
      return `**HEALTHCARE/WELLNESS CONTEXT:**
- This is a health/wellness product or service. Focus on well-being, quality of life, preventive care, and long-term health benefits.
- Talking points should cover: health improvement, convenience, expert care, lifestyle enhancement, preventive benefits.
- Objections will be about: effectiveness, cost, time commitment, trust in provider/product.
- Scripts should connect the prospect's health goals and lifestyle to the product benefits.
- Price point: ${formattedPrice}`;
    
    case 'Travel/Hospitality':
      return `**TRAVEL/HOSPITALITY CONTEXT:**
- This is a travel/hospitality product. Focus on experiences, relaxation, convenience, and value for money.
- Talking points should cover: unique experiences, comfort, convenience, family/group benefits, memories creation.
- Objections will be about: price, timing, safety, comparison with alternatives.
- Scripts should connect the prospect's need for relaxation, family time, or experiences to the offering.
- Price point: ${formattedPrice}`;
    
    case 'Consumer Electronics':
      return `**CONSUMER ELECTRONICS CONTEXT:**
- This is a consumer electronics product. Focus on features, performance, value, and lifestyle enhancement.
- Talking points should cover: key features, performance benefits, brand reliability, after-sales support, value proposition.
- Objections will be about: price, comparison with competitors, necessity, warranty concerns.
- Scripts should connect the prospect's tech needs, usage patterns, and lifestyle to product benefits.
- Price point: ${formattedPrice}`;
    
    case 'Fashion/Lifestyle':
      return `**FASHION/LIFESTYLE CONTEXT:**
- This is a fashion/lifestyle product. Focus on style, quality, exclusivity, and personal expression.
- Talking points should cover: quality, design, brand value, versatility, investment pieces.
- Objections will be about: price, necessity, style preferences, alternatives.
- Scripts should connect the prospect's personal style and professional image to the product.
- Price point: ${formattedPrice}`;
    
    case 'Food/Beverages':
      return `**FOOD/BEVERAGES CONTEXT:**
- This is a food/beverage product or service. Focus on quality, taste, convenience, and health benefits.
- Talking points should cover: quality ingredients, taste, convenience, health benefits, value.
- Objections will be about: price, taste preferences, dietary restrictions, alternatives.
- Scripts should connect the prospect's lifestyle and food preferences to the offering.
- Price point: ${formattedPrice}`;
    
    case 'B2B Services':
      return `**B2B SERVICES CONTEXT:**
- This is a B2B service offering. Focus on business outcomes, efficiency, expertise, and ROI.
- Talking points should cover: business impact, expertise, track record, customization, support.
- Objections will be about: cost, internal capabilities, timing, comparison with competitors.
- Scripts should connect the prospect's business challenges and goals to the service benefits.
- Price point: ${formattedPrice}`;
    
    case 'Software/SaaS':
      return `**SOFTWARE/SAAS CONTEXT:**
- This is a software/SaaS product. Focus on efficiency, automation, integration, and business outcomes.
- Talking points should cover: features, integration, ROI, support, scalability.
- Objections will be about: existing tools, implementation effort, cost, security.
- Scripts should connect the prospect's operational challenges to software capabilities.
- Price point: ${formattedPrice}`;
    
    default:
      return `**PRODUCT CONTEXT (${productType}):**
- Analyze the product description carefully: "${productSummary}..."
- Generate talking points that genuinely connect the prospect's profile, role, and interests to this specific product's benefits.
- Create objection handling relevant to this product category and price point (${formattedPrice}).
- Scripts should be personalized based on the prospect's professional background and likely needs.
- DO NOT use generic B2B SaaS language. Make all content specific to this product.`;
  }
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
      return `- [${date}] ${snippet} (likes: ${p.likes || 0}, comments: ${p.comments || 0
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

  // Detect product type for context-aware generation
  const productType = detectProductType(productDescription);
  const productTypeContext = getProductTypeContext(productType, productDescription, productPrice);

  const userPrompt = `You are Sellinder, an expert sales intelligence writer. Generate a comprehensive, long-form SELLING-FOCUSED DISC report structured as JSON. This report must be detailed enough to render as a 3-5 page A4 document with rich, actionable content for sales professionals.

**CRITICAL INSTRUCTION:** The product being sold is a ${productType}. ALL talking points, scripts, objection handling, and personalization MUST be relevant to selling this specific ${productType} to this prospect. Do NOT generate generic B2B SaaS content. Analyze the prospect's profile to find genuine connections to why they would be interested in this ${productType}.

${productTypeContext}

**INPUTS:**

Profile:
${profileText}

Recent Posts (sample, most recent first):
${postsSample || "- no posts provided -"}

Product Information (${productType}):
Name/Description: ${productDescription}
Price: ${productPrice !== null ? formatProductPrice(productPrice) : "Not specified"}

Confidence Metrics (precomputed): ${metricsText}

**OUTPUT REQUIREMENTS (MANDATORY - Return valid JSON only):**

Return a single JSON object with these exact keys:

1. **executiveSummary**: 2-3 sentence overview for a sales rep approaching this prospect to sell ${productType}. Mention their role, company, and key selling angle specific to why they would be interested in this ${productType}.

2. **profileSummary**: 90-100 word narrative introducing the prospect from a sales perspective. Explain why this prospect is a good fit for this ${productType} based on their profile, career stage, and likely needs.

3. **discPercentages**: Object with {D: int, I: int, S: int, C: int} where integers sum to exactly 100. Base this on profile traits, post content, and communication style.

4. **discDefinitions**: Object keyed by full trait names {"dominance": "...", "influence": "...", "steadiness": "...", "conscientiousness": "..."}. Provide 2-4 sentences per trait explaining what that DISC dimension means in communication and buying behavior (consumer-friendly language) and mention the abbreviation (e.g., "Dominance (D)").

5. **primaryStyle**: 50-70 word explanation of how to sell to the primary DISC type (focus on tone, pacing, value framing). Call out the trait name explicitly.

6. **secondaryStyle**: 50-70 word explanation of how to reinforce the pitch for their secondary DISC type, including risks to avoid. Call out the trait name explicitly.

7. **approachGuidance**: 3-4 paragraphs totaling 150-200 words that walk the rep through a full outreach flow for selling this ${productType} (opening, framing value, handling resistance, closing next step) tailored to this prospect's DISC profile. Reference specific ${productType} benefits${productPrice !== null ? ' and price point' : ''} naturally.

7b. **companyOverview**: Object describing the offer being sold. Follow this exact schema:
  - companyName: string (short name for the offer/service derived from the description)
  - specializations: array of **3-5** strings (each 12-20 words, highlight what the offer specializes in)
  - keyFeatures: array of **3-5** strings (each 12-20 words, concrete features/benefits/value props)
  - pricingModel: string (reference price or value framing if available; otherwise "Not specified")
  NEVER leave arrays empty. If information is missing, infer from the description rather than returning empty arrays.

8. **personalityBullets**: Array of 3-5 concise bullet strings summarizing key personality traits relevant to sales approach (these will be displayed as key traits).

9. **talkingPoints**: Array of 4-6 objects, each with:
   - topic: string (short heading RELEVANT to the ${productType} being sold - e.g., for real estate: "Location Benefits", "Investment Value", "Family Lifestyle"; for automotive: "Safety Features", "Fuel Efficiency"; for education: "Career Growth", "Certification Value")
   - why: string (40-80 words explaining why this topic matters TO THIS PROSPECT based on their profile/posts and how it connects to the ${productType})
   - whatToSay: string (3-4 lines max, concise script specific to selling this ${productType}, DO NOT paste full product description, mention specific product benefits)
   - evidence: string (cite specific post snippet with date if applicable, otherwise "Profile-based")
   - importantPoints: array of strings (3-4 concise bullet points extracting key takeaways about selling this ${productType} to this prospect)

10. **personalizationCues**: Array of 5-7 detailed guidance paragraphs (each 3-5 complete sentences, 60-120 words). SELLING-FOCUSED personalization for this ${productType}. Each paragraph should cover ONE specific aspect:
   - Paragraph 1: Opening approach - how to start the conversation when selling this ${productType}, what to acknowledge about their background
   - Paragraph 2: Price positioning - how to mention ${productPrice !== null ? formatProductPrice(productPrice) : 'the price'} in context of value/ROI specific to ${productType}
   - Paragraph 3: Career-to-benefit connection - how to link prospect's role/experience to specific ${productType} advantages
   - Paragraph 4: Social proof strategy - examples and references to use that are relevant to ${productType}
   - Paragraph 5: Language and phrasing - specific words, phrases, and micro-language the rep should use for ${productType} sales
   - Paragraph 6: What to avoid - specific things NOT to say or emphasize when selling ${productType}
   - Paragraph 7 (optional): Post-specific insights - if posts reveal preferences, mention them with dates
   
   Each paragraph must be complete, actionable, and ready for sales rep to use directly. NO single-sentence bullets.

11. **openingScripts**: Object with:
   - linkedin_dm: array of 2 variant strings (each 40-80 words, personalized for selling ${productType}, mention specific product benefits relevant to prospect's profile)
   - email: array of 2 objects {subject: string, body: string} (one short 80-word body, one long 150-word body - both focused on ${productType} value proposition)
   - phone: array of 3 variant strings (10-second opener, 20-second opener, 45-second pitch - all tailored for ${productType} sales conversation)
   - whatsapp: array of 2 variant strings (casual, professional - both appropriate for ${productType} outreach)

12. **objectionHandling**: Array of 4-5 objects, each with:
   - objection: string (likely objection specific to buying this ${productType} - e.g., for real estate: "price too high", "need to discuss with family", "location concerns"; for automotive: "maintenance costs", "fuel economy"; for education: "time commitment", "job placement")
   - rationale: string (2-3 sentences why this prospect would raise this objection based on their profile/DISC type)
   - response: string (2-4 sentence recommended reply addressing the objection with specific ${productType} benefits${productPrice !== null ? " and value/ROI justification" : ""})

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

  // Use cleaned values throughout
  const cleanCompany = cleanCompanyOrTitle(profile.company, 'company');
  const cleanTitle = cleanCompanyOrTitle(profile.title, 'title');
  const cleanProduct = getShortProductDescription(productDescription);
  const priceStr = productPrice ? formatProductPrice(productPrice) : null;

  return {
    executiveSummary: `${profile.name || 'This prospect'}${cleanCompany !== 'their organization' ? ` at ${cleanCompany}` : ''} shows a ${getDISCTypeName(primary)}-primary personality. Approach with direct, results-focused messaging emphasizing ROI${priceStr ? ` at ${priceStr}` : ''}.`,
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
        topic: cleanCompany !== 'their organization' ? `Role at ${cleanCompany}` : "Professional Role",
        why: `As ${cleanTitle}${cleanCompany !== 'their organization' ? ` at ${cleanCompany}` : ''}, they have decision-making authority and relevant needs.`,
        whatToSay: `Given your role as ${cleanTitle}, ${cleanProduct}${priceStr ? ` at ${priceStr}` : ''} has helped similar professionals achieve measurable results.`,
        evidence: "Profile-based"
      }
    ],
    personalizationCues: [
      `When reaching out to ${profile.name || 'this prospect'}, acknowledge their professional background as ${cleanTitle}. This builds rapport and shows genuine interest. Tailor your opening to reference specific aspects of their career that connect to what you're offering.`,
      
      priceStr 
        ? `Position the ${priceStr} investment as strategic value rather than just cost. Emphasize long-term benefits, ROI potential, and how this compares favorably to alternatives. Connect the investment to their professional standing and financial goals.`
        : `Focus on tangible outcomes and measurable value. Frame benefits in terms of problems solved, time saved, or opportunities created. Use concrete examples that resonate with their role and priorities.`,
      
      `Keep all communications focused on efficiency and clear outcomes. This prospect values directness and measurable results. Lead with benefits, support with data, and make next steps crystal clear. Avoid lengthy explanations or overly emotional appeals.`,
      
      `Use social proof strategically - reference similar professionals who have made this decision successfully. Share relevant case studies and testimonials that mirror their context. This reduces perceived risk and validates their decision-making process.`
    ],
    openingScripts: {
      linkedin_dm: [
        `Hi ${profile.name || 'there'}, I noticed your impressive background as ${cleanTitle} and wanted to share an exciting ${cleanProduct} opportunity${priceStr ? ` at ${priceStr}` : ''}. This property offers exceptional value with premium amenities, excellent connectivity, and strong appreciation potential in a prime location. Given your professional standing, this could be perfect for your family's long-term goals. The spacious layout, modern facilities, and thriving neighborhood make it an ideal investment. Would love to share detailed information and arrange a site visit at your convenience.`
      ],
      email: [
        {
          subject: `Premium ${cleanProduct} opportunity in prime location`,
          body: `Hi ${profile.name || 'there'},\n\nGiven your established career as ${cleanTitle}, I wanted to reach out about a ${cleanProduct}${priceStr ? ` at ${priceStr}` : ''} that aligns perfectly with your lifestyle and investment goals.\n\nThis property offers:\n• Excellent connectivity to major business districts and IT hubs\n• Premium amenities including clubhouse, swimming pool, and fitness center\n• Strong appreciation potential with ongoing infrastructure development\n• Ready-to-move or well-planned construction timeline\n• Family-friendly environment with schools, hospitals, and shopping nearby\n\nMany professionals in similar roles have found this to be an excellent investment for their family's future. The combination of location, amenities, and pricing makes this a rare opportunity in today's market.\n\nWould you be available for a brief call or site visit this week? I'd be happy to share detailed floor plans, payment options, and answer any questions you might have.\n\nBest regards,`
        }
      ],
      phone: [
        `Hi ${profile.name || 'there'}, I wanted to reach out about a ${cleanProduct}${priceStr ? ` priced at ${priceStr}` : ''} in a prime location with excellent amenities. This property is situated in a well-connected area with great schools, hospitals, and shopping centers nearby. It features spacious layouts, premium clubhouse facilities, and strong potential for appreciation. Given your professional profile as ${cleanTitle}, I think this could be a great fit for your family's long-term plans. The property offers both immediate comfort and solid investment value. Do you have a few minutes to discuss the details, or would you prefer I send you more information first?`
      ],
      whatsapp: [
        `Hi ${profile.name || 'there'}, I came across a ${cleanProduct} that might interest you - great location, premium amenities${priceStr ? `, ${priceStr}` : ''}. It's in a prime area with excellent connectivity, clubhouse, gym, swimming pool, and all modern facilities. Perfect for families looking for comfort and investment value. The location has strong appreciation potential with new infrastructure projects coming up. Would you like to know more? I can share photos, floor plans, and arrange a site visit whenever convenient for you.`
      ]
    },
    objectionHandling: [
      {
        objection: "Too busy right now",
        recommendedResponse: `I understand. This is about saving time long-term. How about a 10-minute call next week?`,
        followUpTone: "Respectful, patient"
      },
      {
        objection: "Need to think about it",
        recommendedResponse: `Absolutely. I can send a one-page summary${priceStr ? ` showing how the ${priceStr} investment` : ''} delivers value. Would that help?`,
        followUpTone: "Professional, supportive"
      },
      {
        objection: "The cost seems high",
        recommendedResponse: `I appreciate that concern.${priceStr ? ` At ${priceStr}, ` : ' '}the ROI typically comes from efficiency gains and time savings. Let me share some specific examples.`,
        followUpTone: "Data-backed, confident"
      }
    ],
    nextActions: [
      { day: 0, action: "Send connection request", channel: "LinkedIn", copy: `Personalized message to ${profile.name} referencing their role.` },
      { day: 1, action: "Follow up with email", channel: "Email", copy: "Short value-focused email with relevant case study." },
      { day: 3, action: "Share resource", channel: "LinkedIn", copy: "Send relevant article or insight related to their industry." },
      { day: 7, action: "Schedule call", channel: "Phone", copy: "Call to schedule discovery meeting." },
      { day: 14, action: "Send case study", channel: "Email", copy: "Share relevant case study with measurable outcomes." },
      { day: 21, action: "Value reminder", channel: "LinkedIn", copy: "Share customer success story from similar role." },
      { day: 30, action: "Final touchpoint", channel: "Email", copy: "Final follow-up with clear call to action." }
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

  // Personalization cues: normalize into an array of detailed paragraphs (3-5 sentences each)
  const personalizationSource = parsed.personalizationCues;
  let personalizationCues = [];
  if (Array.isArray(personalizationSource) && personalizationSource.length) {
    // Already an array - use as-is, ensuring each item is substantial
    personalizationCues = personalizationSource.slice(0, 8).map(s => String(s).trim()).filter(s => s.length > 50);
  } else if (typeof personalizationSource === "string" && personalizationSource.trim()) {
    // String format - split into paragraphs by double newlines, NOT by sentences
    personalizationCues = personalizationSource
      .split(/\n\n+/)
      .map(p => p.replace(/\n/g, ' ').trim())
      .filter(p => p.length > 50)
      .slice(0, 8);
  }
  // Only add fallback if we have fewer than 4 substantial paragraphs
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

  const productType = detectProductType(productDescription);
  const finalTalkingPointsExpanded = ensureExpandedTalkingPoints(finalTalkingPoints, { profile, productDescription, productPrice, productType });

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

  const openingScriptsNormalized = sanitizeOpeningScripts(parsed.openingScripts || { linkedin_dm: [], email: [], phone: [], whatsapp: [] }, profile, productDescription, productPrice);

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

  // Use AI-generated Company Overview or build fallback
  let companyOverview = parsed.companyOverview || null;
  
  // Filter out empty arrays and null values from AI-generated companyOverview
  if (companyOverview && typeof companyOverview === 'object') {
    const filtered = {};
    Object.keys(companyOverview).forEach(key => {
      if (hasActualData(companyOverview[key])) {
        filtered[key] = companyOverview[key];
      }
    });
    companyOverview = Object.keys(filtered).length ? filtered : null;
  }

  companyOverview = normalizeCompanyOverview(companyOverview, productDescription, productPrice);

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
  // Normalize whitespace but preserve newlines for splitting
  const t = String(text).trim();
  
  // Try splitting by newlines first
  const byLines = t.split(/\n+/).map(s => s.trim()).filter(Boolean);
  if (byLines.length >= 3) return byLines.filter(b => b.length > 10);

  // Protect common abbreviations from being split
  const protectedText = t
    .replace(/React\.js/gi, 'REACTJS_PROTECTED')
    .replace(/Node\.js/gi, 'NODEJS_PROTECTED')
    .replace(/Vue\.js/gi, 'VUEJS_PROTECTED')
    .replace(/Next\.js/gi, 'NEXTJS_PROTECTED')
    .replace(/Express\.js/gi, 'EXPRESSJS_PROTECTED')
    .replace(/Angular\.js/gi, 'ANGULARJS_PROTECTED')
    .replace(/\.NET/gi, 'DOTNET_PROTECTED')
    .replace(/e\.g\./gi, 'EG_PROTECTED')
    .replace(/i\.e\./gi, 'IE_PROTECTED')
    .replace(/etc\./gi, 'ETC_PROTECTED')
    .replace(/Inc\./gi, 'INC_PROTECTED')
    .replace(/Ltd\./gi, 'LTD_PROTECTED')
    .replace(/Corp\./gi, 'CORP_PROTECTED')
    .replace(/Mr\./gi, 'MR_PROTECTED')
    .replace(/Ms\./gi, 'MS_PROTECTED')
    .replace(/Dr\./gi, 'DR_PROTECTED')
    .replace(/vs\./gi, 'VS_PROTECTED');

  // Split on sentence boundaries (. ! ?) followed by space and capital letter or end of string
  const sents = protectedText.split(/(?<=[.!?])\s+(?=[A-Z]|$)/).filter(Boolean);
  
  // Restore protected abbreviations and filter out very short fragments
  const restored = sents.map(s => {
    return s
      .replace(/REACTJS_PROTECTED/gi, 'React.js')
      .replace(/NODEJS_PROTECTED/gi, 'Node.js')
      .replace(/VUEJS_PROTECTED/gi, 'Vue.js')
      .replace(/NEXTJS_PROTECTED/gi, 'Next.js')
      .replace(/EXPRESSJS_PROTECTED/gi, 'Express.js')
      .replace(/ANGULARJS_PROTECTED/gi, 'Angular.js')
      .replace(/DOTNET_PROTECTED/gi, '.NET')
      .replace(/EG_PROTECTED/gi, 'e.g.')
      .replace(/IE_PROTECTED/gi, 'i.e.')
      .replace(/ETC_PROTECTED/gi, 'etc.')
      .replace(/INC_PROTECTED/gi, 'Inc.')
      .replace(/LTD_PROTECTED/gi, 'Ltd.')
      .replace(/CORP_PROTECTED/gi, 'Corp.')
      .replace(/MR_PROTECTED/gi, 'Mr.')
      .replace(/MS_PROTECTED/gi, 'Ms.')
      .replace(/DR_PROTECTED/gi, 'Dr.')
      .replace(/VS_PROTECTED/gi, 'vs.');
  });
  
  // Filter out fragments that are too short to be meaningful
  // Don't truncate - keep full sentences for personalization cues
  return restored.map(s => s.trim()).filter(b => b.length > 15);
}

function buildQuickSummary({ profile, primaryAbbr, primaryPercentage, finalTalkingPointsExpanded, metrics, posts }) {
  const top3 = (finalTalkingPointsExpanded || []).slice(0, 3).map(tp => tp.topic || tp.title || (tp.whatToSay || '').split('\n')[0]).filter(Boolean);
  const bestChannel = determineBestChannel(posts);
  
  // Use utility function to clean company and title
  const cleanCompany = cleanCompanyOrTitle(profile.company, 'company');
  const cleanTitle = cleanCompanyOrTitle(profile.title, 'title');
  
  return {
    who: `${profile.name || 'Unknown'}${cleanCompany !== 'their organization' ? ' — ' + cleanCompany : ''}${cleanTitle !== 'their role' ? ' (' + cleanTitle + ')' : ''}`,
    primaryDISC: getDISCTypeName(primaryAbbr),
    topTalkingPoints: top3,
    bestOutreachChannel: bestChannel,
    preferredTone: determineWritingTone(posts) || 'Unknown'
  };
}

function determineBestChannel(posts) {
  // Simple heuristic: if many short, social posts then LinkedIn, if long form then Email
  if (!Array.isArray(posts) || posts.length === 0) return 'LinkedIn';
  const avgLen = posts.reduce((a, p) => a + ((p.content || p.text || '').length), 0) / posts.length;
  const exclamations = posts.reduce((a, p) => a + ((p.content || p.text || '').match(/!/g) || []).length, 0);
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
  const stop = new Set(["the", "and", "for", "with", "that", "this", "you", "are", "our", "your", "from", "have", "has", "was", "were", "will", "they", "their", "but", "not", "its", "it's", "what", "which", "who"]);
  const freq = Object.create(null);
  posts.forEach(p => {
    const text = (p.content || p.text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    text.split(/\s+/).forEach(w => {
      if (!w || w.length < 3) return;
      if (stop.has(w)) return;
      freq[w] = (freq[w] || 0) + 1;
    });
  });
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, limit).map(e => e[0]);
}

function computeSentiment(posts) {
  if (!Array.isArray(posts) || posts.length === 0) return 0;
  const positive = ['good', 'great', 'success', 'win', 'improve', 'growth', 'gain', 'love', 'excellent', 'happy'];
  const negative = ['fail', 'problem', 'risk', 'issue', 'concern', 'delay', 'drop', 'loss', 'challenge', 'struggle'];
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
    const key = (tp.topic || tp.why || tp.whatToSay || '').toLowerCase().split(/\s+/).slice(0, 5).join(' ');
    for (let p of posts) {
      const text = (p.content || p.text || '').toLowerCase();
      if (!text) continue;
      if (key && text.includes(key)) {
        results[idx].evidence = `${(p.date || p.createdAt || 'no-date')}: ${(p.content || p.text || '').slice(0, 120)}`;
        break;
      }
    }
  });
  return results;
}

function ensureExpandedTalkingPoints(talkingPoints, { profile, productDescription, productPrice, productType = 'General Product/Service' }) {
  if (!Array.isArray(talkingPoints) || talkingPoints.length === 0) return talkingPoints;

  return talkingPoints.map((tp) => {
    const item = Object.assign({}, tp);
    const product = getShortProductDescription(productDescription || profile?.productDescription || profile?.product || 'the solution');
    const price = productPrice ? formatProductPrice(productPrice) : null;
    const topic = item.topic || item.title || 'this topic';

    const existing = (item.whatToSay || item.description || '').trim();
    const sentenceCount = existing ? existing.split(/(?<=[.!?])\s+/).filter(Boolean).length : 0;

    if (sentenceCount < 4 || existing.length < 240) {
      item.whatToSay = generateTalkingPointDetail({ topic, product, price, seed: sentenceCount > 0 ? existing : null, productType });
    } else {
      item.whatToSay = dedupeTalkingPointText(existing);
    }

    if (!item.why || item.why.length < 60) {
      item.why = item.why && item.why.length > 20 ? item.why : `This addresses ${topic} and directly influences outcomes the buyer is measured on.`;
    }

    if (!Array.isArray(item.importantPoints) || item.importantPoints.length === 0) {
      item.importantPoints = [
        `Lead with ${topic.toLowerCase()} impact`,
        `Quantify the improvement`,
        `Offer a concrete next step`
      ];
    }

    return item;
  }).slice(0, 8);
}

function generateTalkingPointDetail({ topic, product, price, seed, productType = 'General Product/Service' }) {
  const loweredTopic = topic.toLowerCase();
  
  // If seed content exists and is substantial, use it
  if (seed && seed.length > 100) {
    return dedupeTalkingPointText(seed.trim());
  }
  
  // Generate product-type specific talking point content
  const priceStr = price || '';
  
  // Topic-specific openers (avoid generic "benchmark" and "system change" language)
  const topicTemplates = {
    'family lifestyle': `This property creates an ideal environment for your family to thrive. With dedicated spaces for children, social areas for gatherings, and amenities that bring the community together, it's designed for the life stage you're in right now. The spacious layout means everyone has their own space while staying connected.`,
    
    'investment value': `From a financial perspective, this represents a smart asset allocation. Properties in this area have shown consistent appreciation of 8-12% annually, and with ongoing infrastructure development, that trend is likely to continue. ${priceStr ? `At ${priceStr}, you're entering at a favorable point in the market cycle.` : ''} Beyond capital appreciation, you're also building equity with every payment instead of paying rent.`,
    
    'location benefits': `Location defines daily quality of life. You'll be positioned near major employment hubs, cutting commute time significantly—imagine recovering 1-2 hours each day currently lost in traffic. The neighborhood also offers excellent social infrastructure: reputable schools, quality healthcare, shopping, and entertainment all within a short radius, so your family rarely needs to travel far for essentials.`,
    
    'amenities enjoyment': `The amenities here go beyond standard offerings. From a well-equipped fitness center and swimming pool to dedicated spaces for yoga, sports, and children's activities, these facilities save you separate memberships while encouraging a healthier, more active lifestyle. The clubhouse and multipurpose halls also provide spaces for socializing and hosting events without leaving home.`,
    
    'career stability & home ownership': `Your established career provides the financial foundation to make this move confidently. Home loan rates are favorable for salaried professionals, and locking in property at today's prices protects you from future appreciation. Ownership also brings tax benefits and builds long-term wealth through equity—advantages that renting simply can't match. This is your chance to transition from paying someone else's mortgage to building your own asset.`,
    
    'location & commute convenience': `Proximity to your workplace transforms daily life. Instead of spending hours in traffic, you'll reclaim that time for family, fitness, or relaxation. This location offers direct connectivity to major tech corridors and business districts via metro, expressways, and arterial roads. Your commute could drop from 90+ minutes to just 20-30 minutes each way—that's 10+ hours back in your week.`,
    
    'space utilization': `The floor plan is intelligently designed to maximize usable space. Each room has a clear purpose, storage is built-in, and natural light flows throughout. Whether you need a home office, a play area for kids, or guest accommodation, the layout adapts to your family's evolving needs without feeling cramped.`,
    
    'security & safety': `This community prioritizes resident safety with 24/7 security personnel, CCTV monitoring, controlled access points, and well-lit common areas. For families with children or elderly members, this peace of mind is invaluable. You can let kids play in designated areas or return home late from work without safety concerns.`,
    
    'modern amenities': `The property is built to contemporary standards with quality fixtures, efficient plumbing, reliable electrical systems, and provisions for modern conveniences like high-speed internet and smart home integration. This means fewer maintenance headaches and a living experience that matches your tech-savvy lifestyle.`,
    
    'community living': `Being part of an established community brings intangible benefits—neighbors become friends, children find playmates, and there's always someone to help in a pinch. Community events, festivals, and shared spaces foster connections that enrich daily life beyond just four walls.`
  };
  
  // Try to match the topic to a template (case-insensitive, partial match)
  let content = null;
  for (const [key, template] of Object.entries(topicTemplates)) {
    if (loweredTopic.includes(key) || key.includes(loweredTopic)) {
      content = template;
      break;
    }
  }
  
  // Fallback for topics not matching templates
  if (!content) {
    content = `Regarding ${topic}, this offering addresses a key consideration in your decision process. ${product}${priceStr ? ` at ${priceStr}` : ''} delivers tangible value in this area, with features and benefits aligned to your needs. The advantages become clear when you compare this to alternatives—you get more for your investment while securing long-term benefits that compound over time.`;
  }
  
  return content;
}

function dedupeTalkingPointText(text) {
  if (!text) return '';
  const paragraphs = String(text)
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean);

  const unique = [];
  const seen = new Set();
  paragraphs.forEach((para) => {
    const normalized = para.toLowerCase().replace(/[^a-z0-9]+/g, ' ');
    if (!seen.has(normalized)) {
      seen.add(normalized);
      unique.push(para);
    }
  });

  return unique.join('\n\n');
}

function sanitizeOpeningScripts(openingScripts, profile, productDescription, productPrice) {
  const name = profile?.name || profile?.fullName || 'there';
  const title = profile?.title || profile?.role || '';
  const company = profile?.company || profile?.organization || '';
  const product = getShortProductDescription(productDescription || 'the offer');
  const price = productPrice ? formatProductPrice(productPrice) : null;

  const cleanPlaceholder = (text) => {
    if (!text) return '';
    let out = String(text);
    out = out.replace(/Title not found/gi, title || 'your role');
    out = out.replace(/Company not found/gi, company || 'your team');
    out = out.replace(/\s+/g, ' ').trim();
    out = out.replace(/\bthe offer\b/gi, product);
    if (price) out = out.replace(/₹\s*2,00,00,000/gi, price);
    return out;
  };

  const normalizeList = (list) => Array.isArray(list) ? list.map(s => cleanPlaceholder(s)).filter(Boolean) : [];

  const emailList = Array.isArray(openingScripts.email)
    ? openingScripts.email.map(e => {
        if (e && typeof e === 'object') {
          return {
            subject: cleanPlaceholder(e.subject || ''),
            body: cleanPlaceholder(e.body || '')
          };
        }
        return null;
      }).filter(Boolean)
    : [];

  return {
    linkedin_dm: normalizeList(openingScripts.linkedin_dm),
    phone: normalizeList(openingScripts.phone),
    whatsapp: normalizeList(openingScripts.whatsapp),
    email: emailList
  };
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

  // Format as Indian Rupees
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: numericPrice % 1 === 0 ? 0 : 2,
    minimumFractionDigits: numericPrice % 1 === 0 ? 0 : 2
  });

  return formatter.format(numericPrice);
}

function generateFallbackPersonalizationCues({ profile, productDescription, productPrice }) {
  const contactName = profile?.name || 'the prospect';
  const company = cleanCompanyOrTitle(profile?.company, 'company');
  const role = cleanCompanyOrTitle(profile?.title, 'title');
  const product = getShortProductDescription(productDescription || profile?.productDescription || profile?.product || 'our solution');
  const price = productPrice ? formatProductPrice(productPrice) : null;
  
  // Detect product type for more relevant cues
  const productType = detectProductType(productDescription);
  const desc = String(productDescription || '').toLowerCase();
  
  // Extract property-specific details for real estate
  let propertyDetails = '';
  let locationInfo = '';
  let amenitiesHighlight = '';
  
  if (productType === 'Real Estate Property' && productDescription) {
    // Extract location
    const locationMatch = desc.match(/(in|at)\s+([a-z\s,]+(?:hyderabad|bangalore|mumbai|delhi|pune|chennai|kolkata)[a-z\s,]*)/i);
    if (locationMatch) {
      locationInfo = locationMatch[2].trim();
    }
    
    // Extract key features
    const bhkMatch = desc.match(/(\d+)\s*bhk/);
    const sqftMatch = desc.match(/(\d+[,\d]*)\s*sq\.?\s*ft/);
    const readyToMove = desc.includes('ready to move');
    
    if (bhkMatch || sqftMatch) {
      propertyDetails = `This ${bhkMatch ? bhkMatch[0] : 'property'} ${sqftMatch ? 'spanning ' + sqftMatch[1] + ' sq.ft.' : ''} ${readyToMove ? 'is ready for immediate possession' : ''}.`.trim();
    }
    
    // Extract amenities
    if (desc.includes('clubhouse') || desc.includes('swimming pool') || desc.includes('gymnasium')) {
      amenitiesHighlight = 'with premium amenities including clubhouse, swimming pool, and fitness facilities';
    }
  }
  
  const cues = [
    `When reaching out to ${contactName}, start with a friendly acknowledgment of their ${role !== 'their role' ? 'impressive career as ' + role : 'professional background'}${company !== 'their organization' ? ' at ' + company : ''}. ${productType === 'Real Estate Property' ? 'You might say, "' + contactName + ', I admire your work' + (company !== 'their organization' ? ' at ' + company : '') + ' and ' + (role !== 'their role' ? 'your commitment to ' + (role.toLowerCase().includes('lead') || role.toLowerCase().includes('manager') ? 'leading your team' : 'excellence in your field') : 'your professional journey') + '." This shows you\'ve done your research and helps build initial rapport.' : 'This shows genuine interest and builds rapport. Mention a specific aspect of their background that connects to what you\'re offering.'}`,
    
    price 
      ? `Mention the price of ${price} as a strategic investment ${productType === 'Real Estate Property' ? `for ${contactName}'s family's future` : 'rather than just a cost'}. ${productType === 'Real Estate Property' && locationInfo ? `Emphasize the long-term appreciation potential of the property in the thriving ${locationInfo} market.` : 'Position it in terms of long-term value, ROI potential, and how it compares to alternatives in the market.'} Connect ${role !== 'their role' ? `${contactName}'s career stability` : 'their professional standing'} and ${productType === 'Real Estate Property' ? 'family aspirations' : 'financial goals'} to the investment opportunity. ${productType === 'Real Estate Property' ? 'Emphasize how home loan rates are favorable for salaried professionals and how investing now locks in today\'s prices.' : 'Emphasize payment flexibility, financing options, or phased approaches if relevant to reduce sticker shock.'}`
      : `Focus on the value proposition and tangible outcomes this delivers. Frame benefits in terms of time saved, problems solved, or opportunities unlocked. Use concrete examples and metrics wherever possible. Show how this investment pays for itself through specific gains they'll experience. Connect the value directly to challenges someone in their role typically faces.`,
    
    `Incorporate social proof by referencing successful ${productType === 'Real Estate Property' ? 'families' : 'professionals or companies'} who have made similar ${productType === 'Real Estate Property' ? 'investments in the area' : 'decisions'}, enhancing the emotional appeal. Use phrases like ${productType === 'Real Estate Property' ? `"Imagine ${contactName !== 'the prospect' ? 'your' : 'the'} family enjoying ${propertyDetails || amenitiesHighlight ? 'the spacious living area and community amenities' : 'the property'}"` : `"Many ${role} professionals have found..." or "Teams like yours have experienced..."`} to create ${productType === 'Real Estate Property' ? 'vivid imagery and' : ''} peer validation. Share specific success stories, testimonials, or case studies that mirror their context. This reduces perceived risk and helps them visualize their own success with your offering.`,
    
    `Avoid overly technical jargon ${productType === 'Real Estate Property' ? 'that may disengage them; instead, focus on the lifestyle and emotional benefits of the property' : 'or feature lists that may disengage them. Instead, focus on outcomes and emotional benefits that resonate with their situation'}. Steer clear of ${productType === 'Real Estate Property' ? 'any negative comparisons with other properties that may undermine the unique value of this offering' : 'negative comparisons with competitors that sound defensive or unprofessional'}. Don't rush to close - build trust first. Avoid assumptions about their budget, timeline, or decision-making process without asking. Keep language conversational and respectful, not pushy or aggressive.`,
    
    `Use language that reflects confidence without arrogance. Phrases like "I'd love to show you how..." or "Let me share what's worked for others like you..." invite collaboration. ${productType === 'Real Estate Property' ? `For property viewings, suggest "Would you and your family be available for a site visit this weekend?" to involve decision-makers.` : `Frame next steps as low-commitment: "Would a quick 15-minute call work?" or "Can I send you a brief overview?"`} Make it easy for them to say yes. Mirror their communication style where possible - if they're formal, match that; if casual, adjust accordingly.`,
    
    `Keep all communications concise and respect their time. Busy professionals like ${role} appreciate brevity. Get to the point quickly, deliver value upfront, and make the call-to-action crystal clear. ${productType === 'Real Estate Property' ? `Highlight location advantages, investment potential, and lifestyle benefits in every touchpoint.` : ''} Follow up persistently but not annoyingly - space out touchpoints and bring new value in each interaction. Track what resonates and adjust your approach based on their responses or lack thereof.`
  ];
  
  return cues.filter(Boolean).slice(0, 8);
}

function fallbackPrimaryStyle(primaryType, productDescription) {
  const product = getShortProductDescription(productDescription || 'the solution');
  return `Lead with ${getDISCTypeName(primaryType)} priorities: open with quantified outcomes, confirm how ${product} delivers value within their timeline, and set clear next steps. Keep language decisive, demonstrate readiness to move quickly, and emphasize that evaluation will be efficient and focused.`;
}

function fallbackSecondaryStyle(secondaryType) {
  return `Reinforce through ${getDISCTypeName(secondaryType)} perspective: use collaborative language, provide social proof, and offer easy-to-share materials. Respect their validation process, outline how communication will flow, and create space for questions so the process feels supportive.`;
}

function fallbackApproachGuidance(primaryType, secondaryType, productDescription, productPrice) {
  const product = getShortProductDescription(productDescription || 'the solution');
  const pricePhrase = productPrice ? ` at ${formatProductPrice(productPrice)}` : '';
  return `Open with a ${getDISCTypeName(primaryType)}-focused hook highlighting the key outcome ${product}${pricePhrase} delivers. Include one relevant proof point.

Address ${getDISCTypeName(secondaryType)} concerns by outlining implementation clarity and available support. Offer detailed documentation without overwhelming upfront.

Pre-empt objections by offering a diagnostic session or trial. Emphasize helping them achieve results efficiently.

Close by requesting a 20-minute working session and confirm next steps immediately.`;
}

function fallbackProfileSummary({ profile, primaryType, secondaryType, productDescription, productPrice }) {
  const name = profile?.name || 'This prospect';
  const company = cleanCompanyOrTitle(profile?.company, 'company');
  const role = cleanCompanyOrTitle(profile?.title, 'title');
  const product = getShortProductDescription(productDescription || 'the solution');
  const pricePhrase = productPrice ? ` at ${formatProductPrice(productPrice)}` : '';

  return `${name}${company !== 'their organization' ? ` at ${company}` : ''} as ${role} shows ${getDISCTypeName(primaryType)} primary traits with ${getDISCTypeName(secondaryType)} secondary characteristics. They value clear, results-focused communication. Position ${product}${pricePhrase} as a solution that delivers measurable outcomes with minimal friction. Provide implementation clarity and proof points to support their decision-making process.`;
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
  // Use utility function to clean company and role
  const company = cleanCompanyOrTitle(profile?.company, 'company');
  const role = cleanCompanyOrTitle(profile?.title, 'title');
  
  const name = profile?.name || 'the prospect';
  const location = profile?.location || '';
  const product = getShortProductDescription(productDescription || profile?.productDescription || profile?.product || 'the product');
  const price = productPrice ? formatProductPrice(productPrice) : null;
  
  // Detect product type and return appropriate talking points
  const productType = detectProductType(productDescription);
  
  if (productType === 'Real Estate Property') {
    return generateRealEstateTalkingPoints({ profile, productDescription, productPrice, name, role, location, product, price });
  }
  
  if (productType === 'Automotive') {
    return generateAutomotiveTalkingPoints({ profile, productDescription, productPrice, name, role, product, price });
  }
  
  if (productType === 'Financial Product') {
    return generateFinancialTalkingPoints({ profile, productDescription, productPrice, name, role, product, price });
  }
  
  if (productType === 'Education/Training') {
    return generateEducationTalkingPoints({ profile, productDescription, productPrice, name, role, product, price });
  }
  
  if (productType === 'Healthcare/Wellness') {
    return generateHealthcareTalkingPoints({ profile, productDescription, productPrice, name, role, product, price });
  }
  
  if (productType === 'Consumer Electronics') {
    return generateElectronicsTalkingPoints({ profile, productDescription, productPrice, name, role, product, price });
  }
  
  if (productType === 'Software/SaaS') {
    return generateSaaSTalkingPoints({ profile, productDescription, productPrice, name, role, company, product, price });
  }
  
  // General product talking points for any other product type
  return generateGeneralProductTalkingPoints({ profile, productDescription, productPrice, name, role, company, product, price, productType });
}

function generateGeneralProductTalkingPoints({ profile, productDescription, productPrice, name, role, company, product, price, productType }) {
  return [
    {
      topic: 'Value proposition',
      why: `As a ${role}, ${name} would be interested in how this product addresses their specific needs and delivers value.`,
      whatToSay: `Based on your professional background, ${product}${price ? ` at ${price}` : ''} could be a great fit for your requirements. Let me highlight the key benefits that would matter most to you.`,
      evidence: 'Profile-based',
      importantPoints: [
        'Personalized value proposition',
        'Connect product to their needs',
        'Highlight relevant benefits'
      ]
    },
    {
      topic: 'Quality & reliability',
      why: `Professionals value quality and reliability in their purchasing decisions.`,
      whatToSay: `This ${productType.toLowerCase()} stands out for its quality and reliability. Many customers in similar roles have found it exceeds their expectations.`,
      evidence: 'Product features',
      importantPoints: [
        'Quality assurance',
        'Reliability track record',
        'Customer satisfaction'
      ]
    },
    {
      topic: 'Investment & ROI',
      why: `${name} would want to understand the return on their investment.`,
      whatToSay: `${price ? `At ${price}, ` : ''}this represents excellent value when you consider the benefits and long-term returns. Let me walk you through the value you'd receive.`,
      evidence: 'Value analysis',
      importantPoints: [
        'Clear value proposition',
        'Long-term benefits',
        'Cost-benefit analysis'
      ]
    },
    {
      topic: 'Convenience & support',
      why: `Busy professionals appreciate convenience and good support.`,
      whatToSay: `We make the entire process seamless - from selection to delivery to after-sales support. You'll have dedicated assistance throughout.`,
      evidence: 'Service offering',
      importantPoints: [
        'Seamless process',
        'Dedicated support',
        'Hassle-free experience'
      ]
    },
    {
      topic: 'Why now',
      why: `Creating urgency helps move decisions forward.`,
      whatToSay: `This is a great time to consider this - current conditions are favorable, and early action ensures you get the best value and availability.`,
      evidence: 'Market conditions',
      importantPoints: [
        'Favorable timing',
        'Current availability',
        'Early action benefits'
      ]
    },
    {
      topic: 'Next steps',
      why: `Clear next steps help move the conversation forward.`,
      whatToSay: `I'd love to discuss this further and answer any questions. Would a brief call work for you this week to explore how this fits your needs?`,
      evidence: 'Process overview',
      importantPoints: [
        'Schedule discussion',
        'Answer questions',
        'Personalized exploration'
      ]
    }
  ];
}

function generateSaaSTalkingPoints({ profile, productDescription, productPrice, name, role, company, product, price }) {
  return [
    {
      topic: company ? `Strategic outcomes at ${company}` : 'Strategic outcomes',
      why: `${role} is accountable for protecting headline metrics; anything that compresses time-to-impact is top priority.`,
      whatToSay: `You own the scoreboard for ${company}. ${product}${price ? ` at ${price}` : ''} cuts the cycle between idea and execution so you can report measurable impact this quarter.\n\nWe've seen similar organizations reduce their deployment time by 40-60%, which directly translates to faster time-to-market for critical initiatives.\n\nI can walk you through a 10-minute overview of the implementation roadmap and expected lift. Would you be available for a brief working session next week to explore how this maps to your current priorities?`,
      evidence: 'Profile-based',
      importantPoints: [
        'Focus on measurable impact',
        'Highlight speed to execution',
        'Connect to quarterly goals'
      ]
    },
    {
      topic: 'Operational efficiency',
      why: 'Leaders stay alert to process drag and hidden coordination costs.',
      whatToSay: `${product} removes manual checkpoints, keeps stakeholders aligned, and frees capacity without adding headcount${price ? `, all within a ${price} envelope` : ''}.\n\nYour team can redirect an estimated 15-20 hours per week from routine coordination to high-value strategic work.\n\nThe automation layer handles repetitive workflows while providing real-time visibility across all stakeholders, eliminating status update meetings and reducing back-and-forth communications by up to 70%.`,
      evidence: 'Profile-based',
      importantPoints: [
        'Remove manual checkpoints',
        'Align stakeholders',
        'Free up capacity'
      ]
    },
    {
      topic: 'Cross-functional alignment',
      why: 'Winning initiatives pair go-to-market velocity with delivery confidence.',
      whatToSay: `Frame the rollout as a co-owned sprint between GTM and Ops. Offer a shared dashboard template so everyone sees progress in real time.\n\nWe provide pre-built collaboration templates that have helped teams reduce cross-functional friction by establishing clear ownership, shared KPIs, and automated status updates.\n\nThis approach ensures both revenue teams and delivery teams are working from the same playbook, with built-in checkpoints that catch misalignment early before it impacts customer outcomes.`,
      evidence: 'Internal alignment playbook',
      importantPoints: [
        'Frame as co-owned sprint',
        'Offer shared dashboard',
        'Ensure real-time visibility'
      ]
    },
    {
      topic: 'Proof and comparables',
      why: 'Champions need peer validation to unlock internal approval.',
      whatToSay: `Share a quick hit case study with identical KPIs and call out the timeline from kickoff to first ROI signal. Provide references on request.\n\nWe have documented success stories from three companies in similar segments, all showing 3-5x ROI within the first 6 months of deployment.\n\nI can connect you with a current customer who recently went through the evaluation process - they can speak candidly about implementation challenges, actual vs. projected outcomes, and lessons learned.`,
      evidence: 'Case study reference',
      importantPoints: [
        'Share relevant case study',
        'Highlight timeline to ROI',
        'Provide references'
      ]
    },
    {
      topic: 'Budget framing',
      why: 'Stakeholders want to see cost mapped to stack consolidation or revenue lift.',
      whatToSay: `Position ${product} as a swap, not a net-new line item. Outline which spend it replaces and the forecasted payback date${price ? ` at ${price}` : ''}.\n\nMost clients consolidate 2-4 existing tools, which offsets 60-80% of the investment while gaining significantly more capability.\n\nThe typical payback period is 8-12 months through a combination of license consolidation, reduced manual effort, and faster execution cycles. I can map this specifically to your current tool stack in a brief discovery session.`,
      evidence: 'Financial model',
      importantPoints: [
        'Position as a swap',
        'Outline spend replacement',
        'Forecast payback date'
      ]
    },
    {
      topic: 'Clear next steps',
      why: 'Momentum stalls without a guided path forward.',
      whatToSay: `Suggest a 20-minute working session with agenda, owners, and success criteria so we exit with an agreed evaluation plan.\n\nWe'll come prepared with a tailored agenda covering your specific use cases, technical requirements, and success metrics.\n\nBy the end of the session, you'll have a clear 30-60-90 day rollout plan with defined milestones, resource requirements, and decision points. This ensures everyone is aligned before moving forward.`,
      evidence: 'Process overview',
      importantPoints: [
        'Suggest working session',
        'Define success criteria',
        'Agree on evaluation plan'
      ]
    }
  ];
}

function generateAutomotiveTalkingPoints({ profile, productDescription, productPrice, name, role, product, price }) {
  const desc = (productDescription || '').toLowerCase();
  const isElectric = desc.includes('electric') || desc.includes('ev') || desc.includes('hybrid');
  const isSUV = desc.includes('suv') || desc.includes('crossover');
  
  return [
    {
      topic: 'Professional image & lifestyle fit',
      why: `As a ${role}, ${name}'s vehicle reflects their professional success and personal style.`,
      whatToSay: `This ${product} aligns perfectly with your professional standing${price ? ` at ${price}` : ''}. It makes a statement while offering the comfort and features you deserve.\n\nThe design reflects modern sophistication that resonates with successful professionals, while the interior provides a premium environment for both work commutes and weekend getaways.\n\nMany of our clients in similar roles have found that this vehicle strikes the perfect balance between professional presence and personal enjoyment.`,
      evidence: 'Profile-based',
      importantPoints: [
        'Professional image enhancement',
        'Lifestyle alignment',
        'Status and comfort'
      ]
    },
    {
      topic: 'Daily commute & convenience',
      why: `Working professionals spend significant time commuting; comfort and efficiency matter.`,
      whatToSay: `Imagine transforming your daily commute into a comfortable, enjoyable experience. ${isElectric ? 'With minimal running costs and zero emissions, this vehicle can save you up to 70% on fuel expenses.' : 'The exceptional fuel efficiency means fewer stops at the pump and lower monthly running costs.'}\n\nAdvanced features like adaptive cruise control, lane assist, and premium sound system make even traffic-heavy commutes more relaxed and productive.\n\nYou'll arrive at work refreshed instead of stressed, and have more energy for what matters after work. That's valuable time and peace of mind you can't put a price on.`,
      evidence: 'Feature benefits',
      importantPoints: [
        'Comfortable commute',
        isElectric ? 'Low running costs' : 'Fuel efficiency',
        'Daily convenience'
      ]
    },
    {
      topic: 'Safety & family considerations',
      why: `${name} likely prioritizes safety for themselves and their family.`,
      whatToSay: `Safety is paramount - this ${product} comes with advanced safety features including multiple airbags, ABS, ESP, and ${isSUV ? 'enhanced stability control with better visibility from the elevated seating position.' : 'collision avoidance systems.'}\n\nIt has achieved top safety ratings in crash tests, giving you complete peace of mind whether you're driving to work or taking the family on weekend trips.\n\nThe active safety features work continuously in the background, protecting you from potential hazards and helping prevent accidents before they happen.`,
      evidence: 'Safety features',
      importantPoints: [
        'Advanced safety features',
        'Family protection',
        'Peace of mind'
      ]
    },
    {
      topic: 'Value & resale',
      why: `Smart buyers consider total cost of ownership and resale value.`,
      whatToSay: `${price ? `At ${price}, ` : ''}this represents excellent value with strong resale potential. The brand's reputation for reliability and build quality ensures your investment holds well over time.\n\nHistorically, this model retains 65-70% of its value after 3 years, which is significantly above the industry average. That means lower depreciation and better returns when you decide to upgrade.\n\nThe total cost of ownership - including maintenance, insurance, and resale value - makes this one of the smartest financial decisions in this segment.`,
      evidence: 'Market analysis',
      importantPoints: [
        'Strong resale value',
        'Brand reliability',
        'Total cost of ownership'
      ]
    },
    {
      topic: 'Financing & offers',
      why: `Attractive financing can make the decision easier.`,
      whatToSay: `We have attractive financing options with interest rates starting from 7.5% and flexible EMI plans tailored to your budget. Let me show you how manageable this can be on a monthly basis.\n\nWith a 20% down payment, your monthly EMI could be as low as what you might currently spend on ride-sharing services, fuel, and vehicle maintenance combined.\n\nPlus, we're currently running a special offer with zero processing fees and complimentary insurance for the first year${price ? `, making the effective cost significantly lower than the ${price} sticker price` : ''}.`,
      evidence: 'Financing options',
      importantPoints: [
        'Competitive interest rates',
        'Flexible EMI options',
        'Special offers'
      ]
    },
    {
      topic: 'Test drive & next steps',
      why: `Experience drives purchase decisions in automotive.`,
      whatToSay: `Nothing beats experiencing this vehicle firsthand. The responsive handling, smooth ride quality, and advanced features really come alive when you're behind the wheel.\n\nI can arrange a test drive at your preferred location - whether that's our showroom, your office, or even your home on a weekend. We'll let you drive your typical route so you can see exactly how it fits your daily life.\n\nMany clients find that a 30-minute test drive answers all their questions better than hours of research. When would be most convenient for you?`,
      evidence: 'Process',
      importantPoints: [
        'Schedule test drive',
        'Convenient location',
        'Personalized experience'
      ]
    }
  ];
}

function generateFinancialTalkingPoints({ profile, productDescription, productPrice, name, role, product, price }) {
  return [
    {
      topic: 'Financial security & planning',
      why: `As a ${role}, ${name} likely values financial security and smart planning for the future.`,
      whatToSay: `With your career trajectory, this is the ideal time to strengthen your financial foundation. ${product} offers the security and growth your portfolio needs.`,
      evidence: 'Profile-based',
      importantPoints: [
        'Financial security',
        'Future planning',
        'Portfolio strengthening'
      ]
    },
    {
      topic: 'Tax benefits & savings',
      why: `Professionals in ${name}'s position often look for tax-efficient investments.`,
      whatToSay: `Beyond the returns, this product offers significant tax benefits under applicable sections. It's a smart way to grow wealth while reducing tax burden.`,
      evidence: 'Tax benefits',
      importantPoints: [
        'Tax efficiency',
        'Wealth growth',
        'Double benefit'
      ]
    },
    {
      topic: 'Family protection & legacy',
      why: `Protecting family and building legacy are key motivators for financial decisions.`,
      whatToSay: `This ensures your family is protected no matter what, while building a corpus for future goals like children's education or retirement${price ? ` with an investment of ${price}` : ''}.`,
      evidence: 'Coverage benefits',
      importantPoints: [
        'Family protection',
        'Future goals funding',
        'Legacy building'
      ]
    },
    {
      topic: 'Returns & comparison',
      why: `Smart investors compare options before committing.`,
      whatToSay: `Compared to traditional options, this offers superior risk-adjusted returns. Let me show you a comparison with your current investments.`,
      evidence: 'Performance data',
      importantPoints: [
        'Competitive returns',
        'Risk management',
        'Performance track record'
      ]
    },
    {
      topic: 'Flexibility & liquidity',
      why: `Flexibility in financial products provides comfort and control.`,
      whatToSay: `You maintain control with flexible options - whether it's partial withdrawals, loan facility, or adjustment of coverage. Your money remains accessible when needed.`,
      evidence: 'Product features',
      importantPoints: [
        'Flexible options',
        'Liquidity features',
        'Control over investment'
      ]
    },
    {
      topic: 'Getting started',
      why: `Simplifying the process encourages action.`,
      whatToSay: `The process is simple and can be completed online. I can walk you through it in 15 minutes and have you covered immediately.`,
      evidence: 'Process',
      importantPoints: [
        'Simple process',
        'Quick completion',
        'Immediate benefits'
      ]
    }
  ];
}

function generateEducationTalkingPoints({ profile, productDescription, productPrice, name, role, product, price }) {
  return [
    {
      topic: 'Career advancement',
      why: `As a ${role}, ${name} would benefit from upskilling to advance their career.`,
      whatToSay: `This ${product} is designed for professionals like you who want to accelerate their career growth. Alumni have seen significant career progression within months of completion.`,
      evidence: 'Profile-based',
      importantPoints: [
        'Career acceleration',
        'Alumni success stories',
        'Professional growth'
      ]
    },
    {
      topic: 'Industry relevance',
      why: `Staying current with industry trends is crucial for professional success.`,
      whatToSay: `The curriculum is designed with industry input and updated regularly. You'll learn skills that are in high demand right now and for the foreseeable future.`,
      evidence: 'Curriculum design',
      importantPoints: [
        'Industry-aligned curriculum',
        'In-demand skills',
        'Future-proof learning'
      ]
    },
    {
      topic: 'Learning flexibility',
      why: `Working professionals need flexible learning options.`,
      whatToSay: `Designed for busy professionals - learn at your own pace with weekend sessions and online access. It won't disrupt your current work commitments.`,
      evidence: 'Program structure',
      importantPoints: [
        'Flexible schedule',
        'Work-life balance',
        'Self-paced options'
      ]
    },
    {
      topic: 'ROI on education',
      why: `Education is an investment; professionals want to understand the returns.`,
      whatToSay: `${price ? `At ${price}, ` : ''}this program typically pays for itself within the first year through salary increase or new opportunities. Many participants see 30-50% salary growth.`,
      evidence: 'Alumni outcomes',
      importantPoints: [
        'Quick payback',
        'Salary growth potential',
        'New opportunities'
      ]
    },
    {
      topic: 'Networking & community',
      why: `Professional networks are valuable career assets.`,
      whatToSay: `You'll join a community of ambitious professionals from leading companies. The networking and peer learning often prove as valuable as the coursework itself.`,
      evidence: 'Community benefits',
      importantPoints: [
        'Professional networking',
        'Peer learning',
        'Alumni community'
      ]
    },
    {
      topic: 'Enrollment process',
      why: `Clear next steps encourage enrollment.`,
      whatToSay: `Enrollment is straightforward. I can help you with the application and answer any questions. Would you like to start with a counseling session to explore the fit?`,
      evidence: 'Process',
      importantPoints: [
        'Simple enrollment',
        'Guidance available',
        'Counseling session'
      ]
    }
  ];
}

function generateHealthcareTalkingPoints({ profile, productDescription, productPrice, name, role, product, price }) {
  return [
    {
      topic: 'Health & well-being',
      why: `As a ${role}, ${name} needs to maintain good health to perform at their best.`,
      whatToSay: `Your health is your most valuable asset. ${product} helps you stay at your best, ensuring you have the energy and wellness to excel in your career and personal life.`,
      evidence: 'Profile-based',
      importantPoints: [
        'Health as priority',
        'Performance optimization',
        'Work-life wellness'
      ]
    },
    {
      topic: 'Convenience & accessibility',
      why: `Busy professionals need convenient healthcare solutions.`,
      whatToSay: `We understand your time is valuable. Our services are designed for busy professionals with flexible scheduling, online consultations, and quick turnarounds.`,
      evidence: 'Service features',
      importantPoints: [
        'Flexible scheduling',
        'Online options',
        'Time-efficient'
      ]
    },
    {
      topic: 'Expert care & quality',
      why: `Quality and expertise matter in healthcare decisions.`,
      whatToSay: `You'll have access to top specialists and evidence-based treatments. We focus on quality outcomes, not just quick fixes${price ? ` - all within your budget of ${price}` : ''}.`,
      evidence: 'Quality credentials',
      importantPoints: [
        'Expert specialists',
        'Evidence-based approach',
        'Quality outcomes'
      ]
    },
    {
      topic: 'Preventive approach',
      why: `Prevention is better than cure, especially for busy professionals.`,
      whatToSay: `Our approach emphasizes prevention - catching issues early when they're easier and less expensive to address. It's an investment in your long-term health.`,
      evidence: 'Preventive care',
      importantPoints: [
        'Early detection',
        'Cost-effective prevention',
        'Long-term health'
      ]
    },
    {
      topic: 'Personalized care',
      why: `Personalized healthcare delivers better outcomes.`,
      whatToSay: `We create a personalized plan based on your health profile, lifestyle, and goals. No one-size-fits-all approach - this is tailored specifically for you.`,
      evidence: 'Personalization',
      importantPoints: [
        'Tailored approach',
        'Lifestyle consideration',
        'Individual goals'
      ]
    },
    {
      topic: 'Getting started',
      why: `Easy first steps encourage commitment.`,
      whatToSay: `Start with an initial consultation to assess your needs and create a roadmap. Would you like to schedule a convenient time this week?`,
      evidence: 'Process',
      importantPoints: [
        'Initial consultation',
        'Health roadmap',
        'Convenient scheduling'
      ]
    }
  ];
}

function generateElectronicsTalkingPoints({ profile, productDescription, productPrice, name, role, product, price }) {
  return [
    {
      topic: 'Professional productivity',
      why: `As a ${role}, ${name} needs technology that enhances their professional effectiveness.`,
      whatToSay: `This ${product} is built for professionals who need reliability and performance. It will help you work more efficiently and stay ahead${price ? ` - excellent value at ${price}` : ''}.`,
      evidence: 'Profile-based',
      importantPoints: [
        'Professional-grade performance',
        'Reliability',
        'Productivity enhancement'
      ]
    },
    {
      topic: 'Features & performance',
      why: `Technical specifications matter for informed decisions.`,
      whatToSay: `The key specs set this apart - let me highlight the features that would matter most for your usage: performance, battery life, and build quality.`,
      evidence: 'Specifications',
      importantPoints: [
        'Key specifications',
        'Performance highlights',
        'Usage alignment'
      ]
    },
    {
      topic: 'Brand & reliability',
      why: `Brand trust influences electronics purchases.`,
      whatToSay: `This comes from a brand known for quality and reliability. Strong after-sales support and warranty coverage give you peace of mind with your investment.`,
      evidence: 'Brand reputation',
      importantPoints: [
        'Trusted brand',
        'Warranty coverage',
        'After-sales support'
      ]
    },
    {
      topic: 'Value comparison',
      why: `Buyers compare options before deciding.`,
      whatToSay: `${price ? `At ${price}, ` : ''}this offers the best value in its segment when you compare features, performance, and build quality with alternatives.`,
      evidence: 'Competitive analysis',
      importantPoints: [
        'Best-in-segment value',
        'Feature comparison',
        'Quality justification'
      ]
    },
    {
      topic: 'Ecosystem & compatibility',
      why: `Integration with existing devices matters.`,
      whatToSay: `It integrates seamlessly with your existing devices and workflows. No compatibility headaches - everything works together smoothly.`,
      evidence: 'Compatibility',
      importantPoints: [
        'Seamless integration',
        'Device ecosystem',
        'Workflow compatibility'
      ]
    },
    {
      topic: 'Purchase & delivery',
      why: `Convenient purchasing encourages decisions.`,
      whatToSay: `We offer quick delivery and easy setup support. If you'd like, I can also arrange a demo so you can experience it firsthand before deciding.`,
      evidence: 'Process',
      importantPoints: [
        'Quick delivery',
        'Setup support',
        'Demo option'
      ]
    }
  ];
}

function generateRealEstateTalkingPoints({ profile, productDescription, productPrice, name, role, location, product, price }) {
  // Extract property details from description
  const desc = (productDescription || '').toLowerCase();
  const hasAmenities = desc.includes('amenities') || desc.includes('clubhouse') || desc.includes('swimming pool');
  const hasParking = desc.includes('parking');
  const isReadyToMove = desc.includes('ready to move') || desc.includes('ready-to-move');
  
  return [
    {
      topic: 'Career stability & home ownership',
      why: `As a ${role}, ${name} likely has stable income and may be considering investing in property for long-term financial security and family comfort.`,
      whatToSay: `With your established career as ${role}, this could be the right time to invest in a home that offers both comfort and appreciation${price ? ` at ${price}` : ''}. This property is in a prime location with excellent connectivity.\n\nYour stable income profile makes you eligible for attractive home loan rates, and investing in property now locks in today's prices while the area continues developing.\n\nThis isn't just a home - it's a tangible asset that typically appreciates 8-12% annually in this locality, building long-term wealth for your family while providing the comfort of owning your own space.`,
      evidence: 'Profile-based',
      importantPoints: [
        'Stable career supports home loan eligibility',
        'Property as long-term investment',
        'Prime location benefits'
      ]
    },
    {
      topic: 'Location & commute convenience',
      why: `Proximity to IT hubs and workplaces is crucial for working professionals to maintain work-life balance.`,
      whatToSay: `This property offers excellent connectivity to major IT corridors and business districts${location ? ` in ${location}` : ''}. Imagine cutting your daily commute time by 30-45 minutes each way.\n\nYou're just 15-20 minutes from major tech parks, with easy access to metro stations, expressways, and main roads. This means less time stuck in traffic and more quality time at home with family.\n\nThe area also has excellent social infrastructure - top schools, hospitals, shopping centers, and entertainment options within a 5 km radius, so you rarely need to travel far for daily needs.`,
      evidence: 'Profile-based',
      importantPoints: [
        'Proximity to IT hubs',
        'Reduced commute time',
        'Better work-life balance'
      ]
    },
    {
      topic: 'Investment appreciation',
      why: `Real estate in developing areas typically appreciates well, making it both a home and an investment.`,
      whatToSay: `Properties in this area have shown consistent appreciation of 10-15% year-over-year over the past 3 years${price ? `. At ${price}, ` : ', '}this is positioned well for both immediate living and future value growth.\n\nWith upcoming infrastructure projects including a new metro line and IT corridor expansion, property values are projected to increase significantly over the next 2-3 years.\n\nYou're essentially getting dual benefits - a comfortable home to live in now, plus an appreciating asset that builds wealth. Many investors in this locality have seen their property values double within 5-7 years.`,
      evidence: 'Market analysis',
      importantPoints: [
        'Consistent area appreciation',
        'Dual benefit: home + investment',
        'Future value growth potential'
      ]
    },
    {
      topic: hasAmenities ? 'Lifestyle amenities' : 'Quality of life',
      why: `Modern professionals value amenities that support health, relaxation, and family activities without leaving the community.`,
      whatToSay: hasAmenities 
        ? `The property includes world-class amenities - clubhouse, swimming pool, gymnasium, and recreational spaces - perfect for unwinding after work and weekend family activities.\n\nNo need to spend on external gym memberships or drive to sports clubs. Everything you need for fitness, recreation, and socializing is right within your community.\n\nThese amenities aren't just facilities - they're lifestyle enablers. Imagine a morning swim before work, evening gym session, or weekend pool parties with neighbors. It's resort-style living every single day.`
        : `This property offers a comfortable living environment with quality construction and thoughtful design for modern family living.\n\nThe developer has focused on quality over quantity - premium fittings, earthquake-resistant structure, proper ventilation, and ample natural light in every room.\n\nYou'll appreciate the attention to detail in the layout, storage solutions, and the overall construction quality that ensures low maintenance and long-term durability.`,
      evidence: 'Property features',
      importantPoints: [
        'On-site recreational facilities',
        'Health and wellness amenities',
        'Family-friendly environment'
      ]
    },
    {
      topic: 'Family space & growth',
      why: `A growing career often means growing family needs - space for children, elderly parents, or a home office.`,
      whatToSay: `The spacious layout accommodates evolving family needs - whether it's a dedicated study area for work-from-home days, a play zone for children, or an extra room for visiting parents.\n\nWith the rise of hybrid work models, having a proper home office space isn't just nice to have - it's essential. This property provides that flexibility without compromising on living areas.\n\nAs your family grows, you won't need to move or feel cramped. The thoughtful design ensures everyone has their personal space while maintaining comfortable common areas for family time.`,
      evidence: 'Profile-based',
      importantPoints: [
        'Flexible space usage',
        'Room for family growth',
        'Home office potential'
      ]
    },
    {
      topic: isReadyToMove ? 'Immediate possession' : 'Next steps to ownership',
      why: isReadyToMove 
        ? `Ready-to-move properties eliminate construction delays and allow immediate planning.`
        : `Understanding the buying process helps prospects make informed decisions.`,
      whatToSay: isReadyToMove
        ? `This is a ready-to-move property - no waiting, no construction uncertainty. You could be celebrating your housewarming within weeks of decision.`
        : `I'd be happy to walk you through the property, discuss financing options, and answer any questions. When would be convenient for a site visit?`,
      evidence: 'Property status',
      importantPoints: [
        isReadyToMove ? 'No construction wait time' : 'Clear buying process',
        'Immediate planning possible',
        'Site visit scheduling'
      ]
    }
  ];
}

function getShortProductDescription(description) {
  if (!description) return 'the solution';
  const str = String(description).trim().toLowerCase();
  
  // Detect product type and return a clean, concise product name
  const productType = detectProductType(description);
  
  // For Software/SaaS, extract service type
  if (productType === 'Software/SaaS') {
    if (str.includes('full stack') || str.includes('fullstack')) return 'Full Stack Development Services';
    if (str.includes('web app') || str.includes('web application')) return 'Web Application Development';
    if (str.includes('mobile app')) return 'Mobile App Development';
    if (str.includes('custom software')) return 'Custom Software Solutions';
    if (str.includes('software maintenance')) return 'Software Maintenance Services';
    if (str.includes('saas')) return 'SaaS Platform';
    if (str.includes('api development')) return 'API Development Services';
    if (str.includes('devops')) return 'DevOps Services';
    if (str.includes('cloud')) return 'Cloud Solutions';
    if (str.includes('qa') || str.includes('testing')) return 'QA & Testing Services';
    if (str.includes('ai') || str.includes('machine learning')) return 'AI/ML Solutions';
    if (str.includes('data')) return 'Data Solutions';
    return 'Software Development Services';
  }
  
  // For Real Estate
  if (productType === 'Real Estate Property') {
    const bhkMatch = str.match(/(\d+)\s*bhk/i);
    if (bhkMatch) return `${bhkMatch[1]} BHK Property`;
    if (str.includes('villa')) return 'Villa';
    if (str.includes('apartment')) return 'Apartment';
    if (str.includes('plot')) return 'Plot/Land';
    return 'Property';
  }
  
  // For Automotive
  if (productType === 'Automotive') {
    if (str.includes('suv')) return 'SUV';
    if (str.includes('sedan')) return 'Sedan';
    if (str.includes('bike') || str.includes('motorcycle')) return 'Motorcycle';
    return 'Vehicle';
  }
  
  // For Financial products
  if (productType === 'Financial Product') {
    if (str.includes('insurance')) return 'Insurance Plan';
    if (str.includes('mutual fund')) return 'Mutual Fund';
    if (str.includes('loan')) return 'Loan Product';
    return 'Financial Product';
  }
  
  // For Education
  if (productType === 'Education/Training') {
    if (str.includes('course')) return 'Training Course';
    if (str.includes('certification')) return 'Certification Program';
    if (str.includes('bootcamp')) return 'Bootcamp';
    return 'Training Program';
  }
  
  // For Healthcare
  if (productType === 'Healthcare/Wellness') {
    if (str.includes('gym') || str.includes('fitness')) return 'Fitness Membership';
    if (str.includes('therapy')) return 'Therapy Services';
    return 'Wellness Solution';
  }
  
  // For Electronics
  if (productType === 'Consumer Electronics') {
    if (str.includes('laptop')) return 'Laptop';
    if (str.includes('smartphone') || str.includes('phone')) return 'Smartphone';
    if (str.includes('television') || str.includes('tv')) return 'Television';
    return 'Electronic Device';
  }
  
  // Default: try to extract first meaningful phrase
  const original = String(description).trim();
  if (original.length < 40) return original;
  
  // Look for pattern like "X services" or "X solutions" 
  const serviceMatch = original.match(/([A-Za-z\s]+(?:services?|solutions?|product|platform|system))/i);
  if (serviceMatch && serviceMatch[1].length < 50) return serviceMatch[1].trim();
  
  return 'this solution';
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
  const name = profile?.name || 'the prospect';
  const price = productPrice ? formatProductPrice(productPrice) : null;
  
  // Detect product type for relevant objections
  const productType = detectProductType(productDescription);
  
  if (productType === 'Real Estate Property') {
    return generateRealEstateObjectionHandling({ profile, productDescription, productPrice, name, role, price });
  }
  
  if (productType === 'Automotive') {
    return generateAutomotiveObjectionHandling({ profile, productDescription, productPrice, name, role, price });
  }
  
  if (productType === 'Financial Product') {
    return generateFinancialObjectionHandling({ profile, productDescription, productPrice, name, role, price });
  }
  
  if (productType === 'Education/Training') {
    return generateEducationObjectionHandling({ profile, productDescription, productPrice, name, role, price });
  }
  
  if (productType === 'Healthcare/Wellness') {
    return generateHealthcareObjectionHandling({ profile, productDescription, productPrice, name, role, price });
  }
  
  if (productType === 'Consumer Electronics') {
    return generateElectronicsObjectionHandling({ profile, productDescription, productPrice, name, role, price });
  }
  
  // For Software/SaaS and other B2B products
  if (productType === 'Software/SaaS' || productType === 'B2B Services') {
    return generateB2BObjectionHandling({ profile, productDescription, productPrice, name, role, company, price });
  }
  
  // General product objections
  return generateGeneralObjectionHandling({ profile, productDescription, productPrice, name, role, price, productType });
}

function generateGeneralObjectionHandling({ profile, productDescription, productPrice, name, role, price, productType }) {
  return [
    {
      objection: 'The price seems high',
      rationale: `${name} may be comparing with alternatives or has budget constraints.`,
      response: `I understand price is an important consideration. ${price ? `At ${price}, ` : ''}this offers excellent value when you consider the quality, features, and long-term benefits. Let me walk you through what makes this worth the investment.`
    },
    {
      objection: 'I need to think about it',
      rationale: `${name} wants time to evaluate options or discuss with others.`,
      response: `Absolutely, take your time. To help with your decision, I can share additional information or answer specific questions you might have. What aspects would you like more clarity on?`
    },
    {
      objection: 'I\'m not sure if I need this',
      rationale: `${name} hasn't fully connected the product value to their needs.`,
      response: `That's a fair point. Let me understand your current situation better - what challenges are you facing that prompted your initial interest? I can then show you exactly how this addresses those needs.`
    },
    {
      objection: 'I\'m looking at other options',
      rationale: `${name} is doing due diligence before committing.`,
      response: `That's smart - comparing options is important. I'd be happy to help you understand how we compare on the parameters that matter most to you. What factors are most important in your decision?`
    },
    {
      objection: 'The timing isn\'t right',
      rationale: `${name} has other priorities or constraints right now.`,
      response: `I understand. When would be a better time to revisit this? Meanwhile, I can keep you updated on any new developments or offers that might be relevant.`
    },
    {
      objection: 'I\'ve had bad experiences before',
      rationale: `Past negative experiences create hesitation and trust issues.`,
      response: `I appreciate you sharing that. We prioritize customer satisfaction and have measures in place to ensure a positive experience. Can I share some customer testimonials and our support process?`
    }
  ];
}

function generateB2BObjectionHandling({ profile, productDescription, productPrice, name, role, company, price }) {
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
      response: `Let's co-create a two-slide deck highlighting team-specific wins, include your stakeholders' names, and offer to join the call to cover the heavy lifting.`
    },
    {
      objection: 'Not convinced on ROI yet',
      rationale: `${role} wants proof tied to their KPIs before advocating internally.`,
      response: `We will bring metric-level benchmarks, share a customer intro, and build a forecast with your assumptions so you see exactly when the solution hits break-even.`
    }
  ];
}

function generateAutomotiveObjectionHandling({ profile, productDescription, productPrice, name, role, price }) {
  return [
    {
      objection: 'The price is beyond my budget',
      rationale: `${name} may have a specific budget in mind or is comparing with other vehicles.`,
      response: `I understand budget is important. ${price ? `At ${price}, ` : ''}we have flexible financing options that can make this very affordable on a monthly basis. Let me show you the EMI options - you might be surprised how manageable it can be.`
    },
    {
      objection: 'I want to compare with other brands',
      rationale: `${name} is doing due diligence before making a significant purchase.`,
      response: `That's wise for such an important decision. I can help you with a detailed comparison on the parameters that matter - safety, mileage, features, resale value, and total cost of ownership. What aspects are most important to you?`
    },
    {
      objection: 'I\'m concerned about maintenance costs',
      rationale: `Long-term ownership costs are a valid consideration.`,
      response: `Valid concern. This vehicle actually has lower maintenance costs compared to competitors. We also offer service packages that lock in maintenance costs for years. Let me share the details.`
    },
    {
      objection: 'I need to discuss with my family',
      rationale: `Vehicle purchases typically involve family consultation.`,
      response: `Of course, it's a family decision. Why don't we schedule a test drive where your family can join? They can experience the space, comfort, and safety features firsthand. When would work?`
    },
    {
      objection: 'I\'m waiting for the new model',
      rationale: `${name} wants to ensure they get the latest version.`,
      response: `I appreciate you thinking long-term. The current model offers excellent value, and we can discuss trade-in options when the new model arrives. Plus, current offers make this the best time to buy.`
    }
  ];
}

function generateFinancialObjectionHandling({ profile, productDescription, productPrice, name, role, price }) {
  return [
    {
      objection: 'I\'m not sure about the returns',
      rationale: `${name} wants clarity on expected financial outcomes.`,
      response: `That's a fair concern. Let me show you historical performance data and realistic projections. We focus on risk-adjusted returns that match your goals, not unrealistic promises.`
    },
    {
      objection: 'I already have investments elsewhere',
      rationale: `${name} has existing financial commitments.`,
      response: `That's great that you're already investing. This can complement your portfolio by addressing a different need - whether it's insurance coverage, tax savings, or diversification. Let me show you how it fits.`
    },
    {
      objection: 'The lock-in period is too long',
      rationale: `Liquidity concerns are common with financial products.`,
      response: `I understand the need for flexibility. This product offers partial withdrawal options and loan facilities against your investment. Your money isn't completely locked - let me explain the liquidity features.`
    },
    {
      objection: 'I don\'t trust financial products',
      rationale: `Past experiences or general skepticism about financial services.`,
      response: `Trust is crucial in financial decisions. We're regulated by [relevant authority], and I can share our track record, customer testimonials, and claim settlement ratios. Transparency is our priority.`
    },
    {
      objection: 'I need to consult my CA/financial advisor',
      rationale: `${name} relies on professional advice for financial decisions.`,
      response: `That's prudent. I'd be happy to speak with your advisor directly and provide all documentation they need. We can also include them in our next discussion. When would be a good time?`
    }
  ];
}

function generateEducationObjectionHandling({ profile, productDescription, productPrice, name, role, price }) {
  return [
    {
      objection: 'I don\'t have time for this',
      rationale: `${name} as a ${role} has a busy schedule.`,
      response: `We've designed this specifically for working professionals. With weekend classes and self-paced modules, you can learn without disrupting your work. Many of our successful participants had similar time constraints.`
    },
    {
      objection: 'Is this certification valued in the industry?',
      rationale: `${name} wants assurance about industry recognition.`,
      response: `Great question. This program is recognized by leading companies, and our alumni work at top organizations. Let me share some placement statistics and alumni testimonials from your industry.`
    },
    {
      objection: 'The fee is too high',
      rationale: `${name} is evaluating ROI on education investment.`,
      response: `${price ? `At ${price}, ` : ''}this is an investment in your career. Our alumni typically see 30-50% salary growth within a year. We also offer EMI options and sometimes scholarships. Let me check what's available for you.`
    },
    {
      objection: 'I can learn this online for free',
      rationale: `Free resources are available but lack structured learning.`,
      response: `Free resources are great for basics, but this program offers structured learning, industry projects, mentorship, and most importantly - a recognized certification and career support. These make the difference in career outcomes.`
    },
    {
      objection: 'I\'m not sure if this is the right program',
      rationale: `${name} has uncertainty about program fit.`,
      response: `Let's discuss your career goals in detail. I can then show you exactly how this program maps to your objectives and share stories of professionals with similar backgrounds who've benefited.`
    }
  ];
}

function generateHealthcareObjectionHandling({ profile, productDescription, productPrice, name, role, price }) {
  return [
    {
      objection: 'I\'m not sure if this is effective',
      rationale: `${name} wants evidence of outcomes.`,
      response: `Valid concern. We use evidence-based approaches with proven results. Let me share success stories and outcome data from patients with similar needs. We're confident because we've seen consistent results.`
    },
    {
      objection: 'The cost is too high',
      rationale: `Healthcare costs can be significant.`,
      response: `${price ? `At ${price}, ` : ''}this is an investment in your health. We offer payment plans, and many of our services may be covered by insurance. Health is priceless, but let me help make this affordable.`
    },
    {
      objection: 'I\'m already seeing another doctor/provider',
      rationale: `${name} has existing healthcare relationships.`,
      response: `That's fine - we often work alongside other providers. Our approach can complement your existing care. With your permission, we can even coordinate with your current doctor for better outcomes.`
    },
    {
      objection: 'I don\'t think I need this right now',
      rationale: `${name} may be underestimating the need or delaying care.`,
      response: `Prevention is always better than cure. Addressing health concerns early is typically easier and less expensive. Let's at least do an initial assessment - you can decide from there with full information.`
    },
    {
      objection: 'I\'m nervous about the procedure/process',
      rationale: `Healthcare anxiety is common.`,
      response: `It's completely normal to feel that way. Let me walk you through exactly what to expect - most patients find the actual experience much easier than anticipated. We prioritize your comfort throughout.`
    }
  ];
}

function generateElectronicsObjectionHandling({ profile, productDescription, productPrice, name, role, price }) {
  return [
    {
      objection: 'It\'s too expensive',
      rationale: `${name} is comparing with lower-priced alternatives.`,
      response: `${price ? `At ${price}, ` : ''}this offers premium quality and features. When you factor in durability, performance, and resale value, it's actually more cost-effective long-term than cheaper alternatives that need frequent replacement.`
    },
    {
      objection: 'I can get similar specs for less',
      rationale: `${name} is focused on specifications.`,
      response: `Specs are important, but so is build quality, after-sales support, and real-world performance. Let me show you comparison reviews and explain what makes this worth the premium - it's not just about numbers on paper.`
    },
    {
      objection: 'I want to wait for the next version',
      rationale: `${name} wants the latest technology.`,
      response: `Technology always evolves, but this current version offers excellent value and the features you need now. Waiting means missing out on productivity gains today. Plus, we have good trade-in programs if you upgrade later.`
    },
    {
      objection: 'What if it has problems?',
      rationale: `${name} is concerned about reliability and support.`,
      response: `We offer comprehensive warranty and excellent after-sales support. Our service network ensures quick resolution if any issues arise. Let me share the warranty details and our service commitment.`
    },
    {
      objection: 'I need to research more',
      rationale: `${name} wants more information before deciding.`,
      response: `Take your time. I can share detailed reviews, comparison sheets, and demo videos. If you'd like, I can also arrange a hands-on demo so you can experience it yourself before deciding.`
    }
  ];
}


function generateRealEstateObjectionHandling({ profile, productDescription, productPrice, name, role, price }) {
  return [
    {
      objection: 'The price is too high for my budget',
      rationale: `${name} as a ${role} may have budget constraints or is comparing with other properties in the market.`,
      response: `I understand budget is a key consideration. ${price ? `At ${price}, ` : ''}this property offers excellent value considering the location, amenities, and appreciation potential. We also have flexible payment plans and can connect you with preferred banking partners for competitive home loan rates.`
    },
    {
      objection: 'I need to think about it / discuss with family',
      rationale: `Property purchase is a major family decision requiring consensus from spouse and potentially parents.`,
      response: `Absolutely, this is a significant decision. I'd suggest bringing your family for a site visit so they can experience the property firsthand. We can arrange a convenient weekend visit and answer all questions together.`
    },
    {
      objection: 'I\'m not sure about the location',
      rationale: `${name} may have concerns about commute distance, neighborhood development, or future infrastructure.`,
      response: `This area is strategically located with upcoming infrastructure projects. Let me share the development roadmap showing planned metro lines, roads, and commercial zones. Many IT professionals have chosen this area for its balance of peaceful living and workplace accessibility.`
    },
    {
      objection: 'I\'m looking at other properties too',
      rationale: `${name} is doing due diligence and comparing multiple options before committing.`,
      response: `That's smart - comparing options is essential for such an important decision. I'd be happy to provide a comparison sheet highlighting how this property stacks up on key parameters like price per sq.ft., amenities, builder reputation, and location advantages.`
    },
    {
      objection: 'The timing isn\'t right for me',
      rationale: `${name} may be waiting for a promotion, bonus, or has other financial commitments currently.`,
      response: `I understand timing is crucial. Property prices in this area have been appreciating steadily, and current interest rates are favorable. We offer booking with a small token amount to lock in today's price while you finalize your finances.`
    },
    {
      objection: 'I\'m concerned about the builder/developer',
      rationale: `Trust in the builder's delivery track record and quality is important for any property buyer.`,
      response: `A very valid concern. This project is by a reputed developer with a strong track record of on-time delivery. I can share their portfolio of completed projects, customer testimonials, and RERA registration details.`
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

  switch (dominantTrait) {
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

  switch (primaryArea.area) {
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
  switch (category) {
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

  // Use utility function to clean title
  const cleanTitle = cleanCompanyOrTitle(profile.current_position?.title || profile.title, 'title');

  return {
    profileName: profile.name || 'Unknown',
    title: cleanTitle,
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
  switch (primaryAbbr) {
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
  switch (preferredChannel?.toLowerCase()) {
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
  switch (primaryAbbr) {
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

  switch (primaryAbbr) {
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

// Helper to check if a value has actual data
function hasActualData(value) {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value) && value.length === 0) return false;
  if (typeof value === 'object' && Object.keys(value).length === 0) return false;
  return true;
}

function buildCompanyOverview(productDescription, productPrice) {
  const defaultOverview = {
    companyName: 'Our Solution',
    specializations: [
      'Tailored engagement that adapts to client needs',
      'Quality-first delivery model with measurable ROI',
      'Dedicated support team that stays beyond launch'
    ],
    keyFeatures: [
      'Full-cycle delivery with planning, build, and support',
      'Transparent collaboration with shared milestones',
      'Outcome-based success metrics for every engagement'
    ],
    pricingModel: productPrice ? formatProductPrice(productPrice) : 'Not specified'
  };

  if (!productDescription) {
    return defaultOverview;
  }

  const desc = String(productDescription).trim();
  const companyName = getShortProductDescription(productDescription) || 'Our Solution';
  const points = extractKeyPointsFromDescription(desc, 6);

  const specializations = points.slice(0, Math.min(3, points.length));
  const remaining = points.slice(specializations.length);
  const keyFeatures = remaining.length > 0 ? remaining.slice(0, 3) : points.slice(0, Math.min(3, points.length));

  return {
    companyName,
    specializations: specializations.length ? specializations : defaultOverview.specializations,
    keyFeatures: keyFeatures.length ? keyFeatures : defaultOverview.keyFeatures,
    pricingModel: productPrice ? formatProductPrice(productPrice) : 'Not specified'
  };
}

function extractKeyPointsFromDescription(description, maxPoints = 6) {
  if (!description) return [];

  const cleaned = String(description)
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ' ')
    .trim();

  if (!cleaned) return [];

  const rawChunks = cleaned
    .split(/(?<=[.!?])\s+|,|;|\n+/)
    .map(chunk => chunk.trim())
    .filter(chunk => chunk.length >= 15 && chunk.length <= 200);

  const uniquePoints = [];
  rawChunks.forEach(chunk => {
    const normalized = chunk.replace(/\s+/g, ' ').trim();
    if (normalized && !uniquePoints.some(existing => existing.toLowerCase() === normalized.toLowerCase())) {
      uniquePoints.push(normalized);
    }
  });

  return uniquePoints.slice(0, maxPoints);
}

function normalizeCompanyOverview(overview, productDescription, productPrice) {
  const fallback = buildCompanyOverview(productDescription, productPrice);

  if (!overview || typeof overview !== 'object') {
    return fallback;
  }

  const sanitizeList = (list) => {
    if (!Array.isArray(list)) return [];
    return list
      .map(item => String(item || '').trim())
      .filter(item => item.length >= 10)
      .slice(0, 3);
  };

  const specializations = sanitizeList(overview.specializations);
  const keyFeatures = sanitizeList(overview.keyFeatures);

  const ensureLength = (target, backup) => {
    const result = [...target];
    for (const item of backup) {
      if (result.length >= 3) break;
      if (!result.some(existing => existing.toLowerCase() === item.toLowerCase())) {
        result.push(item);
      }
    }
    return result.length ? result : backup.slice(0, 3);
  };

  return {
    companyName: String(overview.companyName || fallback.companyName || '').trim() || fallback.companyName,
    specializations: ensureLength(specializations, fallback.specializations),
    keyFeatures: ensureLength(keyFeatures, fallback.keyFeatures),
    pricingModel: overview.pricingModel || fallback.pricingModel
  };
}

function buildRealEstateOverview(productDescription) {
  const desc = productDescription || '';
  
  // Extract property details
  const propertyName = extractPropertyName(desc);
  const location = extractLocation(desc);
  const propertyType = extractPropertyType(desc);
  const size = extractPropertySize(desc);
  const bedrooms = extractBedrooms(desc);
  const amenities = extractAmenities(desc);
  const highlights = extractPropertyHighlights(desc);
  
  const overview = {
    productType: 'Real Estate Property',
    propertyName: propertyName,
    location: location,
    propertyType: propertyType,
    size: size,
    configuration: bedrooms,
    amenities: amenities,
    highlights: highlights
  };

  // Filter out null values and empty arrays to only show fields with actual data
  const filtered = {};
  Object.keys(overview).forEach(key => {
    if (hasActualData(overview[key])) {
      filtered[key] = overview[key];
    }
  });

  // Always include productType
  if (!filtered.productType) {
    filtered.productType = 'Real Estate Property';
  }

  return filtered;
}

function extractPropertyName(text) {
  // Look for property/project names like "My Home Tridasa", "DLF The Crest", etc.
  const patterns = [
    /(?:in|at)\s+([A-Z][a-zA-Z\s]+(?:Towers?|Heights?|Residency|Gardens?|Villas?|Park|Estate|Enclave|City|Plaza|Square|Court|Apartments?|Homes?))/gi,
    /([A-Z][a-zA-Z]+\s+(?:Towers?|Heights?|Residency|Gardens?|Villas?|Park|Estate|Enclave|City|Plaza|Square))/gi,
    /(?:project|property)\s+(?:name[d]?\s+)?([A-Z][a-zA-Z\s]+)/gi
  ];
  
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      return matches[0].replace(/^(?:in|at)\s+/i, '').trim();
    }
  }
  return null;
}

function extractLocation(text) {
  // Look for location patterns
  const patterns = [
    /(?:in|at|located\s+(?:in|at))\s+([A-Z][a-zA-Z\s,]+(?:Hyderabad|Bangalore|Mumbai|Delhi|Chennai|Pune|Kolkata|Noida|Gurgaon|Gurugram|Ahmedabad|Jaipur|Lucknow|Chandigarh|Kochi|Indore|Nagpur|Vizag|Coimbatore|Thiruvananthapuram))/gi,
    /([A-Z][a-zA-Z]+,\s*[A-Z][a-zA-Z]+(?:,\s*[A-Z][a-zA-Z]+)?)/g
  ];
  
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      return matches[0].replace(/^(?:in|at|located\s+(?:in|at))\s+/i, '').trim();
    }
  }
  return null;
}

function extractPropertyType(text) {
  const lower = text.toLowerCase();
  if (lower.includes('villa')) return 'Villa';
  if (lower.includes('penthouse')) return 'Penthouse';
  if (lower.includes('duplex')) return 'Duplex';
  if (lower.includes('studio')) return 'Studio Apartment';
  if (lower.includes('plot') || lower.includes('land')) return 'Plot/Land';
  if (lower.includes('apartment') || lower.includes('flat') || lower.includes('bhk')) return 'Apartment';
  if (lower.includes('house') || lower.includes('home')) return 'House';
  return 'Residential Property';
}

function extractPropertySize(text) {
  const patterns = [
    /(\d{1,5}(?:,\d{3})*\s*(?:sq\.?\s*ft\.?|sqft|square\s*feet))/gi,
    /(\d{1,5}(?:,\d{3})*\s*(?:sq\.?\s*m\.?|sqm|square\s*meters?))/gi
  ];
  
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      return matches[0].trim();
    }
  }
  return null;
}

function extractBedrooms(text) {
  const patterns = [
    /(\d+)\s*BHK/gi,
    /(\d+)\s*(?:bed(?:room)?s?)/gi
  ];
  
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      const num = matches[0].match(/\d+/);
      if (num) return `${num[0]} BHK`;
    }
  }
  return null;
}

function extractAmenities(text) {
  const amenities = [];
  const amenityKeywords = [
    'swimming pool', 'pool', 'gymnasium', 'gym', 'clubhouse', 'club house',
    'parking', 'garden', 'park', 'playground', 'play area', 'children\'s play',
    'jogging track', 'walking track', 'sports', 'tennis', 'badminton', 'squash',
    'yoga', 'meditation', 'spa', 'sauna', 'library', 'reading room',
    'community hall', 'banquet', 'party hall', 'multipurpose hall',
    'security', '24/7', 'cctv', 'intercom', 'power backup', 'generator',
    'lift', 'elevator', 'water supply', 'rain water', 'sewage treatment',
    'landscaping', 'terrace', 'balcony', 'pooja room', 'servant room',
    'food court', 'supermarket', 'pharmacy', 'creche', 'guest room'
  ];
  
  const lower = text.toLowerCase();
  amenityKeywords.forEach(keyword => {
    if (lower.includes(keyword)) {
      // Capitalize first letter of each word
      const formatted = keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      if (!amenities.includes(formatted)) {
        amenities.push(formatted);
      }
    }
  });
  
  return amenities.length > 0 ? amenities.slice(0, 10) : null;
}

function extractPropertyHighlights(text) {
  const highlights = [];
  const highlightPatterns = [
    /ready\s+to\s+move/gi,
    /under\s+construction/gi,
    /(\d+)\s*(?:floor|storey)/gi,
    /west[\s-]?facing|east[\s-]?facing|north[\s-]?facing|south[\s-]?facing/gi,
    /semi[\s-]?furnished|fully[\s-]?furnished|unfurnished/gi,
    /(\d+)\s*(?:car\s+)?parking/gi,
    /corner\s+(?:unit|flat|apartment)/gi,
    /(\d+)%?\s*open\s*space/gi,
    /vastu\s+compliant/gi,
    /gated\s+community/gi,
    /premium|luxury|affordable/gi
  ];
  
  highlightPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const formatted = match.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        if (!highlights.includes(formatted)) {
          highlights.push(formatted);
        }
      });
    }
  });
  
  return highlights.length > 0 ? highlights.slice(0, 6) : null;
}

function buildAutomotiveOverview(productDescription) {
  const desc = productDescription || '';
  const overview = {
    productType: 'Automotive',
    vehicleType: extractVehicleType(desc),
    brand: extractBrand(desc),
    keyFeatures: extractVehicleFeatures(desc),
    specifications: extractVehicleSpecs(desc)
  };

  // Filter out null values and empty arrays to only show fields with actual data
  const filtered = {};
  Object.keys(overview).forEach(key => {
    if (hasActualData(overview[key])) {
      filtered[key] = overview[key];
    }
  });

  // Always include productType
  if (!filtered.productType) {
    filtered.productType = 'Automotive';
  }

  return filtered;
}

function extractVehicleType(text) {
  const lower = text.toLowerCase();
  if (lower.includes('suv')) return 'SUV';
  if (lower.includes('sedan')) return 'Sedan';
  if (lower.includes('hatchback')) return 'Hatchback';
  if (lower.includes('mpv') || lower.includes('muv')) return 'MPV';
  if (lower.includes('crossover')) return 'Crossover';
  if (lower.includes('coupe')) return 'Coupe';
  if (lower.includes('convertible')) return 'Convertible';
  if (lower.includes('truck') || lower.includes('pickup')) return 'Truck/Pickup';
  if (lower.includes('motorcycle') || lower.includes('bike')) return 'Motorcycle';
  if (lower.includes('scooter')) return 'Scooter';
  return 'Vehicle';
}

function extractBrand(text) {
  const brands = ['Toyota', 'Honda', 'Hyundai', 'Maruti', 'Suzuki', 'Tata', 'Mahindra', 'Kia', 'MG', 'Volkswagen', 'Skoda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes', 'Audi', 'Lexus', 'Jaguar', 'Land Rover', 'Porsche', 'Ferrari', 'Lamborghini', 'Tesla', 'Nissan', 'Renault', 'Jeep', 'Volvo'];
  for (const brand of brands) {
    if (text.toLowerCase().includes(brand.toLowerCase())) {
      return brand;
    }
  }
  return null;
}

function extractVehicleFeatures(text) {
  const features = [];
  const featureKeywords = ['airbag', 'abs', 'esp', 'cruise control', 'sunroof', 'touchscreen', 'bluetooth', 'navigation', 'parking sensor', 'camera', 'leather', 'alloy', 'led', 'automatic', 'manual', 'cvt', 'dct'];
  const lower = text.toLowerCase();
  featureKeywords.forEach(keyword => {
    if (lower.includes(keyword)) {
      features.push(keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
    }
  });
  return features.length > 0 ? features : null;
}

function extractVehicleSpecs(text) {
  const specs = {};
  const engineMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:cc|litre|liter|L)/i);
  if (engineMatch) specs.engine = engineMatch[0];
  const powerMatch = text.match(/(\d+)\s*(?:hp|bhp|ps)/i);
  if (powerMatch) specs.power = powerMatch[0];
  const mileageMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:km\/l|kmpl|mpg)/i);
  if (mileageMatch) specs.mileage = mileageMatch[0];
  return Object.keys(specs).length > 0 ? specs : null;
}

function buildEducationOverview(productDescription) {
  const desc = productDescription || '';
  const overview = {
    productType: 'Education/Training',
    programName: extractProgramName(desc),
    duration: extractDuration(desc),
    mode: extractLearningMode(desc),
    keyFeatures: extractEducationFeatures(desc)
  };

  // Filter out null values and empty arrays to only show fields with actual data
  const filtered = {};
  Object.keys(overview).forEach(key => {
    if (hasActualData(overview[key])) {
      filtered[key] = overview[key];
    }
  });

  // Always include productType
  if (!filtered.productType) {
    filtered.productType = 'Education/Training';
  }

  return filtered;
}

function extractProgramName(text) {
  const patterns = [
    /(?:course|program|certification|diploma|degree)\s+(?:in|on)\s+([^.]+)/gi,
    /([A-Z][a-zA-Z\s]+(?:Bootcamp|Course|Program|Certification|Training|Masterclass))/gi
  ];
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) return matches[0].trim();
  }
  return null;
}

function extractDuration(text) {
  const patterns = [
    /(\d+)\s*(?:month|week|year|hour|day)s?/gi,
    /(\d+)\s*-\s*(\d+)\s*(?:month|week)s?/gi
  ];
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) return matches[0].trim();
  }
  return null;
}

function extractLearningMode(text) {
  const lower = text.toLowerCase();
  if (lower.includes('online') && lower.includes('offline')) return 'Hybrid';
  if (lower.includes('online')) return 'Online';
  if (lower.includes('offline') || lower.includes('classroom') || lower.includes('in-person')) return 'Offline/Classroom';
  if (lower.includes('self-paced')) return 'Self-paced';
  return null;
}

function extractEducationFeatures(text) {
  const features = [];
  const keywords = ['certification', 'placement', 'job assistance', 'live project', 'mentor', 'doubt clearing', 'lifetime access', 'certificate', 'industry expert', 'hands-on', 'practical'];
  const lower = text.toLowerCase();
  keywords.forEach(keyword => {
    if (lower.includes(keyword)) {
      features.push(keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
    }
  });
  return features.length > 0 ? features : null;
}

function buildFinancialOverview(productDescription) {
  const overview = {
    productType: 'Financial Product',
    keyFeatures: extractKeyFeatures(productDescription),
    pricingModel: extractPricingModel(productDescription)
  };

  // Filter out null values and empty arrays to only show fields with actual data
  const filtered = {};
  Object.keys(overview).forEach(key => {
    if (hasActualData(overview[key])) {
      filtered[key] = overview[key];
    }
  });

  // Always include productType
  if (!filtered.productType) {
    filtered.productType = 'Financial Product';
  }

  return filtered;
}

function buildHealthcareOverview(productDescription) {
  const overview = {
    productType: 'Healthcare/Wellness',
    keyFeatures: extractKeyFeatures(productDescription),
    specializations: extractSpecializations(productDescription)
  };

  // Filter out null values and empty arrays to only show fields with actual data
  const filtered = {};
  Object.keys(overview).forEach(key => {
    if (hasActualData(overview[key])) {
      filtered[key] = overview[key];
    }
  });

  // Always include productType
  if (!filtered.productType) {
    filtered.productType = 'Healthcare/Wellness';
  }

  return filtered;
}

function buildElectronicsOverview(productDescription) {
  const overview = {
    productType: 'Consumer Electronics',
    keyFeatures: extractKeyFeatures(productDescription),
    specifications: extractElectronicsSpecs(productDescription)
  };

  // Filter out null values and empty arrays to only show fields with actual data
  const filtered = {};
  Object.keys(overview).forEach(key => {
    if (hasActualData(overview[key])) {
      filtered[key] = overview[key];
    }
  });

  // Always include productType
  if (!filtered.productType) {
    filtered.productType = 'Consumer Electronics';
  }

  return filtered;
}

function extractElectronicsSpecs(text) {
  const specs = {};
  const ramMatch = text.match(/(\d+)\s*(?:GB|MB)\s*(?:RAM)/i);
  if (ramMatch) specs.ram = ramMatch[0];
  const storageMatch = text.match(/(\d+)\s*(?:GB|TB)\s*(?:storage|SSD|HDD)/i);
  if (storageMatch) specs.storage = storageMatch[0];
  const displayMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:inch|")\s*(?:display|screen)?/i);
  if (displayMatch) specs.display = displayMatch[0];
  const batteryMatch = text.match(/(\d+)\s*(?:mAh|Wh)/i);
  if (batteryMatch) specs.battery = batteryMatch[0];
  return Object.keys(specs).length > 0 ? specs : null;
}

/**
 * Build comprehensive overview for Software/SaaS products
 */
function buildSoftwareOverview(productDescription) {
  const desc = productDescription || '';
  
  const overview = {
    productType: 'Software/SaaS',
    serviceType: extractSoftwareServiceType(desc),
    technologies: extractTechnologies(desc),
    serviceOfferings: extractSoftwareServices(desc),
    keyBenefits: extractSoftwareBenefits(desc),
    deliveryModel: extractDeliveryModel(desc),
    supportDetails: extractSupportDetails(desc)
  };

  // Filter out null values and empty arrays to only show fields with actual data
  const filtered = {};
  Object.keys(overview).forEach(key => {
    if (hasActualData(overview[key])) {
      filtered[key] = overview[key];
    }
  });

  // Always include productType
  if (!filtered.productType) {
    filtered.productType = 'Software/SaaS';
  }

  return filtered;
}

function extractSoftwareServiceType(text) {
  const lower = text.toLowerCase();
  
  // Check for specific service types
  if (lower.includes('full stack') || lower.includes('fullstack')) return 'Full Stack Development';
  if (lower.includes('mobile app') || lower.includes('mobile development')) return 'Mobile App Development';
  if (lower.includes('web app') || lower.includes('web development')) return 'Web Application Development';
  if (lower.includes('maintenance') && lower.includes('support')) return 'Software Maintenance & Support';
  if (lower.includes('software maintenance')) return 'Software Maintenance';
  if (lower.includes('custom software')) return 'Custom Software Development';
  if (lower.includes('saas') || lower.includes('software as a service')) return 'SaaS Solution';
  if (lower.includes('api') && lower.includes('development')) return 'API Development';
  if (lower.includes('integration')) return 'System Integration';
  if (lower.includes('consulting') || lower.includes('consultancy')) return 'IT Consulting';
  if (lower.includes('devops')) return 'DevOps Services';
  if (lower.includes('qa') || lower.includes('testing')) return 'QA & Testing Services';
  if (lower.includes('cloud')) return 'Cloud Solutions';
  if (lower.includes('data') && (lower.includes('analytics') || lower.includes('science'))) return 'Data & Analytics';
  if (lower.includes('ai') || lower.includes('machine learning')) return 'AI/ML Solutions';
  
  // Generic fallbacks
  if (lower.includes('development') || lower.includes('develop')) return 'Software Development Services';
  if (lower.includes('software')) return 'Software Solutions';
  
  return 'Technology Services';
}

function extractTechnologies(text) {
  const technologies = [];
  const techKeywords = [
    // Frontend
    'react', 'react.js', 'angular', 'vue', 'vue.js', 'next.js', 'nextjs', 'javascript', 'typescript', 'html', 'css', 'tailwind', 'bootstrap',
    // Backend
    'node', 'node.js', 'express', 'python', 'django', 'flask', 'java', 'spring', 'php', 'laravel', '.net', 'c#', 'ruby', 'rails', 'golang', 'rust',
    // Mobile
    'react native', 'flutter', 'swift', 'kotlin', 'ios', 'android',
    // Database
    'mongodb', 'mysql', 'postgresql', 'redis', 'firebase', 'sql server', 'oracle',
    // Cloud/DevOps
    'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'jenkins', 'ci/cd',
    // Other
    'graphql', 'rest api', 'microservices', 'serverless'
  ];
  
  const lower = text.toLowerCase();
  techKeywords.forEach(tech => {
    if (lower.includes(tech.toLowerCase())) {
      // Format nicely
      const formatted = tech === '.net' ? '.NET' : 
                       tech.includes('.js') ? tech.replace('.js', '.js') :
                       tech.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      if (!technologies.includes(formatted)) {
        technologies.push(formatted);
      }
    }
  });
  
  return technologies.length > 0 ? technologies.slice(0, 10) : null;
}

function extractSoftwareServices(text) {
  const services = [];
  const servicePatterns = [
    /build(?:ing)?\s+(?:robust|scalable|custom|web|mobile|functional)?\s*(?:applications?|apps?|software|solutions?)/gi,
    /(?:web|mobile|custom)\s+(?:app(?:lication)?|software)\s+development/gi,
    /(?:end-to-end|full[- ]?stack)\s+development/gi,
    /(?:maintenance|support|testing|deployment|planning)/gi,
    /(?:ui\/ux|frontend|backend|database)\s+(?:design|development)/gi
  ];
  
  const sentences = text.split(/[.!]+/).filter(s => s.trim().length > 10);
  sentences.forEach(sentence => {
    servicePatterns.forEach(pattern => {
      const matches = sentence.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleaned = match.trim();
          if (cleaned.length > 5 && !services.some(s => s.toLowerCase() === cleaned.toLowerCase())) {
            services.push(cleaned.charAt(0).toUpperCase() + cleaned.slice(1));
          }
        });
      }
    });
  });
  
  return services.length > 0 ? services.slice(0, 5) : null;
}

function extractSoftwareBenefits(text) {
  const benefits = [];
  const benefitKeywords = [
    { keyword: 'scalable', benefit: 'Scalable Architecture' },
    { keyword: 'robust', benefit: 'Robust & Reliable Solutions' },
    { keyword: 'affordable', benefit: 'Affordable Pricing' },
    { keyword: 'cost-effective', benefit: 'Cost-Effective Solutions' },
    { keyword: 'timely delivery', benefit: 'Timely Delivery' },
    { keyword: 'within the committed timeline', benefit: 'On-Time Delivery' },
    { keyword: 'quality', benefit: 'Quality Assurance' },
    { keyword: 'clean', benefit: 'Clean & Maintainable Code' },
    { keyword: 'maintainable', benefit: 'Easy Maintenance' },
    { keyword: 'responsive', benefit: 'Responsive Design' },
    { keyword: 'ui/ux', benefit: 'User-Friendly UI/UX' },
    { keyword: 'best practices', benefit: 'Industry Best Practices' },
    { keyword: 'modern tech', benefit: 'Modern Technology Stack' },
    { keyword: 'secure', benefit: 'Security-First Approach' },
    { keyword: 'free updates', benefit: 'Free Updates Included' },
    { keyword: 'support', benefit: 'Dedicated Support' },
    { keyword: 'professionalism', benefit: 'Professional Service' },
    { keyword: 'efficiency', benefit: 'High Efficiency' }
  ];
  
  const lower = text.toLowerCase();
  benefitKeywords.forEach(item => {
    if (lower.includes(item.keyword) && !benefits.includes(item.benefit)) {
      benefits.push(item.benefit);
    }
  });
  
  return benefits.length > 0 ? benefits.slice(0, 6) : null;
}

function extractDeliveryModel(text) {
  const lower = text.toLowerCase();
  
  if (lower.includes('agile')) return 'Agile Methodology';
  if (lower.includes('scrum')) return 'Scrum Framework';
  if (lower.includes('waterfall')) return 'Waterfall Model';
  if (lower.includes('end-to-end') || lower.includes('planning') && lower.includes('deployment')) return 'End-to-End Development';
  if (lower.includes('phase') || lower.includes('milestone')) return 'Phased Delivery';
  
  return null;
}

function extractSupportDetails(text) {
  const support = {};
  
  // Look for support duration
  const durationMatch = text.match(/(\d+)\s*months?\s*(?:of\s+)?(?:free\s+)?(?:support|updates|maintenance)/i);
  if (durationMatch) {
    support.duration = `${durationMatch[1]} months`;
  }
  
  // Look for support type
  const lower = text.toLowerCase();
  if (lower.includes('free updates')) support.updates = 'Free Updates';
  if (lower.includes('free support')) support.type = 'Free Support';
  if (lower.includes('post-deployment') || lower.includes('post deployment')) support.phase = 'Post-Deployment';
  if (lower.includes('maintenance')) support.maintenance = 'Included';
  
  return Object.keys(support).length > 0 ? support : null;
}

function extractServiceOffering(text) {
  // For non-software products, extract what service/product is being offered
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 15);
  const offerings = [];
  
  sentences.forEach(sentence => {
    const lower = sentence.toLowerCase();
    if (lower.includes('offer') || lower.includes('provide') || lower.includes('service') || lower.includes('specialize')) {
      offerings.push(sentence.trim());
    }
  });
  
  return offerings.length > 0 ? offerings.slice(0, 3) : null;
}

function extractKeyBenefits(text) {
  const benefits = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 15);
  
  const benefitIndicators = ['benefit', 'advantage', 'help', 'ensure', 'provide', 'deliver', 'achieve', 'improve', 'save', 'reduce'];
  
  sentences.forEach(sentence => {
    const lower = sentence.toLowerCase();
    if (benefitIndicators.some(indicator => lower.includes(indicator))) {
      benefits.push(sentence.trim());
    }
  });
  
  return benefits.length > 0 ? benefits.slice(0, 4) : null;
}

function extractDeliverables(text) {
  const deliverables = [];
  const deliverableKeywords = ['deliver', 'deliverable', 'output', 'result', 'provide', 'include'];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 15);
  
  sentences.forEach(sentence => {
    const lower = sentence.toLowerCase();
    if (deliverableKeywords.some(keyword => lower.includes(keyword))) {
      deliverables.push(sentence.trim());
    }
  });
  
  return deliverables.length > 0 ? deliverables.slice(0, 4) : null;
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

  switch (primaryAbbr) {
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

  switch (primaryAbbr) {
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
    switch (secondaryAbbr) {
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
