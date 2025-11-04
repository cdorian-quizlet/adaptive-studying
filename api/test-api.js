/**
 * Test Script for AI Coach API
 * 
 * Run this to verify your backend is working correctly:
 * node test-api.js
 */

const API_URL = 'http://localhost:3000';

async function testHealthCheck() {
    console.log('🔍 Testing health check endpoint...');
    try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        
        if (data.status === 'ok') {
            console.log('✅ Health check passed!');
            return true;
        } else {
            console.log('❌ Health check failed:', data);
            return false;
        }
    } catch (error) {
        console.log('❌ Health check failed:', error.message);
        console.log('   Make sure the backend server is running (npm start in api folder)');
        return false;
    }
}

async function testAICoach() {
    console.log('\n🤖 Testing AI Coach endpoint...');
    try {
        const response = await fetch(`${API_URL}/api/ai-coach`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: 'Say hello in one sentence',
                history: []
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.log('❌ AI Coach test failed:', errorData);
            return false;
        }
        
        const data = await response.json();
        
        if (data.success && data.response) {
            console.log('✅ AI Coach test passed!');
            console.log('📝 AI Response:', data.response);
            return true;
        } else {
            console.log('❌ AI Coach test failed: Invalid response format', data);
            return false;
        }
    } catch (error) {
        console.log('❌ AI Coach test failed:', error.message);
        
        if (error.message.includes('fetch')) {
            console.log('   Make sure the backend server is running');
        }
        
        return false;
    }
}

async function runTests() {
    console.log('╔════════════════════════════════════════════╗');
    console.log('║   AI Coach API Test Suite                 ║');
    console.log('╚════════════════════════════════════════════╝\n');
    
    const healthCheckPassed = await testHealthCheck();
    
    if (!healthCheckPassed) {
        console.log('\n⚠️  Cannot proceed with AI Coach test. Fix health check first.\n');
        process.exit(1);
    }
    
    const aiCoachPassed = await testAICoach();
    
    console.log('\n' + '═'.repeat(46));
    
    if (healthCheckPassed && aiCoachPassed) {
        console.log('🎉 All tests passed! Your AI Coach is ready to use!');
        console.log('\nNext steps:');
        console.log('1. Open your app');
        console.log('2. Click the sparkle FAB button');
        console.log('3. Ask the AI Coach a question\n');
    } else {
        console.log('❌ Some tests failed. Please check the errors above.\n');
        console.log('Troubleshooting:');
        console.log('• Make sure backend is running: npm start (in api folder)');
        console.log('• Check .env file has OPENAI_API_KEY');
        console.log('• Verify your OpenAI account has credits');
        console.log('• Check backend terminal for error messages\n');
        process.exit(1);
    }
}

// Run tests
runTests().catch(console.error);

