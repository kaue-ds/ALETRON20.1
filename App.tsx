
import React, { useState, useEffect } from 'react';
import { HashRouter, useLocation } from 'react-router-dom';
import { InspectionData, User, SavedInspection, UserBranding, STANDARD_PHOTOS, PREMIUM_PHOTOS_LIST } from './types';
import TabInitial from './components/TabInitial';
import TabQuestionnaire from './components/TabQuestionnaire';
import TabPhotos from './components/TabPhotos';
import TabSave from './components/TabSave';
import TabHistory from './components/TabHistory';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import UserSettings from './components/UserSettings';
import AlectronValidator from './components/AlectronValidator';
import SupportChat from './components/SupportChat';
import { LayoutDashboard, ClipboardList, Camera, Save as SaveIcon, LogOut, History, Settings, ChevronLeft } from 'lucide-react';
import { getCurrentUser, logoutUser, saveInspection, getOrganizationBranding, getLatestUserData } from './services/storage';

const INITIAL_DATA: InspectionData = {
  contractNumber: '',
  plate: '',
  inspector: '',
  clientName: '',
  clientEmail: '',
  clientRG: '',    
  clientPhone: '', 
  vehicle: '',
  mileage: '',
  removedItems: '',
  observation: '',
  collectionObservation: '',
  checklist: {},
  fuelLevel: 50,
  tires: { fl: '', fr: '', rl: '', rr: '', spare: '' },
  photos: {},
  photoComments: {}, 
  photoMetadata: {}, 
  inspectorSignature: '',
  clientSignature: ''
};

