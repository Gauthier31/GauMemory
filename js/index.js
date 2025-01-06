////////////////////////////// index.html //////////////////////////////
// Fonction pour afficher la liste des révisions sur la page index.html
function initFicheRevisionList() {
    console.log("initFicheRevisionList()");
    const listeFicheRevisionDiv = document.getElementById('liste_fiche_revision');

    if (listeFicheRevisionDiv) {
        listeRevision.forEach(function (revision, index) {
            revision = listeRevision[index];

            revision.terms.forEach(x => {
                x.diff = calculateDaysDifference(x.date)
            });
            // Calculer le nombre de termes appris
            const learnedCount = revision.terms.filter(term =>
                (term.status[0] >= 1 && term.status[0] > term.diff[0]) ||
                (term.status[1] >= 1 && term.status[1] > term.diff[1])
            ).length;
            const totalCount = revision.terms.length;
            // Créer les éléments de la liste
            const listItem = document.createElement('li');
            const link = document.createElement('a');

            let color = (learnedCount == totalCount) ? '#4CAF50' : (learnedCount > 0) ? '#FF9800' : '';
            link.style.color = color;
            link.textContent = `${revision.title} - ${learnedCount} / ${totalCount}`; // Inclure le nombre appris
            link.href = 'fiche_revision.html?indexFicheRevision=' + index; // Utiliser l'index pour le lien
            listItem.appendChild(link);
            listeFicheRevisionDiv.appendChild(listItem);
        });
    } else {
        console.error('File list element not found');
    }
}
//////////////////////////////  //////////////////////////////