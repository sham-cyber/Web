import './_group.css';

const products = [
  { id: 'ai-call-chat', name: 'AI Call & Chat', note: 'Patent Pending' },
  { id: 'ai-call-crm-lead', name: 'AI Call CRM & Lead' },
  { id: 'ai-manufacturing', name: 'AI Manufacturing' },
  { id: 'machine-automation', name: 'Machine Automation' },
  { id: 'motor-rewinding', name: 'Motor Rewinding' },
  { id: 'attendance-app', name: 'Attendance App' },
  { id: 'iot', name: 'IoT' },
  { id: 'payroll-app', name: 'Payroll App' },
];

const socialLinks = [
  { name: 'Facebook', href: 'https://www.facebook.com/' },
  { name: 'Instagram', href: 'https://www.instagram.com/' },
  { name: 'WhatsApp', href: 'https://www.whatsapp.com/' },
  { name: 'X', href: 'https://x.com/' },
  { name: 'YouTube', href: 'https://www.youtube.com/' },
  { name: 'Discord', href: 'https://discord.com/' },
  { name: 'Slack', href: 'https://slack.com/' },
  { name: 'Notion', href: 'https://www.notion.so/' },
  { name: 'Replit', href: 'https://replit.com/' },
  { name: 'Vercel', href: 'https://vercel.com/' },
  { name: 'Render', href: 'https://render.com/' },
  { name: 'Supabase', href: 'https://supabase.com/' },
  { name: 'GitHub', href: 'https://github.com/' },
];

function Footer() {
  return (
    <footer className="details">
      <div>
        <div className="owner">Asha Pawar</div>
        <small className="legal">GST NO. 27FXUPP8652K1Z9</small>
      </div>
      <div className="contact-block">
        <a className="contact-link" href="mailto:connect@asharatnatech.com">
          <span>connect@asharatnatech.com</span><span className="contact-arrow" aria-hidden="true">↗</span>
        </a>
      </div>
      <nav className="social-links" aria-label="Social and technology platforms">
        {socialLinks.map((social) => (
          <a key={social.name} href={social.href}>{social.name}</a>
        ))}
      </nav>
    </footer>
  );
}

export function PhotoHero() {
  return (
    <main className="site-shell photo-shell">
      <div className="site-frame photo-frame">
        <header className="topbar">
          <div className="brand-mark" aria-hidden="true">AR</div>
          <div className="topbar-note">AshaRatna Tech</div>
        </header>
        <section className="hero photo-hero" aria-labelledby="company-name">
          <img
            className="photo-hero-image"
            src="/__mockup/images/ashara-home-hero.jpg"
            alt="Portrait photo featured in the AshaRatna Tech homepage"
          />
          <nav className="product-navigation" aria-label="Products and payment">
            <div className="product-tabs">
              {products.map((product) => (
                <a key={product.id} className="product-tab" href="#" data-product={product.id}>
                  <span>{product.name}</span>
                  {'note' in product && <small>{product.note}</small>}
                </a>
              ))}
              <a className="product-tab payment-tab" href="#" data-product="payment">Payment</a>
            </div>
          </nav>
          <div className="hero-copy">
            <h1 className="hero-title" id="company-name"><span className="sweep-text">AshaRatna Tech</span></h1>
            <p className="hero-service">Handles all IT services <span>and solutions</span></p>
            <div className="hero-rule" aria-hidden="true" />
          </div>
        </section>
        <section className="photo-gallery" aria-labelledby="gallery-title">
          <div className="gallery-intro">
            <p className="gallery-eyebrow">AshaRatna Tech / Gallery</p>
            <h2 id="gallery-title">Photo Gallery</h2>
            <div className="gallery-rule" aria-hidden="true" />
          </div>
          <div className="gallery-grid">
            <figure className="gallery-card">
              <a
                className="gallery-image-link"
                href="/__mockup/images/ashara-gallery-upload.jpg"
                target="_blank"
                rel="noreferrer"
                aria-label="Open the uploaded screenshot at full size"
              >
                <img
                  className="gallery-image"
                  src="/__mockup/images/ashara-gallery-upload.jpg"
                  alt="Uploaded AshaRatna Tech screenshot"
                  loading="lazy"
                />
              </a>
              <figcaption>Uploaded screenshot</figcaption>
            </figure>
          </div>
        </section>
        <Footer />
      </div>
    </main>
  );
}