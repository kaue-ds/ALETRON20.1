
export type ChecklistStatus = 'good' | 'bad' | 'damaged' | 'na' | null;

export interface ChecklistItem {
  id: string;
  label: string;
  status: ChecklistStatus;
}

// Relaxed type to string to support dynamic photo lists
export type PhotoType = string;

export interface InspectionData {
  // Metadata for Editing
  id?: string;
  date?: string;

  // Tab 1: Initial
  contractNumber: string;
  plate: string;
  inspector: string;
  clientName: string;
  clientEmail: string;
  vehicle: string;
  mileage: string;
  removedItems: string;
  observation: string;
  collectionObservation: string;

  // Tab 2: Questionnaire
  checklist: Record<string, ChecklistStatus>;
  fuelLevel: number; // 0 to 100
  tires: {
    fl: string; // Front Left
    fr: string; // Front Right
    rl: string; // Rear Left
    rr: string; // Rear Right
    spare: string; // Estepe
  };
  
  // Tab 3: Photos
  photos: Partial<Record<string, string>>; // Storing DataURLs
  photoComments: Partial<Record<string, string>>; // New: Optional comments per photo
  photoMetadata: Partial<Record<string, string>>; // New: Timestamp metadata

  // Signatures & Client Details
  inspectorSignature?: string;
  clientSignature?: string;
  clientRG?: string;      // New
  clientPhone?: string;   // New
}

export type PhotoModel = 'standard' | 'premium' | 'custom';

export interface PhotoConfig {
  model: PhotoModel;
  activePhotos: string[]; // Used when model is 'custom'
}

export interface UserBranding {
  companyName?: string;
  logoBase64?: string;
  primaryColor?: string; // Hex Code
  isDarkTheme?: boolean; // New: Dark Mode Toggle
  footerText?: string;
  fontFamily?: string; 
  checklistTitle?: string;
  photoConfig?: PhotoConfig; 
  isChecklistLocked?: boolean; 
  language?: 'pt' | 'es' | 'en'; // New: Language preference
  allowInspectionEditing?: boolean; // New: Permission to edit inspections
}

// Auth & Admin Types
export type UserRole = 'super_admin' | 'admin' | 'employee';

export interface User {
  id: string;
  username: string;
  password: string; // In a real app, never store plain text
  role: UserRole;
  name: string;
  
  // Hierarchy & Limits
  isActive: boolean;        // If false, cannot login
  maxEmployees?: number;    // Only for Admins: How many employees they can create
  createdBy?: string;       // ID of the user who created this user
  
  // Customization
  branding?: UserBranding;

  // WhatsApp integration
  phoneNumber?: string;
  
  // Local chat history (User side)
  supportMessages?: ChatMessage[];
  
  // Admin Inbox (Fallback storage for Super Admin)
  supportInbox?: SupportMessage[];
}

export interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'support';
  timestamp: string; // ISO string for storage compatibility
}

// Internal Support Message System
export interface SupportMessage {
  id: string;
  userId: string;
  username: string;
  userRole: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface SavedInspection extends InspectionData {
  id: string;
  date: string;
  savedBy: string;
  created_at?: string; // Supabase timestamp
}

export const INITIAL_CHECKLIST_ITEMS: string[] = [
  "Antena", "Calota", "Cartão Code", "Chave de Roda", "Chave do veículo", 
  "Documentos", "Estepe", "Extintor", "Macaco", "Rádio", 
  "Rádio Central Multimídia", "Rodas de Ferro", "Rodas de liga leve", 
  "Tapetes", "Triângulo"
];

// MODELO PADRÃO (8 FOTOS)
export const STANDARD_PHOTOS: string[] = [
  'Frente',
  'Lateral Dianteira Direita',
  'Lateral Traseira Direita',
  'Traseira',
  'Lateral Traseira Esquerda',
  'Lateral Dianteira Esquerda',
  'Documentos',
  'Painel'
];

// Keep backward compatibility for imports that use this name
export const MANDATORY_PHOTOS = STANDARD_PHOTOS;

// MODELO PREMIUM (75 FOTOS - Baseado no PDF)
export const PREMIUM_PHOTOS_LIST: string[] = [
  "Frente", "Lateral Dianteira Direita", "Lateral Traseira Direita", "Traseira", 
  "Lateral Traseira Esquerda", "Lateral Dianteira Esquerda", "Painel (Meia Chave)", "Rádio/Mídia",
  "Bancos Dianteiros", "Bancos Traseiros", "Teto Externo", 
  "Pneu Dianteiro Esquerdo", "Pneu Traseiro Esquerdo", "Pneu Traseiro Direito", "Pneu Dianteiro Direito",
  "Para-brisa", "Para-choque Dianteiro/Grades", "Capô Aberto",
  "Porta Dianteira Esquerda", "Porta Traseira Esquerda", "Para-choque Traseiro", "Tampa Traseira",
  "Porta-malas (Macaco/Triângulo)", "Bagagito/Suportes", "Porta Traseira Direita", "Porta Dianteira Direita",
  "Porta Traseira Direita (Detalhe)", "Motor", "Painel Instrumentos", "Para-choque Dianteiro (Detalhe)",
  "Para-choque Dianteiro (Detalhe 2)", "Para-choque Traseiro (Detalhe)", "Para-lama Direito", "Para-lama Esquerdo",
  "Placa Dianteira", "Placa Traseira", "Porta Dianteira Esq (Detalhe)", "Porta Dianteira Dir (Detalhe)",
  "Porta-malas (Visão Geral)", "Porta Traseira Esq (Detalhe)", "Protetor de Cárter", "Retrovisor Direito",
  "Retrovisor Esquerdo", "Revestimento Porta Diant Dir", "Revestimento Porta Diant Esq", "Roda Dianteira Esq",
  "Roda Dianteira Dir", "Tampa Traseira (Detalhe)", "Teto (Visão 1)", "Teto (Visão 2)",
  "Bagagito (Detalhe)", "Antena", "Ar Condicionado", "Manual do Proprietário",
  "Banco Traseiro (Detalhe 1)", "Banco Traseiro (Detalhe 2)", "Banco Traseiro (Detalhe 3)", "Bancos Dianteiros (Detalhe)",
  "Borracha Porta Diant Dir", "Borracha Porta Diant Esq", "Borracha Tampa Traseira", "Antena (Detalhe 2)",
  "Ar Condicionado (Saída)", "Manual (Aberto)", "Bancos Dianteiros (Assento)", "Borracha Porta Diant Esq (Det)",
  "Borracha Porta Diant Dir (Det)", "Borracha Tampa Tras (Det)", "Caixa de Ar Direita", "Caixa de Ar Esquerda",
  "Capô (Detalhe)", "Frisos de Teto", "Grade Para-choque Diant", "Lateral Traseira Dir (Detalhe)", "Lateral Traseira Esq (Detalhe)"
];