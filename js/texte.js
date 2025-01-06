function initTexte() {
    console.log("initTexte()")

    const indexTexte = parseInt(getURLParameter('indexTexte')); // Récupère l'index du texte depuis l'URL

    if (indexTexte >= 0 && indexTexte < listeTexte.length) {
        // Si l'index est valide, on récupère le titre et le texte
        const texteData = listeTexte[indexTexte];
        const titre = texteData[0];
        const contenu = texteData[1];

        // Afficher les valeurs dans les champs appropriés
        document.getElementById('texte-title').value = titre;
        document.getElementById('texte-textarea').value = contenu;
    }
}

// Fonction pour sauvegarder les données et télécharger un fichier texte
function saveToFileTexte() {
    console.log("saveToFileTexte()");

    // Récupérer le titre et le texte de l'input et du textarea
    const titre = document.getElementById('texte-title').value.trim();
    let texte = document.getElementById('texte-textarea').value.trim();

    // Supprimer tous les '\n' qui ne sont pas précédés par un '.'
    texte = texte.replace(/([^.])\n/g, '$1 '); // Remplace les '\n' qui ne sont pas précédés par un point par un espace

    // Récupérer l'index dans l'URL
    const indexTexte = parseInt(getURLParameter('indexTexte'));

    // Vérifier si l'index est -1 (ajout) ou >= 0 (modification)
    if (indexTexte >= 0 && indexTexte < listeTexte.length) {
        // Modifier un texte existant
        listeTexte[indexTexte][0] = titre;  // Modifier le titre
        listeTexte[indexTexte][1] = texte;  // Modifier le contenu
        console.log("Texte modifié :", listeTexte);
    } else {
        // Ajouter un nouveau texte
        listeTexte.push([titre, texte, []]);
        console.log("Texte ajouté :", listeTexte);
    }

    // Convertir le tableau `listeTexte` en une chaîne JSON formatée
    const jsonContent = JSON.stringify(listeTexte, null, 4);

    // Créer un blob (un objet représentant des données brutes)
    const blob = new Blob([jsonContent], { type: 'text/plain' });

    // Créer un lien temporaire pour télécharger le fichier
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = 'texte_liste.json'; // Nom du fichier

    // Simuler un clic pour déclencher le téléchargement
    downloadLink.click();

    // Libérer l'URL après le téléchargement
    URL.revokeObjectURL(downloadLink.href);
}

function initializeTestButton() {
    console.log("initializeTestButton()")

    // Récupérer le titre de la révision
    const title = document.getElementById('texte-title').value;
    const urlParams = new URLSearchParams(window.location.search);
    const indexTexte = urlParams.get('indexTexte'); // Récupérer la liste sélectionnée dans l'URL


    // Rediriger vers la page de test avec le titre en paramètre
    if (title) {
        window.location.href = `texte_test.html?indexTexte=` + indexTexte;
    } else {
        alert('Veuillez entrer un titre de révision avant de commencer le test.');
    }
}