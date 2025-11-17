import { shordataformate, shortDateWithTime, timeFormat } from "../../Utils/formatDateToIST .js";
import UserModel from "../user/userModel.js";
import LinkedinContent from "./LinkedinContent.model.js";
import LinkedinPost from "./LinkedinPost.model.js";
import DISCProfile from "../DISCProfile/DISCProfileModel.js";
import { analyzeLinkedInProfile } from "../DISCProfile/analysisEngineV2.js";
import jwt from 'jsonwebtoken';


function normalizeLinkedInPosts(rawPosts, maxCount = 30) {
    if (!Array.isArray(rawPosts)) return [];

    const normalized = [];
    const seen = new Set();

    const buildNormalizedPost = (candidate, base) => {
        if (!candidate) return null;

        const textValue = candidate.content || candidate.text || "";
        if (!String(textValue).trim()) return null;

        const normalizedPost = { ...candidate };
        normalizedPost.content = candidate.content || candidate.text || "";
        normalizedPost.text = candidate.text || candidate.content || "";

        const baseDate = base?.date || base?.timestamp || base?.createdAt || null;
        const dateValue = candidate.date || candidate.timestamp || candidate.createdAt || baseDate;
        if (dateValue instanceof Date) normalizedPost.date = dateValue.toISOString();
        else normalizedPost.date = dateValue || null;

        const likesValue = candidate.likes ?? candidate.likeCount ?? candidate.reactionCount ?? base?.likes ?? base?.likeCount ?? base?.reactionCount ?? 0;
        const commentsValue = candidate.comments ?? candidate.commentCount ?? candidate.commentsCount ?? base?.comments ?? base?.commentCount ?? base?.commentsCount ?? 0;
        normalizedPost.likes = Number.isFinite(likesValue) ? likesValue : 0;
        normalizedPost.comments = Number.isFinite(commentsValue) ? commentsValue : 0;

        normalizedPost.parentId = normalizedPost.parentId || base?._id || base?.id || null;
        normalizedPost.profileId = normalizedPost.profileId || base?.profileId || base?._id || base?.id || null;

        if (normalizedPost.date && typeof normalizedPost.date === "string") {
            const parsedDate = new Date(normalizedPost.date);
            if (!Number.isNaN(parsedDate.getTime())) normalizedPost.date = parsedDate.toISOString();
        }

        delete normalizedPost.posts;

        const keyParts = [
            normalizedPost.postId,
            normalizedPost.id,
            normalizedPost.urn,
            normalizedPost.permalink,
            normalizedPost.url,
            normalizedPost.link,
            normalizedPost.profileId ? String(normalizedPost.profileId) : null,
            normalizedPost.date ? String(normalizedPost.date) : null,
            normalizedPost.content ? normalizedPost.content.slice(0, 140).toLowerCase() : null
        ].filter(Boolean);

        if (keyParts.length === 0) keyParts.push(`fallback-${normalized.length}`);

        const key = keyParts.join("::");
        if (seen.has(key)) return null;
        seen.add(key);

        return normalizedPost;
    };

    rawPosts.forEach((entry) => {
        const base = entry && typeof entry.toObject === "function" ? entry.toObject() : entry;
        if (!base) return;

        const parentId = base._id || base.id || base.parentId || null;
        const baseProfileId = base.profileId || parentId;

        if (Array.isArray(base.posts) && base.posts.length > 0) {
            const toNumeric = (value) => {
                if (value === null || value === undefined || value === '') return null;
                const numeric = typeof value === 'number' ? value : Number(String(value).replace(/[^0-9.-]/g, ''));
                return Number.isFinite(numeric) ? numeric : null;
            };

            const collected = base.posts.map((post) => buildNormalizedPost({ ...post, parentId, profileId: baseProfileId }, base)).filter(Boolean);

            const expectedCount = toNumeric(base.postsCount) ?? toNumeric(base.postCount) ?? toNumeric(base.totalPosts) ?? toNumeric(base.posts?.length);

            const limit = expectedCount !== null ? Math.min(expectedCount, collected.length) : collected.length;
            for (let i = 0; i < limit; i++) normalized.push(collected[i]);
            return;
        }

        const single = buildNormalizedPost({ ...base, parentId, profileId: baseProfileId }, base);
        if (single) normalized.push(single);
    });

    if (normalized.length > maxCount) return normalized.slice(0, maxCount);
    return normalized;
}

