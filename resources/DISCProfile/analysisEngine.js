import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_SECRET_KEY || 'dummy-key'
});

function analyzeDISCFromProfile(profile) {
    const scores = { D: 50, I: 50, S: 50, C: 50 };

    const title = (profile.title || '').toLowerCase();
    const about = (profile.about || '').toLowerCase();
    const experience = Array.isArray(profile.experience) ? profile.experience : [];

    const dKeywords = ['ceo', 'founder', 'director', 'president', 'vp', 'chief', 'executive', 'manager', 'lead', 'head', 'drive', 'results', 'achieve', 'win', 'challenge'];
    const iKeywords = ['marketing', 'sales', 'communications', 'social', 'creative', 'innovative', 'people', 'team', 'collaborate', 'inspire', 'energetic', 'enthusiastic'];
    const sKeywords = ['support', 'service', 'assist', 'help', 'care', 'patient', 'consistent', 'reliable', 'team player', 'cooperative', 'friendly'];
    const cKeywords = ['analyst', 'engineer', 'scientist', 'researcher', 'quality', 'compliance', 'data', 'technical', 'precise', 'accurate', 'detail', 'systematic'];

    const combinedText = `${title} ${about} ${experience.map(e => e.title || '').join(' ')}`.toLowerCase();

    dKeywords.forEach(kw => { if (combinedText.includes(kw)) scores.D += 3; });
    iKeywords.forEach(kw => { if (combinedText.includes(kw)) scores.I += 3; });
    sKeywords.forEach(kw => { if (combinedText.includes(kw)) scores.S += 3; });
    cKeywords.forEach(kw => { if (combinedText.includes(kw)) scores.C += 3; });

    if (title.includes('ceo') || title.includes('founder') || title.includes('director')) scores.D += 10;
    if (title.includes('marketing') || title.includes('sales')) scores.I += 8;
    if (title.includes('support') || title.includes('service')) scores.S += 8;
    if (title.includes('engineer') || title.includes('analyst')) scores.C += 8;

    const skillsArray = Array.isArray(profile.skills) ? profile.skills : [];
    const skillsText = skillsArray.join(' ').toLowerCase();
    dKeywords.forEach(kw => { if (skillsText.includes(kw)) scores.D += 2; });
    iKeywords.forEach(kw => { if (skillsText.includes(kw)) scores.I += 2; });
    sKeywords.forEach(kw => { if (skillsText.includes(kw)) scores.S += 2; });
    cKeywords.forEach(kw => { if (skillsText.includes(kw)) scores.C += 2; });

    normalizeScores(scores);
    return scores;
}

function analyzeDISCFromPosts(posts) {
    const scores = { D: 50, I: 50, S: 50, C: 50 };

    if (!Array.isArray(posts) || posts.length === 0) return scores;

    posts.forEach(post => {
        const content = (post.content || post.text || '').toLowerCase();
        const wordCount = content.split(/\s+/).length;

        if (content.match(/\b(achieve|win|result|goal|challenge|compete|lead)\b/g)) scores.D += 2;
        if (content.match(/\b(excited|amazing|love|great|awesome|happy|fun|share|celebrate)\b/g)) scores.I += 2;
        if (content.match(/\b(thank|support|help|team|together|appreciate|grateful|care)\b/g)) scores.S += 2;
        if (content.match(/\b(data|analysis|research|study|accurate|detail|process|system)\b/g)) scores.C += 2;

        const questionCount = (content.match(/\?/g) || []).length;
        const exclamationCount = (content.match(/!/g) || []).length;
        const statementCount = (content.match(/\./g) || []).length;

        if (exclamationCount > 2) scores.I += 3;
        if (questionCount > 2) scores.I += 2;
        if (wordCount > 200 && statementCount > 5) scores.C += 3;
        if (wordCount < 50 && exclamationCount === 0) scores.D += 2;

        if (content.includes('we') || content.includes('our team') || content.includes('together')) scores.S += 2;
        if (content.includes('i') && content.includes('achieve')) scores.D += 2;
    });

    normalizeScores(scores);
    return scores;
}

