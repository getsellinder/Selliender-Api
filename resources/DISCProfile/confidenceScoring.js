function calculateCompleteness(profile, posts) {
    let score = 0;
    const weights = {
        name: 5,
        title: 5,
        company: 5,
        location: 3,
        about: 10,
        experience: 8,
        education: 5,
        skills: 7,
        followerCount: 3,
        connectionCount: 3,
        certifications: 4,
        languages: 2,
        recommendations: 3,
        volunteering: 2,
        accomplishments: 2,
        courses: 2,
        projects: 4,
        awards: 3,
        publications: 3,
        patents: 3
    };

    let maxScore = 0;
    let actualScore = 0;

    for (const [field, weight] of Object.entries(weights)) {
        maxScore += weight;
        if (profile[field]) {
            if (Array.isArray(profile[field]) && profile[field].length > 0) {
                actualScore += weight;
            } else if (typeof profile[field] === 'string' && profile[field].trim().length > 0) {
                actualScore += weight;
            } else if (typeof profile[field] === 'number' && profile[field] > 0) {
                actualScore += weight;
            }
        }
    }

    const profileScore = maxScore > 0 ? (actualScore / maxScore) : 0;

    const postsCount = Array.isArray(posts) ? posts.length : 0;
    let postsScore = 0;
    if (postsCount >= 25) postsScore = 1.0;
    else if (postsCount >= 15) postsScore = 0.8;
    else if (postsCount >= 10) postsScore = 0.6;
    else if (postsCount >= 5) postsScore = 0.4;
    else if (postsCount >= 1) postsScore = 0.2;

    return (profileScore * 0.6 + postsScore * 0.4);
}

function calculateSampleQuality(posts) {
    if (!Array.isArray(posts) || posts.length === 0) return 0;

    let totalQuality = 0;
    let weightSum = 0;

    posts.forEach(post => {
        let quality = 0;
        const content = post.content || post.text || '';
        const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;

        if (wordCount >= 100) quality += 0.4;
        else if (wordCount >= 50) quality += 0.3;
        else if (wordCount >= 20) quality += 0.2;
        else quality += 0.1;

        // Handle different engagement formats
        let engagementNum = 0;
        if (typeof post.engagement === 'number') {
            engagementNum = post.engagement;
        } else if (typeof post.engagement === 'string') {
            engagementNum = parseInt(post.engagement.replace(/[^\d]/g, '')) || 0;
        } else if (typeof post.likes === 'number') {
            engagementNum = post.likes;
        } else if (typeof post.likes === 'string') {
            engagementNum = parseInt(post.likes.replace(/[^\d]/g, '')) || 0;
        }
        
        let engagementScore = 0;
        if (engagementNum >= 100) engagementScore = 0.3;
        else if (engagementNum >= 50) engagementScore = 0.25;
        else if (engagementNum >= 10) engagementScore = 0.15;
        else if (engagementNum >= 1) engagementScore = 0.1;

        const postType = post.type || '';
        let typeScore = 0.3;
        if (postType.toLowerCase().includes('article') || postType.toLowerCase().includes('long')) {
            typeScore = 0.3;
        } else if (postType.toLowerCase().includes('share') || postType.toLowerCase().includes('repost')) {
            typeScore = 0.15;
        }

        quality += engagementScore + typeScore;

        const weight = Math.min(engagementNum / 10 + 1, 5);
        totalQuality += quality * weight;
        weightSum += weight;
    });

    return weightSum > 0 ? Math.min(totalQuality / weightSum, 1) : 0;
}

function calculateRecency(posts) {
    if (!Array.isArray(posts) || posts.length === 0) return 0;

    const now = new Date();
    let totalRecencyScore = 0;
    let count = 0;

    posts.forEach(post => {
        let postDate = null;

        if (post.date) {
            postDate = new Date(post.date);
        } else if (post.timestamp) {
            postDate = new Date(post.timestamp);
        } else if (post.timeAgo) {
            postDate = parseTimeAgo(post.timeAgo);
        } else if (post.extractedAt) {
            postDate = new Date(post.extractedAt);
        }

        if (postDate && !isNaN(postDate.getTime())) {
            const daysDiff = (now - postDate) / (1000 * 60 * 60 * 24);

            let recencyScore = 0;
            if (daysDiff <= 7) recencyScore = 1.0;
            else if (daysDiff <= 30) recencyScore = 0.8;
            else if (daysDiff <= 90) recencyScore = 0.5;
            else if (daysDiff <= 180) recencyScore = 0.3;
            else recencyScore = 0.1;

            totalRecencyScore += recencyScore;
            count++;
        }
    });

    return count > 0 ? (totalRecencyScore / count) : 0.5;
}

