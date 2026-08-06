'use client';

import { useState } from 'react';
import styles from './contact.module.scss';

const translations = {
  en: {
    title: 'Contact Us',
    subtitle: 'Get in touch with us',
    name: 'Your Name',
    email: 'Email Address',
    phone: 'Phone Number (Optional)',
    subject: 'Subject',
    message: 'Your Message',
    submit: 'Send Message',
    sending: 'Sending...',
    success: 'Message sent successfully! We will get back to you soon.',
    error: 'Failed to send message. Please try again.',
    namePlaceholder: 'Enter your full name',
    emailPlaceholder: 'Enter your email',
    phonePlaceholder: 'Enter your phone number',
    subjectPlaceholder: 'What is this about?',
    messagePlaceholder: 'Write your message here...',
    required: 'This field is required',
    invalidEmail: 'Please enter a valid email address',
  },
  fr: {
    title: 'Contactez-nous',
    subtitle: 'Entrer en contact avec nous',
    name: 'Votre Nom',
    email: 'Adresse Email',
    phone: 'Numéro de Téléphone (Optionnel)',
    subject: 'Sujet',
    message: 'Votre Message',
    submit: 'Envoyer le Message',
    sending: 'Envoi en cours...',
    success: 'Message envoyé avec succès! Nous vous répondrons bientôt.',
    error: "Échec de l'envoi du message. Veuillez réessayer.",
    namePlaceholder: 'Entrez votre nom complet',
    emailPlaceholder: 'Entrez votre email',
    phonePlaceholder: 'Entrez votre numéro de téléphone',
    subjectPlaceholder: 'De quoi s\'agit-il?',
    messagePlaceholder: 'Écrivez votre message ici...',
    required: 'Ce champ est obligatoire',
    invalidEmail: 'Veuillez entrer une adresse email valide',
  },
};

interface ContactFormProps {
  locale: string;
}

export function ContactForm({ locale }: ContactFormProps) {
  const t = translations[locale as keyof typeof translations] || translations.en;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t.required;
    }
    if (!formData.email.trim()) {
      newErrors.email = t.required;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.invalidEmail;
    }
    if (!formData.subject.trim()) {
      newErrors.subject = t.required;
    }
    if (!formData.message.trim()) {
      newErrors.message = t.required;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          locale,
        }),
      });
      
      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {submitStatus === 'success' && (
        <div className={`alert alert-success ${styles.alert}`}>
          {t.success}
        </div>
      )}
      
      {submitStatus === 'error' && (
        <div className={`alert alert-danger ${styles.alert}`}>
          {t.error}
        </div>
      )}
      
      <div className="row g-3">
        <div className="col-md-6">
          <label htmlFor="name" className="form-label">{t.name}</label>
          <input
            type="text"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={t.namePlaceholder}
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>
        
        <div className="col-md-6">
          <label htmlFor="email" className="form-label">{t.email}</label>
          <input
            type="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder={t.emailPlaceholder}
          />
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>
        
        <div className="col-md-6">
          <label htmlFor="phone" className="form-label">{t.phone}</label>
          <input
            type="tel"
            className="form-control"
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder={t.phonePlaceholder}
          />
        </div>
        
        <div className="col-md-6">
          <label htmlFor="subject" className="form-label">{t.subject}</label>
          <input
            type="text"
            className={`form-control ${errors.subject ? 'is-invalid' : ''}`}
            id="subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder={t.subjectPlaceholder}
          />
          {errors.subject && <div className="invalid-feedback">{errors.subject}</div>}
        </div>
        
        <div className="col-12">
          <label htmlFor="message" className="form-label">{t.message}</label>
          <textarea
            className={`form-control ${errors.message ? 'is-invalid' : ''}`}
            id="message"
            rows={5}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder={t.messagePlaceholder}
          />
          {errors.message && <div className="invalid-feedback">{errors.message}</div>}
        </div>
        
        <div className="col-12">
          <button
            type="submit"
            className="btn btn-empire-primary btn-lg w-100"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                {t.sending}
              </>
            ) : (
              t.submit
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
