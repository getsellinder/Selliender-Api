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

function extractTalkingPoints(profile, posts) {
    const points = [];
    const topicFrequency = {};

    if (Array.isArray(posts)) {
        posts.forEach(post => {
            const content = (post.content || post.text || '').toLowerCase();
            const words = content.split(/\s+/);

            const keywords = ['growth', 'innovation', 'team', 'success', 'project', 'launch', 'strategy', 'leadership', 'development', 'technology', 'sustainability', 'customer', 'product', 'market', 'sales', 'revenue', 'partnership'];

            keywords.forEach(kw => {
                if (content.includes(kw)) {
                    topicFrequency[kw] = (topicFrequency[kw] || 0) + 1;
                }
            });
        });
    }

    const sortedTopics = Object.entries(topicFrequency).sort((a, b) => b[1] - a[1]).slice(0, 6);

    sortedTopics.forEach((topic, index) => {
        points.push({
            topic: topic[0].charAt(0).toUpperCase() + topic[0].slice(1),
            why: `Mentioned ${topic[1]} times in recent posts`,
            priority: index + 1
        });
    });

    if (profile.company) {
        points.push({
            topic: `Work at ${profile.company}`,
            why: 'Current company affiliation',
            priority: points.length + 1
        });
    }

    return points.slice(0, 6);
}

function extractPersonalizationCues(profile, posts) {
    const cues = [];

    if (profile.about && profile.about.length > 50) {
        cues.push(`About: "${profile.about.substring(0, 100)}..."`);
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
        cues.push(`Key skills: ${profile.skills.slice(0, 5).join(', ')}`);
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

    return cues;
}

export async function analyzeLinkedInProfile(profile, posts, productDescription) {
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
    const openingScripts = await generateOpeningScripts(profile, finalDISC, productDescription, primaryType);
    const objectionHandling = await generateObjectionHandling(finalDISC, productDescription, primaryType);
    const nextActions = await generateNextActions(primaryType, productDescription);

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

async function generatePersonalityBullets(discDescription, primaryType, secondaryType) {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a sales intelligence assistant. Generate 2-3 concise bullet points about this person's personality and communication style."
                },
                {
                    role: "user",
                    content: `DISC Analysis:\n${discDescription}\n\nProvide practical insights for sales engagement. Return only the bullets as a JSON array of strings.`
                }
            ],
            max_tokens: 150,
            temperature: 0.7
        });

        const content = completion.choices[0].message.content.trim();
        try {
            return JSON.parse(content);
        } catch {
            return content.split('\n').filter(line => line.trim().length > 0).slice(0, 3);
        }
    } catch (error) {
        if (error.status !== 429) {
            console.error("❌ Error generating personality bullets:", error.message);
        }
        return [
            `Primary ${primaryType} type - ${getTypeDescription(primaryType)}`,
            `Secondary ${secondaryType} characteristics`,
            "Adapt communication style to match their preferences"
        ];
    }
}

async function generateOpeningScripts(profile, discScores, productDescription, primaryType) {
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
                linkedin_dm: [`Hi ${profile.name}, I noticed your work at ${profile.company}...`],
                email: [{ subject: "Quick question", body: `Dear ${profile.name},\n\nI hope this message finds you well...` }],
                phone: `Hi ${profile.name}, this is [Your Name] from [Company]...`,
                whatsapp: `Hi ${profile.name}, quick question about ${productDescription}...`
            };
        }
    } catch (error) {
        if (error.status !== 429) {
            console.error("❌ Error generating opening scripts:", error.message);
        }
        return {
            linkedin_dm: [`Hi ${profile.name}, I came across your profile...`],
            email: [{ subject: "Introduction", body: "Dear prospect..." }],
            phone: "Hi, this is [Your Name]...",
            whatsapp: "Hi, quick question..."
        };
    }
}

async function generateObjectionHandling(discScores, productDescription, primaryType) {
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
                { objection: "Too expensive", response: "Let me show you the ROI breakdown...", category: "price" }
            ];
        }
    } catch (error) {
        if (error.status !== 429) {
            console.error("❌ Error generating objection handling:", error.message);
        }
        return [
            { objection: "Not interested", response: "I understand. May I share a brief case study?", category: "interest" }
        ];
    }
}

async function generateNextActions(primaryType, productDescription) {
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
                { action: "Send personalized connection request on LinkedIn", timing: "Today", reasoning: "Build initial rapport with a warm introduction" },
                { action: "Follow up with a short, value-focused email", timing: "Day 3", reasoning: "Reinforce interest without being pushy" },
                { action: "Schedule a discovery call", timing: "Day 7", reasoning: "Understand their needs and present tailored solution" }
            ];
        }
    } catch (error) {
        if (error.status !== 429) {
            console.error("❌ Error generating next actions:", error.message);
        }
        return [
            { action: "Send initial outreach message", timing: "Immediately", reasoning: "Start the conversation with relevant value proposition" },
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
