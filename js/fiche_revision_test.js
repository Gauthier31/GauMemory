// Variables globales pour suivre la progression
let currentTermIndex = 0;
let remainingTerms = [];
let oldDefinition = '';

// Mode
// execute, retry, wait, edit, modal
let mode = 'execute';
let saisieMode = 'textarea';
let modeSav = null;
let closeModalVal = false;

let langue = null;
let langueInstant = null

// Sélection des éléments HTML
const pageTitle = document.getElementById('titre-liste');

const nbCorrectDisplay = document.getElementById('nbCorrect');
const nbCorrectDelayDisplay = document.getElementById('nbCorrectDelay');
const nbInconnuDisplay = document.getElementById('nbInconnu');
const nbIncorrectDisplay = document.getElementById('nbIncorrect');
const nbAttenteDisplay = document.getElementById('nbAttente');
const progressBarCorrect = document.getElementById('progress-correct');
const progressBarCorrectDelay = document.getElementById('progress-correct-delay');
const progressBarWrong = document.getElementById('progress-wrong');
const progressBarWaiting = document.getElementById('progress-waiting');


const termDisplay = document.getElementById('term-display');
const definitionInput = document.getElementById('definition-input');
const consigne = document.getElementById('consigne');


const correctElementDisplayDiv = document.getElementById('correct-definition-div');
const correctElementDisplayText = document.getElementById('correct-definition-text');

const boxValidateManual = document.getElementById('validate-manual');

const modalPile = document.getElementById('modal-pile');

const mean1 = document.getElementById('mean-1');
const mean2 = document.getElementById('mean-2');
const mean3 = document.getElementById('mean-3');

const affichageMobile = document.getElementById("affichageMobile");
const blocSaisie = document.getElementById("blocSaisie");
let strongLearn = document.getElementById("strongLearn").checked;


// Récupérer le paramètre de la liste depuis l'URL
const urlParams = new URLSearchParams(window.location.search);
const indexFicheRevision = urlParams.get('indexFicheRevision');

let correctCount = 0;
let correctCountDelay = 0;
let wrongCount = 0;
let waitingCount = 0;
let unknownCount = 0;

let groupSize = 7; // Taille par défaut
let currentGroup = []; // Liste des termes du groupe actuel
let termsTested = []; // Stocke temporairement les termes testés

// Liste a réviser
let revision = null;
let revisionSav = null;

const today = new Date().toLocaleDateString('fr-FR');

window.addEventListener('beforeunload', function () {
    //saveToFile(); // Sauvegarde des données avant de quitter
});

document.getElementById('group-size').addEventListener('input', function () {
    groupSize = parseInt(this.value) || 7;
    initTestFicheRevision(); // Réinitialise avec la nouvelle taille de groupe
});


////////////////////////////////////////////////////////////////////////////
////////////////////////////// Initialisation //////////////////////////////
function initTestFicheRevision() {
    console.log("initTestFicheRevision()");

    revision = listeRevision[indexFicheRevision];
    pageTitle.textContent = revision.title;

    if (revision) {

        if (langue == null)
            initMeans();
        initCountTerme();
        displayMobile();

        remainingTerms = revision.terms.filter(term =>
            (langue == 'both' && (
                !(term.status[0] >= 1 && term.status[0] > term.diff[0]) ||
                !(term.status[1] >= 1 && term.status[1] > term.diff[1])
            )) ||
            (!(term.status[langue] >= 1 && term.status[langue] > term.diff[langue]))
        );

        remainingTerms.forEach(term => {
            term.both = false;
        })

        selectGroup();
        updateProgressBar();
    } else {
        console.error('Liste de révision non trouvée.');
    }
}

function initMeans() {
    console.log("initMeans()");
    mean1.innerHTML = revision.means[0] + `<input type="radio" name="test-mode" value="` + 0 + `" onclick="updateLangue('` + revision.means[0] + `')">`;
    mean2.innerHTML = revision.means[1] + `<input  type="radio" name="test-mode" value="` + 1 + `" onclick="updateLangue('` + revision.means[1] + `')">`;
    langue = document.querySelector('input[name="test-mode"]:checked').value;
}


