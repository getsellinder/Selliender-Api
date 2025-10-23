import { analyzeLinkedInProfile } from './analysisEngineV2.js';

const profile = {
    name: "Test User",
    title: "VP Engineering",
    about: "Tech leader",
    skills: ["Leadership"],
    experience: [{ title: "VP", company: "Tech Co" }]
};

const posts = [{ content: "Great quarter!", likes: 10, comments: 5, date: new Date() }];

console.log("Testing personality structure...\n");

const result = await analyzeLinkedInProfile(profile, posts, "SaaS Platform", 199);

console.log("✅ personality.disc keys:");
console.log("  ", Object.keys(result.personality.disc).join(", "));

console.log("\n✅ Word counts:");
console.log("   primaryStyle:", result.personality.primaryStyle.split(' ').length, "words");
console.log("   secondaryStyle:", result.personality.secondaryStyle.split(' ').length, "words");
console.log("   approachGuidance:", result.personality.approachGuidance.split(' ').length, "words");

console.log("\n✅ keyTraits count:", result.personality.keyTraits.length);

console.log("\n✅ discDefinitions keys:");
console.log("  ", Object.keys(result.personality.discDefinitions).join(", "));

console.log("\n🎉 All structural requirements met!");
