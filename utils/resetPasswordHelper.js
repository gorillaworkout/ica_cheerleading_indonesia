// Helper script untuk debug reset password
// Jalankan di browser console jika ada masalah redirect

function debugResetPassword() {
    console.log("🔍 DEBUGGING RESET PASSWORD")
    console.log("Current URL:", window.location.href)
    console.log("Pathname:", window.location.pathname)
    console.log("Hash:", window.location.hash)
    console.log("Search:", window.location.search)
    
    // Check if we have reset token in hash
    const hasResetToken = window.location.hash.includes('access_token=') && window.location.hash.includes('type=recovery')
    console.log("Has Reset Token:", hasResetToken)
    
    // Check if we're on wrong page
    const isOnForgotPage = window.location.pathname.includes('forgot-password')
    const isOnResetPage = window.location.pathname.includes('reset-password')
    
    console.log("On forgot-password page:", isOnForgotPage)
    console.log("On reset-password page:", isOnResetPage)
    
    if (hasResetToken && isOnForgotPage) {
        console.log("❌ PROBLEM: Reset token found but on forgot-password page")
        console.log("✅ SOLUTION: Redirect to reset-password page")
        
        const currentUrl = window.location.href
        const correctUrl = currentUrl.replace('/forgot-password', '/reset-password')
        console.log("Correct URL should be:", correctUrl)
        
        if (confirm("Redirect to correct reset password page?")) {
            window.location.href = correctUrl
        }
    } else if (hasResetToken && isOnResetPage) {
        console.log("✅ Correct: Reset token found and on reset-password page")
    } else if (!hasResetToken) {
        console.log("ℹ️ No reset token found - this is expected for normal browsing")
    }
}

function extractTokenInfo() {
    const hash = window.location.hash
    if (!hash.includes('access_token=')) {
        console.log("No access token in URL")
        return null
    }
    
    const params = new URLSearchParams(hash.substring(1))
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const expiresAt = params.get('expires_at')
    const tokenType = params.get('token_type')
    const type = params.get('type')
    
    console.log("Token Info:")
    console.log("- Access Token Length:", accessToken?.length)
    console.log("- Refresh Token Length:", refreshToken?.length)
    console.log("- Expires At:", expiresAt)
    console.log("- Token Type:", tokenType)
    console.log("- Type:", type)
    
    if (expiresAt) {
        const expiryTime = new Date(parseInt(expiresAt) * 1000)
        const currentTime = new Date()
        const isExpired = currentTime > expiryTime
        
        console.log("- Expiry Time:", expiryTime.toISOString())
        console.log("- Current Time:", currentTime.toISOString())
        console.log("- Is Expired:", isExpired)
        
        if (isExpired) {
            console.log("❌ TOKEN IS EXPIRED - Request new reset link")
        } else {
            console.log("✅ Token is still valid")
        }
    }
    
    return {
        accessToken,
        refreshToken,
        expiresAt,
        tokenType,
        type
    }
}

// Auto-run debug
console.log("Reset Password Helper Loaded")
console.log("Run debugResetPassword() to debug")
console.log("Run extractTokenInfo() to see token details")

// Auto debug if we detect potential issue
if (typeof window !== 'undefined') {
    const hasResetToken = window.location.hash.includes('access_token=') && window.location.hash.includes('type=recovery')
    const isOnForgotPage = window.location.pathname.includes('forgot-password')
    
    if (hasResetToken && isOnForgotPage) {
        console.log("🚨 AUTO-DETECTED ISSUE: Reset token on wrong page")
        debugResetPassword()
    }
}
