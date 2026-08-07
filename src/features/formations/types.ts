export interface Participant {
  id: string;
  name: string;
  title: string;
}

export interface Formation {
  id: string;
  title: string;
  shortTitle: string;
  status: 'passée' | 'en_cours' | 'à_venir';
  dateRange: string;
  duration: string;
  location: string;
  certifNumPrefix: string;
  description: string;
  competences: string[];
  signataires: { name: string; role: string }[];
  partners: string[];
  participants: Participant[];
  modules?: { title: string; url?: string }[];
  imageUrl?: string;
}
