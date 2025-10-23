import DISCProfile from "./DISCProfileModel.js";
import LinkedinContent from "../linkedin/LinkedinContent.model.js";
import LinkedinPost from "../linkedin/LinkedinPost.model.js";
import UserModel from "../user/userModel.js";
import { analyzeLinkedInProfile } from "./analysisEngineV2.js";
export const analyzeDISCProfile = async (req, res) => {
    try {
        const { userId, linkedinContentId, linkedinPostId, productDescription } = req.body;

        if (!userId || !productDescription) {
            return res.status(400).json({
                message: "userId and productDescription are required"
            });
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let profileData = null;
        let postsData = [];

        if (linkedinContentId) {
            profileData = await LinkedinContent.findById(linkedinContentId);
        } else if (user.LinkedinContentId) {
            profileData = await LinkedinContent.findById(user.LinkedinContentId);
        }

        if (!profileData) {
            return res.status(404).json({
                message: "LinkedIn profile data not found. Please upload LinkedIn data first."
            });
        }

        if (linkedinPostId) {
            const postsDoc = await LinkedinPost.findById(linkedinPostId);
            if (postsDoc && postsDoc.posts) {
                postsData = postsDoc.posts;
            }
        } else if (user.LinkedinPostId) {
            const postsDoc = await LinkedinPost.findById(user.LinkedinPostId);
            if (postsDoc && postsDoc.posts) {
                postsData = postsDoc.posts;
            }
        }

        if (profileData.posts && Array.isArray(profileData.posts) && profileData.posts.length > 0) {
            postsData = [...postsData, ...profileData.posts];
        }

        console.log(`Analyzing profile for ${profileData.name} with ${postsData.length} posts`);

        const analysisResult = await analyzeLinkedInProfile(
            profileData.toObject ? profileData.toObject() : profileData,
            postsData,
            productDescription
        );

        const dataSources = [];
        if (profileData._id) dataSources.push(`profile_${profileData._id}`);
        if (postsData.length > 0) dataSources.push(`posts_${postsData.length}_items`);
        dataSources.push('about_section', 'experience_section', 'skills_section');

        const discProfileDoc = new DISCProfile({
            userId: userId,
            linkedinContentId: profileData._id,
            linkedinPostId: linkedinPostId || user.LinkedinPostId,
            productDescription,
            executive: analysisResult.executive,
                starting: analysisResult.starting,
            personality: analysisResult.personality,
            talkingPoints: analysisResult.talkingPoints,
            openingScripts: analysisResult.openingScripts,
            objectionHandling: analysisResult.objectionHandling,
            personalizationCues: analysisResult.personalizationCues,
            nextActions: analysisResult.nextActions,
            confidence: analysisResult.confidence,
            dataSources,
            analysisMetadata: analysisResult.analysisMetadata
        });

        await discProfileDoc.save();

        return res.status(200).json({
            message: "DISC Profile analysis completed successfully",
            analysis: discProfileDoc
        });

    } catch (error) {
        console.error("Error in analyzeDISCProfile:", error);
        return res.status(500).json({
            message: "Failed to analyze DISC profile",
            error: error.message
        });
    }
};

export const getDISCProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const discProfile = await DISCProfile.findById(id)
            .populate('userId')
            .populate('linkedinContentId')
            .populate('linkedinPostId');

        if (!discProfile) {
            return res.status(404).json({ message: "DISC Profile not found" });
        }

        return res.status(200).json(discProfile);

    } catch (error) {
        console.error("Error in getDISCProfile:", error);
        return res.status(500).json({
            message: "Failed to retrieve DISC profile",
            error: error.message
        });
    }
};

export const getDISCProfilesByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const discProfiles = await DISCProfile.find({ userId })
            .sort({ createdAt: -1 })
            .populate('linkedinContentId')
            .populate('linkedinPostId');

        return res.status(200).json({
            count: discProfiles.length,
            profiles: discProfiles
        });

    } catch (error) {
        console.error("Error in getDISCProfilesByUser:", error);
        return res.status(500).json({
            message: "Failed to retrieve DISC profiles",
            error: error.message
        });
    }
};