function initCountTerme() {
    console.log("initCountTerme()");
    revision = listeRevision[indexFicheRevision];

    revision.terms.forEach(x => {
        x.diff = calculateDaysDifference(x.date)
    });

    correctCount = revision.terms.filter(term =>
        (langue == 'both' && (
            (term.status[0] >= 1 && term.status[0] > term.diff[0]) ||
            (term.status[1] >= 1 && term.status[1] > term.diff[0])
        )) ||
        (term.status[langue] >= 1 && term.status[langue] > term.diff[langue])

    ).length;

    correctCountDelay = revision.terms.filter(term =>
        (langue == 'both' && (
            (term.status[0] >= 1 && term.status[0] <= term.diff[0]) ||
            (term.status[1] >= 1 && term.status[1] <= term.diff[1])
        )) ||
        (term.status[langue] >= 1 && term.status[langue] <= term.diff[langue])
    ).length;

    unknownCount = revision.terms.filter(term =>
        (langue == 'both' && (
            (term.status[0] == null) ||
            (term.status[1] == null)
        )) ||
        (term.status[langue] == null)
    ).length;

    waitingCount = revision.terms.filter(term =>
        (langue == 'both' && (
            (term.status[0] == 0) ||
            (term.status[1] == 0)
        )) ||
        (term.status[langue] == 0)
    ).length;

    wrongCount = revision.terms.filter(term =>
        (langue == 'both' && (
            (term.status[0] == -1) ||
            (term.status[1] == -1)
        )) ||
        (term.status[langue] == -1)
    ).length;
}

//////////////////////////////////////////////////////////////////////////////////
////////////////////////////// Saisie + Paramètrage //////////////////////////////
// Gérer l'entrée de l'utilisateur lorsque "Entrée" est pressé
function enterInput(event) {
    if (event.key === 'Enter' && mode != 'modal') {
        event.preventDefault(); // Empêche le retour à la ligne
        checkDefinition();
    } else if (event.key >= '0' && event.key <= '9') {
        event.preventDefault();  // Empêche l'écriture du chiffre
    }

    autoResize(definitionInput)
}

document.addEventListener('keydown', function (event) {
    if (event.key === '1' && boxValidateManual.style.display == "flex") {
        validateInput();
    } else if (event.key === '2' && boxValidateManual.style.display == "flex") {
        midInput();
    } else if (event.key === '3' && boxValidateManual.style.display == "flex") {
        rejectInput();
    } else if (event.key === 'Enter' && mode == 'modal') {
        definitionInput.addEventListener('select', preventSelection);
        closeModal();
    }
});

// Fonction pour empêcher la sélection via souris
function preventSelection(event) {
    event.preventDefault();
}

/////////////// Mélange ///////////////
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function nextFibonacci(n) {
    console.log("nextFibonacci()")
    if (n <= 0) return 1;

    let a = 0, b = 1;

    while (b <= n) {
        let temp = b;
        b = a + b;
        a = temp;
    }
    return b;
}

function dropCountTerm(term) {
    console.log("dropCountTerm()")

    if (term.status[langueInstant] >= 1 && term.status[langueInstant] > term.diff[langueInstant]) {
        correctCount--;
    } if (term.status[langueInstant] >= 1 && term.status[langueInstant] <= term.diff[langueInstant]) {
        correctCountDelay--;
    } else if (term.status[langueInstant] == null) {
        unknownCount--;
    } else if (term.status[langueInstant] == 0) {
        waitingCount--;
    } else if (term.status[langueInstant] == -1) {
        wrongCount--;
    }
}

/////////////// Paramètre de test ///////////////
function updateGroupSize() {
    console.log("updateGroupSize()")
    const input = document.getElementById('group-size');
    groupSize = parseInt(input.value, 10) || 7;
    selectGroup();
}

function updateLangue() {
    console.log("updateLangue()")
    langue = document.querySelector('input[name="test-mode"]:checked').value;

    initTestFicheRevision();
}

