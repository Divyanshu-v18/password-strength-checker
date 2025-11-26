// DOM Elements
const passwordInput = document.getElementById('passwordInput');
const toggleBtn = document.getElementById('toggleBtn');
const copyBtn = document.getElementById('copyBtn');
const strengthBar = document.getElementById('strengthBar');
const strengthLabel = document.getElementById('strengthLabel');
const crackTime = document.getElementById('crackTime');
const entropyValue = document.getElementById('entropyValue');

// Requirement elements
const reqLength = document.getElementById('req-length');
const reqUppercase = document.getElementById('req-uppercase');
const reqLowercase = document.getElementById('req-lowercase');
const reqNumber = document.getElementById('req-number');
const reqSpecial = document.getElementById('req-special');
const reqCommon = document.getElementById('req-common');

// Common passwords list
let commonPasswords = new Set();

// Load common passwords
fetch('common_passwords.txt')
    .then(response => response.text())
    .then(data => {
        commonPasswords = new Set(data.split('\n').map(p => p.trim().toLowerCase()));
    })
    .catch(err => console.log('Common passwords file not found, skipping dictionary check'));

// Toggle password visibility
toggleBtn.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    
    const eyeIcon = document.getElementById('eyeIcon');
    if (type === 'text') {
        eyeIcon.innerHTML = `
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
        `;
    } else {
        eyeIcon.innerHTML = `
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        `;
    }
});

// Copy password to clipboard
copyBtn.addEventListener('click', async () => {
    const password = passwordInput.value;
    
    if (!password) {
        copyBtn.classList.add('shake');
        setTimeout(() => copyBtn.classList.remove('shake'), 300);
        return;
    }
    
    let copySuccess = false;
    
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(password);
            copySuccess = true;
        } catch (err) {
            console.log('Clipboard API failed, trying fallback method');
        }
    }
    
    // Fallback method for older browsers or non-HTTPS
    if (!copySuccess) {
        try {
            // Create temporary textarea
            const textArea = document.createElement('textarea');
            textArea.value = password;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            // Execute copy command
            copySuccess = document.execCommand('copy');
            document.body.removeChild(textArea);
        } catch (err) {
            console.error('Fallback copy failed:', err);
        }
    }
    
    // Visual feedback
    const originalHTML = copyBtn.innerHTML;
    
    if (copySuccess) {
        copyBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        `;
        copyBtn.style.color = '#48bb78';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
            copyBtn.style.color = '';
        }, 2000);
    } else {
        // Show error feedback
        copyBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        `;
        copyBtn.style.color = '#f56565';
        copyBtn.classList.add('shake');
        
        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
            copyBtn.style.color = '';
            copyBtn.classList.remove('shake');
        }, 2000);
        
        // Alert user as last resort
        alert('Copy failed. Please manually select and copy the password.');
    }
});

// Password strength checker
passwordInput.addEventListener('input', () => {
    const password = passwordInput.value;
    
    if (!password) {
        resetStrength();
        return;
    }
    
    checkPasswordStrength(password);
});

// Calculate password entropy
function calculateEntropy(password) {
    if (!password) return { entropy: 0, combinations: 0 };
    
    let charsetSize = 0;
    
    // Determine character set size
    if (/[a-z]/.test(password)) charsetSize += 26; // lowercase
    if (/[A-Z]/.test(password)) charsetSize += 26; // uppercase
    if (/[0-9]/.test(password)) charsetSize += 10; // numbers
    if (/[^A-Za-z0-9]/.test(password)) charsetSize += 32; // special characters (approximate)
    
    // Calculate entropy: log2(charsetSize^length)
    const entropy = password.length * Math.log2(charsetSize);
    
    // Calculate total possible combinations
    const combinations = Math.pow(charsetSize, password.length);
    
    return { entropy, combinations };
}

// Detect common patterns that reduce effective security
function detectPatterns(password) {
    let patternPenalty = 0;
    
    // Check for repeated characters (like "aaa" or "111")
    if (/(.)\1{2,}/.test(password)) patternPenalty += 20;
    
    // Check for repeated patterns (like "abcabc" or "123123")
    for (let i = 2; i <= password.length / 2; i++) {
        const pattern = password.substring(0, i);
        const repeated = pattern.repeat(Math.floor(password.length / i));
        if (password.startsWith(repeated) && repeated.length >= password.length * 0.5) {
            patternPenalty += 30;
            break;
        }
    }
    
    // Check for keyboard patterns (qwerty, asdf, etc.)
    const keyboardPatterns = ['qwerty', 'asdf', 'zxcv', '1234', 'abcd'];
    for (const pattern of keyboardPatterns) {
        if (password.toLowerCase().includes(pattern)) {
            patternPenalty += 15;
        }
    }
    
    // Check for sequential characters (abc, 123, etc.)
    let sequentialCount = 0;
    for (let i = 0; i < password.length - 2; i++) {
        const char1 = password.charCodeAt(i);
        const char2 = password.charCodeAt(i + 1);
        const char3 = password.charCodeAt(i + 2);
        if (char2 === char1 + 1 && char3 === char2 + 1) {
            sequentialCount++;
        }
    }
    if (sequentialCount > 0) patternPenalty += sequentialCount * 10;
    
    return Math.min(patternPenalty, 60); // Cap penalty at 60 bits
}

