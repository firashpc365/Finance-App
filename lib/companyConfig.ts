
export type CompanyId = 'ELITE' | 'JAG' | 'TSS' | 'RIGHT';

export interface CompanyProfile {
  id: CompanyId;
  name: string;
  logo: string;
  color: {
    primary: string;   // For headers/buttons (tailwind class)
    secondary: string; // For accents (tailwind class)
    text: string;      // Specific text color (tailwind class)
    gradient?: string; // For special looks (tailwind class)
  };
  contact: {
    email: string;
    website?: string;
    phones: string[];
    address: string;
  };
}

export const COMPANY_CONFIG: Record<CompanyId, CompanyProfile> = {
  ELITE: {
    id: 'ELITE',
    name: 'ElitePro Events & Advertising',
    logo: 'https://placehold.co/400x200/2d9a91/ffffff?text=ELITEPRO',
    color: {
      primary: 'bg-teal-600',
      secondary: 'border-teal-600',
      text: 'text-teal-700',
      gradient: 'bg-gradient-to-r from-teal-500 to-emerald-400'
    },
    contact: {
      email: 'firash@eliteproeventsksa.com',
      website: 'www.eliteproeventsksa.com',
      phones: ['+966 54 531 1018', '+966 53 706 0245'],
      address: 'Al Souq, Dammam 32242'
    }
  },
  JAG: {
    id: 'JAG',
    name: 'JAG Arabia',
    logo: 'https://placehold.co/400x200/dc2626/ffffff?text=JAG+ARABIA',
    color: {
      primary: 'bg-red-600',
      secondary: 'border-red-600',
      text: 'text-slate-800',
      gradient: 'bg-red-700'
    },
    contact: {
      email: 'firashpc@gmail.com',
      phones: ['+966 50 123 4567'],
      address: 'Dammam, Saudi Arabia'
    }
  },
  TSS: {
    id: 'TSS',
    name: 'TSS Advertising',
    logo: 'https://placehold.co/400x200/f97316/ffffff?text=TSS+ADV',
    color: {
      primary: 'bg-orange-500',
      secondary: 'border-orange-500',
      text: 'text-orange-600',
      gradient: 'bg-gradient-to-r from-orange-500 to-purple-600'
    },
    contact: {
      email: 'firashpc@gmail.com',
      phones: ['+966 50 234 5678'],
      address: 'Dammam, Saudi Arabia'
    }
  },
  RIGHT: {
    id: 'RIGHT',
    name: 'Right Events',
    logo: 'https://placehold.co/400x200/000000/ffffff?text=RIGHT+EVENTS',
    color: {
      primary: 'bg-black',
      secondary: 'border-black',
      text: 'text-red-600',
      gradient: 'bg-black'
    },
    contact: {
      email: 'firashpc@gmail.com',
      phones: ['+966 50 384 9793'],
      address: 'Dammam, Saudi Arabia'
    }
  }
};