/////////////// Validation manuel ///////////////
function validateInput() {
    console.log("validateInput()");

    const currentTerm = remainingTerms[currentTermIndex];

    dropCountTerm(currentTerm);
    currentTerm.status[langueInstant] = nextFibonacci(currentTerm.diff[langueInstant]);
    currentTerm.date[langueInstant] = today;
    correctCount++;
    currentTerm.diff[langueInstant] = 0;
    updateProgressBar();

    displayNextTerm();

}

function midInput() {
    console.log("midInput()");

    displayNextTerm();
}

function rejectInput(saisie = false) {
    console.log("rejectInput()");

    if (saisie) {
        const currentTerm = remainingTerms[currentTermIndex];

        dropCountTerm(currentTerm);
        currentTerm.status[langueInstant] = -1;
        wrongCount++;
        currentTerm.date[langueInstant] = today;
        currentTerm.diff[langueInstant] = 0;

        displayNextTerm();
    } else {
        mode = 'retry';

        definitionInput.value = '';

        const currentTerm = remainingTerms[currentTermIndex];
        const correctElement = (langueInstant == 0) ? currentTerm.term : currentTerm.definition;
        displayInterfaceIncorrect(correctElement);
    }

}

/////////////// Mis en place des groupes ///////////////
function selectGroup() {
    console.log("selectGroup()");

    correctDelayTerms = remainingTerms.filter(term =>
        (langue == 'both' && (
            (term.status[0] >= 1 && term.status[0] <= term.diff[0]) ||
            (term.status[1] >= 1 && term.status[1] <= term.diff[1])
        )) ||
        (term.status[langue] >= 1 && term.status[langue] <= term.diff[langue])
    );

    incorrectTermsOnly = remainingTerms.filter(term =>
        (langue == 'both' && (
            (term.status[0] == -1) ||
            (term.status[1] == -1)
        )) ||
        (term.status[langue] == -1)
    );

    waitingTerms = remainingTerms.filter(term =>
        (langue == 'both' && (
            (term.status[0] == 0) ||
            (term.status[1] == 0)
        )) ||
        (term.status[langue] == 0)
    );

    unknownTerms = remainingTerms.filter(term =>
        (langue == 'both' && (
            (term.status[0] == null) ||
            (term.status[1] == null)
        )) ||
        (term.status[langue] == null)
    );

    if (correctDelayTerms + incorrectTermsOnly + waitingTerms + unknownTerms == 0) {
        // Tous les termes sont appris
        correctElementDisplayText.innerHTML = 'Test terminé!<br/>Tous les termes sont appris.';
        correctElementDisplayText.style.color = 'black'

        termDisplay.value = '';
        termDisplay.disabled = true;

        definitionInput.value = '';
        //definitionInput.disabled = true;
        //definitionInput.classList.remove("saisieBordure");
        definitionInput.placeholder = '';

        boxValidateManual.style.display = 'none';

        autoResize(termDisplay);
        //saveToFile();
        return 0;
    }

    shuffleArray(incorrectTermsOnly);
    currentGroup = incorrectTermsOnly.slice(0, groupSize);

    // Ajoute les termes en attentes si il reste de la place
    if (currentGroup.length < groupSize) {
        const neededTerms = groupSize - currentGroup.length;
        shuffleArray(correctDelayTerms);
        currentGroup = currentGroup.concat(correctDelayTerms.slice(0, neededTerms));
    }

    // Ajoute les termes en attentes si il reste de la place
    if (currentGroup.length < groupSize) {
        const neededTerms = groupSize - currentGroup.length;
        shuffleArray(waitingTerms);
        currentGroup = currentGroup.concat(waitingTerms.slice(0, neededTerms));
    }

    // Ajoute les termes en inconnus si il reste de la place
    if (currentGroup.length < groupSize) {
        const neededTerms = groupSize - currentGroup.length;
        shuffleArray(unknownTerms);
        currentGroup = currentGroup.concat(unknownTerms.slice(0, neededTerms));
    }

    shuffleArray(currentGroup);
    termsTested = []
    termsTested.push(...currentGroup); // Ajoute les termes au groupe testé
    displayNextTerm();
}