function analyzeDISCFromWritingStyle(posts) {
    const scores = { D: 50, I: 50, S: 50, C: 50 };

    if (!Array.isArray(posts) || posts.length === 0) return scores;

    let totalWordCount = 0;
    let totalSentences = 0;
    let totalExclamations = 0;
    let totalQuestions = 0;
    let totalEmotionalWords = 0;
    let totalTechnicalWords = 0;

    posts.forEach(post => {
        const content = post.content || post.text || '';
        const words = content.split(/\s+/).filter(w => w.length > 0);
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);

        totalWordCount += words.length;
        totalSentences += sentences.length;
        totalExclamations += (content.match(/!/g) || []).length;
        totalQuestions += (content.match(/\?/g) || []).length;

        const emotionalWords = content.match(/\b(love|hate|excited|amazing|wonderful|terrible|awesome|brilliant)\b/gi) || [];
        totalEmotionalWords += emotionalWords.length;

        const technicalWords = content.match(/\b(data|metric|analysis|algorithm|framework|methodology|implementation|optimization)\b/gi) || [];
        totalTechnicalWords += technicalWords.length;
    });

    const avgWordsPerPost = totalWordCount / posts.length;
    const avgWordsPerSentence = totalSentences > 0 ? totalWordCount / totalSentences : 0;

    if (avgWordsPerPost < 50) scores.D += 5;
    if (avgWordsPerPost > 150) scores.C += 5;
    if (avgWordsPerSentence < 12) scores.D += 3;
    if (avgWordsPerSentence > 20) scores.C += 3;

    if (totalExclamations / posts.length > 1) scores.I += 8;
    if (totalQuestions / posts.length > 0.5) scores.I += 5;
    if (totalEmotionalWords / posts.length > 2) scores.I += 5;
    if (totalTechnicalWords / posts.length > 2) scores.C += 8;

    if (totalExclamations === 0 && totalQuestions === 0) scores.C += 4;

    normalizeScores(scores);
    return scores;
}

function normalizeScores(scores) {
    const total = scores.D + scores.I + scores.S + scores.C;
    if (total === 0) return;

    const factor = 200 / total;
    scores.D = Math.round(Math.min(100, Math.max(0, scores.D * factor)));
    scores.I = Math.round(Math.min(100, Math.max(0, scores.I * factor)));
    scores.S = Math.round(Math.min(100, Math.max(0, scores.S * factor)));
    scores.C = Math.round(Math.min(100, Math.max(0, scores.C * factor)));
}

function mergeDISCScores(profileScores, postsScores, styleScores) {
    const merged = { D: 0, I: 0, S: 0, C: 0 };

    const weights = {
        profile: 0.35,
        posts: 0.40,
        style: 0.25
    };

    merged.D = Math.round(profileScores.D * weights.profile + postsScores.D * weights.posts + styleScores.D * weights.style);
    merged.I = Math.round(profileScores.I * weights.profile + postsScores.I * weights.posts + styleScores.I * weights.style);
    merged.S = Math.round(profileScores.S * weights.profile + postsScores.S * weights.posts + styleScores.S * weights.style);
    merged.C = Math.round(profileScores.C * weights.profile + postsScores.C * weights.posts + styleScores.C * weights.style);

    return merged;
}

function getDISCType(discScores) {
    const entries = Object.entries(discScores).sort((a, b) => b[1] - a[1]);
    const primaryType = entries[0][0];
    const secondaryType = entries[1][0];
    return { primaryType, secondaryType };
}

async function generateExecutiveSummary(profileSummary, discDescription, primaryType) {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a sales intelligence assistant. Generate a concise 1-2 sentence executive summary for approaching this prospect."
                },
                {
                    role: "user",
                    content: `Profile:\n${profileSummary}\n\nDISC Analysis:\n${discDescription}\n\nCreate a brief, actionable summary for a salesperson.`
                }
            ],
            max_tokens: 100,
            temperature: 0.7
        });

        return completion.choices[0].message.content.trim();
    } catch (error) {
        if (error.status !== 429) {
            console.error("❌ Error generating executive summary:", error.message);
        }
        return `${primaryType}-type personality. Direct approach recommended based on profile analysis.`;
    }
}

