function initListAudio() {
    console.log("initListAudio()")

    const listeAudioDiv = document.getElementById('liste_audio');

    if (listeAudioDiv) {
        listeAudio.forEach(function (revision, index) {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.textContent = revision[0];
            link.href = 'audio.html?indexAudio=' + index;
            listItem.appendChild(link);
            listeAudioDiv.appendChild(listItem);
        });
    } else {
        console.error('File list element not found');
    }
}
