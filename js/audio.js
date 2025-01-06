function initAudio() {
    console.log("initAudio()")

    const indexAudio = parseInt(getURLParameter('indexAudio')); // Récupère l'index du audio depuis l'URL

    if (indexAudio >= 0 && indexAudio < listeAudio.length) {
        // Si l'index est valide, on récupère le titre et le audio
        const audioData = listeAudio[indexAudio];
        const titre = audioData[0];
        const contenu = audioData[1];

        // Afficher les valeurs dans les champs appropriés
        document.getElementById('audio-title').value = titre;
        document.getElementById('audio-textarea').value = contenu;
    }
}

// Fonction pour sauvegarder les données et télécharger un fichier audio
function saveToFileAudio() {
    console.log("saveToFileAudio()");

    // Récupérer le titre et le audio de l'input et du textarea
    const titre = document.getElementById('audio-title').value.trim();
    let audio = document.getElementById('audio-textarea').value.trim();

    // Supprimer tous les '\n' qui ne sont pas précédés par un '.'
    audio = audio.replace(/([^.])\n/g, '$1 '); // Remplace les '\n' qui ne sont pas précédés par un point par un espace

    // Récupérer l'index dans l'URL
    const indexAudio = parseInt(getURLParameter('indexAudio'));

    // Vérifier si l'index est -1 (ajout) ou >= 0 (modification)
    if (indexAudio >= 0 && indexAudio < listeAudio.length) {
        // Modifier un audio existant
        listeAudio[indexAudio][0] = titre;  // Modifier le titre
        listeAudio[indexAudio][1] = audio;  // Modifier le contenu
        console.log("Audio modifié :", listeAudio);
    } else {
        // Ajouter un nouveau audio
        listeAudio.push([titre, audio]);
        console.log("Audio ajouté :", listeAudio);
    }

    // Convertir le tableau `listeAudio` en une chaîne JSON formatée
    const jsonContent = JSON.stringify(listeAudio, null, 4);

    // Créer un blob (un objet représentant des données brutes)
    const blob = new Blob([jsonContent], { type: 'text/plain' });

    // Créer un lien temporaire pour télécharger le fichier
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = 'audio_liste.json'; // Nom du fichier

    // Simuler un clic pour déclencher le téléchargement
    downloadLink.click();

    // Libérer l'URL après le téléchargement
    URL.revokeObjectURL(downloadLink.href);
}

function initializeTestButton() {
    console.log("initializeTestButton()")

    // Récupérer le titre de la révision
    const title = document.getElementById('audio-title').value;
    const urlParams = new URLSearchParams(window.location.search);
    const indexAudio = urlParams.get('indexAudio'); // Récupérer la liste sélectionnée dans l'URL


    // Rediriger vers la page de test avec le titre en paramètre
    if (title) {
        window.location.href = `audio_test.html?indexAudio=` + indexAudio;
    } else {
        alert('Veuillez entrer un titre de révision avant de commencer le test.');
    }
}