export interface Service {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  iconName: string;
  imageAlt: string;
  price?: number;
  therapists?: string[];
  pourQui?: string;
  objectif?: string;
  commentCaSePasse?: string;
  duree?: string;
  modalite?: string;
  quandLutiliser?: string;
  imageUrl?: string;
}

export interface Value {
  name: string;
  description: string;
  iconName: string;
}

export interface Appointment {
  id: string;
  serviceId: string;
  serviceTitle: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientNotes: string;
  date: string;
  timeSlot: string;
  preferredTherapist: string;
  status: 'confirmé' | 'en_attente' | 'annulé';
  createdAt: string;
}

export interface Question {
  id: number;
  text: string;
  options: {
    text: string;
    score: number;
  }[];
}
