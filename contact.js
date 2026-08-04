/**
 * contact.js
 * Handles the contact form interaction by constructing a mailto: link
 * and opening the user's default email client.
 */

const TO_EMAIL = 'saravanan.ak@northeastern.edu';

(function initContactForm() {
  // Wait for DOM
  if (document.readyState !== 'loading') setup();
  else document.addEventListener('DOMContentLoaded', setup);

  function setup() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', handleSubmit);
  }

  function handleSubmit(e) {
    e.preventDefault();

    // Validate
    const valid = validateForm();
    if (!valid) return;

    // Collect values
    const name = document.getElementById('form-name').value.trim();
    const email = document.getElementById('form-email').value.trim();
    const subject = document.getElementById('form-subject').value.trim();
    const message = document.getElementById('form-message').value.trim();

    // Construct mailto link (for native desktop apps)
    const mailtoBody = `From: ${name} (${email})\n\n${message}`;
    const mailtoLink = `mailto:${TO_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailtoBody)}`;
    
    // Construct Gmail Web link (in case native mail app doesn't open)
    const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${TO_EMAIL}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailtoBody)}`;
    
    // Open Gmail web compose in a new tab by default
    window.open(gmailLink, '_blank');

    // Show a success state with a fallback native mail link
    setButtonState('success');
    showFeedback(`Opening Gmail...<br><br><span style="font-size:0.85em;color:var(--clr-text-muted);">Prefer your native mail app? <a href="${mailtoLink}" style="color:var(--clr-accent-light);text-decoration:underline;">Click here</a>.</span>`, 'success');
    
    // Don't auto-reset the form immediately, give them time to click the link if needed.
    setTimeout(() => {
      resetForm();
    }, 12000);
  }

  function validateForm() {
    let isValid = true;

    const nameInput = document.getElementById('form-name');
    const emailInput = document.getElementById('form-email');
    const subjectInput = document.getElementById('form-subject');
    const msgInput = document.getElementById('form-message');

    if (!nameInput.value.trim()) {
      showFieldError(nameInput, 'Please enter your name.');
      isValid = false;
    } else {
      clearFieldError(nameInput);
    }

    if (!emailInput.value.trim()) {
      showFieldError(emailInput, 'Please enter your email.');
      isValid = false;
    } else if (!isValidEmail(emailInput.value.trim())) {
      showFieldError(emailInput, 'Please enter a valid email address.');
      isValid = false;
    } else {
      clearFieldError(emailInput);
    }

    if (!subjectInput.value.trim()) {
      showFieldError(subjectInput, 'Please enter a subject.');
      isValid = false;
    } else {
      clearFieldError(subjectInput);
    }

    if (!msgInput.value.trim()) {
      showFieldError(msgInput, 'Please enter a message.');
      isValid = false;
    } else {
      clearFieldError(msgInput);
    }

    return isValid;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showFieldError(input, msg) {
    const errSpan = document.getElementById(`error-${input.id.replace('form-', '')}`);
    if (errSpan) {
      errSpan.textContent = msg;
      errSpan.classList.add('visible');
    }
    input.classList.add('invalid');

    // GSAP shake animation
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(input,
        { x: -5 },
        { x: 5, duration: 0.1, yoyo: true, repeat: 3, ease: 'power1.inOut',
          onComplete: () => gsap.set(input, { x: 0 }) }
      );
    }
  }

  function clearFieldError(input) {
    const errSpan = document.getElementById(`error-${input.id.replace('form-', '')}`);
    if (errSpan) {
      errSpan.textContent = '';
      errSpan.classList.remove('visible');
    }
    input.classList.remove('invalid');
  }

  function showFeedback(msg, type) {
    const feedback = document.getElementById('form-feedback');
    if (!feedback) return;
    feedback.innerHTML = msg; // allow HTML for the fallback link
    feedback.className = `feedback-${type}`;

    if (typeof gsap !== 'undefined') {
      gsap.fromTo(feedback,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
  }

  function setButtonState(state) {
    const btnText = document.getElementById('btn-text');
    const btnLoading = document.getElementById('btn-loading');
    const btnSuccess = document.getElementById('btn-success');
    const btnError = document.getElementById('btn-error');

    // Hide all
    [btnText, btnLoading, btnSuccess, btnError].forEach(el => {
      if (el) el.style.display = 'none';
    });

    switch (state) {
      case 'default':
        if (btnText) btnText.style.display = 'inline-flex';
        break;
      case 'loading':
        if (btnLoading) btnLoading.style.display = 'inline-flex';
        break;
      case 'success':
        if (btnSuccess) btnSuccess.style.display = 'inline-flex';
        break;
      case 'error':
        if (btnError) btnError.style.display = 'inline-flex';
        break;
    }
  }

  function resetForm() {
    const form = document.getElementById('contact-form');
    if (form) form.reset();
    setButtonState('default');
    const feedback = document.getElementById('form-feedback');
    if (feedback) feedback.textContent = '';
  }
})();