export const getAllDISCProfiles = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const { name, minConfidence } = req.query;

        let matchConditions = {};

        if (minConfidence) {
            matchConditions['confidence.score'] = { $gte: parseInt(minConfidence) };
        }

        let discProfiles = await DISCProfile.find(matchConditions)
            .populate('userId')
            .populate('linkedinContentId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        if (name) {
            discProfiles = discProfiles.filter(profile => {
                if (profile.linkedinContentId && profile.linkedinContentId.name) {
                    return profile.linkedinContentId.name.toLowerCase().includes(name.toLowerCase());
                }
                return false;
            });
        }

        const total = await DISCProfile.countDocuments(matchConditions);

        return res.status(200).json({
            profiles: discProfiles,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total
        });

    } catch (error) {
        console.error("Error in getAllDISCProfiles:", error);
        return res.status(500).json({
            message: "Failed to retrieve DISC profiles",
            error: error.message
        });
    }
};

export const deleteDISCProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const discProfile = await DISCProfile.findByIdAndDelete(id);

        if (!discProfile) {
            return res.status(404).json({ message: "DISC Profile not found" });
        }

        return res.status(200).json({
            message: "DISC Profile deleted successfully",
            deletedProfile: discProfile
        });

    } catch (error) {
        console.error("Error in deleteDISCProfile:", error);
        return res.status(500).json({
            message: "Failed to delete DISC profile",
            error: error.message
        });
    }
};

export const updateDISCProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const discProfile = await DISCProfile.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        )
            .populate('userId')
            .populate('linkedinContentId')
            .populate('linkedinPostId');

        if (!discProfile) {
            return res.status(404).json({ message: "DISC Profile not found" });
        }

        return res.status(200).json({
            message: "DISC Profile updated successfully",
            profile: discProfile
        });

    } catch (error) {
        console.error("Error in updateDISCProfile:", error);
        return res.status(500).json({
            message: "Failed to update DISC profile",
            error: error.message
        });
    }
};

export const reanalyzeDISCProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { productDescription } = req.body;

        const existingProfile = await DISCProfile.findById(id);
        if (!existingProfile) {
            return res.status(404).json({ message: "DISC Profile not found" });
        }

        const profileData = await LinkedinContent.findById(existingProfile.linkedinContentId);
        let postsData = [];

        if (existingProfile.linkedinPostId) {
            const postsDoc = await LinkedinPost.findById(existingProfile.linkedinPostId);
            if (postsDoc && postsDoc.posts) {
                postsData = postsDoc.posts;
            }
        }

        const newProductDescription = productDescription || existingProfile.productDescription;

        const analysisResult = await analyzeLinkedInProfile(
            profileData.toObject(),
            postsData,
            newProductDescription
        );

            existingProfile.productDescription = newProductDescription;
            existingProfile.executive = analysisResult.executive;
            existingProfile.starting = analysisResult.starting;
            existingProfile.personality = analysisResult.personality;
            existingProfile.talkingPoints = analysisResult.talkingPoints;
            existingProfile.openingScripts = analysisResult.openingScripts;
            existingProfile.objectionHandling = analysisResult.objectionHandling;
            existingProfile.personalizationCues = analysisResult.personalizationCues;
            existingProfile.nextActions = analysisResult.nextActions;
            existingProfile.confidence = analysisResult.confidence;
            existingProfile.analysisMetadata = analysisResult.analysisMetadata;

        await existingProfile.save();

        return res.status(200).json({
            message: "DISC Profile reanalyzed successfully",
            profile: existingProfile
        });

    } catch (error) {
        console.error("Error in reanalyzeDISCProfile:", error);
        return res.status(500).json({
            message: "Failed to reanalyze DISC profile",
            error: error.message
        });
    }
};
