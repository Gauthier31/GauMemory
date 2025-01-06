// Variables pour stocker les mots trouvés et ceux restants
let motsTrouves = [];
let motsRestants = [];

// Identifiants pour les index du texte ou de l'audio
const indexTexte = parseInt(getURLParameter('indexTexte'));
const indexAudio = parseInt(getURLParameter('indexAudio'));

let type = null

// Fonction pour initialiser les tests (texte ou audio)
function initTest(typeInput) {
    console.log(`initTest(${typeInput})`);

    type = typeInput

    if (type === 'texte' && indexTexte >= 0 && indexTexte < listeTexte.length) {
        const texteData = listeTexte[indexTexte];
        const titre = texteData[0]; // Titre du texte
        const contenu = texteData[1]; // Contenu du texte
        motsTrouves = texteData[2] || [];

        // Mettre à jour le titre
        const titreElement = document.getElementById('titre-texte');
        titreElement.textContent = "Test - " + titre;

        // Séparer le texte en mots et les ajouter à la liste des mots restants
        motsRestants = contenu.split(" ");
        initTraining(motsTrouves);

    } else if (type === 'audio' && indexAudio >= 0 && indexAudio < listeAudio.length) {
        const audioData = listeAudio[indexAudio];
        const titre = audioData[0]; // Titre de l'audio
        const contenu = audioData[1]; // Contenu de l'audio
        motsTrouves = audioData[2] || [];

        // Mettre à jour le titre
        const titreElement = document.getElementById('titre-audio');
        titreElement.textContent = "Test - " + titre;

        // Séparer l'audio en mots et les ajouter à la liste des mots restants
        motsRestants = contenu.split(" ");
        initTraining(motsTrouves);

    } else {
        console.error("Index ou type invalide.");
    }
}

// Fonction pour initialiser l'affichage des mots trouvés
function initTraining(motsTrouvesSource) {
    console.log(`initTraining(${type})`);

    const motsTrouvesTemp = [...motsTrouvesSource];
    const trainingDiv = document.getElementById(type === 'texte' ? 'training-texte' : 'training-audio');
    trainingDiv.innerHTML = ''; // Vider le conteneur avant d'ajouter les mots

    motsRestants.forEach(mot => {
        const regexMotEtPonctuation = /(\w+)([.,:;!?]*)/g;
        let match;

        while ((match = regexMotEtPonctuation.exec(mot)) !== null) {
            const [motComplet, motSansPonctuation, ponctuation] = match;

            // Créer une div pour le mot
            if (motSansPonctuation) {
                const motDiv = document.createElement('div');
                motDiv.textContent = motSansPonctuation;
                motDiv.classList.add(type === 'texte' ? 'mot-div-texte' : 'mot-div-audio');

                // Vérifier si le mot a déjà été trouvé
                const motIndex = motsTrouvesTemp.findIndex(m => m.toLowerCase() === motSansPonctuation.toLowerCase());
                if (motIndex !== -1) {
                    motDiv.classList.add(type === 'texte' ? 'motTextFind' : 'motAudioFind');
                    motsTrouvesTemp.splice(motIndex, 1); // Supprimer la première occurrence
                }

                trainingDiv.appendChild(motDiv);
            }

            // Créer une div pour la ponctuation (s'il y en a)
            if (ponctuation) {
                const ponctuationDiv = document.createElement('div');
                ponctuationDiv.textContent = ponctuation;
                ponctuationDiv.classList.add('ponctuation-div');
                trainingDiv.appendChild(ponctuationDiv);
            }
        }
    });
}

// Gérer l'entrée de l'utilisateur lorsque "Entrée" est pressé
function enterInput(event) {
    console.log("enterInput()");
    // Liste des caractères de ponctuation
    const punctuation = [' ', '!', '?', '.', ',', 'enter', ';', ':', '-', '(', ')', '[', ']', '{', '}', '"', "'", '`', '...', '¡', '¿'];

    // Vérifie si la touche pressée est une ponctuation
    if (punctuation.includes(event.key)) {
        checkDefinition();
    }
}

// Fonction pour vérifier si un mot est correct
function checkDefinition() {
    console.log(`checkDefinition(${type})`);

    const userInput = document.getElementById('definition-input').value.trim().toLowerCase();
    const motDivs = document.querySelectorAll(type === 'texte' ? '.mot-div-texte' : '.mot-div-audio');

    for (let divMot of motDivs) {
        if (divMot.textContent.trim().toLowerCase() === userInput) {
            if (!divMot.classList.contains('motTextFind')) {
                divMot.classList.add('motTextFind');
                motsTrouves.push(userInput);
                break;
            }
        }
    }

    // Vider l'input après vérification
    document.getElementById('definition-input').value = '';
}

// Fonction pour sauvegarder les mots trouvés
function saveFoundWords() {
    console.log(`saveFoundWords(${type})`);

    if (type === 'texte' && indexTexte >= 0 && indexTexte < listeTexte.length) {
        listeTexte[indexTexte][2] = motsTrouves;

        const jsonContent = JSON.stringify(listeTexte, null, 4);
        saveToFile(jsonContent, 'texte_liste.json');

    } else if (type === 'audio' && indexAudio >= 0 && indexAudio < listeAudio.length) {
        listeAudio[indexAudio][2] = motsTrouves;

        const jsonContent = JSON.stringify(listeAudio, null, 4);
        saveToFile(jsonContent, 'audio_liste.json');

    } else {
        console.error("Type ou index invalide pour la sauvegarde.");
    }
}

// Fonction utilitaire pour sauvegarder dans un fichier
function saveToFile(content, filename) {
    const blob = new Blob([content], { type: 'application/json' });
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = filename;
    downloadLink.click();
    URL.revokeObjectURL(downloadLink.href);
}

// Fonction pour réinitialiser l'affichage et vider les mots trouvés
function resetBtn() {
    console.log(`resetBtn(${type})`);

    if (type === 'texte' && indexTexte >= 0 && indexTexte < listeTexte.length) {
        listeTexte[indexTexte][2] = [];
        initTraining(listeTexte[indexTexte][2]);

    } else if (type === 'audio' && indexAudio >= 0 && indexAudio < listeAudio.length) {
        listeAudio[indexAudio][2] = [];
        initTraining(listeAudio[indexAudio][2]);
    }

    motsTrouves = [];
}