function splitTextToPoints(text, sentencesPerPoint = 2) {
    if (!text || typeof text !== 'string') return [];
    // Split into sentences (keep punctuation)
    const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
    const cleaned = sentences.map(s => s.trim()).filter(s => s.length > 0);
    if (cleaned.length <= sentencesPerPoint) return [cleaned.join(' ')];

    const points = [];
    for (let i = 0; i < cleaned.length; i += sentencesPerPoint) {
        points.push(cleaned.slice(i, i + sentencesPerPoint).join(' '));
    }
    return points;
}

async function generatePersonalityBullets(discDescription, primaryType, secondaryType) {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a sales intelligence assistant. Produce one detailed paragraph of approximately 250-350 words that explains the prospect's personality, communication preferences, likely motivations, decision-making style, and practical tips for engaging them. Use the DISC analysis to ground the insights. Return the paragraph as a single-element JSON array [\"paragraph\"]. Do not include any extra commentary."
                },
                {
                    role: "user",
                    content: `DISC Analysis:\n${discDescription}\nPrimary Type: ${primaryType}\nSecondary Type: ${secondaryType}\n\nWrite a single detailed paragraph (~300 words) suitable for a salesperson preparing outreach.`
                }
            ],
            max_tokens: 700,
            temperature: 0.7
        });

        const content = completion.choices[0].message.content.trim();
        try {
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed) && parsed.length > 0) {
                const first = parsed[0];
                const points = (typeof first === 'string') ? splitTextToPoints(first, 2) : parsed;
                const primarySentence = `Primary ${primaryType} - ${getTypeDescription(primaryType)}.`;
                const secondarySentence = `Secondary ${secondaryType} - ${getTypeDescription(secondaryType)}.`;
                return [primarySentence, secondarySentence, ...points];
            }
        } catch {
            // fall through to legacy parsing
        }

        // If AI didn't return JSON, split the paragraph into readable points and prepend type sentences
        const aiPoints = splitTextToPoints(content, 2);
        return [`Primary ${primaryType} - ${getTypeDescription(primaryType)}.`, `Secondary ${secondaryType} - ${getTypeDescription(secondaryType)}.`, ...aiPoints];
    } catch (error) {
        if (error.status !== 429) {
            console.error("❌ Error generating personality bullets:", error.message);
        }
        // Fallback: programmatically compose a ~300-word paragraph from DISC types
        const primaryDesc = getTypeDescription(primaryType);
        const secondaryDesc = getTypeDescription(secondaryType);

        const fallbackParagraph = `The prospect profiles as a ${primaryType}-primary with ${secondaryType} as a secondary influence. ${primaryDesc}. ${secondaryDesc}. In practice, this means they tend to prioritize results and efficient decision-making while valuing accurate information and structured reasoning. Approach them clearly and directly: present the most important outcome first, support claims with data or concise examples, and avoid overly emotional appeals. When engaging, use short, result-oriented language and focus on concrete impact—how your solution reduces time-to-value, increases revenue, or eliminates key pain points. Be prepared to answer technical and analytical questions; provide evidence (metrics, case studies, or references) that validates your claims. Keep meetings time-boxed and agenda-driven, and offer options rather than open-ended questions to expedite decisions. For follow-ups, prioritize short, focused updates that show progress or new evidence rather than general check-ins. While they are results-driven, recognize the secondary ${secondaryType} aspect: they also appreciate thoroughness and accuracy, so ensure proposals are technically sound and include clear next steps. Balance directness with a respect for precision—this increases credibility and reduces friction during negotiations. Overall, aim for a concise, data-rich approach that demonstrates respect for their time and provides a clear path to outcomes.`;

        return splitTextToPoints(fallbackParagraph, 2);
    }
}

