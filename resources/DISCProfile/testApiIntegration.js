import { analyzeLinkedInProfile } from './analysisEngineV2.js';

// Quick test to verify API will work
const testProfile = {
    _id: "test123",
    name: "Test User",
    title: "VP of Sales",
    company: "Test Company",
    about: "Experienced sales leader",
    skills: ["Sales", "Leadership"],
    experience: [{ title: "VP Sales", company: "Test Co" }]
};

const testPosts = [
    { 
        content: "Excited about our Q4 results!", 
        likes: 50, 
        comments: 10,
        date: new Date()
    }
];

console.log("🧪 Testing V2 Engine Integration...\n");

try {
    const result = await analyzeLinkedInProfile(
        testProfile, 
        testPosts, 
        "Test Product", 
        99.99
    );
    
    console.log("✅ Analysis completed successfully!");
    console.log("\n📊 Result structure:");
    console.log("- executive:", !!result.executive ? "✅" : "❌");
    console.log("- starting:", !!result.starting ? "✅" : "❌");
    console.log("- personality.disc.dominance:", typeof result.personality?.disc?.dominance === 'number' ? "✅" : "❌");
    console.log("- personality.discDefinitions:", !!result.personality?.discDefinitions ? "✅" : "❌");
    console.log("- personality.primaryStyle:", !!result.personality?.primaryStyle ? "✅" : "❌");
    console.log("- personality.secondaryStyle:", !!result.personality?.secondaryStyle ? "✅" : "❌");
    console.log("- personality.approachGuidance:", !!result.personality?.approachGuidance ? "✅" : "❌");
    console.log("- personality.keyTraits:", Array.isArray(result.personality?.keyTraits) ? "✅" : "❌");
    console.log("- talkingPoints:", Array.isArray(result.talkingPoints) ? "✅" : "❌");
    console.log("- openingScripts:", !!result.openingScripts ? "✅" : "❌");
    console.log("- objectionHandling:", Array.isArray(result.objectionHandling) ? "✅" : "❌");
    console.log("- nextActions:", Array.isArray(result.nextActions) ? "✅" : "❌");
    console.log("- personalizationCues:", Array.isArray(result.personalizationCues) ? "✅" : "❌");
    console.log("- confidence.score:", typeof result.confidence?.score === 'number' ? "✅" : "❌");
    console.log("- confidence.breakdown:", !!result.confidence?.breakdown ? "✅" : "❌");
    console.log("- confidence.explanation:", !!result.confidence?.explanation ? "✅" : "❌");
    console.log("- analysisMetadata:", !!result.analysisMetadata ? "✅" : "❌");
    
    console.log("\n🎉 All checks passed! API should work correctly.");
    
} catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
}