///////////////////////////////////////////////////////////////////
////////////////////////////// Reset //////////////////////////////
// Réinitialiser les termes de révision
function resetTerms() {
    console.log("resetTerms()");

    let value = document.getElementById('reset-count').value;
    const revision = listeRevision[indexFicheRevision];

    if (revision) {
        revision.terms.forEach(term => {

            if (langue == 'both') {
                if (value == 'null') {
                    term.status = [null, null];
                    term.date = [null, null];
                } else {
                    term.status = [null, null];
                }
            } else {
                if (value == 'null') {
                    term.status[langueInstant] = null;
                    term.date[langueInstant] = null;
                } else {
                    term.status[langueInstant] = null;
                }
            }

        });
        console.log(`Tous les termes de la liste ont été réinitialisés.`);
        correctElementDisplayText.innerHTML = '';
        initTestFicheRevision()
    } else {
        console.error('Liste de révision non trouvée.');
    }

    correctCount = 0;
    correctCountDelay = 0;
    unknownCount = revision.terms.length;
    waitingCount = 0;
    wrongCount = 0;
}

function resetBtn() {
    console.log("resetBtn()");
    resetTerms();

    revision = listeRevision[indexFicheRevision];

    remainingTerms = revision.terms.filter(term =>
        (langue == 'both' && (
            !(term.status[0] >= 1 && term.status[0] > term.diff[0]) ||
            !(term.status[1] >= 1 && term.status[1] > term.diff[1])
        )) ||
        (!(term.status[langue] >= 1 && term.status[langue] > term.diff[langue]))
    );

    updateProgressBar();
    displayNextTerm();
}


///////////////////////////////////////////////////////////////////////
////////////////////////////// Affichage //////////////////////////////
function displayNextTerm() {
    console.log("displayNextTerm()");
    modalPile.innerHTML = ``;

    if (currentGroup.length > 0) {

        let numberIndex = Math.floor(Math.random() * currentGroup.length);
        let term = null;


        if (langue == 'both' && strongLearn) {
            console.log(strongLearn)
            if (
                (
                    currentGroup[numberIndex].status[0] >= 1
                    && currentGroup[numberIndex].status[0] > currentGroup[numberIndex].diff[0]
                ) ||
                (
                    currentGroup[numberIndex].status[1] >= 1
                    && currentGroup[numberIndex].status[1] > currentGroup[numberIndex].diff[1]
                )
            ) {
                term = currentGroup[numberIndex];
                currentGroup.splice(numberIndex, 1);
            } else {
                term = currentGroup[numberIndex];
            }
        } else {
            term = currentGroup[numberIndex];
            currentGroup.splice(numberIndex, 1);
        }


        currentTermIndex = remainingTerms.findIndex(t => t.id === term.id);

        // Si on se teste sur les deux termes
        if (langue == 'both') {

            // Incorrect term
            if (
                term.status[0] == -1 &&
                term.status[1] == -1
            ) {
                if (Math.random() > 0.5) {
                    langueInstant = 1;
                } else {
                    langueInstant = 0
                }

            } else if (term.status[0] == -1) {
                langueInstant = 0;

            } else if (term.status[1] == -1) {
                langueInstant = 1;


                // Correct delay terms
            } else if (
                !term.status[0] >= 1 && term.status[0] <= term.diff[0] &&
                term.status[1] >= 1 && term.status[1] <= term.diff[1]
            ) {
                if (Math.random() > 0.5) {
                    langueInstant = 1;
                } else {
                    langueInstant = 0
                }

            } else if (term.status[0] >= 1 && term.status[0] <= term.diff[0]) {
                langueInstant = 0;

            } else if (term.status[1] >= 1 && term.status[1] <= term.diff[1]) {
                langueInstant = 1;


                // Waiting term
            } else if (
                term.status[0] == 0 &&
                term.status[1] == 0
            ) {
                if (Math.random() > 0.5) {
                    langueInstant = 1;
                } else {
                    langueInstant = 0
                }

            } else if (term.status[0] == 0) {
                langueInstant = 0;

            } else if (term.status[1] == 0) {
                langueInstant = 1;


                // Unknown term
            } else if (
                term.status[0] == null &&
                term.status[1] == null
            ) {
                if (Math.random() > 0.5) {
                    langueInstant = 1;
                } else {
                    langueInstant = 0
                }

            } else if (term.status[0] == null) {
                langueInstant = 0;

            } else if (term.status[1] == null) {
                langueInstant = 1;
            }


        } else {
            langueInstant = langue;
        }

        // Affiche le terme ou la définition selon le mode
        mode = 'execute';

        displayNextTermInterface(term);
        modalPile.classList.remove('show');
    } else {
        showGroupSummary();
    }
}

