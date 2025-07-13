document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const generatePasswordBtn = document.getElementById('generate-password');
    const copyPasswordBtn = document.getElementById('copy-password');
    const strengthBar = document.getElementById('strength-bar');
    const strengthText = document.getElementById('strength-text');
    const successFeedback = document.getElementById('success-feedback');
    const timeToCrack = document.getElementById('time-to-crack');
    const crackTimeText = document.getElementById('crack-time-text');
    
    // Requirement elements
    const lengthReq = document.getElementById('length-req');
    const uppercaseReq = document.getElementById('uppercase-req');
    const lowercaseReq = document.getElementById('lowercase-req');
    const numberReq = document.getElementById('number-req');
    const specialReq = document.getElementById('special-req');
    
    // Toggle password visibility
    togglePasswordBtn.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.innerHTML = type === 'password' ? '<i class="far fa-eye"></i>' : '<i class="far fa-eye-slash"></i>';
    });
    
    // Generate strong password
    generatePasswordBtn.addEventListener('click', function() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]\\:;?><,./-=';
        let password = '';
        
        // Ensure we meet all requirements
        password += getRandomChar('ABCDEFGHIJKLMNOPQRSTUVWXYZ'); // uppercase
        password += getRandomChar('abcdefghijklmnopqrstuvwxyz'); // lowercase
        password += getRandomChar('0123456789'); // number
        password += getRandomChar('!@#$%^&*()_+~`|}{[]\\:;?><,./-='); // special
        
        // Fill the rest randomly to make it 12 characters long
        for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        // Shuffle the password
        password = shuffleString(password);
        
        passwordInput.value = password;
        
        // Trigger validation
        validatePassword();
    });
    
    function getRandomChar(charSet) {
        return charSet.charAt(Math.floor(Math.random() * charSet.length));
    }
    
    function shuffleString(str) {
        const array = str.split('');
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array.join('');
    }
    
    // Copy password to clipboard
    copyPasswordBtn.addEventListener('click', function() {
        if (passwordInput.value) {
            navigator.clipboard.writeText(passwordInput.value).then(() => {
                const tooltip = this.querySelector('.tooltip');
                tooltip.textContent = 'Copied!';
                setTimeout(() => {
                    tooltip.textContent = 'Copy to clipboard';
                }, 2000);
            });
        }
    });
    
    // Password strength calculation
    function calculateStrength(password) {
        if (!password) return 0;
        
        let strength = 0;
        
        // Length contributes up to 40% (max at 12+ chars)
        strength += Math.min(password.length / 12 * 40, 40);
        
        // Character variety
        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[^a-zA-Z0-9]/.test(password);
        
        if (hasLower && hasUpper) strength += 15;
        if (hasNumber) strength += 15;
        if (hasSpecial) strength += 15;
        
        // Deductions for poor patterns
        if (/password|123|qwerty/i.test(password)) strength = Math.max(strength - 30, 0);
        if (/(.)\1{2,}/.test(password)) strength = Math.max(strength - 15, 0); // repeated chars
        
        return Math.min(Math.max(strength, 0), 100);
    }
    
    // Estimate time to crack
    function estimateCrackTime(password) {
        if (!password) return { text: 'less than a second', seconds: 0 };
        
        // Basic entropy calculation
        let charsetSize = 0;
        if (/[a-z]/.test(password)) charsetSize += 26;
        if (/[A-Z]/.test(password)) charsetSize += 26;
        if (/[0-9]/.test(password)) charsetSize += 10;
        if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32; // common special chars
        
        const entropy = password.length * Math.log2(charsetSize);
        
        // Assume 10 billion guesses per second (modern GPU)
        const guessesPerSecond = 1e10;
        const seconds = Math.pow(2, entropy) / guessesPerSecond;
        
        // Format the time
        if (seconds < 1) return { text: 'less than a second', seconds };
        if (seconds < 60) return { text: `${Math.round(seconds)} seconds`, seconds };
        if (seconds < 3600) return { text: `${Math.round(seconds/60)} minutes`, seconds };
        if (seconds < 86400) return { text: `${Math.round(seconds/3600)} hours`, seconds };
        if (seconds < 31536000) return { text: `${Math.round(seconds/86400)} days`, seconds };
        if (seconds < 3153600000) return { text: `${Math.round(seconds/31536000)} years`, seconds };
        return { text: `${Math.round(seconds/3153600000)} centuries`, seconds };
    }
    
    // Update strength meter and text
    function updateStrengthDisplay(strength) {
        strengthBar.style.width = strength + '%';
        
        if (strength < 30) {
            strengthBar.style.backgroundColor = 'var(--danger)';
            strengthText.textContent = 'Very Weak';
            strengthText.style.color = 'var(--danger)';
        } else if (strength < 50) {
            strengthBar.style.backgroundColor = 'var(--warning)';
            strengthText.textContent = 'Weak';
            strengthText.style.color = 'var(--warning)';
        } else if (strength < 70) {
            strengthBar.style.backgroundColor = '#ffcc00';
            strengthText.textContent = 'Moderate';
            strengthText.style.color = '#ffcc00';
        } else if (strength < 90) {
            strengthBar.style.backgroundColor = 'var(--success)';
            strengthText.textContent = 'Strong';
            strengthText.style.color = 'var(--success)';
        } else {
            strengthBar.style.backgroundColor = '#2ecc71';
            strengthText.textContent = 'Very Strong';
            strengthText.style.color = '#2ecc71';
        }
    }
    
    // Validate password requirements
    function validatePassword() {
        const password = passwordInput.value;
        
        // Check requirements
        const isLengthValid = password.length >= 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[^a-zA-Z0-9]/.test(password);
        
        // Update requirement indicators
        updateRequirement(lengthReq, isLengthValid);
        updateRequirement(uppercaseReq, hasUppercase);
        updateRequirement(lowercaseReq, hasLowercase);
        updateRequirement(numberReq, hasNumber);
        updateRequirement(specialReq, hasSpecial);
        
        // Calculate and update strength
        const strength = calculateStrength(password);
        updateStrengthDisplay(strength);
        
        // Update time to crack
        const crackTime = estimateCrackTime(password);
        crackTimeText.textContent = `Time to crack: ${crackTime.text}`;
        
        // Update time to crack color based on strength
        if (strength < 30) {
            timeToCrack.style.backgroundColor = 'rgba(247, 37, 133, 0.1)';
            timeToCrack.style.color = 'var(--danger)';
        } else if (strength < 70) {
            timeToCrack.style.backgroundColor = 'rgba(248, 150, 30, 0.1)';
            timeToCrack.style.color = 'var(--warning)';
        } else {
            timeToCrack.style.backgroundColor = 'rgba(76, 201, 240, 0.1)';
            timeToCrack.style.color = 'var(--success)';
        }
        
        // Show success feedback if all requirements met
        if (isLengthValid && hasUppercase && hasLowercase && hasNumber && hasSpecial) {
            successFeedback.style.display = 'flex';
        } else {
            successFeedback.style.display = 'none';
        }
        
        return isLengthValid && hasUppercase && hasLowercase && hasNumber && hasSpecial;
    }
    
    // Update requirement indicator
    function updateRequirement(element, isValid) {
        const icon = element.querySelector('i');
        if (isValid) {
            icon.className = 'fas fa-check-circle valid';
            element.style.color = 'var(--success)';
        } else {
            icon.className = 'fas fa-times-circle invalid';
            element.style.color = 'var(--danger)';
        }
    }
    
    // Event listeners for real-time validation
    passwordInput.addEventListener('input', validatePassword);
    
    // Initialize
    validatePassword();
});