import OpenAI from "openai"
import dotenv from "dotenv"

dotenv.config()

const openai = new OpenAI({
    apiKey: process.env.OPENAI_SECRET_KEY
})

async function testOpenAIConnection() {
    console.log("🔍 Testing OpenAI API Connection...")
    console.log("API Key (first 20 chars):", process.env.OPENAI_SECRET_KEY?.substring(0, 20) + "...")
    
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant. Respond with just 'Hello!'"
                },
                {
                    role: "user",
                    content: "Test connection"
                }
            ],
            max_tokens: 10,
            temperature: 0.7
        })

        console.log("✅ OpenAI API Connection Successful!")
        console.log("Response:", completion.choices[0].message.content)
        console.log("Model Used:", completion.model)
        console.log("Tokens Used:", completion.usage.total_tokens)
        
        return true
    } catch (error) {
        console.error("❌ OpenAI API Connection Failed!")
        console.error("Error:", error.message)
        
        if (error.status === 401) {
            console.error("🔑 Invalid API Key - Please check OPENAI_SECRET_KEY in .env")
        } else if (error.status === 429) {
            console.error("⚠️ Rate limit exceeded or quota reached")
        } else if (error.status === 500) {
            console.error("🔧 OpenAI server error - try again later")
        }
        
        return false
    }
}

async function testDISCAnalysis() {
    console.log("\n🧪 Testing DISC Analysis with OpenAI...")
    
    const testProfile = {
        name: "John Smith",
        title: "CEO & Founder",
        company: "Tech Startup Inc",
        about: "Passionate entrepreneur driving innovation in AI technology. Results-oriented leader with 10+ years building successful teams.",
        skills: ["Leadership", "Strategy", "Product Development", "Team Building"],
        experience: [
            { title: "CEO", company: "Tech Startup Inc", duration: "2020-Present" }
        ]
    }
    
    const testPosts = [
        { 
            content: "Excited to announce our product launch! We've achieved incredible results with our new AI platform. #Innovation #Success",
            likes: 150,
            comments: 25
        },
        {
            content: "Leadership is about empowering your team to win. Our team crushed it this quarter! 🚀",
            likes: 200,
            comments: 30
        }
    ]
    
    const productDescription = "AI-powered CRM software for sales teams"
    
    try {
        console.log("Profile:", testProfile.name, "-", testProfile.title)
        console.log("Posts:", testPosts.length)
        console.log("Product:", productDescription)
        
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a sales intelligence assistant. Generate a concise executive summary."
                },
                {
                    role: "user",
                    content: `Profile: ${testProfile.name}, ${testProfile.title} at ${testProfile.company}. DISC: High D (Dominant). Product: ${productDescription}. Create a 1-sentence summary.`
                }
            ],
            max_tokens: 60,
            temperature: 0.7
        })
        
        console.log("✅ DISC Analysis Test Successful!")
        console.log("Executive Summary:", completion.choices[0].message.content)
        console.log("Tokens Used:", completion.usage.total_tokens)
        
        return true
    } catch (error) {
        console.error("❌ DISC Analysis Test Failed!")
        console.error("Error:", error.message)
        return false
    }
}

async function runTests() {
    console.log("=" .repeat(60))
    console.log("OpenAI Integration Test Suite")
    console.log("=" .repeat(60))
    
    const connectionTest = await testOpenAIConnection()
    
    if (connectionTest) {
        await testDISCAnalysis()
    } else {
        console.log("\n⚠️ Skipping DISC test due to connection failure")
    }
    
    console.log("\n" + "=" .repeat(60))
    console.log("Test Complete!")
    console.log("=" .repeat(60))
}

runTests()
