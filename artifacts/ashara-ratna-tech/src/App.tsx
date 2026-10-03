import { type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

const products = [
  { id: 'ai-call-chat', name: 'AI Call & Chat', note: 'Patent Pending' },
  { id: 'ai-call-crm-lead', name: 'AI Call CRM & Lead' },
  { id: 'ai-manufacturing', name: 'AI Manufacturing' },
  { id: 'machine-automation', name: 'Machine Automation' },
  { id: 'motor-rewinding', name: 'Motor Rewinding' },
  { id: 'attendance-app', name: 'Attendance App' },
  { id: 'iot', name: 'IoT' },
  { id: 'payroll-app', name: 'Payroll App' },
  { id: 'remote-app-website-testing', name: 'Remote App and Website Testing' },
  { id: 'seo-websites-apps', name: 'SEO of Websites & Apps' },
] as const;

const suanPowerIndustriesUrl = 'https://suanpowerindustries.com/';
const paymentLink = 'https://bit.ly/44xwcBo';
const uploadedGalleryPhoto = `${import.meta.env.BASE_URL}ashara-gallery-upload.jpg`;
const aiCallGalleryImage = `${import.meta.env.BASE_URL}asharatna-ai-call-chat-promo.jpg`;
const aiManufacturingGalleryImage = `${import.meta.env.BASE_URL}asharatna-ai-manufacturing-promo.jpg`;
const patentApplicationGalleryImage = `${import.meta.env.BASE_URL}ai-money-maker-patent-application.jpg`;
const aiAppTesterGalleryImage = `${import.meta.env.BASE_URL}asha-ai-app-tester.jpg`;
const anupMohiteGalleryImage = `${import.meta.env.BASE_URL}anup-mohite-upcoming-director.jpg`;
const ashaMohiteOwnerImage = `${import.meta.env.BASE_URL}asha-mohite-owner.jpg`;
const polarisePatentDiscussionImage = `${import.meta.env.BASE_URL}polarise-patent-pending-discussion.jpg`;
const ourCreationGalleryImage = `${import.meta.env.BASE_URL}ashara-our-creation.jpg`;
const ebookTitle = 'How to Make a Static Site in Replit for Vercel and Add a Domain';
const ebookSubtitle =
  'Build your site in Replit, send it to GitHub, publish it on Vercel, and connect a domain you own.';
const ebookDescription =
  'A practical, beginner-friendly guide to building a static website in Replit, deploying it to Vercel, and connecting a custom domain.';
const ebookAmazonSearchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(ebookTitle)}`;

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

type ProductId = (typeof products)[number]['id'];

function productPaymentHref(productId: ProductId) {
  return `${import.meta.env.BASE_URL}payment?product=${encodeURIComponent(productId)}`;
}

function SiteHeader({
  selectedProductId,
  paymentActive = false,
  internshipActive = false,
  ebookActive = false,
}: {
  selectedProductId?: string;
  paymentActive?: boolean;
  internshipActive?: boolean;
  ebookActive?: boolean;
}) {
  return (
    <>
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true">AR</div>
        <div className="topbar-note">AshaRatna Tech</div>
      </header>
      <nav className="product-navigation" aria-label="Products, partners, ebook, payment and internship">
        <div className="product-tabs">
          {products.map((product) => {
            const isSelected = selectedProductId === product.id;
            const isAiCallChat = product.id === 'ai-call-chat';
            return (
              <a
                key={product.id}
                className={`product-tab${isSelected ? ' is-selected' : ''}`}
                href={isAiCallChat ? suanPowerIndustriesUrl : productPaymentHref(product.id)}
                target={isAiCallChat ? '_blank' : undefined}
                rel={isAiCallChat ? 'noopener noreferrer' : undefined}
                data-product={product.id}
                aria-current={isSelected ? 'page' : undefined}
              >
                <span>{product.name}</span>
                {'note' in product && <small>{product.note}</small>}
              </a>
            );
          })}
          <a
            className="product-tab partner-tab"
            href={suanPowerIndustriesUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-product="channel-partner-suan-power"
          >
            Channel Partner — Suan Power Industries
          </a>
          <a
            className={`product-tab ebook-tab${ebookActive ? ' is-selected' : ''}`}
            href={`${import.meta.env.BASE_URL}ebook-buy`}
            data-product="ebook-buy"
            aria-current={ebookActive ? 'page' : undefined}
          >
            Ebook Buy
          </a>
          <a
            className={`product-tab payment-tab${paymentActive ? ' is-selected' : ''}`}
            href={`${import.meta.env.BASE_URL}payment`}
            data-product="payment"
            aria-current={paymentActive ? 'page' : undefined}
          >
            Payment
          </a>
          <a
            className={`product-tab internship-tab${internshipActive ? ' is-selected' : ''}`}
            href={`${import.meta.env.BASE_URL}remote-internship`}
            data-product="remote-internship"
            aria-current={internshipActive ? 'page' : undefined}
          >
            Remote Internship
          </a>
        </div>
      </nav>
    </>
  );
}

function SiteFooter() {
  return (
    <footer className="details">
      <div>
        <div className="owner-details">
          <div className="owner" data-testid="text-owner">Asha Mohite</div>
          <a
            className="owner-link"
            href="https://www.linkedin.com/in/asha-mohite-49749b3a2?utm_source=share_via&utm_content=profile&utm_medium=member_android"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open Asha Mohite's LinkedIn profile"
          >
            LinkedIn <span aria-hidden="true">↗</span>
          </a>
        </div>
        <small className="legal" data-testid="text-gst">
          GST NO. 27FXUPP8652K1Z9
        </small>
      </div>
      <div className="contact-block">
        <a
          className="contact-link"
          href="mailto:connect@asharatnatech.com"
          data-testid="link-contact-email"
          aria-label="Email connect@asharatnatech.com"
        >
          <span>connect@asharatnatech.com</span>
          <span className="contact-arrow" aria-hidden="true">↗</span>
        </a>
      </div>
      <nav className="social-links" aria-label="Social and technology platforms">
        {socialLinks.map((social) => (
          <a
            key={social.name}
            href={social.href}
            target="_blank"
            rel="noreferrer"
          >
            {social.name}
          </a>
        ))}
      </nav>
    </footer>
  );
}

function SiteLayout({
  children,
  selectedProductId,
  paymentActive = false,
  internshipActive = false,
  ebookActive = false,
  homeHero = false,
}: {
  children: ReactNode;
  selectedProductId?: string;
  paymentActive?: boolean;
  internshipActive?: boolean;
  ebookActive?: boolean;
  homeHero?: boolean;
}) {
  return (
    <main className="site-shell">
      <div className={`site-frame${homeHero ? ' home-frame' : ''}`}>
        <SiteHeader
          selectedProductId={selectedProductId}
          paymentActive={paymentActive}
          internshipActive={internshipActive}
          ebookActive={ebookActive}
        />
        {children}
        <SiteFooter />
      </div>
    </main>
  );
}

function Home() {
  return (
    <SiteLayout homeHero>
      <>
        <section className="hero hero-photo" aria-labelledby="company-name">
          <img
            className="hero-photo-image"
            src={`${import.meta.env.BASE_URL}asharatna-home-hero-edited.jpg`}
            alt="Portrait photo featured in the AshaRatna Tech homepage"
          />
          <div className="hero-copy">
            <h1 className="hero-title" id="company-name">
              <span className="sweep-text">AshaRatna Tech</span>
            </h1>
            <p className="hero-service">
              Handles all IT services <span>and solutions</span>
            </p>
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
                href={uploadedGalleryPhoto}
                target="_blank"
                rel="noreferrer"
                aria-label="Open the uploaded screenshot at full size"
              >
                <img
                  className="gallery-image"
                  src={uploadedGalleryPhoto}
                  alt="Uploaded AshaRatna Tech screenshot"
                  loading="lazy"
                />
              </a>
              <figcaption>Uploaded screenshot</figcaption>
            </figure>
            <figure className="gallery-card">
              <a
                className="gallery-image-link"
                href={aiCallGalleryImage}
                target="_blank"
                rel="noreferrer"
                aria-label="Open the AI Call and Chat promotional screenshot at full size"
              >
                <img
                  className="gallery-image"
                  src={aiCallGalleryImage}
                  alt="AshaRatna Tech AI Call and Chat platform promotion in neon green on a blue background"
                  loading="lazy"
                />
              </a>
              <figcaption>AI Call &amp; Chat Platform</figcaption>
            </figure>
            <figure className="gallery-card">
              <a
                className="gallery-image-link"
                href={aiManufacturingGalleryImage}
                target="_blank"
                rel="noreferrer"
                aria-label="Open the AI Manufacturing System promotional screenshot at full size"
              >
                <img
                  className="gallery-image"
                  src={aiManufacturingGalleryImage}
                  alt="AshaRatna Tech AI Manufacturing System order-to-delivery automation platform"
                  loading="eager"
                />
              </a>
              <figcaption>AI Manufacturing System</figcaption>
            </figure>
            <figure className="gallery-card">
              <a
                className="gallery-image-link"
                href={patentApplicationGalleryImage}
                target="_blank"
                rel="noreferrer"
                aria-label="Open the AI Money Maker patent application page at full size"
              >
                <img
                  className="gallery-image"
                  src={patentApplicationGalleryImage}
                  alt="Indian patent application page for the AI Money Maker system, application number 202521074434"
                  loading="eager"
                />
              </a>
              <figcaption>AI Money Maker · Patent Application No. 202521074434</figcaption>
            </figure>
            <figure className="gallery-card">
              <a
                className="gallery-image-link"
                href={aiAppTesterGalleryImage}
                target="_blank"
                rel="noreferrer"
                aria-label="Open the Asha AI App Tester screenshot at full size"
              >
                <img
                  className="gallery-image"
                  src={aiAppTesterGalleryImage}
                  alt="Asha AI App Tester automated security testing platform sign-in screen"
                  loading="eager"
                />
              </a>
              <figcaption>Asha AI App Tester</figcaption>
            </figure>
            <figure className="gallery-card director-gallery-card">
              <a
                className="gallery-image-link director-gallery-image-link"
                href={anupMohiteGalleryImage}
                target="_blank"
                rel="noreferrer"
                aria-label="Open Anup Mohite's portrait at full size"
              >
                <img
                  className="gallery-image"
                  src={anupMohiteGalleryImage}
                  alt="Portrait of Anup Mohite, upcoming director at AshaRatna Tech"
                  loading="eager"
                />
              </a>
              <figcaption>Upcoming Director · Anup Mohite</figcaption>
            </figure>
            <figure className="gallery-card">
              <a
                className="gallery-image-link"
                href={ashaMohiteOwnerImage}
                target="_blank"
                rel="noreferrer"
                aria-label="Open Asha Mohite's portrait at full size"
              >
                <img
                  className="gallery-image"
                  src={ashaMohiteOwnerImage}
                  alt="Portrait of Asha Mohite, owner of AshaRatna Tech"
                  loading="lazy"
                />
              </a>
              <figcaption>Asha Mohite · Owner</figcaption>
            </figure>
            <figure className="gallery-card">
              <a
                className="gallery-image-link"
                href={polarisePatentDiscussionImage}
                target="_blank"
                rel="noreferrer"
                aria-label="Open the Polarise patent-pending discussion photo at full size"
              >
                <img
                  className="gallery-image"
                  src={polarisePatentDiscussionImage}
                  alt="Two people at Polarise for a patent-pending discussion"
                  loading="eager"
                />
              </a>
              <figcaption>At Polarise for Patent Pending Discussion.</figcaption>
            </figure>
            <figure className="gallery-card">
              <a
                className="gallery-image-link"
                href={ourCreationGalleryImage}
                target="_blank"
                rel="noreferrer"
                aria-label="Open the office portrait at full size"
              >
                <img
                  className="gallery-image"
                  src={ourCreationGalleryImage}
                  alt="Professional portrait in an office setting"
                  loading="lazy"
                />
              </a>
              <figcaption>Our creation</figcaption>
            </figure>
          </div>
        </section>
      </>
    </SiteLayout>
  );
}

function PaymentPage() {
  const selectedId = new URLSearchParams(window.location.search).get('product');
  const selectedProduct = products.find((product) => product.id === selectedId);
  const emailSubject = selectedProduct
    ? encodeURIComponent(`Payment enquiry: ${selectedProduct.name}`)
    : '';

  return (
    <SiteLayout
      selectedProductId={selectedProduct?.id}
      paymentActive={!selectedProduct}
    >
      <section className="payment-page" aria-labelledby="payment-title">
        <div className="payment-card">
          <p className="payment-eyebrow">ASHA RATNA TECH · PAYMENT</p>
          <h1 id="payment-title">Payment details</h1>
          {selectedProduct ? (
            <>
              <p className="payment-label">Selected service</p>
              <h2>{selectedProduct.name}</h2>
              {'note' in selectedProduct && (
                <span className="patent-note">{selectedProduct.note}</span>
              )}
              <p className="payment-description">
                Email us to confirm the price and arrange payment for this service.
              </p>
              <a
                className="payment-action"
                href={`mailto:connect@asharatnatech.com?subject=${emailSubject}`}
              >
                Email for payment details
              </a>
            </>
          ) : (
            <>
              <p className="payment-description">
                Pay online through Razorpay using the link below. Select a product tab for service-specific payment details.
              </p>
              <a
                className="payment-action"
                href={paymentLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Pay with Razorpay
              </a>
            </>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

function EbookBuyPage() {
  return (
    <SiteLayout ebookActive>
      <section className="payment-page ebook-page" aria-labelledby="ebook-title">
        <div className="payment-card ebook-card">
          <p className="payment-eyebrow">ASHA RATNA TECH · EBOOK</p>
          <h1 id="ebook-title">Ebook Buy</h1>
          <p className="payment-label">Book title</p>
          <h2>{ebookTitle}</h2>
          <p className="ebook-subtitle">{ebookSubtitle}</p>
          <p className="ebook-price">
            ₹5,001 <span>including GST</span>
          </p>
          <p className="payment-description">
            {ebookDescription} Available on Amazon India using the link below.
          </p>
          <a
            className="payment-action ebook-action"
            href={ebookAmazonSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Find the ebook on Amazon India
          </a>
        </div>
      </section>
    </SiteLayout>
  );
}

function RemoteInternshipPage() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const application = {
      name: String(formData.get('name') ?? '').trim(),
      qualification: String(formData.get('qualification') ?? '').trim(),
      phone: String(formData.get('phone') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      city: String(formData.get('city') ?? '').trim(),
    };
    const subject = encodeURIComponent(`Remote Internship Application - ${application.name}`);
    const body = encodeURIComponent([
      `Name: ${application.name}`,
      `Qualification: ${application.qualification}`,
      `Phone number: ${application.phone}`,
      `Email: ${application.email}`,
      `City: ${application.city}`,
    ].join('\n'));

    window.location.href = `mailto:connect@asharatnatech.com?subject=${subject}&body=${body}`;
  }

  return (
    <SiteLayout internshipActive>
      <section className="internship-page" aria-labelledby="internship-title">
        <div className="internship-card">
          <p className="internship-eyebrow">AshaRatna Tech · Careers</p>
          <h1 id="internship-title">Remote Internship</h1>
          <p className="internship-description">
            Share your details to apply for a remote internship.
          </p>
          <form className="internship-form" onSubmit={handleSubmit}>
            <div className="internship-form-grid">
              <label className="internship-field">
                Name
                <input
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  required
                />
              </label>
              <label className="internship-field">
                Qualification
                <input
                  name="qualification"
                  type="text"
                  autoComplete="off"
                  placeholder="Your qualification"
                  required
                />
              </label>
              <label className="internship-field">
                Phone number
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="Your phone number"
                  required
                />
              </label>
              <label className="internship-field">
                Email
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                />
              </label>
              <label className="internship-field internship-city">
                City
                <input
                  name="city"
                  type="text"
                  autoComplete="address-level2"
                  placeholder="Your city"
                  required
                />
              </label>
            </div>
            <button className="internship-submit" type="submit">Send</button>
            <p className="internship-note" id="internship-note">
              Send opens a pre-filled email to connect@asharatnatech.com.
            </p>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/payment" component={PaymentPage} />
        <Route path="/ebook-buy" component={EbookBuyPage} />
        <Route path="/remote-internship" component={RemoteInternshipPage} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
