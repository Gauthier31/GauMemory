// script.js


////////////////////////////// addEventListener //////////////////////////////
// Détection du DOMContentLoaded pour initialiser la page correcte
document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname.includes('index.html')) {
        initFicheRevisionList();  // Initialiser la page d'index
    } else if (window.location.pathname.includes('fiche_revision.html')) {
        initFicheRevisionPage();  // Initialiser la page de la fiche de révision
    } else if (window.location.pathname.includes('fiche_revision_test.html')) {
        initTestFicheRevision();  // Initialiser la page de test de la fiche de révision


    } else if (window.location.pathname.includes('liste_texte.html')) {
        initListTexte();
    } else if (window.location.pathname.includes('liste_audio.html')) {
        initListAudio();
    } else if (window.location.pathname.includes('texte.html')) {
        initTexte();
    } else if (window.location.pathname.includes('texte_test.html')) {
        initTest('texte');
    } else if (window.location.pathname.includes('audio.html')) {
        initAudio();
    } else if (window.location.pathname.includes('audio_test.html')) {
        initTest('audio');
    }

});


////////////////////////////// All //////////////////////////////

// Fonction pour télécharger le tableau JSON mis à jour
function saveToFile() {
    console.log("saveToFile()");

    listeRevision.forEach(revision => {

        revision.terms.forEach(term => {

            if (term.both) {
                let transi = term.term;
                term.term = term.definition;
                term.definition = transi;

                term.both = !term.both;
            }

            delete term.diff;
            delete term.both;
        })
    })



    // Convertir `listeRevision` structuré en une chaîne JSON formatée
    const jsonContent = JSON.stringify(listeRevision, null, 4);

    // Créer un blob (un objet représentant des données brutes) au format JSON
    const blob = new Blob([jsonContent], { type: 'application/json' });

    // Créer un lien temporaire pour le téléchargement
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = 'revision_liste.json'; // Nom du fichier téléchargé

    // Simuler un clic pour déclencher le téléchargement
    downloadLink.click();

    // Libérer l'URL après le téléchargement pour éviter une fuite de mémoire
    URL.revokeObjectURL(downloadLink.href);
}


// Fonction pour récupérer les paramètres de l'URL
function getURLParameter(name) {
    return new URLSearchParams(window.location.search).get(name);
}
//////////////////////////////  //////////////////////////////

////////////////////////////// Auto size textearea //////////////////////////////
// Fonction pour ajuster automatiquement la hauteur du textarea
function autoResize(textarea) {
    textarea.style.height = 'fit-content';       // Réinitialise la hauteur
    textarea.style.height = textarea.scrollHeight + 'px'; // Définit la hauteur en fonction du contenu
}


function calculateDaysDifference(targetDateStringTab) {

    let tab = [];

    targetDateStringTab.forEach(targetDateString => {
        if (targetDateString == null) {
            tab.push(null);
        } else {
            // Convertir la chaîne de date en un objet Date
            const [day, month, year] = targetDateString.split('/').map(Number);
            const targetDate = new Date(year, month - 1, day); // Les mois commencent à 0 en JavaScript

            // Obtenir la date actuelle
            const today = new Date();

            // Réinitialiser les heures pour ignorer l'heure lors du calcul
            targetDate.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);

            // Calculer la différence en millisecondes
            const differenceInMillis = today - targetDate;

            // Convertir les millisecondes en jours
            const differenceInDays = Math.round(differenceInMillis / (1000 * 60 * 60 * 24));
            tab.push(differenceInDays);
        }
    });
    return tab;
}