function displayNextTermInterface(term) {
    console.log("displayNextTermInterface(term)");
    termDisplay.value = (langueInstant == 0) ? term.definition : term.term;
    autoResize(termDisplay);

    // remet les textarea a vide
    definitionInput.value = '';
    definitionInput.disabled = false;
    definitionInput.style.borderColor = '';

    // Fait disparaitre les bouton de validation manuel
    boxValidateManual.style.display = 'none';
    // Fait disparaitre la correction
    correctElementDisplayDiv.style.display = 'none';

    // si le terme est incorrect alors on le met en rouge
    termDisplay.style.color = term.status[langueInstant] === -1 ? '#FF5252' : (term.status[langueInstant] >= 1 && term.status[langueInstant] <= term.diff[langueInstant]) ? '#FF9800' : '';

    if (term.status[langueInstant] == null) {
        consigne.innerHTML = 'Réécrivez le texte'
        correctElementDisplayDiv.style.display = 'flex';
        correctElementDisplayText.innerHTML = (langueInstant == 0) ? term.term : term.definition;
        correctElementDisplayText.style.color = "#F57C00";
    } else {
        consigne.innerHTML = 'Écrivez la traduction en ' + revision.means[langueInstant].toLowerCase();
        correctElementDisplayDiv.style.display = 'none';
    }
}

function displayInterfaceCorrect(correctElement) {
    console.log("displayInterfaceCorrect()")
    definitionInput.style.borderColor = '#4CAF50 !important'; // Bordure verte si correcte

    // Fait apparaitre les bouton de validation manuel
    boxValidateManual.style.display = 'flex';
    // Fait apparaitre la correction
    correctElementDisplayDiv.style.display = 'flex';
    consigne.innerHTML = 'Appuyez sur Entree↵'

    // Comparer les réponses et surligner les différences
    const userResponse = definitionInput.value.trim();
    const highlighted = highlightDifferences(correctElement, userResponse, true);
    correctElementDisplayText.innerHTML = "Correction : " + highlighted;
    correctElementDisplayText.style.color = "#4CAF50";
}

function displayInterfaceIncorrect(correctElement) {
    console.log("displayInterfaceIncorrect()")
    definitionInput.style.borderColor = '#FF5252 !important'; // Bordure rouge si incorrecte

    // Afficher le bouton de validation
    boxValidateManual.style.display = 'flex';
    // Fait apparaitre les bouton de validation manuel
    correctElementDisplayDiv.style.display = 'flex';
    consigne.innerHTML = 'Réécrivez le mot correctement'

    // Comparer les réponses et surligner les différences
    const userResponse = definitionInput.value.trim();
    const highlighted = highlightDifferences(correctElement, userResponse, false);
    correctElementDisplayText.innerHTML = "Correction : " + highlighted;
    correctElementDisplayText.style.color = "black";
}

function highlightDifferences(correct, user, check) {
    console.log("highlightDifferences(correct, user, check)")
    let result = '';

    color = (check) ? 'black' : '#FF5252';

    // Parcourir les caractères des deux chaînes
    for (let i = 0; i < correct.length; i++) {
        const correctChar = correct[i];
        const userChar = user[i] || ''; // Si la chaîne de l'utilisateur est plus courte

        // Vérifier si le caractère correspond
        if (correctChar.toLowerCase() === userChar.toLowerCase()) {
            result += correctChar; // Ajouter le caractère correct
        } else {
            result += `<span style="color: ${color};">${correctChar || ''}</span>`; // Ajouter le caractère incorrect ou "_"
        }
    }

    return result;
}