// Calculate crack time based on entropy and patterns
function calculateCrackTime(entropy, password) {
    if (entropy === 0) return 'Instantly';
    
    // Reduce entropy based on detected patterns
    const patternPenalty = detectPatterns(password);
    const effectiveEntropy = Math.max(entropy - patternPenalty, 0);
    
    // Use effective entropy for more realistic results
    if (effectiveEntropy < 20) return 'Seconds';
    if (effectiveEntropy < 30) return 'Minutes';
    if (effectiveEntropy < 40) return 'Hours';
    if (effectiveEntropy < 50) return 'Days';
    if (effectiveEntropy < 60) return 'Months';
    if (effectiveEntropy < 70) return 'Years';
    if (effectiveEntropy < 80) return 'Decades';
    
    return 'Centuries';
}

// Format large numbers for display
function formatNumber(num) {
    if (num === 0) return '0';
    if (num < 1000) return num.toFixed(0);
    if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
    if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
    if (num < 1000000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num < 1000000000000000) return (num / 1000000000000).toFixed(1) + 'T';
    
    // For very large numbers, use scientific notation
    return num.toExponential(2);
}

function checkPasswordStrength(password) {
    let score = 0;
    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
        common: !commonPasswords.has(password.toLowerCase())
    };
    
    // Update requirement indicators
    updateRequirement(reqLength, checks.length);
    updateRequirement(reqUppercase, checks.uppercase);
    updateRequirement(reqLowercase, checks.lowercase);
    updateRequirement(reqNumber, checks.number);
    updateRequirement(reqSpecial, checks.special);
    updateRequirement(reqCommon, checks.common);
    
    // Calculate and display entropy
    const { entropy } = calculateEntropy(password);
    entropyValue.textContent = `${entropy.toFixed(1)} bits`;
    
    // If password is too short, cap at weak
    if (password.length < 8) {
        strengthBar.className = 'strength-bar weak';
        strengthLabel.className = 'strength-label weak';
        strengthLabel.textContent = 'Too Short';
        crackTime.textContent = 'Instantly crackable';
        return;
    }
    
    // Count how many requirements are met
    const requirementsMet = Object.values(checks).filter(Boolean).length;
    const totalRequirements = Object.keys(checks).length;
    
    // Calculate score based on requirements met
    if (checks.length) score += 20;
    if (checks.uppercase) score += 15;
    if (checks.lowercase) score += 15;
    if (checks.number) score += 15;
    if (checks.special) score += 20;
    if (checks.common) score += 15;
    
    // Bonus for length
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;
    
    // Penalty for common passwords
    if (!checks.common) score -= 20;
    
    // Calculate crack time based on entropy and patterns
    const crackTimeText = calculateCrackTime(entropy, password);
    
    // Determine strength level - require ALL criteria for Strong
    let strength, label;
    
    if (requirementsMet < 4) {
        strength = 'weak';
        label = 'Weak';
    } else if (requirementsMet < 5) {
        strength = 'fair';
        label = 'Fair';
    } else if (requirementsMet < 6) {
        strength = 'good';
        label = 'Good';
    } else if (requirementsMet === 6) {
        // All requirements met
        strength = 'strong';
        label = 'Strong';
    } else {
        strength = 'fair';
        label = 'Fair';
    }
    
    // Update UI
    strengthBar.className = `strength-bar ${strength}`;
    strengthLabel.className = `strength-label ${strength}`;
    strengthLabel.textContent = label;
    crackTime.textContent = `${crackTimeText} to crack`;
}

function updateRequirement(element, isMet) {
    if (isMet) {
        element.classList.remove('unmet');
        element.classList.add('met');
    } else {
        element.classList.remove('met');
        element.classList.add('unmet');
    }
}

function resetStrength() {
    strengthBar.className = 'strength-bar';
    strengthBar.style.width = '0%';
    strengthLabel.className = 'strength-label';
    strengthLabel.textContent = 'Enter a password';
    crackTime.textContent = '';
    entropyValue.textContent = '0 bits';
    
    // Reset all requirements
    [reqLength, reqUppercase, reqLowercase, reqNumber, reqSpecial, reqCommon].forEach(req => {
        req.classList.remove('met', 'unmet');
    });
}