function extractTalkingPoints(profile, posts) {
    const points = [];
    const topicFrequency = {};

    if (Array.isArray(posts)) {
        posts.forEach(post => {
            const content = (post.content || post.text || '').toLowerCase();

            const keywords = ['growth', 'innovation', 'team', 'success', 'project', 'launch', 'strategy', 'leadership', 'development', 'technology', 'sustainability', 'customer', 'product', 'market', 'sales', 'revenue', 'partnership'];

            keywords.forEach(kw => {
                if (content.includes(kw)) {
                    topicFrequency[kw] = (topicFrequency[kw] || 0) + 1;
                }
            });
        });
    }

    const sortedTopics = Object.entries(topicFrequency).sort((a, b) => b[1] - a[1]).slice(0, 5);

    sortedTopics.forEach((topic, index) => {
        const topicName = topic[0].charAt(0).toUpperCase() + topic[0].slice(1);
        const frequency = topic[1];
        
        const openers = {
            'growth': `I noticed you've been discussing growth strategies. How are you currently measuring success in your expansion initiatives?`,
            'innovation': `Your focus on innovation caught my attention. What's the biggest innovation challenge you're tackling right now?`,
            'team': `I see team building is a priority for you. How are you scaling your team while maintaining culture?`,
            'success': `You frequently share success stories. What metrics matter most to you when defining success?`,
            'leadership': `Your leadership insights are compelling. What's your approach to developing leaders within your organization?`,
            'strategy': `I noticed your strategic focus. What's your top strategic priority for this quarter?`,
            'technology': `Your posts about technology stood out. Which tech investments are delivering the most ROI for you?`,
            'customer': `Customer focus is clearly important to you. How are you enhancing customer experience right now?`,
            'product': `Your product updates are interesting. What's the next big feature or improvement you're excited about?`,
            'sales': `I see sales is a key focus. What's working best in your current sales strategy?`,
            'revenue': `Revenue growth seems to be a priority. What channels are driving the most revenue for you?`,
            'partnership': `You've mentioned partnerships. What makes a great partnership from your perspective?`,
            'project': `I noticed you're managing significant projects. What's the biggest challenge in your current projects?`,
            'launch': `Your recent launches caught my eye. What's your process for successful product launches?`,
            'development': `Development seems central to your work. What's the biggest development bottleneck you're facing?`,
            'sustainability': `Your sustainability focus is admirable. How are you balancing sustainability with growth goals?`,
            'market': `Market trends seem important to you. What market shifts are you preparing for?`
        };

        points.push({
            topic: topicName,
            why: `Mentioned ${frequency}x - shows active interest and expertise`,
            suggestedOpener: openers[topic[0]] || `I noticed you frequently discuss ${topicName}. What aspects of ${topicName} are most important to you right now?`,
            priority: index + 1
        });
    });

    // If we have fewer than 3 points from posts, add fallback points from profile
    if (points.length < 3) {
        // Add role/title-based talking point
        if (profile.title) {
            const title = profile.title;
            const roleInsights = {
                'ceo': { topic: 'Strategic Vision', why: 'CEO role - focused on company direction and growth', opener: 'As a CEO, what are your top strategic priorities for the next quarter?' },
                'cto': { topic: 'Technology Leadership', why: 'CTO role - drives technical strategy and innovation', opener: 'What technology trends are you prioritizing in your tech strategy?' },
                'cfo': { topic: 'Financial Strategy', why: 'CFO role - focuses on financial performance and planning', opener: 'What financial metrics are you tracking most closely right now?' },
                'vp': { topic: 'Departmental Leadership', why: 'VP role - leads strategic initiatives and team development', opener: 'What are your key objectives for your team this quarter?' },
                'director': { topic: 'Strategic Execution', why: 'Director role - drives execution and team performance', opener: 'What initiatives are you focusing on to drive results in your area?' },
                'manager': { topic: 'Team Performance', why: 'Management role - focused on team success and operations', opener: 'What challenges are you helping your team overcome right now?' },
                'founder': { topic: 'Company Building', why: 'Founder - building and scaling the organization', opener: 'What are the biggest challenges in scaling your business right now?' }
            };

            const titleLower = title.toLowerCase();
            for (const [key, insight] of Object.entries(roleInsights)) {
                if (titleLower.includes(key)) {
                    points.push({
                        topic: insight.topic,
                        why: insight.why,
                        suggestedOpener: insight.opener,
                        priority: points.length + 1
                    });
                    break;
                }
            }
        }

        // Add industry/company point
        if (profile.company && points.length < 4) {
            points.push({
                topic: 'Industry Trends',
                why: `Works at ${profile.company} - relevant industry context`,
                suggestedOpener: `Given your role at ${profile.company}, what industry trends are impacting your business most?`,
                priority: points.length + 1
            });
        }

        // Add experience-based point
        if (Array.isArray(profile.experience) && profile.experience.length > 0 && points.length < 5) {
            const recentExperience = profile.experience[0];
            if (recentExperience.title) {
                points.push({
                    topic: 'Professional Experience',
                    why: `${recentExperience.title} background - brings valuable perspective`,
                    suggestedOpener: `With your background in ${recentExperience.title}, what best practices have you found most effective?`,
                    priority: points.length + 1
                });
            }
        }

        // Add skills-based point
        if (Array.isArray(profile.skills) && profile.skills.length > 0 && points.length < 6) {
            const topSkills = profile.skills.slice(0, 3).join(', ');
            points.push({
                topic: 'Core Expertise',
                why: `Key skills: ${topSkills} - demonstrates specialized knowledge`,
                suggestedOpener: `I see you have expertise in ${topSkills}. How are you applying these skills in your current role?`,
                priority: points.length + 1
            });
        }
    }

    // Add company point if not already added
    if (profile.company && !points.some(p => p.topic.includes(profile.company))) {
        points.push({
            topic: `${profile.company}`,
            why: `Current company - relevant for contextualized outreach`,
            suggestedOpener: `I've been following ${profile.company}'s progress. How is your team navigating the current market landscape?`,
            priority: points.length + 1
        });
    }

    // Normalize 'why' and 'suggestedOpener' fields to be strings
    const normalized = points.map(pt => {
        const copy = Object.assign({}, pt);
        if (Array.isArray(copy.why)) copy.why = copy.why.join(' ');
        else if (copy.why === undefined || copy.why === null) copy.why = '';
        if (Array.isArray(copy.suggestedOpener)) copy.suggestedOpener = copy.suggestedOpener.join(' ');
        else if (copy.suggestedOpener === undefined || copy.suggestedOpener === null) copy.suggestedOpener = '';
        return copy;
    });

    return normalized.slice(0, 6);
}