function updateProgressBar() {
    console.log("updateProgressBar()")

    let totalTerms = listeRevision[indexFicheRevision].terms.length;
    if (langue == 'both')
        totalTerms *= 2;

    const correctPercentage = (correctCount / totalTerms) * 100;
    const correctPercentageDelay = (correctCountDelay / totalTerms) * 100;
    const wrongPercentage = (wrongCount / totalTerms) * 100;
    const waitingPercentage = (waitingCount / totalTerms) * 100;

    progressBarCorrect.style.width = `${correctPercentage}%`;
    progressBarCorrectDelay.style.width = `${correctPercentageDelay}%`;
    progressBarWrong.style.width = `${wrongPercentage}%`;
    progressBarWaiting.style.width = `${waitingPercentage}%`;

    nbCorrectDisplay.textContent = correctCount;
    nbCorrectDelayDisplay.textContent = correctCountDelay;
    nbIncorrectDisplay.textContent = wrongCount;
    nbAttenteDisplay.textContent = waitingCount;
    nbInconnuDisplay.textContent = unknownCount + "/" + totalTerms;
}

/////////////// Modal ///////////////
// Affichage du modal avec les résultats
function displayModal(userText, expectedDefinition, score) {
    console.log("displayModal()")
    let threshold = document.getElementById('threshold-count').value

    let color = (threshold <= score) ? '#4CAF50' : 'black'

    modalPile.classList.add('show');
    modalPile.innerHTML += `
        <div id="modal-result" class="modal">
            <p><strong>User :</strong> ${userText}</p>
            <p><strong>Expected :</strong> ${expectedDefinition}</p>
            <p style="color: ${color}"><strong>Score (${threshold}%) :</strong> ${score.toFixed(2)}</p>
        </div>
    `;
}

// Affiche les termes après test dans un modal
function showGroupSummary() {
    console.log("showGroupSummary()");
    mode = 'modal';

    let columHead = '';
    if (langue == 'both' || langue == 0) {
        columHead += `<th style="border: 1px solid #ddd; padding: 8px; background-color: var(--bleuClair); color: white;">Statut ${revision.means[0]}</th>`
    }
    if (langue == 'both' || langue == 1) {
        columHead += `<th style="border: 1px solid #ddd; padding: 8px; background-color: var(--bleuClair); color: white;">Statut ${revision.means[1]}</th>`
    }

    // Crée le contenu du tableau
    const modalContent = `
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; background-color: var(--bleuClair); color: white;">Terme</th>
                    <th style="border: 1px solid #ddd; padding: 8px; background-color: var(--bleuClair); color: white;">Définition</th>
                    ${columHead}
                </tr>
            </thead>
            <tbody>
            
            ${termsTested.map(term => {

        let columBody = '';
        let color = 'black';

        if (langue == 'both' || langue == 0) {

            color = 'black'; // Par défaut
            if (term.status[0] > 0) color = 'green'; // Si status > 0
            else if (term.status[0] < 0) color = 'red'; // Si status < 0

            columBody += `<td style="border: 1px solid #ddd; padding: 8px; color: ${color};"><strong>${term.status[0]}</strong></td>`

        }
        if (langue == 'both' || langue == 1) {

            color = 'black'; // Par défaut
            if (term.status[1] > 0) color = 'green'; // Si status > 0
            else if (term.status[1] < 0) color = 'red'; // Si status < 0

            columBody += `<td style="border: 1px solid #ddd; padding: 8px; color: ${color};"><strong>${term.status[1]}</strong></td>`
        }

        return `<tr>
                        <td style="border: 1px solid #ddd; padding: 8px;">${term.term}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${term.definition}</td>
                        ${columBody}
                    </tr>`;
    }).join('')}
            </tbody>
        </table>
    `;

    // Affiche le modal avec le contenu du tableau
    showModalGroup(modalContent);
}

