const termDefinitionRow = document.getElementById('term-definition-row');

const urlParams = new URLSearchParams(window.location.search);
const indexFicheRevision = urlParams.get('indexFicheRevision'); // Récupérer la liste sélectionnée dans l'URL

let revision = null;

// Fonction pour charger les termes et définitions d'une révision sélectionnée
function initFicheRevisionPage() {
    console.log("initFicheRevisionPage()");

    if (listeRevision && Array.isArray(listeRevision)) {
        revision = listeRevision[indexFicheRevision]; // Trouver la révision correspondante

        if (revision) {

            initMeans();

            const titleInput = document.getElementById('revision-title');
            titleInput.value = revision.title; // Afficher le titre de la révision

            const termDefinitionPairs = revision.terms; // Accéder au tableau des paires terme/définition

            // Boucle à travers les termes et définitions
            termDefinitionPairs.forEach(function (termData) {
                if (termData) {
                    const { term, definition, status, id, date } = termData;
                    lineTermeDef(term, definition, status, id, date);
                }
            });
        } else {
            for (let i = 0; i < 5; i++) {
                // Créer un nouvel identifiant unique pour cette paire terme/définition
                const newid = Date.now() + Math.random().toString(36).substr(2, 5); // Génère un identifiant unique
                lineTermeDef(null, null, null, newid, null);
            }
        }
    } else {
        console.error('listeRevision Nulle');
    }

    document.querySelectorAll('.auto-resize-textarea').forEach(autoResize);
}

function initMeans() {
    console.log("initMeans()");

    const means1 = document.getElementById('means-1');
    const means2 = document.getElementById('means-2');

    means1.value = revision.means[0];
    means2.value = revision.means[1];

    // Ajuste automatiquement la taille des textareas
    autoResize(means1);
    autoResize(means2);
}

// Fonction pour ajouter une nouvelle ligne (terme et définition) dans fiche_revision.html
function addTermDefinitionPair() {
    console.log("addTermDefinitionPair()");
    const lineCount = document.getElementById('line-count').value; // Récupère la valeur de l'input (nombre de lignes)

    const count = parseInt(lineCount, 10);

    if (!isNaN(count) && count > 0) {
        for (let i = 0; i < count; i++) {
            const newid = Date.now() + Math.random().toString(36).substr(2, 5);
            lineTermeDef(null, null, null, newid, null);
        }
    } else {
        alert('Veuillez entrer un nombre valide.');
    }
}

function initializeTestButton() {
    console.log("initializeTestButton()");

    const title = document.getElementById('revision-title').value;

    if (title) {
        window.location.href = `fiche_revision_test.html?indexFicheRevision=` + indexFicheRevision;
    } else {
        alert('Veuillez entrer un titre de révision avant de commencer le test.');
    }
}

function lineTermeDef(terme, definition, status, id, date) {
    console.log("lineTermeDef(terme, definition, status, id)");

    const safeId = encodeURIComponent(id);

    // Création du conteneur principal
    const newTermDefinitionPair = document.createElement('div');
    newTermDefinitionPair.classList.add('term-definition-pair', 'row', 'jc-space-between', 'g-20', 'mb-20');
    newTermDefinitionPair.setAttribute('data-id', safeId);

    // Création du bouton de suppression
    const deleteButton = document.createElement('div');
    deleteButton.textContent = '✖';
    deleteButton.classList.add('cross-btn', 'btnFit');
    deleteButton.setAttribute('data-id', safeId);
    deleteButton.onclick = () => deleteTermDefinitionById(safeId);

    // Création de la première zone de texte (terme)
    const termTextarea = document.createElement('textarea');
    termTextarea.rows = 1;
    termTextarea.classList.add('auto-resize-textarea', 'saisieBordure', 'fs-16');
    termTextarea.placeholder = 'Terme';
    termTextarea.value = terme != null ? terme : '';
    termTextarea.oninput = () => autoResize(termTextarea);

    // Création de l'élément de séparation (flèche)
    const swapIcon = document.createElement('span');
    swapIcon.textContent = '⇆';

    // Création de la deuxième zone de texte (définition)
    const definitionTextarea = document.createElement('textarea');
    definitionTextarea.rows = 1;
    definitionTextarea.classList.add('auto-resize-textarea', 'saisieBordure', 'fs-16');
    definitionTextarea.placeholder = 'Définition';
    definitionTextarea.value = definition != null ? definition : '';
    definitionTextarea.oninput = () => autoResize(definitionTextarea);

    // Création du cercle de statut
    const statusCircle = document.createElement('div');
    statusCircle.classList.add('status-circle', 'fs-12');
    let roundColor = "";
    if (date != null) {
        diff = calculateDaysDifference(date)
        roundColor = (status >= 1 && status > diff) ? '#4CAF50' : (status >= 1) ? "#FF9800" : (status <= -1) ? "#FF5252" : ''
        statusCircle.innerHTML = diff + '/' + status;
    } else {
        roundColor = "#F0F0F0";
    }
    statusCircle.style.backgroundColor = roundColor;

    // Assemblage des éléments dans le conteneur principal
    newTermDefinitionPair.appendChild(deleteButton);
    newTermDefinitionPair.appendChild(termTextarea);
    newTermDefinitionPair.appendChild(swapIcon);
    newTermDefinitionPair.appendChild(definitionTextarea);
    newTermDefinitionPair.appendChild(statusCircle);

    // Ajout du conteneur principal à la ligne des termes/définitions
    termDefinitionRow.appendChild(newTermDefinitionPair);
}