function extractPersonalizationCues(profile, posts) {
    const cues = [];

    if (profile.about && profile.about.length > 50) {
        cues.push(`About: "${profile.about.substring(0, 250)}..."`);
    }

    if (profile.location) {
        cues.push(`Based in ${profile.location}`);
    }

    if (Array.isArray(profile.experience) && profile.experience.length > 0) {
        const recent = profile.experience[0];
        if (recent.title && recent.company) {
            cues.push(`Currently ${recent.title} at ${recent.company}`);
        }
    }

    if (Array.isArray(profile.skills) && profile.skills.length > 0) {
        cues.push(`Key skills: ${profile.skills.slice(0, 10).join(', ')}`);
    }

    if (Array.isArray(posts) && posts.length > 0) {
        const recentPost = posts[0];
        if (recentPost.content || recentPost.text) {
            const snippet = (recentPost.content || recentPost.text).substring(0, 100);
            cues.push(`Recent post: "${snippet}..."`);
        }
    }

    if (Array.isArray(profile.certifications) && profile.certifications.length > 0) {
        cues.push(`Certifications: ${profile.certifications.map(c => c.name).join(', ')}`);
    }

    if (Array.isArray(profile.volunteering) && profile.volunteering.length > 0) {
        cues.push(`Active in volunteering: ${profile.volunteering[0].organization || 'various causes'}`);
    }

    // Add recent activity summary
    if (Array.isArray(posts) && posts.length > 0) {
        const recent = posts.slice(0, 3).map(p => (p.content || p.text || '').substring(0, 200)).join(' | ');
        cues.push(`Recent activity: ${recent}`);
    }

    // Add education and awards if present
    if (Array.isArray(profile.education) && profile.education.length > 0) {
        const edu = profile.education[0];
        const eduText = `${edu.degree || ''} ${edu.fieldOfStudy || ''} from ${edu.institution || ''}`.trim();
        if (eduText) cues.push(`Education: ${eduText}`);
    }

    if (Array.isArray(profile.awards) && profile.awards.length > 0) {
        cues.push(`Awards: ${profile.awards.slice(0, 3).map(a => a.title || a).join('; ')}`);
    }

    // Mutual connections hint if available
    if (profile.mutualConnections && profile.mutualConnections > 0) {
        cues.push(`Mutual connections: ${profile.mutualConnections} shared connections`);
    }

    return cues;
}