// Fonction pour afficher le modal du groupe avec une overlay
function showModalGroup(content) {
    console.log("showModalGroup(content)");

    // Création de l'overlay
    const overlay = document.createElement('div');
    overlay.classList.add('modal-overlay');
    document.body.appendChild(overlay);

    // Création du modal
    const modalGroup = document.createElement('div');
    modalGroup.classList.add('modal-resume');
    modalGroup.innerHTML = `
        <div class="modal-content">
            <h2>Résumé du Groupe</h2>
            ${content}
            <div class="row jc-center mt-20 g-50">
                <button class="rouge-btn fs-16" onclick="closeModal()">Fermer</button>
            </div>
        </div>`;
    document.body.appendChild(modalGroup);

    setTimeout(() => {
        closeModalVal = true;
    }, 1000);
}

// Fonction pour fermer le modal et enlever l'overlay
function closeModal() {
    console.log("closeModal()");

    if (!closeModalVal)
        return false;

    const modalGroup = document.querySelector('.modal-resume');
    const overlay = document.querySelector('.modal-overlay');

    if (modalGroup && overlay) {
        modalGroup.classList.remove('show');

        modalGroup.remove();
        overlay.remove();
    }
    mode = 'execute';

    selectGroup();
}

///////////////////////////////////////////////////////////////////
////////////////////////////// Check //////////////////////////////
function checkDefinition() {
    console.log("checkDefinition()");

    if (mode == 'edit' || mode == 'modal' || mode == 'timeout') {
        if (mode == 'modal') {
            closeModal();
            definitionInput.addEventListener('select', preventSelection);
        }
        return 0;
    }

    // Si le terme est juste on redemande de resaisir entree ↵
    if (mode == 'wait') {
        validateInput();
        return 0;
    }

    const userElement = definitionInput.value.trim();
    const currentTerm = remainingTerms[currentTermIndex];

    if (currentTerm) {
        const correctElement = (langueInstant == 0) ? currentTerm.term : currentTerm.definition;

        // Si le terme n'a jamais était testé
        if (currentTerm.status[langueInstant] == null) {
            if (isSimilarEnough(userElement, removeParentheses(correctElement), 100)) {
                dropCountTerm(currentTerm);
                currentTerm.status[langueInstant] = 0;
                waitingCount++;
                updateProgressBar();
                mode = 'timeout'
                setTimeout(displayNextTerm, 1000);
            }
            return 0;
        }

        // Si c'est la première fois qu'on le teste
        if (mode == 'execute') {

            // Si la saisie est bonne
            let threshold = document.getElementById('threshold-count').value;
            if (isSimilarEnough(userElement, removeParentheses(correctElement), threshold)) {

                mode = 'wait';
                displayInterfaceCorrect(correctElement);

            } else {
                mode = 'retry';
                displayInterfaceIncorrect(correctElement);
            }

            // Si il a fait une erreur
        } else {
            if (isSimilarEnough(userElement, removeParentheses(correctElement), 100)) {
                rejectInput(true);
            }
        }
    } else {
        console.error('Element pas trouvé');
    }
}

// Fonction pour vérifier si la définition est suffisamment similaire
function isSimilarEnough(userElement, correctElement, threshold = 80) {
    // Si la définition correcte contient un "/", tester chaque variante séparément
    const definitions = correctElement.split('/').map(d => d.trim());

    // Calculer la ressemblance pour chaque variante et vérifier si l'une d'elles dépasse le seuil
    return definitions.some(def => similarityPercentage(userElement, def) >= threshold);
}

// Fonction pour calculer le pourcentage de ressemblance
function similarityPercentage(a, b) {
    const maxLength = Math.max(a.length, b.length);
    const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase());
    val = ((maxLength - distance) / maxLength) * 100
    displayModal(a, b, val)
    return val;
}

