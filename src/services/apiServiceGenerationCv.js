import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Génère un CV optimisé ATS via l'IA (Hugging Face côté backend).
 * @param {Object} donneesCv - correspond au CvGenerationRequest du backend
 * @param {string} donneesCv.langue - "fr" | "ar" | "en"
 * @param {string} donneesCv.posteVise
 * @param {string} donneesCv.nomComplet
 * @param {string} donneesCv.email
 * @param {string} donneesCv.telephone
 * @param {string[]} donneesCv.competences
 * @param {Array} donneesCv.experiences - [{ poste, entreprise, periode, description }]
 * @param {Array} donneesCv.formations - [{ diplome, etablissement, annee }]
 * @returns {Promise<Object>} CvGenerationResponse { resume, competencesAtsOptimisees, experiencesReformulees }
 */
export const genererCv = async (donneesCv) => {
  try {
    const response = await apiClient.post('/cv/generer', donneesCv);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la génération du CV :', error);
    throw error;
  }
};
export const telechargerPdfCv = async (donneesPdf) => {
  try {
    const response = await apiClient.post('/cv/telecharger-pdf', donneesPdf, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors du téléchargement du PDF :', error);
    throw error;
  }
};

const apiServiceGenerationCv = { genererCv, telechargerPdfCv };
export default apiServiceGenerationCv;