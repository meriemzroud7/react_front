import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import RecruteurLayout from '../layouts/RecruteurLayout';
import CandidatLayout from '../layouts/CandidatLayout';
import AdminLayout from '../layouts/AdminLayout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import CodeVerification from '../pages/CodeVerification';
import NotFound from '../pages/NotFound';


/* Espace Recruteur */
import Dashboard from '../pages/recruteur/Dashboard';
import Offres from '../pages/recruteur/Offres';
import CreerOffre from '../pages/recruteur/CreerOffre';
import Candidatures from '../pages/recruteur/Candidatures';
import AnalyseIA from '../pages/recruteur/AnalyseIA';
import Comparaison from '../pages/recruteur/Comparaison';
import ProfilCandidat from '../pages/recruteur/ProfilCandidat';
import Entretiens from '../pages/recruteur/Entretiens';
import SalleEntretien from '../pages/recruteur/SalleEntretien';
import Calendrier from '../pages/recruteur/Calendrier';
import Messagerie from '../pages/recruteur/Messagerie';
import Rapports from '../pages/recruteur/Rapports';
import Parametres from '../pages/recruteur/Parametres';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import ModifierOffre from '../pages/recruteur/ModifierOffre';



/* Espace Candidat */
import CandidatDashboard from '../pages/candidat/Dashboard';
import CandidatProfile from '../pages/candidat/Profile';
import CandidatCV from '../pages/candidat/CVManager';
import CandidatCoverLetters from '../pages/candidat/GenerationCv';
import CandidatJobSearch from '../pages/candidat/JobSearch';
import CandidatJobDetails from '../pages/candidat/JobDetails';
import CandidatRecommendations from '../pages/candidat/Recommendations';
import CandidatInterviews from '../pages/candidat/Interviews';
import CandidatInterviewRoom from '../pages/candidat/InterviewRoom';
import CandidatMessaging from '../pages/candidat/Messaging';
import CandidatSavedJobs from '../pages/candidat/SavedJobs';
import CandidatNotifications from '../pages/candidat/Notifications';
import CandidatSettings from '../pages/candidat/Settings';
import GenerationCv from '../pages/candidat/GenerationCv';
import ListCandidature from '../pages/candidat/listCandidature';
import VerifCandidature from '../pages/candidat/verifcandidature';


/* Espace Administrateur */
import AdminDashboard from '../pages/admin/Dashboard';
import AdminUtilisateurs from '../pages/admin/Utilisateurs';
import AdminEntreprises from '../pages/admin/Entreprises';
import AdminOffres from '../pages/admin/Offres';
import AdminCandidatures from '../pages/admin/Candidatures';
import AdminEntretiens from '../pages/admin/Entretiens';
import AdminReferentiels from '../pages/admin/Referentiels';
import AdminCompetences from '../pages/admin/Competences';
import AdminIA from '../pages/admin/IA';
import AdminSignalements from '../pages/admin/Signalements';
import AdminRapports from '../pages/admin/Rapports';
import AdminNotifications from '../pages/admin/Notifications';
import AdminParametres from '../pages/admin/Parametres';
import AdminLogs from '../pages/admin/Logs';
import AdminMaintenance from '../pages/admin/Maintenance';
import AdminProfil from '../pages/admin/Profil';

function AppRoutes() {
  return (
    <Routes>
      {/* ── Public landing + footer ── */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
      </Route>

      {/* ── Auth pages ── */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<CodeVerification />} />
         <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>


      
      {/* ── Espace Administrateur ── */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="utilisateurs" element={<AdminUtilisateurs />} />
        <Route path="entreprises" element={<AdminEntreprises />} />
        <Route path="offres" element={<AdminOffres />} />
        <Route path="candidatures" element={<AdminCandidatures />} />
        <Route path="entretiens" element={<AdminEntretiens />} />
        <Route path="referentiels" element={<AdminReferentiels />} />
        <Route path="competences" element={<AdminCompetences />} />
        <Route path="ia" element={<AdminIA />} />
        <Route path="signalements" element={<AdminSignalements />} />
        <Route path="rapports" element={<AdminRapports />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="parametres" element={<AdminParametres />} />
        <Route path="profil" element={<AdminProfil />} />
        <Route path="logs" element={<AdminLogs />} />
        <Route path="maintenance" element={<AdminMaintenance />} />
      </Route>

      {/* ── Espace Recruteur ── */}
      <Route path="/recruteur" element={<RecruteurLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="offres" element={<Offres />} />
        <Route path="offres/nouvelle" element={<CreerOffre />} />
        <Route path="candidatures" element={<Candidatures />} />
        <Route path="analyse-ia" element={<AnalyseIA />} />
        <Route path="comparaison" element={<Comparaison />} />
        <Route path="profil/:id" element={<ProfilCandidat />} />
        <Route path="entretiens" element={<Entretiens />} />
        <Route path="salle-entretien" element={<SalleEntretien />} />
        <Route path="calendrier" element={<Calendrier />} />
        <Route path="messagerie" element={<Messagerie />} />
        <Route path="rapports" element={<Rapports />} />
        <Route path="parametres" element={<Parametres />} />
        <Route path="offres/:id/modifier" element={<ModifierOffre />} />
       
      </Route>

      
      {/* ── Espace Candidat ── */}
      <Route path="/candidat" element={<CandidatLayout />}>
        <Route index element={<CandidatDashboard />} />
        <Route path="profil" element={<CandidatProfile />} />
        <Route path="cv" element={<CandidatCV />} />
        <Route path="lettres" element={<CandidatCoverLetters />} />
        <Route path="offres" element={<CandidatJobSearch />} />
        <Route path="offres/:id" element={<CandidatJobDetails />} />
        <Route path="recommandations" element={<CandidatRecommendations />} />
        <Route path="candidatures" element={<ListCandidature />} />    
          <Route path="candidatures/:id" element={<VerifCandidature />} />
        <Route path="entretiens" element={<CandidatInterviews />} />
        <Route path="entretiens/:id/salle" element={<CandidatInterviewRoom />} />
        <Route path="messagerie" element={<CandidatMessaging />} />
        <Route path="favoris" element={<CandidatSavedJobs />} />
        <Route path="notifications" element={<CandidatNotifications />} />
        <Route path="parametres" element={<CandidatSettings />} />
        <Route path="/candidat/generer-cv" element={<GenerationCv />} />
      </Route>

      {/* ── 404 ── */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