// Fonction pour calculer la distance de Levenshtein
function levenshteinDistance(a, b) {
    const matrix = Array.from(Array(a.length + 1), () => Array(b.length + 1).fill(0));

    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1, // suppression
                matrix[i][j - 1] + 1, // insertion
                matrix[i - 1][j - 1] + cost // substitution
            );
        }
    }
    return matrix[a.length][b.length];
}

function removeParentheses(str) {
    return str.replace(/\s*\(.*?\)|\*/g, '');
}

///////////////////////////////////////////////////////////////////

function editerTermDef() {
    console.log("editerTermDef()")

    const currentTerm = remainingTerms[currentTermIndex]
    const foundElement = listeRevision[indexFicheRevision].terms.find(term => term.id == currentTerm.id);

    if (mode != 'edit') {
        // Entrer en mode édition
        termDisplay.disabled = false;
        termDisplay.classList.add('editing-mode');
        definitionInput.classList.add('editing-mode');

        // Charger la définition actuelle dans le textarea de définition
        oldDefinition = definitionInput.value;
        if (langueInstant == 0) {
            definitionInput.value = foundElement ? foundElement.term : 'Error';
        } else {
            definitionInput.value = foundElement ? foundElement.definition : 'Error';
        }

        modeSav = mode;
        mode = 'edit';
    } else {
        // Quitter le mode édition et sauvegarder les modifications
        termDisplay.disabled = true;
        termDisplay.classList.remove('editing-mode');
        definitionInput.classList.remove('editing-mode');

        // Prendre les valeurs modifiées
        if (langueInstant == 0) {
            foundElement.definition = termDisplay.value.trim();
            foundElement.term = definitionInput.value.trim();
        } else {
            foundElement.definition = definitionInput.value.trim();
            foundElement.term = termDisplay.value.trim();
        }

        correctElementDisplayText.innerHTML = definitionInput.value.trim();
        definitionInput.value = oldDefinition;

        mode = modeSav;
    }

    autoResize(termDisplay);
    autoResize(definitionInput);
    console.log("editerTermDef()");
};


/////////////////


function displayMobile() {
    console.log("displayMobile()");

    //  
    if (affichageMobile.checked) {
        blocSaisie.classList.add("row-cols-1");
        blocSaisie.classList.remove("g-20");
        blocSaisie.classList.add("g-10");
        correctElementDisplayDiv.classList.remove("jc-center");
    } else {
        blocSaisie.classList.remove("row-cols-1");
        blocSaisie.classList.add("g-20");
        blocSaisie.classList.remove("g-10");
        correctElementDisplayDiv.classList.add("jc-center");
    }

    autoResize(termDisplay);
    autoResize(definitionInput);
}

function changeStrongLearn() {
    console.log("changeStrongLearn()");

    strongLearn = document.getElementById("strongLearn").checked;
}

function changeSaisieDisplay() {

    if (saisieMode == 'textarea') {

        blocSaisie.innerHTML = `
            <div class="card-container" onclick="this.classList.toggle('flipped')">
                <div class="card">
                    <div class="front">
                        <h2 id="term-display">Recto</h2>
                    </div>
                    <div class="back">
                        <h2 id="definition-input">Verso</h2>
                    </div>
                </div>
            </div>`;

        saisieMode = 'card';

    } else {

        blocSaisie.innerHTML = `
            <textarea id="term-display" class="auto-resize-textarea fs-24" rows="1" disabled></textarea>

            <span class="swap-icon fs-24">⇆</span>

            <div class="row jc-center">
                <div style="width: 100%; margin-right: 10px">
                    <p id="consigne" class="consigne">
                        &nbsp;</p>
                    <textarea rows="1" id="definition-input" class="auto-resize-textarea saisieBordure fs-24"
                        placeholder="Définition" onkeydown="enterInput(event)"></textarea>
                </div>
                <img src="logo/pen.png" class="button" onclick="editerTermDef()">
            </div>`;

        saisieMode = 'textarea';
    }

    const termDisplay = document.getElementById('term-display');
    const definitionInput = document.getElementById('definition-input');
    const consigne = document.getElementById('consigne');

    midInput();
}

