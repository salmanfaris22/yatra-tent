// NexGo island — newsletter signup.
// Loaded only when this island appears on a page (lazy hydration).
// Receives (rootElement, props) when mounted by the islands runtime.
export default function init(el, props) {
  const form = el.querySelector('.nl-form');
  const status = el.querySelector('.nl-status');
  const emailInput = form.querySelector('input[name="email"]');

  // Restore subscribed state if user already subscribed in this browser
  if (localStorage.getItem('yatra-nl-subscribed') === '1') {
    status.textContent = '✓ You are already subscribed.';
    status.style.color = 'var(--green)';
    form.style.display = 'none';
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    if (!email) return;
    status.textContent = '…';
    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Newsletter signup',
          contact: email,
          topic: 'newsletter',
          message: 'Subscribed via island widget',
        }),
      });
      if (!r.ok) throw new Error('failed');
      localStorage.setItem('yatra-nl-subscribed', '1');
      status.textContent = '✓ You are in. We will email you when the next camp opens.';
      status.style.color = 'var(--green)';
      form.style.display = 'none';
    } catch {
      status.textContent = '✗ Could not subscribe. Try WhatsApp instead.';
      status.style.color = '#c0392b';
    }
  });
}
