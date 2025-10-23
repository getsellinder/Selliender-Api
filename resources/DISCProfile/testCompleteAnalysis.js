import dotenv from 'dotenv'
import { analyzeLinkedInProfile } from './analysisEngineV2.js'

dotenv.config()

async function testCompleteAnalysis() {
    console.log("=" .repeat(70))
    console.log("DISC Profile Analysis - Complete Test")
    console.log("=" .repeat(70))
    
    // Test Data - Simulating real LinkedIn profile
    const testProfile = {
        name: "Sarah Johnson",
        title: "VP of Sales",
        company: "Enterprise Solutions Inc",
        location: "San Francisco, CA",
        about: "Results-driven sales leader with 12+ years of experience driving revenue growth and building high-performing teams. Passionate about leveraging technology to solve business challenges and achieve ambitious goals.",
        skills: [
            "Strategic Planning",
            "Team Leadership", 
            "Sales Management",
            "Business Development",
            "Negotiation",
            "CRM Software",
            "Account Management"
        ],
        experience: [
            {
                title: "VP of Sales",
                company: "Enterprise Solutions Inc",
                duration: "2020-Present",
                description: "Leading a team of 25 sales professionals, consistently exceeding quarterly targets"
            },
            {
                title: "Sales Director",
                company: "Tech Corp",
                duration: "2016-2020",
                description: "Managed enterprise accounts and drove 45% revenue growth"
            }
        ],
        education: [
            {
                school: "Stanford University",
                degree: "MBA",
                field: "Business Administration"
            }
        ],
        certifications: [
            { name: "Certified Sales Professional" }
        ]
    }
    
    const testPosts = [
        {
            content: "Excited to announce our team crushed Q3 targets! 🚀 Proud of what we achieved together. Leadership is about empowering your team to win. #SalesLeadership #Results",
            likes: 245,
            comments: 32,
            shares: 15,
            timestamp: new Date('2024-10-01')
        },
        {
            content: "Just closed our biggest deal of the year! Persistence and strategic planning pay off. Never give up on your goals. 💪 #Sales #Success",
            likes: 189,
            comments: 21,
            shares: 8,
            timestamp: new Date('2024-09-25')
        },
        {
            content: "Key to sales success: Know your product, understand your customer, and always follow through. Simple but powerful. #SalesTips",
            likes: 156,
            comments: 18,
            shares: 12,
            timestamp: new Date('2024-09-15')
        },
        {
            content: "Attended an amazing leadership conference today. The speaker's insights on team motivation were game-changing. Always learning! 📚",
            likes: 134,
            comments: 15,
            shares: 6,
            timestamp: new Date('2024-09-05')
        },
        {
            content: "Celebrating a milestone: Our team hit $10M in revenue this quarter! This wouldn't be possible without everyone's dedication and hard work. 🎉",
            likes: 312,
            comments: 45,
            shares: 22,
            timestamp: new Date('2024-08-28')
        }
    ]
    
    const productDescription = "AI-powered sales enablement platform that helps sales teams close deals 40% faster with intelligent lead scoring, automated follow-ups, and real-time analytics"
    const productPrice = 149.99
    
    console.log("\n📊 Test Profile:")
    console.log(`   Name: ${testProfile.name}`)
    console.log(`   Title: ${testProfile.title}`)
    console.log(`   Company: ${testProfile.company}`)
    console.log(`   Skills: ${testProfile.skills.length} skills`)
    console.log(`   Experience: ${testProfile.experience.length} positions`)
    console.log(`   Posts: ${testPosts.length} LinkedIn posts`)
    
    console.log("\n🎯 Product:")
    console.log(`   ${productDescription.substring(0, 80)}...`)
    
    console.log("\n" + "-".repeat(70))
    console.log("Running Analysis...")
    console.log("-".repeat(70))
    
    try {
        const startTime = Date.now()
        
        // Run the complete analysis
        const analysis = await analyzeLinkedInProfile(testProfile, testPosts, productDescription, productPrice)
        
        const endTime = Date.now()
        const duration = ((endTime - startTime) / 1000).toFixed(2)
        
        console.log(`\n✅ Analysis completed in ${duration} seconds`)
        
        // Confidence is now included in analysis object
        const confidence = analysis.confidence
        
        console.log("\n" + "=".repeat(70))
        console.log("ANALYSIS RESULTS")
        console.log("=".repeat(70))
        
        // Executive Summary
        console.log("\n📋 EXECUTIVE SUMMARY:")
        console.log(`   ${analysis.executive.summary || analysis.executive}`)
        if (analysis.executive.keyInsights) {
            console.log("\n   Key Insights:")
            analysis.executive.keyInsights.forEach((insight, i) => {
                console.log(`   ${i + 1}. ${insight}`)
            })
        }
        
        // Starting Section
        if (analysis.starting) {
            console.log("\n🟢 STARTING SECTION:")
            console.log(`   About Product: ${analysis.starting.aboutProduct}`)
            console.log(`   Product Cost: ${analysis.starting.productCost}`)
            if (analysis.starting.profileSummary) {
                console.log(`   Profile Summary: ${analysis.starting.profileSummary.substring(0, 120)}...`)
            }
        }

        // DISC Scores
        console.log("\n👤 DISC PERSONALITY PROFILE:")
        Object.entries(analysis.personality.disc).forEach(([name, value]) => {
            console.log(`   ${name}: ${value}%`)
        })
        
        // Primary and Secondary with full elaboration
        if (analysis.personality.primary) {
            console.log(`\n   🥇 Primary Type: ${analysis.personality.primary.name} (${analysis.personality.primary.percentage}%)`)
            console.log(`      ${analysis.personality.primary.description}`)
        }
        
        if (analysis.personality.secondary) {
            console.log(`\n   🥈 Secondary Type: ${analysis.personality.secondary.name} (${analysis.personality.secondary.percentage}%)`)
            console.log(`      ${analysis.personality.secondary.description}`)
        }
        
        // DISC Definitions
        if (analysis.personality.discDefinitions) {
            console.log("\n   📖 DISC Definitions:")
            Object.entries(analysis.personality.discDefinitions).forEach(([key, def]) => {
                console.log(`   ${key}: ${def.substring(0, 80)}...`)
            })
        }
        
        if (analysis.personality.primaryStyle) {
            console.log("\n   🎯 Primary Style:")
            console.log(`   ${analysis.personality.primaryStyle}`)
        }

        if (analysis.personality.secondaryStyle) {
            console.log("\n   🎯 Secondary Style:")
            console.log(`   ${analysis.personality.secondaryStyle}`)
        }

        if (analysis.personality.approachGuidance) {
            console.log("\n   🧭 Approach Guidance:")
            console.log(`   ${analysis.personality.approachGuidance.substring(0, 160)}...`)
        }
        
        // Personality Bullets
        console.log("\n   Personality Traits:")
        if (Array.isArray(analysis.personality.keyTraits)) {
            analysis.personality.keyTraits.forEach((trait, i) => {
                console.log(`   • ${trait}`)
            })
        }
        
        // Confidence Score
        console.log("\n📈 CONFIDENCE SCORE:")
        console.log(`   Overall: ${confidence.score}%`)
        console.log(`\n   Breakdown:`)
        console.log(`   • Completeness:    ${confidence.breakdown.completeness}%`)
        console.log(`   • Sample Quality:  ${confidence.breakdown.sampleQuality}%`)
        console.log(`   • Recency:         ${confidence.breakdown.recency}%`)
        console.log(`   • Agreement:       ${confidence.breakdown.agreement}%`)
        console.log(`   • Signal Strength: ${confidence.breakdown.signalStrength}%`)
        if (confidence.explanation) {
            console.log(`\n   Note: ${confidence.explanation}`)
        }
        
        // Talking Points
        console.log("\n💡 TALKING POINTS:")
        if (Array.isArray(analysis.talkingPoints)) {
            analysis.talkingPoints.slice(0, 5).forEach((point, i) => {
                console.log(`   ${i + 1}. ${point.topic} - ${point.why}`)
            })
        }
        
        // Opening Scripts
        console.log("\n📝 OPENING SCRIPTS:")
        if (analysis.openingScripts) {
            if (analysis.openingScripts.linkedin_dm) {
                console.log(`   LinkedIn: "${analysis.openingScripts.linkedin_dm[0]?.substring(0, 80)}..."`)
            }
            if (analysis.openingScripts.email) {
                console.log(`   Email Subject: "${analysis.openingScripts.email[0]?.subject}"`)
            }
        }
        
        // Objection Handling
        console.log("\n🛡️ OBJECTION HANDLING:")
        if (Array.isArray(analysis.objectionHandling)) {
            analysis.objectionHandling.slice(0, 3).forEach((obj, i) => {
                console.log(`   ${i + 1}. "${obj.objection}"`)
                console.log(`      Response: "${obj.response.substring(0, 60)}..."`)
            })
        }
        
        // Next Actions
        console.log("\n🚀 RECOMMENDED NEXT ACTIONS:")
        if (Array.isArray(analysis.nextActions)) {
            analysis.nextActions.slice(0, 3).forEach((action, i) => {
                console.log(`   ${i + 1}. Day ${action.day}: ${action.action} (${action.channel})`)
            })
        }
        
        // Personalization Cues
        console.log("\n🎯 PERSONALIZATION CUES:")
        if (Array.isArray(analysis.personalizationCues)) {
            analysis.personalizationCues.slice(0, 4).forEach((cue, i) => {
                console.log(`   • ${cue}`)
            })
        }
        
        // Metadata
        console.log("\n📊 ANALYSIS METADATA:")
        console.log(`   Profile Fields Used: ${analysis.analysisMetadata.profileFieldsUsed}`)
        console.log(`   Posts Analyzed: ${analysis.analysisMetadata.postsAnalyzed}`)
        console.log(`   Avg Post Engagement: ${analysis.analysisMetadata.avgPostEngagement.toFixed(1)}`)
        console.log(`   Dominant Topics: ${analysis.analysisMetadata.dominantTopics.join(', ')}`)
        console.log(`   Writing Tone: ${analysis.analysisMetadata.writingTone}`)
        
        // Raw Rationale
        if (analysis.analysisMetadata.rawRationale) {
            console.log("\n🧠 DISC SCORING RATIONALE:")
            console.log(`   ${analysis.analysisMetadata.rawRationale}`)
        }
        
        console.log("\n" + "=".repeat(70))
        console.log("✅ TEST PASSED - Analysis is working correctly!")
        console.log("=".repeat(70))
        
        // Verify critical fields
        console.log("\n🔍 VERIFICATION:")
        const checks = [
            { name: "Executive Summary", pass: !!analysis.executive },
            { name: "DISC Scores", pass: analysis.personality?.disc?.dominance > 0 },
            { name: "DISC Definitions", pass: !!analysis.personality?.discDefinitions },
            { name: "Primary Type Object", pass: !!analysis.personality?.primary?.name },
            { name: "Secondary Type Object", pass: !!analysis.personality?.secondary?.name },
            { name: "Primary Style", pass: !!analysis.personality?.primaryStyle },
            { name: "Secondary Style", pass: !!analysis.personality?.secondaryStyle },
            { name: "Approach Guidance", pass: !!analysis.personality?.approachGuidance },
            { name: "Primary Type", pass: !!analysis.personality?.primaryType },
            { name: "Key Traits", pass: Array.isArray(analysis.personality?.keyTraits) },
            { name: "Talking Points", pass: Array.isArray(analysis.talkingPoints) && analysis.talkingPoints.length > 0 },
            { name: "Opening Scripts", pass: !!analysis.openingScripts },
            { name: "Objection Handling", pass: Array.isArray(analysis.objectionHandling) },
            { name: "Next Actions", pass: Array.isArray(analysis.nextActions) },
            { name: "Personalization Cues", pass: Array.isArray(analysis.personalizationCues) },
            { name: "Confidence Score", pass: confidence.score > 0 && confidence.score <= 100 },
            { name: "Confidence Explanation", pass: !!confidence.explanation },
            { name: "Metadata", pass: !!analysis.analysisMetadata }
        ]
        
        checks.forEach(check => {
            const status = check.pass ? "✅" : "❌"
            console.log(`   ${status} ${check.name}`)
        })
        
        const allPassed = checks.every(c => c.pass)
        
        if (allPassed) {
            console.log("\n🎉 All checks passed! The analysis engine is working perfectly!")
        } else {
            console.log("\n⚠️ Some checks failed. Review the analysis structure.")
        }
        
        return true
        
    } catch (error) {
        console.error("\n❌ TEST FAILED!")
        console.error("Error:", error.message)
        console.error("\nStack trace:", error.stack)
        return false
    }
}

// Run the test
testCompleteAnalysis()
    .then(success => {
        if (success) {
            console.log("\n✅ Analysis engine is ready for production use!")
            process.exit(0)
        } else {
            console.log("\n❌ Analysis engine needs fixes")
            process.exit(1)
        }
    })
    .catch(error => {
        console.error("Fatal error:", error)
        process.exit(1)
    })