function parseSearchLimit(value) {
    if (value === undefined || value === null || value === '') return null;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    const numeric = Number(String(value).replace(/[^0-9.-]/g, ''));
    return Number.isFinite(numeric) ? numeric : null;
}


export const LinkedinUploadFile = async (req, res) => {
    const { id } = req.params
    const { LinkedinURL, content, posts } = req.body;

    try {
        let savePfofile = null;
        let savePosts = [];
        console.log("📥 Uploading LinkedIn data (without product description)");

        if (content) {
            savePfofile = await LinkedinContent.create({
                LinkedinURL,
                ...content
            })
            console.log("✅ Profile saved:", savePfofile._id);
        }

        if (posts) {
            if (Array.isArray(posts)) {
                savePosts = await LinkedinPost.insertMany(posts.map(p => ({
                    ...p,
                    profileId: savePfofile ? savePfofile._id : null
                })))
                console.log("✅ Posts saved:", savePosts.length);
            }
            else {
                const post = await LinkedinPost.create({
                    ...posts,
                    profileId: savePfofile ? savePfofile._id : null
                })
                savePosts.push(post);
                console.log("✅ Single post saved");
            }
        }

        if (id) {
            await UserModel.findByIdAndUpdate(id, {
                LinkedinContentId: savePfofile ? savePfofile._id : null,
                LinkedinPostId: savePosts.length > 0 ? savePosts[0]._id : null
            });
            console.log("✅ Linked to user:", id);
        }

        res.status(200).json({
            message: "LinkedIn data uploaded successfully",
            profile: savePfofile,
            posts: savePosts,
            profileId: savePfofile?._id,
            postId: savePosts.length > 0 ? savePosts[0]._id : null
        });
    } catch (error) {
        console.error("❌ Error uploading file:", error);
        res.status(500).json({ message: error.message });
    }
};

