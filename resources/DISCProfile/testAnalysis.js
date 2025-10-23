import DISCProfile from './DISCProfileModel.js';
import LinkedinContent from '../linkedin/LinkedinContent.model.js';
import LinkedinPost from '../linkedin/LinkedinPost.model.js';
import UserModel from '../user/userModel.js';
import { analyzeLinkedInProfile } from './analysisEngine.js';
import { calculateConfidenceScore } from './confidenceScoring.js';

export async function testDISCAnalysis() {
    console.log("=== Testing DISC Analysis System ===\n");

    try {
        const testUser = await UserModel.findOne({}).limit(1);
        
        if (!testUser) {
            console.log("❌ No test user found. Please create a user first.");
            return;
        }

        console.log(`✓ Found test user: ${testUser._id}`);

        const linkedinProfile = await LinkedinContent.findOne({}).limit(1);
        
        if (!linkedinProfile) {
            console.log("❌ No LinkedIn profile found. Please upload LinkedIn data first.");
            return;
        }

        console.log(`✓ Found LinkedIn profile: ${linkedinProfile.name || 'Unknown'}`);

        const linkedinPosts = await LinkedinPost.findOne({}).limit(1);
        const posts = linkedinPosts?.posts || [];
        
        console.log(`✓ Found ${posts.length} posts\n`);

        console.log("🔄 Starting DISC analysis...\n");

        const productDescription = "AI-powered CRM software that helps sales teams close more deals faster";

        const analysisResult = await analyzeLinkedInProfile(
            linkedinProfile.toObject(),
            posts,
            productDescription
        );

        console.log("✓ Analysis completed!");
        console.log("\n=== DISC Scores ===");
        console.log(`D (Dominance): ${analysisResult.personality.disc.D}`);
        console.log(`I (Influence): ${analysisResult.personality.disc.I}`);
        console.log(`S (Steadiness): ${analysisResult.personality.disc.S}`);
        console.log(`C (Conscientiousness): ${analysisResult.personality.disc.C}`);
        console.log(`Primary Type: ${analysisResult.personality.primaryType}`);
        console.log(`Secondary Type: ${analysisResult.personality.secondaryType}`);

        const confidenceResult = calculateConfidenceScore(
            linkedinProfile.toObject(),
            posts,
            analysisResult.personality.disc,
            analysisResult.personality.disc,
            analysisResult.personality.disc,
            analysisResult.personality.disc
        );

        console.log("\n=== Confidence Score ===");
        console.log(`Overall Score: ${confidenceResult.score}/100`);
        console.log("Breakdown:");
        console.log(`  - Completeness: ${confidenceResult.breakdown.completeness}`);
        console.log(`  - Sample Quality: ${confidenceResult.breakdown.sampleQuality}`);
        console.log(`  - Recency: ${confidenceResult.breakdown.recency}`);
        console.log(`  - Agreement: ${confidenceResult.breakdown.agreement}`);
        console.log(`  - Signal Strength: ${confidenceResult.breakdown.signalStrength}`);
        
        if (confidenceResult.warnings.length > 0) {
            console.log("\nWarnings:");
            confidenceResult.warnings.forEach(w => console.log(`  ⚠ ${w}`));
        }

        console.log("\n=== Executive Summary ===");
        console.log(analysisResult.executive);

        console.log("\n=== Personality Bullets ===");
        analysisResult.personality.bullets.forEach((b, i) => {
            console.log(`  ${i + 1}. ${b}`);
        });

        console.log("\n=== Top Talking Points ===");
        analysisResult.talkingPoints.slice(0, 3).forEach((tp, i) => {
            console.log(`  ${i + 1}. ${tp.topic} - ${tp.why}`);
        });

        console.log("\n=== Opening Scripts ===");
        console.log("LinkedIn DM:");
        console.log(`  ${analysisResult.openingScripts.linkedin_dm[0]}`);
        console.log("\nEmail Subject:");
        console.log(`  ${analysisResult.openingScripts.email[0]?.subject}`);

        console.log("\n=== Next Actions ===");
        console.log(`Cadence: ${analysisResult.nextActions.cadence}`);
        analysisResult.nextActions.plan.slice(0, 3).forEach((action) => {
            console.log(`  Day ${action.day}: ${action.action} (${action.channel})`);
        });

        console.log("\n=== Analysis Metadata ===");
        console.log(`Profile Fields Used: ${analysisResult.analysisMetadata.profileFieldsUsed}`);
        console.log(`Posts Analyzed: ${analysisResult.analysisMetadata.postsAnalyzed}`);
        console.log(`Avg Engagement: ${analysisResult.analysisMetadata.avgPostEngagement}`);
        console.log(`Writing Tone: ${analysisResult.analysisMetadata.writingTone}`);

        console.log("\n✅ Test completed successfully!");
        console.log("\n📝 You can now use the API endpoint:");
        console.log("   POST /api/disc/analyze");
        console.log("   Body: { userId, productDescription }");

    } catch (error) {
        console.error("\n❌ Test failed:", error.message);
        console.error(error.stack);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    console.log("Running standalone test...");
    
    import('../database/db.js').then(() => {
        testDISCAnalysis().then(() => {
            console.log("\nTest completed. Exiting...");
            process.exit(0);
        });
    });
}