// Fonction pour afficher/masquer le textarea
function toggleTextarea() {
    console.log("toggleTextarea()");
    const textareaInput = document.getElementById('textarea-input');
    textareaInput.style.display = textareaInput.style.display === 'none' ? 'block' : 'none';
}


// Fonction pour ajouter un terme et une définition
function addTermDefinition(term, definition, id = null) {
    console.log("addTermDefinition()", term, definition)
    term = term.trim();
    definition = definition.trim();

    if (term != '' && definition != '') {
        const existingIndex = revision.terms.findIndex(item => item.id === id);
        if (existingIndex !== -1) {
            revision.terms[existingIndex].term = term;
            revision.terms[existingIndex].definition = definition;
        } else {
            const id = Date.now() + Math.random().toString(36).substr(2, 5);
            revision.terms.push({ term, definition, status: [null, null], date: [null, null], id });
        }
    }
}


function saveToFileRevision() {
    console.log("saveToFileRevision()");
    const title = document.getElementById('revision-title').value.trim();
    const bulkInput = document.getElementById('textarea-input').value.trim();

    const means1 = document.getElementById('means-1').value.trim();
    const means2 = document.getElementById('means-2').value.trim();

    if (revision == null) {
        if (!title) {
            alert("Veuillez entrer un titre pour la fiche de révision.");
            return;
        }
        if (!means1 || !means2) {
            alert("Veuillez entrer les langues pour la fiche de révision.");
            return;
        }
        revision = { title: title, means: [], terms: [] };
        listeRevision.push(revision);
    }

    // Ajouter les langues dans "means"
    if (!revision.means.includes(means1) && means1) {
        revision.means.push(means1);
    }
    if (!revision.means.includes(means2) && means2) {
        revision.means.push(means2);
    }

    // Ajouter les termes/définitions depuis les paires affichées
    const termDefinitionPairs = document.querySelectorAll('#term-definition-row .term-definition-pair');
    termDefinitionPairs.forEach(pair => {
        const termTextarea = pair.querySelector('textarea[placeholder="Terme"]');
        const definitionTextarea = pair.querySelector('textarea[placeholder="Définition"]');
        const term = termTextarea ? termTextarea.value.trim() : '';
        const definition = definitionTextarea ? definitionTextarea.value.trim() : '';
        const id = pair.getAttribute('data-id');

        addTermDefinition(term, definition, id);
    });

    // Ajouter les termes/définitions depuis le textarea caché
    if (bulkInput) {
        const cleanedInput = bulkInput.replace(/\bAD\b/g, '');
        const termDefinitionPairs = cleanedInput.split(/\n{2,}/);

        termDefinitionPairs.forEach(pair => {
            const [term, definition] = pair.split(/\n/).map(line => line.trim());
            addTermDefinition(term, definition);
        });
    }

    // Sauvegarder les données
    saveToFile();
}


function deleteTermDefinitionById(id) {
    console.log("deleteTermDefinitionById(id)");

    const termDefinitionPairs = listeRevision[indexFicheRevision].terms;

    const indexToRemove = termDefinitionPairs.findIndex(item => item.id === id);

    if (indexToRemove !== -1) {
        termDefinitionPairs.splice(indexToRemove, 1);
    }

    const elementToRemove = document.querySelector(`.term-definition-pair[data-id="${id}"]`);
    if (elementToRemove) {
        elementToRemove.remove();
    }
}

function filterTerms() {
    const searchText = document.getElementById('search-input').value.trim().toLowerCase();
    const termDefinitionPairs = document.querySelectorAll('#term-definition-row .term-definition-pair');

    termDefinitionPairs.forEach(pair => {
        const termTextarea = pair.querySelector('textarea[placeholder="Terme"]');
        const definitionTextarea = pair.querySelector('textarea[placeholder="Définition"]');

        const termText = termTextarea ? termTextarea.value.trim().toLowerCase() : '';
        const definitionText = definitionTextarea ? definitionTextarea.value.trim().toLowerCase() : '';

        // Vérifie si le texte saisi est présent dans le terme ou la définition
        if (termText.includes(searchText) || definitionText.includes(searchText)) {
            pair.style.display = 'flex'; // Affiche la paire
        } else {
            pair.style.display = 'none'; // Cache la paire
        }
    });
}
