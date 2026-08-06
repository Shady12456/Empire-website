import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ContactForm } from './ContactForm';
import styles from './contact.module.scss';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });
  
  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return (
    <div className="py-5">
      <div className="container">
        <div className="text-center mb-5">
          <h1 className="display-5 mb-3">
            <span className="neon-text">{t('contact.title')}</span>
          </h1>
          <p className="lead text-muted">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="row g-4">
          <div className="col-lg-7">
            <ContactForm locale={locale} />
          </div>
          
          <div className="col-lg-5">
            <div className={styles.contactInfo}>
              <div className={styles.infoItem}>
                <i className="bi bi-geo-alt-fill" />
                <div className={styles.infoContent}>
                  <h4>{t('contact.address')}</h4>
                  <p>{t('home.location.address')}</p>
                </div>
              </div>
              
              <div className={styles.infoItem}>
                <i className="bi bi-telephone-fill" />
                <div className={styles.infoContent}>
                  <h4>{t('contact.phone')}</h4>
                  <a href="tel:+237600000000">+237 6 00 00 00 00</a>
                </div>
              </div>
              
              <div className={styles.infoItem}>
                <i className="bi bi-envelope-fill" />
                <div className={styles.infoContent}>
                  <h4>{t('contact.email')}</h4>
                  <a href="mailto:info@empire-lounge.com">info@empire-lounge.com</a>
                </div>
              </div>
              
              <div className={styles.infoItem}>
                <i className="bi bi-whatsapp" />
                <div className={styles.infoContent}>
                  <h4>{t('contact.whatsapp')}</h4>
                  <a href="https://wa.me/237600000000" target="_blank" rel="noopener noreferrer">
                    +237 6 00 00 00 00
                  </a>
                </div>
              </div>
              
              <div className={styles.hours}>
                <h4>{t('contact.hours')}</h4>
                <p><span>{t('contact.restaurantHours')}</span></p>
                <p><span>{t('contact.clubHours')}</span></p>
              </div>
              
              <div className={styles.socialLinks}>
                <a href="#" aria-label="Facebook">
                  <i className="bi bi-facebook" />
                </a>
                <a href="#" aria-label="Instagram">
                  <i className="bi bi-instagram" />
                </a>
                <a href="#" aria-label="Twitter">
                  <i className="bi bi-twitter-x" />
                </a>
                <a href="#" aria-label="WhatsApp">
                  <i className="bi bi-whatsapp" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-5">
          <h3 className="h4 mb-4">{t('contact.mapTitle')}</h3>
          <div className="ratio ratio-21x9 rounded overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3975.123456789!2d9.123456!3d4.123456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNMKwMDcnMjQuMCJOIDnCtDA3JzI0LjAiRQ!5e0!3m2!1sen!2scm!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Empire Lounge Location"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
