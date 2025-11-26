# Introduction

As part of the **AI for Bharat – Kiro Week 1 Challenge (Micro-Tools)**, I decided to build a small but meaningful single-purpose tool: a Password Strength Checker.

The goal was simple - solve one tiny, annoying problem elegantly.

While building it, I used Kiro, the new AI pair-programming agent from AWS Builder Center, to speed up development, generate code, and refine the UI. **This blog documents the problem, the solution, and how Kiro helped me build this tool much faster.**

## 1️⃣ Problem: Why Do We Need a Password Strength Checker?

Weak passwords remain one of the biggest reasons for security breaches today.

Many users still use predictable passwords like:
   - password
   - 123456
   - qwerty
   - birthdays or names

Even when people try to create a strong password, they don’t know:
   - whether it’s actually strong
   - how long it takes to crack
   - if they used enough character variety
   - if their password appears in common password lists

Most online checkers either have ads, confusing UI, or worse & send your password to a server. That’s a privacy risk.

So the challenge was:

Build a clean, modern, privacy-safe password strength checker that runs entirely in the browser.

A small tool — but extremely useful.

## 2️⃣ Solution: A Clean, Fully Client-Side Password Strength Checker

I built a simple password checker that evaluates password strength in real time.

Everything happens locally inside the browser — nothing is uploaded.

🔹 Key Features
   - Real-time password strength evaluation
   - Animated strength meter
   - Crack time estimation
   - Checks for lowercase/uppercase/numbers/symbols
   - Repeated character detection
   - Optional common-password dictionary check. Here are some list of common & weak password.
       - 12345678
       - 666666
       - superman
       - princess

   - Here are some examples of strong passwords
       - MyP@ssw0rd123!
       - Sk@27#box
       - Ary@02#exm
       - 25%d_Cpp#sk

   -  Helpful suggestions for improvement
   -  Show/hide password
   -  Copy to clipboard
   -  Fully responsive UI

This tool solves one extremely focused problem — exactly what a micro-tool should do.

## 3️⃣ How this website is Different from others.

We use entropy to measure strength of password. **(Higher entropy = stronger password)**
   - Formula: length × log₂(charset_size)
   - Entropy is an estimate. Real-world strength depends on pattern use, dictionary words, substitutions, and human choices. Entropy formulas assume uniformly random choices from the character pool.

Our website runs entirely inside the browser we don't send data to server like others.
This is how we do so:-

🔹 HTML, CSS, & JAVASCRIPT RUNS LOCALLY
   - The browser downloads the static files:
       - index.html
       - styles.css
       - app.js
       - common_passwords.txt

Then everything else happens inside the user’s device memory.

There are no backend files like:
   - PHP
   - Python
   - Node.js
   - APIs
   - Databases
   
So there is nowhere for the password to be sent.

🔹 PASSWORD CHECKING IS DONE BY JAVASCRIPT

When the user types a password:

--checkPasswordStrength(password)--

This function runs directly inside the browser’s JavaScript runtime.
Nothing is transmitted to the internet.

🔹 DICTIONARY CHECK IS ALSO LOCAL

I load the file common_passwords.txt like this:

--fetch('common_passwords.txt')
    .then(res => res.text())
    .then(text => commonPasswords = new Set(text.split('\n')))--

Even though it uses fetch(), this request is NOT remote.

It simply loads a local file from the same folder where the website is hosted.
   - If the website is opened from your computer → fetches from local disk
   - If hosted on GitHub Pages → fetches from GitHub’s static server (still no passwords are sent)

This dictionary file contains only the list of passwords, not the user’s password.

🔹 NO DATA LEAVES THE BROWSER

The password:
   - is not sent to your server
   - is not logged
   - is not uploaded
   - is not stored anywhere
   - is not saved in cookies
   - is not cached

The code only uses the password in memory, inside the JavaScript file.

When the tab is closed, everything is erased automatically.

## 4️⃣ How we calculate estimate password crack time.

I convert the password’s entropy (in bits) into a number of possible guesses (2^entropy), then divide by an assumed attacker guesses-per-second rate to get seconds, and finally convert seconds into human-friendly units (minutes / hours / days / years).

Formula

   - guesses = 2^entropyBits
   - seconds = guesses / guessesPerSecond
   - convert seconds → readable string

Where guessesPerSecond is an attacker-speed assumption

Here is an Example :-
step-by-step (entropy = 60 bits, guesses/sec = 10 billion = 1×10¹⁰)

1. Compute number of guesses:
   - 2^60
   - 2^10 = 1024 ≈ 1.024×10^3
   - 2^60 = (2^10)^6 = 1024^6 ≈ 1.152921504606847e18So: guesses ≈ 1.152921504606847 × 10^18.
2. Divide by guesses-per-second:
   - guessesPerSecond = 1 × 10^10
   - seconds = guesses / guessesPerSecond = 1.152921504606847e18 / 1e10 = 1.152921504606847e8 seconds
3. Convert seconds → years:
   - seconds per year ≈ 31,536,000 (365 × 24 × 3600)
   - years = 1.152921504606847e8 / 31,536,000 ≈ 3.655 years
Result: ~3.66 years against an attacker doing 10 billion guesses per second.

## 5️⃣ How Kiro Accelerated My Development

Here’s how I used it across different stages.

I started by asking Kiro to generate the project skeleton:
   - basic HTML layout
   - input fields
   - JS structure
   - minimal CSS
   - entropy formula
   - crack time estimation
   - common password dictionary

Kiro instantly created the starting point for my entire tool.

## 🟣 Conclusion

Building this Password Strength Checker as part of the AI for Bharat MicroTools Challenge was a great learning experience. I understood how a tiny single-purpose tool can still provide real value. Kiro helped me speed up development, improve the layout, generate boilerplate code, and structure my project faster.

Overall, this project taught me the importance of focused tools and how AI can assist developers in building them efficiently.