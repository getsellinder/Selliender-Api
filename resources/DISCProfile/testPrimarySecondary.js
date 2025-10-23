import { analyzeLinkedInProfile } from './analysisEngineV2.js';

const testProfile = {
    _id: "test123",
    name: "Sarah Johnson",
    title: "VP of Sales",
    company: "Enterprise Solutions Inc",
    about: "Experienced sales leader with 12+ years driving revenue growth",
    skills: ["Sales Leadership", "Team Building", "Strategic Planning"],
    experience: [
        { title: "VP Sales", company: "Enterprise Solutions Inc" },
        { title: "Sales Director", company: "Tech Corp" }
    ]
};

const testPosts = [
    { 
        content: "Excited to announce our team crushed Q3 targets! 🎯 $10M in new revenue. Leadership is about empowering people to achieve the impossible.", 
        likes: 150, 
        comments: 45,
        date: new Date('2024-09-15')
    },
    { 
        content: "Just wrapped up an amazing leadership conference. Key takeaway: Data-driven decisions win every time. #SalesLeadership", 
        likes: 89, 
        comments: 23,
        date: new Date('2024-09-10')
    }
];

console.log("🧪 Testing Personality Narrative...\n");

try {
    const result = await analyzeLinkedInProfile(
        testProfile, 
        testPosts, 
        "AI-powered sales enablement platform", 
        149.99
    );
    
    console.log("✅ Analysis completed!\n");
    
    console.log("📊 PERSONALITY STRUCTURE:");
    console.log("=" .repeat(70));
    
    console.log("\n🎯 DISC Scores:");
    Object.entries(result.personality.disc).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}%`);
    });
    
    console.log("\n📌 PRIMARY TYPE:");
    console.log(`   Type: ${result.personality.primary.type}`);
    console.log(`   Name: ${result.personality.primary.name}`);
    console.log(`   Percentage: ${result.personality.primary.percentage}%`);
    console.log(`   Description: ${result.personality.primary.description}`);
    
    console.log("\n📌 SECONDARY TYPE:");
    console.log(`   Type: ${result.personality.secondary.type}`);
    console.log(`   Name: ${result.personality.secondary.name}`);
    console.log(`   Percentage: ${result.personality.secondary.percentage}%`);
    console.log(`   Description: ${result.personality.secondary.description}`);
    
    console.log("\n💡 PRIMARY STYLE:");
    console.log(`   ${result.personality.primaryStyle}`);

    console.log("\n💡 SECONDARY STYLE:");
    console.log(`   ${result.personality.secondaryStyle}`);

    console.log("\n🧭 APPROACH GUIDANCE:");
    console.log(`   ${result.personality.approachGuidance.substring(0, 200)}...`);
    
    console.log("\n" + "=".repeat(70));
    console.log("🎉 Primary and Secondary are now user-friendly!");
    console.log("=".repeat(70));
    
    // Show JSON structure for API response
    console.log("\n📄 API RESPONSE STRUCTURE (personality section):");
    console.log(JSON.stringify({
        personality: {
            disc: result.personality.disc,
            primaryType: result.personality.primaryType,
            secondaryType: result.personality.secondaryType,
            primary: result.personality.primary,
            secondary: result.personality.secondary,
            primaryStyle: result.personality.primaryStyle,
            secondaryStyle: result.personality.secondaryStyle,
            approachGuidance: result.personality.approachGuidance
        }
    }, null, 2));
    
} catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
}