function parseTimeAgo(timeAgo) {
    const now = new Date();
    const str = timeAgo.toLowerCase();

    const minutesMatch = str.match(/(\d+)\s*(minute|min)/);
    if (minutesMatch) {
        return new Date(now.getTime() - parseInt(minutesMatch[1]) * 60 * 1000);
    }

    const hoursMatch = str.match(/(\d+)\s*(hour|hr)/);
    if (hoursMatch) {
        return new Date(now.getTime() - parseInt(hoursMatch[1]) * 60 * 60 * 1000);
    }

    const daysMatch = str.match(/(\d+)\s*(day)/);
    if (daysMatch) {
        return new Date(now.getTime() - parseInt(daysMatch[1]) * 24 * 60 * 60 * 1000);
    }

    const weeksMatch = str.match(/(\d+)\s*(week|wk)/);
    if (weeksMatch) {
        return new Date(now.getTime() - parseInt(weeksMatch[1]) * 7 * 24 * 60 * 60 * 1000);
    }

    const monthsMatch = str.match(/(\d+)\s*(month|mo)/);
    if (monthsMatch) {
        return new Date(now.getTime() - parseInt(monthsMatch[1]) * 30 * 24 * 60 * 60 * 1000);
    }

    return now;
}

function calculateAgreement(profileDISC, postsDISC, styleDISC) {
    const allScores = [profileDISC, postsDISC, styleDISC].filter(s => s !== null);

    if (allScores.length < 2) return 0.7;

    const traits = ['D', 'I', 'S', 'C'];
    let totalVariance = 0;

    traits.forEach(trait => {
        const values = allScores.map(s => s[trait]).filter(v => v !== undefined);
        if (values.length >= 2) {
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
            totalVariance += Math.sqrt(variance);
        }
    });

    const avgStdDev = totalVariance / traits.length;

    let agreement = 1 - (avgStdDev / 50);
    agreement = Math.max(0, Math.min(1, agreement));

    return agreement;
}

function calculateSignalStrength(discScores) {
    const sorted = Object.values(discScores).sort((a, b) => b - a);
    const highest = sorted[0] || 0;
    const secondHighest = sorted[1] || 0;

    const dominance = highest - secondHighest;

    let strength = 0;
    if (dominance >= 30 && highest >= 70) strength = 1.0;
    else if (dominance >= 20 && highest >= 60) strength = 0.8;
    else if (dominance >= 15 && highest >= 50) strength = 0.6;
    else if (dominance >= 10 && highest >= 40) strength = 0.4;
    else strength = 0.2;

    return strength;
}

export function calculateConfidenceScore(profile, posts, discScores, profileDISC = null, postsDISC = null, styleDISC = null) {
    const completeness = calculateCompleteness(profile, posts);
    const sampleQuality = calculateSampleQuality(posts);
    const recency = calculateRecency(posts);
    const agreement = calculateAgreement(profileDISC, postsDISC, styleDISC);
    const signalStrength = calculateSignalStrength(discScores);

    const weights = {
        completeness: 0.30,
        sampleQuality: 0.20,
        recency: 0.15,
        agreement: 0.20,
        signalStrength: 0.15
    };

    let score = (
        completeness * weights.completeness +
        sampleQuality * weights.sampleQuality +
        recency * weights.recency +
        agreement * weights.agreement +
        signalStrength * weights.signalStrength
    ) * 100;

    const postsCount = Array.isArray(posts) ? posts.length : 0;
    const warnings = [];

    if (postsCount < 5) {
        score = Math.min(score, 50);
        warnings.push("Limited posts available (less than 5). Confidence capped at 50.");
    }
    if (postsCount === 0) {
        score = Math.min(score, 45);
        warnings.push("No posts available. Analysis based solely on profile. Confidence capped at 45.");
    }
    if (agreement < 0.5) {
        score -= 10;
        warnings.push("Signals across profile, posts, and writing style show low agreement. Reduced by 10 points.");
    }
    if (signalStrength < 0.4) {
        score -= 5;
        warnings.push("DISC signal strength is weak. Reduced by 5 points.");
    }

    score = Math.max(0, Math.min(100, score));

    return {
        overall: Math.round(score),
        breakdown: {
            completeness: Math.round(completeness * 100),
            sampleQuality: Math.round(sampleQuality * 100),
            recency: Math.round(recency * 100),
            agreement: Math.round(agreement * 100),
            signalStrength: Math.round(signalStrength * 100)
        },
        warnings
    };
}