export async function analyzeLinkedInProfile(profile, posts, productDescription, productPrice = null) {
    const profileDISC = analyzeDISCFromProfile(profile);
    const postsDISC = analyzeDISCFromPosts(posts);
    const styleDISC = analyzeDISCFromWritingStyle(posts);

    const finalDISC = mergeDISCScores(profileDISC, postsDISC, styleDISC);
    const { primaryType, secondaryType } = getDISCType(finalDISC);

    const talkingPoints = extractTalkingPoints(profile, posts);
    const personalizationCues = extractPersonalizationCues(profile, posts);

    const profileSummary = `
Name: ${profile.name || 'Unknown'}
Title: ${profile.title || 'Unknown'}
Company: ${profile.company || 'Unknown'}
About: ${profile.about || 'Not provided'}
Skills: ${Array.isArray(profile.skills) ? profile.skills.join(', ') : 'None listed'}
Recent Posts: ${Array.isArray(posts) ? posts.slice(0, 3).map(p => p.content || p.text || '').join(' | ') : 'No posts'}
`;

    const discDescription = `
DISC Profile: D=${finalDISC.D}, I=${finalDISC.I}, S=${finalDISC.S}, C=${finalDISC.C}
Primary Type: ${primaryType} (${getTypeDescription(primaryType)})
Secondary Type: ${secondaryType} (${getTypeDescription(secondaryType)})
`;

    const executiveSummary = await generateExecutiveSummary(profileSummary, discDescription, primaryType);
    const personalityBullets = await generatePersonalityBullets(discDescription, primaryType, secondaryType);
    const openingScripts = await generateOpeningScripts(profile, finalDISC, productDescription, primaryType, productPrice);
    const objectionHandling = await generateObjectionHandling(finalDISC, productDescription, primaryType, productPrice);
    const nextActions = await generateNextActions(primaryType, productDescription, productPrice);

    return {
        executive: executiveSummary,
        personality: {
            disc: finalDISC,
            bullets: personalityBullets,
            primaryType,
            secondaryType
        },
        talkingPoints,
        openingScripts,
        objectionHandling,
        personalizationCues,
        nextActions,
        analysisMetadata: {
            profileFieldsUsed: countProfileFields(profile),
            postsAnalyzed: Array.isArray(posts) ? posts.length : 0,
            avgPostEngagement: calculateAvgEngagement(posts),
            dominantTopics: talkingPoints.slice(0, 5).map(t => t.topic),
            writingTone: determineWritingTone(posts)
        }
    };
}

function getTypeDescription(type) {
    const descriptions = {
        D: 'Dominant - Direct, results-oriented, decisive',
        I: 'Influence - Enthusiastic, optimistic, people-oriented',
        S: 'Steadiness - Patient, loyal, supportive',
        C: 'Conscientiousness - Analytical, systematic, detail-oriented'
    };
    return descriptions[type] || 'Unknown';
}

