import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import RecruteurLayout from '../layouts/RecruteurLayout';
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
       
      </Route>

      {/* ── 404 ── */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
