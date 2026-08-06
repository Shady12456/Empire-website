import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'faq' });
  
  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default async function FAQPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  const faqs = [
    {
      category: t('faq.restaurant'),
      items: [
        {
          question: t('faq.restaurantHours.question'),
          answer: t('faq.restaurantHours.answer'),
        },
        {
          question: t('faq.orderingHours.question'),
          answer: t('faq.orderingHours.answer'),
        },
        {
          question: t('faq.takeaway.question'),
          answer: t('faq.takeaway.answer'),
        },
        {
          question: t('faq.reservations.question'),
          answer: t('faq.reservations.answer'),
        },
      ],
    },
    {
      category: t('faq.club'),
      items: [
        {
          question: t('faq.clubHours.question'),
          answer: t('faq.clubHours.answer'),
        },
        {
          question: t('faq.agePolicy.question'),
          answer: t('faq.agePolicy.answer'),
        },
        {
          question: t('faq.dressCode.question'),
          answer: t('faq.dressCode.answer'),
        },
        {
          question: t('faq.tableReservation.question'),
          answer: t('faq.tableReservation.answer'),
        },
      ],
    },
    {
      category: t('faq.tickets'),
      items: [
        {
          question: t('faq.buyTickets.question'),
          answer: t('faq.buyTickets.answer'),
        },
        {
          question: t('faq.refundPolicy.question'),
          answer: t('faq.refundPolicy.answer'),
        },
        {
          question: t('faq.passEntry.question'),
          answer: t('faq.passEntry.answer'),
        },
      ],
    },
    {
      category: t('faq.payment'),
      items: [
        {
          question: t('faq.paymentMethods.question'),
          answer: t('faq.paymentMethods.answer'),
        },
        {
          question: t('faq.prices.question'),
          answer: t('faq.prices.answer'),
        },
      ],
    },
  ];

  return (
    <div className="py-5">
      <div className="container">
        <div className="text-center mb-5">
          <h1 className="display-5 mb-3">
            <span className="neon-text">{t('faq.title')}</span>
          </h1>
          <p className="lead text-muted">
            {t('faq.subtitle')}
          </p>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-10">
            {faqs.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-5">
                <h2 className="h4 mb-4">
                  <span className="text-empire-primary">{category.category}</span>
                </h2>
                <div className="accordion" id={`faq-accordion-${categoryIndex}`}>
                  {category.items.map((item, itemIndex) => {
                    const accordionId = `faq-${categoryIndex}-${itemIndex}`;
                    return (
                      <div key={itemIndex} className="accordion-item">
                        <h3 className="accordion-header">
                          <button
                            className="accordion-button"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#${accordionId}`}
                            aria-expanded={itemIndex === 0 ? 'true' : 'false'}
                            aria-controls={accordionId}
                          >
                            {item.question}
                          </button>
                        </h3>
                        <div
                          id={accordionId}
                          className={`accordion-collapse collapse ${itemIndex === 0 ? 'show' : ''}`}
                          data-bs-parent={`#faq-accordion-${categoryIndex}`}
                        >
                          <div className="accordion-body">
                            {item.answer}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* JSON-LD Structured Data for SEO */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'FAQPage',
                  mainEntity: faqs.flatMap((category) =>
                    category.items.map((item) => ({
                      '@type': 'Question',
                      name: item.question,
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: item.answer,
                      },
                    }))
                  ),
                }),
              }}
            />
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-5 pt-5 border-top">
          <h3 className="h5 mb-3">{t('faq.stillHaveQuestions')}</h3>
          <a href={`/${locale}/contact`} className="btn btn-empire-primary">
            {t('faq.contactUs')}
          </a>
        </div>
      </div>
    </div>
  );
}