async function generateOpeningScripts(profile, discScores, productDescription, primaryType, productPrice = null) {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a sales intelligence assistant. Generate personalized opening scripts for different channels."
                },
                                {
                                        role: "user",
                                        content: `Profile: ${profile.name}, ${profile.title} at ${profile.company}
DISC Type: Primary ${primaryType}
Product: ${productDescription}
Price: ${productPrice !== null ? '$' + productPrice : 'N/A'}

Generate opening scripts as JSON:
{
    "linkedin_dm": ["script1", "script2"],
    "email": [{"subject": "...", "body": "..."}],
    "phone": "opening line",
    "whatsapp": "message"
}`
                                }
            ],
            max_tokens: 500,
            temperature: 0.8
        });

        const content = completion.choices[0].message.content.trim();
        try {
            return JSON.parse(content);
        } catch {
            return {
                linkedin_dm: [`Hi ${profile.name}, I noticed your work at ${profile.company} and thought our solution${productPrice ? ` starting at $${productPrice}` : ''} could be relevant...`],
                email: [{ subject: "Quick question", body: `Dear ${profile.name},\n\nI hope this message finds you well. I have a brief idea about ${productDescription}${productPrice ? ` (starting at $${productPrice})` : ''} that may help ${profile.company}.\n\nBest regards,` }],
                phone: `Hi ${profile.name}, this is [Your Name] from [Company]. Quick one: we have a ${productDescription}${productPrice ? ` option starting at $${productPrice}` : ''} that could shorten your time-to-value...`,
                whatsapp: `Hi ${profile.name}, quick question about ${productDescription}${productPrice ? ` (starts at $${productPrice})` : ''}...`
            };
        }
    } catch (error) {
        if (error.status !== 429) {
            console.error("❌ Error generating opening scripts:", error.message);
        }
        return {
            linkedin_dm: [`Hi ${profile.name}, I came across your profile and thought our solution${productPrice ? ` (starts at $${productPrice})` : ''} might be relevant.`],
            email: [{ subject: "Introduction", body: `Dear ${profile.name},\n\nI wanted to introduce ${productDescription}${productPrice ? ` (starting at $${productPrice})` : ''} which has helped similar companies.` }],
            phone: `Hi ${profile.name}, this is [Your Name]... I have a ${productDescription}${productPrice ? ` option starting at $${productPrice}` : ''}.`,
            whatsapp: `Hi ${profile.name}, quick question about ${productDescription}${productPrice ? ` (starts at $${productPrice})` : ''}`
        };
    }
}

async function generateObjectionHandling(discScores, productDescription, primaryType, productPrice = null) {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a sales intelligence assistant. Generate common objections and tailored responses."
                },
                {
                    role: "user",
                    content: `DISC Type: Primary ${primaryType}
Product: ${productDescription}
Price: ${productPrice !== null ? '$' + productPrice : 'N/A'}

Generate 3-4 common objections with responses as JSON array:
[{"objection": "...", "response": "...", "category": "..."}]`
                }
            ],
            max_tokens: 400,
            temperature: 0.7
        });

        const content = completion.choices[0].message.content.trim();
        try {
            return JSON.parse(content);
        } catch {
            return [
                { objection: "Too busy right now", response: "I understand. Would a quick 10-minute call next week work?", category: "timing" },
                { objection: "Not interested", response: "May I ask what you're currently using for this?", category: "interest" },
                { objection: "Too expensive", response: `I hear that. Many clients found the investment worthwhile when we showed ROI; our packages ${productPrice ? `start at $${productPrice}` : 'vary by scope'}. Can I share a short ROI example?`, category: "price" }
            ];
        }
    } catch (error) {
        if (error.status !== 429) {
            console.error("❌ Error generating objection handling:", error.message);
        }
        return [
            { objection: "Not interested", response: "I understand. May I share a brief case study?", category: "interest" },
            { objection: "Too expensive", response: `I understand price matters. We offer packages that ${productPrice ? `start at $${productPrice}` : 'scale with needs'}. Would a short cost-benefit note help?`, category: "price" }
        ];
    }
}