// Wrapper to handle Hash Routing for Alectron
const AppContent = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState<InspectionData>(INITIAL_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAlectron, setShowAlectron] = useState(false);
  const [alectronId, setAlectronId] = useState<string>('');
  
  // Branding State
  const [orgBranding, setOrgBranding] = useState<UserBranding | null>(null);
  
  // State to control if Admin is viewing Dashboard or Inspection Form
  const [showAdminDashboard, setShowAdminDashboard] = useState(true);

  // Check URL Hash for Validator
  useEffect(() => {
    const checkHash = () => {
       const hash = window.location.hash;
       if (hash.includes('validate')) {
          const params = new URLSearchParams(hash.split('?')[1]);
          const id = params.get('id');
          if (id) setAlectronId(id);
          setShowAlectron(true);
       } else {
          setShowAlectron(false);
       }
    };
    
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  useEffect(() => {
    const init = async () => {
      let user = getCurrentUser();
      
      if (user) {
        // --- SYNC WITH SERVER ---
        try {
           const freshUser = await getLatestUserData(user.id);
           if (freshUser) {
             user = freshUser;
             try { localStorage.setItem('autocheck_session', JSON.stringify(user)); } catch(e){}
           }
        } catch(e) {
           console.warn("Using cached data.");
        }

        setCurrentUser(user);
        const branding = await getOrganizationBranding(user);
        setOrgBranding(branding);
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const handleUserUpdate = async () => {
    if (!currentUser) return;
    try {
      const freshUser = await getLatestUserData(currentUser.id);
      if (freshUser) {
        setCurrentUser(freshUser);
        const branding = await getOrganizationBranding(freshUser);
        setOrgBranding(branding);
        try { localStorage.setItem('autocheck_session', JSON.stringify(freshUser)); } catch(e){}
      }
    } catch (e) {
      console.error("Error updating user context", e);
    }
  };

  const updateData = (field: keyof InspectionData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedData = (parent: keyof InspectionData, key: string, value: any) => {
    if (parent === 'fuelLevel') {
      setData(prev => ({ ...prev, fuelLevel: value }));
      return;
    }
    setData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as Record<string, any>),
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    try {
      await saveInspection(data, currentUser);
      alert(data.id ? "Registro atualizado." : "Vistoria salva.");
      setData(INITIAL_DATA);
      setActiveTab(4); 
    } catch (e: any) {
      alert("Erro: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    if (confirm("Descartar dados atuais?")) {
      setData(INITIAL_DATA);
      setActiveTab(0);
    }
  };

  const handleEdit = (inspection: SavedInspection) => {
    setData({ ...INITIAL_DATA, ...inspection });
    setActiveTab(0);
    if (currentUser?.role === 'admin' || currentUser?.role === 'super_admin') {
       setShowAdminDashboard(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setOrgBranding(null);
    setData(INITIAL_DATA);
  };

  if (isLoading) {
     return <div className="h-screen flex items-center justify-center bg-white"><p className="text-black font-light tracking-widest text-xs animate-pulse">CARREGANDO...</p></div>;
  }

  // --- ALECTRON MODE ---
  if (showAlectron) {
     return <AlectronValidator initialId={alectronId} onClose={() => { window.location.hash = ''; setShowAlectron(false); }} />;
  }

  // --- STYLE INJECTION ---
  const primaryColor = orgBranding?.primaryColor || '#000000';
  const isDark = orgBranding?.isDarkTheme || false;
  
  const globalStyles = `
    :root {
      --brand-primary: ${primaryColor};
    }
    
    /* Primary Color Overrides */
    .bg-black { background-color: var(--brand-primary) !important; }
    .text-black { color: var(--brand-primary) !important; }
    .border-black { border-color: var(--brand-primary) !important; }
    .focus\\:border-black:focus { border-color: var(--brand-primary) !important; }
    .focus\\:ring-black:focus { --tw-ring-color: var(--brand-primary) !important; }
    .accent-black { accent-color: var(--brand-primary) !important; }
    .border-l-black { border-left-color: var(--brand-primary) !important; }
    
    /* Hover states for primary buttons (simple darkening) */
    .hover\\:bg-gray-800:hover { opacity: 0.9; }
    .hover\\:bg-gray-900:hover { opacity: 0.9; }

    /* Dark Mode */
    ${isDark ? `
        body { background-color: #121212 !important; color: #e5e5e5 !important; }
        .bg-white { background-color: #1e1e1e !important; color: #e5e5e5 !important; }
        .bg-gray-50 { background-color: #262626 !important; }
        .bg-gray-100 { background-color: #2d2d2d !important; }
        .text-gray-900 { color: #ffffff !important; }
        .text-gray-800, .text-gray-700, .text-gray-600 { color: #d4d4d4 !important; }
        .text-gray-500, .text-gray-400 { color: #a3a3a3 !important; }
        .border-gray-50, .border-gray-100, .border-gray-200, .border-gray-300 { border-color: #404040 !important; }
        input, select, textarea { 
           background-color: #2d2d2d !important; 
           color: white !important; 
           border-color: #404040 !important; 
        }
        /* Buttons specific adjustment */
        .bg-white.text-black.border-2.border-black {
           background-color: #1e1e1e !important;
           color: var(--brand-primary) !important;
           border-color: var(--brand-primary) !important;
        }
    ` : ''}
  `;

  // --- LOGIN MODE ---
  if (!currentUser) {
    return <Login onLogin={(user) => { setCurrentUser(user); getOrganizationBranding(user).then(setOrgBranding); }} />;
  }

  // --- ADMIN DASHBOARD MODE ---
  if ((currentUser.role === 'admin' || currentUser.role === 'super_admin') && showAdminDashboard) {
    return (
      <div className="relative">
        <style>{globalStyles}</style>
        <AdminDashboard 
          currentUser={currentUser} 
          onLogout={handleLogout} 
          onEdit={handleEdit}
          onRefresh={handleUserUpdate}
        />
        <SupportChat currentUser={currentUser} />
      </div>
    );
  }

  // --- VISTORIA APP MODE ---
  
  const fontFamilyStyle = orgBranding?.fontFamily ? { fontFamily: orgBranding.fontFamily } : {};

  // FIX: Ensure there's always a valid list
  let activePhotos = STANDARD_PHOTOS;
  if (orgBranding?.photoConfig) {
      if (orgBranding.photoConfig.model === 'premium') {
          activePhotos = PREMIUM_PHOTOS_LIST;
      } else if (orgBranding.photoConfig.model === 'custom' && orgBranding.photoConfig.activePhotos && orgBranding.photoConfig.activePhotos.length > 0) {
          activePhotos = orgBranding.photoConfig.activePhotos;
      }
  }

  return (
    <div className="flex flex-col h-screen bg-white text-gray-900 font-sans" style={fontFamilyStyle}>
      <style>{globalStyles}</style>
      
      {/* Top Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10">
        <div>
           {orgBranding?.logoBase64 ? (
              <img src={orgBranding.logoBase64} alt="Logo" className="h-8 object-contain grayscale hover:grayscale-0 transition-all" />
           ) : (
              <h1 className="text-sm font-extralight tracking-[0.2em] uppercase text-black">{orgBranding?.companyName || 'ALECTRON'}</h1>
           )}
        </div>
        
        <div className="flex items-center gap-4">
           <button 
             onClick={() => setShowSettings(true)}
             className="text-gray-400 hover:text-black transition-colors"
           >
             <Settings className="w-5 h-5" strokeWidth={1.5} />
           </button>
           {(currentUser.role === 'admin' || currentUser.role === 'super_admin') ? (
             <button 
               onClick={() => { setShowAdminDashboard(true); setData(INITIAL_DATA); }}
               className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-black"
             >
               <ChevronLeft className="w-3 h-3" /> Painel
             </button>
           ) : (
             <button 
               onClick={handleLogout}
               className="text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-black"
             >
               Sair
             </button>
           )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto bg-white">
        {activeTab === 0 && <TabInitial data={data} updateData={updateData} updateNestedData={updateNestedData} branding={orgBranding} />}
        {activeTab === 1 && <TabQuestionnaire data={data} updateNestedData={updateNestedData} branding={orgBranding} />}
        {activeTab === 2 && <TabPhotos data={data} updateNestedData={updateNestedData} activePhotos={activePhotos} />}
        {activeTab === 3 && <TabSave data={data} updateData={updateData} onSave={handleSave} onDiscard={handleDiscard} activePhotos={activePhotos} />}
        {activeTab === 4 && <TabHistory currentUser={currentUser} onEdit={handleEdit} branding={orgBranding} />}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-100 flex justify-around items-center px-4 py-3 md:pb-3 shadow-none z-10">
        {[
          { id: 0, label: 'DADOS', icon: ClipboardList },
          { id: 1, label: 'CHECK', icon: LayoutDashboard },
          { id: 2, label: 'FOTOS', icon: Camera },
          { id: 3, label: 'SALVAR', icon: SaveIcon },
          { id: 4, label: 'HISTÓRICO', icon: History },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)} 
            className={`flex flex-col items-center group ${activeTab === tab.id ? 'opacity-100' : 'opacity-40 hover:opacity-70'} transition-opacity`}
          >
            <tab.icon className={`w-5 h-5 mb-1 ${activeTab === tab.id ? 'stroke-2 text-black' : 'stroke-1 text-gray-600'}`} />
            <span className="text-[9px] font-medium tracking-widest">{tab.label}</span>
          </button>
        ))}
      </div>

      {showSettings && currentUser && (
        <UserSettings user={currentUser} onClose={() => setShowSettings(false)} />
      )}
      
      {/* Support Chat Overlay - Available in both views */}
      <SupportChat currentUser={currentUser} />
    </div>
  );
};

// Wrap content in HashRouter
const App = () => (
  <HashRouter>
    <AppContent />
  </HashRouter>
);

export default App;
