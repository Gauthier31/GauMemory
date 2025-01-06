function initListTexte() {
    console.log("initListTexte()")

    const listeTexteDiv = document.getElementById('liste_texte');

    if (listeTexteDiv) {
        listeTexte.forEach(function (revision, index) {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.textContent = revision[0];
            link.href = 'texte.html?indexTexte=' + index;
            listItem.appendChild(link);
            listeTexteDiv.appendChild(listItem);
        });
    } else {
        console.error('File list element not found');
    }
}