async function generateNextActions(primaryType, productDescription, productPrice = null) {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a sales intelligence assistant. Generate recommended next actions."
                },
                {
                    role: "user",
                    content: `DISC Type: Primary ${primaryType}
Product: ${productDescription}
Price: ${productPrice !== null ? '$' + productPrice : 'N/A'}

Generate 3-4 next actions as JSON array:
[{"action": "...", "timing": "...", "reasoning": "..."}]`
                }
            ],
            max_tokens: 300,
            temperature: 0.7
        });

        const content = completion.choices[0].message.content.trim();
        try {
            return JSON.parse(content);
        } catch {
            return [
                { action: "Send personalized connection request on LinkedIn", timing: "Today", reasoning: `Build initial rapport; mention the ${productDescription}${productPrice ? ` starting at $${productPrice}` : ''} briefly.` },
                { action: "Follow up with a short, value-focused email", timing: "Day 3", reasoning: "Reinforce interest without being pushy" },
                { action: "Schedule a discovery call", timing: "Day 7", reasoning: `Discuss specific needs and pricing options${productPrice ? ` (starting at $${productPrice})` : ''}.` }
            ];
        }
    } catch (error) {
        if (error.status !== 429) {
            console.error("❌ Error generating next actions:", error.message);
        }
        return [
            { action: "Send initial outreach message", timing: "Immediately", reasoning: `Start the conversation with a concise value statement and mention pricing${productPrice ? ` (from $${productPrice})` : ''}.` },
            { action: "Follow up if no response", timing: "3-5 days", reasoning: "Persistence shows genuine interest" },
            { action: "Offer specific value or case study", timing: "1 week", reasoning: "Demonstrate concrete results" }
        ];
    }
}

function countProfileFields(profile) {
    let count = 0;
    const fields = ['name', 'title', 'company', 'location', 'about', 'experience', 'education', 'skills', 'certifications', 'languages'];
    fields.forEach(field => {
        if (profile[field]) {
            if (Array.isArray(profile[field]) && profile[field].length > 0) count++;
            else if (typeof profile[field] === 'string' && profile[field].length > 0) count++;
        }
    });
    return count;
}

function calculateAvgEngagement(posts) {
    if (!Array.isArray(posts) || posts.length === 0) return 0;

    let total = 0;
    let count = 0;

    posts.forEach(post => {
        let engagementNum = 0;
        
        // Handle different engagement formats
        if (typeof post.engagement === 'number') {
            engagementNum = post.engagement;
        } else if (typeof post.engagement === 'string') {
            engagementNum = parseInt(post.engagement.replace(/[^\d]/g, '')) || 0;
        } else if (typeof post.likes === 'number') {
            engagementNum = post.likes;
        } else if (typeof post.likes === 'string') {
            engagementNum = parseInt(post.likes.replace(/[^\d]/g, '')) || 0;
        }
        
        if (engagementNum > 0) {
            total += engagementNum;
            count++;
        }
    });

    if (count === 0) return 0;
    return Math.round(total / count);
}

function determineWritingTone(posts) {
    if (!Array.isArray(posts) || posts.length === 0) return 'Unknown';

    let formalScore = 0;
    let casualScore = 0;

    posts.forEach(post => {
        const content = (post.content || post.text || '').toLowerCase();

        if (content.match(/\b(furthermore|therefore|accordingly|nevertheless|consequently)\b/g)) formalScore++;
        if (content.match(/\b(gonna|wanna|cool|awesome|yeah|nope)\b/g)) casualScore++;

        const exclamations = (content.match(/!/g) || []).length;
        if (exclamations > 2) casualScore++;

        const avgWordLength = content.split(/\s+/).reduce((sum, word) => sum + word.length, 0) / content.split(/\s+/).length;
        if (avgWordLength > 6) formalScore++;
        else casualScore++;
    });

    if (formalScore > casualScore * 1.5) return 'Formal';
    if (casualScore > formalScore * 1.5) return 'Casual';
    return 'Balanced';
}