export const saveDISCRequest = async (req, res) => {
    const { userId } = req.params;
    const { LinkedinURL, productDescription, productPrice } = req.body;

    try {
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        if (!LinkedinURL || !productDescription) {
            return res.status(400).json({ message: "LinkedIn URL and product description are required" });
        }

        // optional: validate productPrice if provided (must be number or numeric string)
        let parsedPrice = null;
        if (productPrice !== undefined && productPrice !== null && productPrice !== '') {
            const maybeNumber = typeof productPrice === 'number' ? productPrice : parseFloat(String(productPrice).replace(/[^0-9.\-]/g, ''));
            if (Number.isNaN(maybeNumber)) {
                return res.status(400).json({ message: 'productPrice must be a valid number' });
            }
            parsedPrice = maybeNumber;
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const updateObj = {
            pendingLinkedInURL: LinkedinURL,
            pendingProductDescription: productDescription
        };
        if (parsedPrice !== null) updateObj.pendingProductPrice = parsedPrice;

        await UserModel.findByIdAndUpdate(userId, updateObj);

        console.log("✅ Product description saved for user:", userId);

        res.status(200).json({
            message: "Request saved successfully. Ready for analysis.",
            LinkedinURL,
            productDescription,
            productPrice: parsedPrice
        });

    } catch (error) {
        console.error("❌ Error saving DISC request:", error);
        res.status(500).json({ message: error.message });
    }
};

export const analyzeDISCProfile = async (req, res) => {
    const { userId } = req.params;

    try {
        let user = await UserModel.findById(userId)
            .populate('LinkedinContentId')
            .populate('LinkedinPostId');

        // Ensure PlanId is populated so we can initialize SearchLimit from the purchased plan
        try {
            await user?.populate?.('PlanId', 'Package SearchLimitMonthly SearchLimitYearly name');
        } catch (e) {
            // non-fatal: proceed without populated plan
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // If user has no SearchLimit set but has a plan with a monthly allowance, initialize it now
        try {
            const planLimit = user?.PlanId?.SearchLimitMonthly ?? 0;
            if ((user.SearchLimit === 0 || user.SearchLimit == null) && planLimit > 0) {
                await UserModel.findByIdAndUpdate(userId, { $set: { SearchLimit: planLimit } });
                user.SearchLimit = planLimit;
                console.log(`Initialized SearchLimit from plan for user ${userId}: ${planLimit}`);
            }
        } catch (err) {
            console.warn('Failed to initialize SearchLimit from plan:', err?.message || err);
        }

        const parsedSearchLimit = parseSearchLimit(user.SearchLimit);
        if (parsedSearchLimit !== null && parsedSearchLimit <= 0) {
            return res.status(403).json({
                message: "Search limit reached. Please upgrade your plan to continue.",
                redirectToPricing: true,
                remainingSearchLimit: 0
            });
        }

        // Allow product description and price to be provided in the request body
        const { productDescription: bodyProductDescription, productPrice: bodyProductPrice } = req.body || {};

        // Prefer body-provided description, otherwise fall back to pending saved on user
        const productDescriptionToUse = bodyProductDescription || user.pendingProductDescription;
        // Normalize price if provided in body otherwise fall back to pending
        let productPriceToUse = null;
        if (bodyProductPrice !== undefined && bodyProductPrice !== null && bodyProductPrice !== '') {
            const parsed = typeof bodyProductPrice === 'number' ? bodyProductPrice : parseFloat(String(bodyProductPrice).replace(/[^0-9.\-]/g, ''));
            productPriceToUse = Number.isFinite(parsed) ? parsed : null;
        } else if (user.pendingProductPrice !== undefined && user.pendingProductPrice !== null) {
            productPriceToUse = user.pendingProductPrice;
        }

        if (!productDescriptionToUse) {
            return res.status(400).json({ message: "No product description found. Please save it first or include it in the request body." });
        }

        if (!user.LinkedinContentId) {
            return res.status(400).json({ message: "No LinkedIn profile data found. Please upload profile first." });
        }

    console.log("🔄 Starting DISC analysis...");

        const profileData = user.LinkedinContentId.toObject ? user.LinkedinContentId.toObject() : user.LinkedinContentId;

        const rawPosts = await LinkedinPost.find({ 
            profileId: user.LinkedinContentId._id 
        }).sort({ createdAt: -1 }).limit(30);

        const embeddedPosts = Array.isArray(profileData.posts) ? profileData.posts : [];

        const combinedPostSources = [
            ...rawPosts,
            ...(embeddedPosts.length > 0
                ? [{
                    _id: user.LinkedinContentId._id,
                    profileId: user.LinkedinContentId._id,
                    posts: embeddedPosts,
                    postsCount: profileData.postsCount ?? profileData.postCount ?? embeddedPosts.length
                }]
                : [])
        ];

        const postsData = normalizeLinkedInPosts(combinedPostSources, 30);

        console.log(`📊 Analyzing profile: ${profileData.name} with ${postsData.length} posts (rawDocs=${rawPosts.length}, embedded=${embeddedPosts.length})`);

        const analysisResult = await analyzeLinkedInProfile(
            profileData,
            postsData,
            productDescriptionToUse,
            productPriceToUse
        );

        console.log("✅ Analysis engine completed");

        const profileDISC = analysisResult.personality.disc;
        const confidenceResult = analysisResult.confidence;

        const dataSources = [];
        if (user.LinkedinContentId._id) dataSources.push(`profile_${user.LinkedinContentId._id}`);
    if (postsData.length > 0) dataSources.push(`posts_${postsData.length}_items`);
        dataSources.push('about_section', 'experience_section', 'skills_section');

        const discProfileDoc = new DISCProfile({
            userId: userId,
            linkedinContentId: user.LinkedinContentId._id,
            linkedinPostId: user.LinkedinPostId?._id || null,
            productDescription: productDescriptionToUse,
            productPrice: productPriceToUse || null,
            executive: analysisResult.executive,
            starting: analysisResult.starting,
            personality: analysisResult.personality,
            talkingPoints: analysisResult.talkingPoints,
            openingScripts: analysisResult.openingScripts,
            objectionHandling: analysisResult.objectionHandling,
            personalizationCues: analysisResult.personalizationCues,
            nextActions: analysisResult.nextActions,
            nextSteps: analysisResult.nextSteps || null,
            confidence: confidenceResult,
            quickSummary: analysisResult.quickSummary || null,
            actionableMetrics: analysisResult.actionableMetrics || null,
            preferenceSnapshot: analysisResult.preferenceSnapshot || null,
            probabilityToPurchase: analysisResult.probabilityToPurchase || null,
            commonGroundAndSharedVision: analysisResult.commonGroundAndSharedVision || null,
            confidenceExplanation: analysisResult.confidenceExplanation || null,
            executiveSummary: analysisResult.executiveSummary || null,
            companyOverview: analysisResult.companyOverview || null,
            communicationStrategy: analysisResult.communicationStrategy || null,
            dataSources,
            analysisMetadata: analysisResult.analysisMetadata
        });

        await discProfileDoc.save();

        // If we consumed the user's pending values (i.e. body did not provide a description), clear them.
        if (!bodyProductDescription) {
            await UserModel.findByIdAndUpdate(userId, {
                $unset: { pendingLinkedInURL: "", pendingProductDescription: "", pendingProductPrice: "" }
            });
        }

        let remainingSearchLimit = parsedSearchLimit;
        try {
            const updatedUser = await UserModel.findOneAndUpdate(
                { _id: userId, SearchLimit: { $gte: 1 } },
                { $inc: { SearchLimit: -1 } },
                { new: true, projection: { SearchLimit: 1 } }
            );

            if (updatedUser) {
                remainingSearchLimit = parseSearchLimit(updatedUser.SearchLimit);
                console.log(`🔻 SearchLimit decremented. Remaining: ${remainingSearchLimit}`);
            } else if (parsedSearchLimit !== null) {
                remainingSearchLimit = Math.max(parsedSearchLimit - 1, 0);
                console.warn('⚠️ SearchLimit update failed; falling back to virtual decrement.');
            }
        } catch (err) {
            console.error('❌ Failed to decrement SearchLimit:', err.message);
            if (parsedSearchLimit !== null) remainingSearchLimit = Math.max(parsedSearchLimit - 1, 0);
        }

        console.log("✅ DISC analysis completed successfully");

        res.status(200).json({
            message: "DISC analysis completed successfully",
            analysisId: discProfileDoc._id,
            analysis: discProfileDoc,
            remainingSearchLimit: remainingSearchLimit === null ? null : Math.max(remainingSearchLimit, 0)
        });

    } catch (error) {
        console.error("❌ DISC analysis failed:", error);
        res.status(500).json({ message: error.message });
    }
};



export const getLinkedinUploadFile = async (req, res) => {
    const { id } = req.params
    try {
        const getUser = await UserModel.findById(id)
            .populate("LinkedinContentId")
            .populate("LinkedinPostId");
        if (!getUser) {
            return res.status(404).json({ message: "User not found" })
        }

        res.status(200).json({
            user: getUser,
            message: "⚠️ LinkedIn data will be deleted automatically after 2 minutes"
        });

        // // schedule deletion after 4 minutes
        setTimeout(async () => {
            try {
                if (getUser.LinkedinContentId) {
                    await LinkedinContent.findByIdAndDelete(getUser.LinkedinContentId._id)
                    getUser.LinkedinContentId = null
                }
                if (getUser.LinkedinPostId) {
                    await LinkedinPost.findByIdAndDelete(getUser.LinkedinPostId._id);
                    getUser.LinkedinPostId = null
                }
                // also unlink from user so populate won’t find them again
                await UserModel.findByIdAndUpdate(id, {
                    $unset: { LinkedinContentId: "", LinkedinPostId: "" }
                })
                console.log(`LinkedIn data removed for user ${id}`);
            } catch (error) {
                console.error("Error deleting LinkedIn data:", err.message);
            }
        }, 2 * 60 * 1000)

        await getUser.save()

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}




export const getLinkedinAnalysisResult = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    try {
        const { name } = req.query;  // ✅ get name from query params

        // build match for populate
        let match = {};
        if (name) {
            match.$or = [
                { name: { $regex: new RegExp(name, "i") } },
                { title: { $regex: new RegExp(name, "i") } }
            ];
        }

        let linkedinCondition = {
            $or: [
                { LinkedinPostId: { $exists: true, $ne: null } },
                { LinkedinContentId: { $exists: true, $ne: null } }
            ]
        };

        // fetch paginated results
        let result = await UserModel.find(linkedinCondition)
            .populate("LinkedinPostId")
            .populate({
                path: "LinkedinContentId",
                match  // ✅ use the new match object here
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // filter out docs where LinkedinContentId didn’t match
        result = result.filter(u => u.LinkedinContentId);

        // fetch total count
        let totalDocs = await UserModel.find(linkedinCondition)
            .populate({
                path: "LinkedinContentId",
                match  // ✅ also here
            });

        const total = totalDocs.filter(u => u.LinkedinContentId).length;
        let data = result.map((val) => ({
            ...val.toObject(),
            createdAt: shordataformate(val.createdAt),
            updatedAt: shordataformate(val.updatedAt),

        }))

        return res.status(200).json({
            result: data,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};



export const getLinkedinUserProfile = async (req, res) => {
    const { id } = req.params
    try {
        const getUser = await UserModel.findById(id)
            .populate("LinkedinContentId")
            .populate("LinkedinPostId");
        if (!getUser) {
            return res.status(404).json({ message: "User not found" })
        }

        res.status(200).json(getUser);




    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}
export const LinkedinuserDelete = async (req, res) => {
    try {
        const { id } = req.params;
        let Finduser = await UserModel.findById(id);

        if (!Finduser) {
            return res
                .status(404)
                .json({ message: "Linkedin Profile not found with this Id" });
        }
        if (Finduser.LinkedinPostId) {
            await LinkedinPost.findByIdAndDelete(Finduser.LinkedinPostId)
            Finduser.LinkedinPostId = null
        }
        if (Finduser.LinkedinContentId) {
            await LinkedinContent.findByIdAndDelete(Finduser.LinkedinContentId)
            Finduser.LinkedinContentId = null
        }
        await Finduser.save()
        return res.status(200).json({ message: "User LinkedIn data removed", user: Finduser });
    } catch (error) {
        console.log("Erron in the PackageDelete", error);
        return res.status(500).json({ message: error.message });
    }
};

export const getLatestDISCAnalysis = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const latestAnalysis = await DISCProfile.findOne({ userId })
            .sort({ createdAt: -1 })
            .populate('linkedinContentId')
            .populate('linkedinPostId');

        if (!latestAnalysis) {
            return res.status(404).json({ 
                message: "No DISC analysis found for this user. Please analyze a profile first." 
            });
        }

        try {
            const origin = req.headers.origin || '*';
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Credentials', 'false');
        } catch (e) {}

        return res.status(200).json({
            success: true,
            analysis: latestAnalysis
        });

    } catch (error) {
        console.error("Error fetching latest DISC analysis:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const getDISCAnalysisById = async (req, res) => {
    try {
        const { analysisId: rawAnalysisId } = req.params;
        const analysisId = String(rawAnalysisId || '').trim();

        // If no id was provided (client called /disc/analysis/), try to return the authenticated user's history
        if (!analysisId) {
            // attempt to decode JWT from cookie or Authorization header
            let token = req.cookies?.token || null;
            if (!token && req.headers?.authorization && req.headers.authorization.startsWith('Bearer ')) {
                token = req.headers.authorization.split(' ')[1];
            }

            if (!token) return res.status(401).json({ success: false, message: 'Authentication required to fetch user history' });

            let payload;
            try {
                payload = jwt.verify(token, process.env.JWT_SECRET);
            } catch (err) {
                return res.status(401).json({ success: false, message: 'Invalid or expired token' });
            }

            const userId = payload._id || payload.id || payload.userId || null;
            if (!userId) return res.status(401).json({ success: false, message: 'Invalid token payload' });

            // reuse getAllDISCAnalysesByUser logic: fetch and return analyses for this user
            const analyses = await DISCProfile.find({ userId })
                .sort({ createdAt: -1 })
                .limit(50)
                .populate('linkedinContentId')
                .populate('linkedinPostId');

            try { const origin = req.headers.origin || '*'; res.setHeader('Access-Control-Allow-Origin', origin); res.setHeader('Access-Control-Allow-Credentials', 'false'); } catch (e) {}
            return res.status(200).json({ success: true, analyses });
        }

        // Try to normalize/accept common client id formats: trim, and extract a 24-hex ObjectId if embedded
        const mongoose = await import('mongoose');
        let resolvedId = analysisId;
        if (!mongoose.Types.ObjectId.isValid(resolvedId)) {
            const m = analysisId.match(/([a-fA-F0-9]{24})/);
            if (m) resolvedId = m[1];
        }

        if (!mongoose.Types.ObjectId.isValid(resolvedId)) {
            // treat as not found instead of a hard 400 so clients (extensions) can handle gracefully
            return res.status(404).json({ success: false, message: 'Analysis not found' });
        }

        const analysis = await DISCProfile.findById(resolvedId)
            .populate('userId')
            .populate('linkedinContentId')
            .populate('linkedinPostId');

        if (!analysis) {
            return res.status(404).json({ success: false, message: "No analysis history found for this user." });
        }

        try { const origin = req.headers.origin || '*'; res.setHeader('Access-Control-Allow-Origin', origin); res.setHeader('Access-Control-Allow-Credentials', 'false'); } catch (e) {}
        return res.status(200).json({ success: true, analysis: analysis });


    } catch (error) {
        console.error("Error fetching DISC analysis:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const getAllDISCAnalysesByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // return full analysis documents (populated) so clients can render the complete report
        const analyses = await DISCProfile.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('linkedinContentId')
            .populate('linkedinPostId');

        const total = await DISCProfile.countDocuments({ userId });

        // Build a response where each history item includes the full analysis document
        // and a compact `summary` used by the UI (keeps backward compatibility)
        const responseAnalyses = analyses.map(analysis => {
            const doc = analysis.toObject ? analysis.toObject() : analysis;

            const summary = {
                _id: doc._id,
                profile: {
                    name: doc.linkedinContentId?.name || 'Unknown',
                    title: doc.linkedinContentId?.title || 'N/A',
                    company: doc.linkedinContentId?.company || 'N/A',
                    location: doc.linkedinContentId?.location || 'N/A',
                    profilePicture: doc.linkedinContentId?.profilePicture || '',
                    linkedinURL: doc.linkedinContentId?.LinkedinURL || ''
                },
                productDescription: doc.productDescription,
                executive: doc.executive,
                quickSummary: doc.quickSummary || null,
                actionableMetrics: doc.actionableMetrics || null,
                preferenceSnapshot: doc.preferenceSnapshot || null,
                personality: {
                    disc: doc.personality?.disc,
                    bullets: doc.personality?.bullets,
                    primaryType: doc.personality?.primaryType,
                    secondaryType: doc.personality?.secondaryType
                },
                talkingPoints: (doc.talkingPoints || []).slice(0, 5),
                openingScripts: doc.openingScripts,
                objectionHandling: (doc.objectionHandling || []).slice(0, 5),
                personalizationCues: (doc.personalizationCues || []).slice(0, 5),
                nextActions: doc.nextActions,
                nextSteps: doc.nextSteps || null,
                companyOverview: doc.companyOverview || null,
                confidence: doc.confidence,
                analysisMetadata: doc.analysisMetadata,
                createdAt: doc.createdAt
            };

            return {
                analysis: doc,
                summary
            };
        });

        try {
            const origin = req.headers.origin || '*';
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Credentials', 'false');
        } catch (e) {
            // ignore header set errors
        }

        return res.status(200).json({
            success: true,
            count: responseAnalyses.length,
            total: total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            analyses: responseAnalyses,
            // Backwards-compatible alias for clients expecting a `history` field
            history: responseAnalyses.map(item => item.analysis)
        });

    } catch (error) {
        console.error("Error fetching user DISC analyses:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const getDISCAnalysisSummary = async (req, res) => {
    try {
        const { analysisId: rawAnalysisId } = req.params;
        const analysisId = String(rawAnalysisId || '').trim();
        const mongoose = await import('mongoose');
        let resolvedId = analysisId;
        if (!mongoose.Types.ObjectId.isValid(resolvedId)) {
            const m = analysisId.match(/([a-fA-F0-9]{24})/);
            if (m) resolvedId = m[1];
        }

        if (!mongoose.Types.ObjectId.isValid(resolvedId)) {
            return res.status(404).json({ success: false, message: 'Analysis not found' });
        }

        const analysis = await DISCProfile.findById(resolvedId)
            .populate('linkedinContentId', 'name title company location profilePicture LinkedinURL');

        if (!analysis) {
            return res.status(404).json({ message: "Analysis not found" });
        }

        const summary = {
            _id: analysis._id,
            profile: {
                name: analysis.linkedinContentId?.name || 'Unknown',
                title: analysis.linkedinContentId?.title || 'N/A',
                company: analysis.linkedinContentId?.company || 'N/A',
                location: analysis.linkedinContentId?.location || 'N/A',
                profilePicture: analysis.linkedinContentId?.profilePicture || '',
                linkedinURL: analysis.linkedinContentId?.LinkedinURL || ''
            },
            productDescription: analysis.productDescription,
            executive: analysis.executive,
            quickSummary: analysis.quickSummary || null,
            actionableMetrics: analysis.actionableMetrics || null,
            preferenceSnapshot: analysis.preferenceSnapshot || null,
            personality: {
                disc: analysis.personality.disc,
                bullets: analysis.personality.bullets,
                primaryType: analysis.personality.primaryType,
                secondaryType: analysis.personality.secondaryType
            },
            talkingPoints: analysis.talkingPoints.slice(0, 5),
            openingScripts: analysis.openingScripts,
            objectionHandling: analysis.objectionHandling.slice(0, 5),
            personalizationCues: analysis.personalizationCues.slice(0, 5),
            nextActions: analysis.nextActions,
            nextSteps: analysis.nextSteps || null,
            companyOverview: analysis.companyOverview || null,
            confidence: analysis.confidence,
            analysisMetadata: analysis.analysisMetadata,
            createdAt: analysis.createdAt
        };

        try { const origin = req.headers.origin || '*'; res.setHeader('Access-Control-Allow-Origin', origin); res.setHeader('Access-Control-Allow-Credentials', 'false'); } catch (e) {}
        return res.status(200).json({ success: true, summary: summary });

    } catch (error) {
        console.error("Error fetching DISC analysis summary:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const analyzeDISCProfileCompact = async (req, res) => {
    const { userId } = req.params;

    try {
        let user = await UserModel.findById(userId)
            .populate('LinkedinContentId')
            .populate('LinkedinPostId');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Ensure PlanId is populated so we can initialize SearchLimit from the purchased plan
        try {
            await user?.populate?.('PlanId', 'Package SearchLimitMonthly SearchLimitYearly name');
        } catch (e) {
            // non-fatal: proceed without populated plan
        }

        // If user has no SearchLimit set but has a plan with a monthly allowance, initialize it now
        try {
            const planLimit = user?.PlanId?.SearchLimitMonthly ?? 0;
            if ((user.SearchLimit === 0 || user.SearchLimit == null) && planLimit > 0) {
                await UserModel.findByIdAndUpdate(userId, { $set: { SearchLimit: planLimit } });
                user.SearchLimit = planLimit;
                console.log(`Initialized SearchLimit from plan for user ${userId}: ${planLimit}`);
            }
        } catch (err) {
            console.warn('Failed to initialize SearchLimit from plan:', err?.message || err);
        }

        const parsedSearchLimit = parseSearchLimit(user.SearchLimit);
        if (parsedSearchLimit !== null && parsedSearchLimit <= 0) {
            return res.status(403).json({
                message: "Search limit reached. Please upgrade your plan to continue.",
                redirectToPricing: true,
                remainingSearchLimit: 0
            });
        }

        const { productDescription: bodyProductDescription, productPrice: bodyProductPrice } = req.body || {};

        const productDescriptionToUse = bodyProductDescription || user.pendingProductDescription;

        let productPriceToUse = null;
        if (bodyProductPrice !== undefined && bodyProductPrice !== null && bodyProductPrice !== '') {
            const parsed = typeof bodyProductPrice === 'number' ? bodyProductPrice : parseFloat(String(bodyProductPrice).replace(/[^0-9.\-]/g, ''));
            productPriceToUse = Number.isFinite(parsed) ? parsed : null;
        } else if (user.pendingProductPrice !== undefined && user.pendingProductPrice !== null) {
            productPriceToUse = user.pendingProductPrice;
        }

        if (!productDescriptionToUse) {
            return res.status(400).json({ message: "No product description found. Please save it first or include it in the request body." });
        }

        if (!user.LinkedinContentId) {
            return res.status(400).json({ message: "No LinkedIn profile data found. Please upload profile first." });
        }

        console.log("🔄 Starting compact DISC analysis...");

        const profileData = user.LinkedinContentId.toObject ? user.LinkedinContentId.toObject() : user.LinkedinContentId;

        const rawPosts = await LinkedinPost.find({
            profileId: user.LinkedinContentId._id
        }).sort({ createdAt: -1 }).limit(30);

        const embeddedPosts = Array.isArray(profileData.posts) ? profileData.posts : [];

        const combinedPostSources = [
            ...rawPosts,
            ...(embeddedPosts.length > 0
                ? [{
                    _id: user.LinkedinContentId._id,
                    profileId: user.LinkedinContentId._id,
                    posts: embeddedPosts,
                    postsCount: profileData.postsCount ?? profileData.postCount ?? embeddedPosts.length
                }]
                : [])
        ];

        const postsData = normalizeLinkedInPosts(combinedPostSources, 30);

        console.log(`📊 (compact) Analyzing profile: ${profileData.name} with ${postsData.length} posts (rawDocs=${rawPosts.length}, embedded=${embeddedPosts.length})`);

        const analysisResult = await analyzeLinkedInProfile(
            profileData,
            postsData,
            productDescriptionToUse,
            productPriceToUse
        );

        const profileDISC = analysisResult.personality.disc;
        const confidenceResult = analysisResult.confidence;

        const dataSources = [];
        if (user.LinkedinContentId._id) dataSources.push(`profile_${user.LinkedinContentId._id}`);
        if (postsData.length > 0) dataSources.push(`posts_${postsData.length}_items`);
        dataSources.push('about_section', 'experience_section', 'skills_section');

        const discProfileDoc = new DISCProfile({
            userId: userId,
            linkedinContentId: user.LinkedinContentId._id,
            linkedinPostId: user.LinkedinPostId?._id || null,
            productDescription: productDescriptionToUse,
            productPrice: productPriceToUse || null,
            executive: analysisResult.executive,
            starting: analysisResult.starting,
            personality: analysisResult.personality,
            talkingPoints: analysisResult.talkingPoints,
            openingScripts: analysisResult.openingScripts,
            objectionHandling: analysisResult.objectionHandling,
            personalizationCues: analysisResult.personalizationCues,
            nextActions: analysisResult.nextActions,
            nextSteps: analysisResult.nextSteps || null,
            confidence: confidenceResult,
            quickSummary: analysisResult.quickSummary || null,
            actionableMetrics: analysisResult.actionableMetrics || null,
            preferenceSnapshot: analysisResult.preferenceSnapshot || null,
            probabilityToPurchase: analysisResult.probabilityToPurchase || null,
            commonGroundAndSharedVision: analysisResult.commonGroundAndSharedVision || null,
            confidenceExplanation: analysisResult.confidenceExplanation || null,
            executiveSummary: analysisResult.executiveSummary || null,
            companyOverview: analysisResult.companyOverview || null,
            communicationStrategy: analysisResult.communicationStrategy || null,
            dataSources,
            analysisMetadata: analysisResult.analysisMetadata
        });

        await discProfileDoc.save();

        if (!bodyProductDescription) {
            await UserModel.findByIdAndUpdate(userId, {
                $unset: { pendingLinkedInURL: "", pendingProductDescription: "", pendingProductPrice: "" }
            });
        }

        let remainingSearchLimit = parsedSearchLimit;
        try {
            const updatedUser = await UserModel.findOneAndUpdate(
                { _id: userId, SearchLimit: { $gte: 1 } },
                { $inc: { SearchLimit: -1 } },
                { new: true, projection: { SearchLimit: 1 } }
            );

            if (updatedUser) {
                remainingSearchLimit = parseSearchLimit(updatedUser.SearchLimit);
                console.log(`🔻 SearchLimit decremented (compact). Remaining: ${remainingSearchLimit}`);
            } else if (parsedSearchLimit !== null) {
                remainingSearchLimit = Math.max(parsedSearchLimit - 1, 0);
                console.warn('⚠️ SearchLimit update failed (compact); falling back to virtual decrement.');
            }
        } catch (err) {
            console.error('❌ Failed to decrement SearchLimit (compact):', err.message);
            if (parsedSearchLimit !== null) remainingSearchLimit = Math.max(parsedSearchLimit - 1, 0);
        }

        console.log("✅ Compact DISC analysis completed successfully");

        // Set CORS response header to reflect the incoming origin for chrome-extension compatibility
        try {
            const origin = req.headers.origin || '*';
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Credentials', 'false');
        } catch (e) {
            // ignore header set errors
        }

        const compact = {
            personality: discProfileDoc.personality,
            talkingPoints: discProfileDoc.talkingPoints,
            approachGuidance: discProfileDoc.personality?.approachGuidance || discProfileDoc.personality?.approach || null,
            companyOverview: discProfileDoc.companyOverview || null,
            nextSteps: discProfileDoc.nextSteps || null,
            analysisId: discProfileDoc._id
        };

        return res.status(200).json({
            message: "DISC compact analysis completed",
            compact,
            remainingSearchLimit: remainingSearchLimit === null ? null : Math.max(remainingSearchLimit, 0)
        });

    } catch (error) {
        console.error("❌ Compact DISC analysis failed:", error);
        return res.status(500).json({ message: error.message });
    }
};