//----------------------------------------------------------------
// Gestion du toggle global
document.querySelectorAll('.boite').forEach(boite => {
  boite.addEventListener('click', function (e) {
    e.stopPropagation();
    this.classList.toggle('ouvert');
  });
});

//----------------------------------------------------------------
// Afficher uniquement la première image de chaque série dans les boites
document.querySelectorAll('.conteneur_images').forEach(conteneur => {
  const seenSeries = new Set();

  conteneur.querySelectorAll('.image').forEach(imageDiv => {
    const serieClass = Array.from(imageDiv.classList).find(c =>
      c.startsWith('image_')
    );

    if (!serieClass) return;

    if (seenSeries.has(serieClass)) {
      // Images suivantes de la série → cachées
      imageDiv.style.display = 'none';
    } else {
      // Première image de la série → visible
      seenSeries.add(serieClass);
      imageDiv.style.display = 'flex';
    }
  });
});

//----------------------------------------------------------------
// Gestion du "zoom"
const zoom = document.querySelector('.zoom');
const grandeImage = zoom.querySelector('.grande_image img');
const tout = document.querySelector('.tout');
const images = document.querySelectorAll('.conteneur_images .image img');

const btnPrev = zoom.querySelector('.bouton.precedent');
const btnNext = zoom.querySelector('.bouton.suivant');
const btnQuit = zoom.querySelector('.bouton.quitter');
const compteur = zoom.querySelector('.bouton.compteur p');

let currentIndex = 0;
const descriptions = document.querySelectorAll('.description');

// Fonction pour récupérer le numéro de l'image (image_1 → "1")
function getImageGroup(img) {
  const classes = Array.from(img.parentElement.classList);
  const imageClass = classes.find(c => c.startsWith('image_'));
  return imageClass ? imageClass.split('_')[1] : null;
}

// Fonction pour récupérer toutes les images d'un même groupe
function getImagesGroup(num) {
  return Array.from(images).filter(img => getImageGroup(img) === num);
}

// Récupération des **groupes existants** dans l'ordre du DOM
const imageGroups = Array.from(new Set(Array.from(images).map(img => getImageGroup(img))));

// Fonction pour mettre à jour le zoom (image + description + compteur)
function updateZoom() {
  const img = images[currentIndex];
  grandeImage.src = img.src;

  // Gestion de la description
  descriptions.forEach(desc => desc.style.display = 'none');
  const groupNum = getImageGroup(img);
  if (groupNum) {
    const descToShow = document.querySelector(`.description_${groupNum}`);
    if (descToShow) descToShow.style.display = 'block';
  }

  // Mise à jour du compteur local
  if (groupNum) {
    const groupImages = getImagesGroup(groupNum);
    const position = groupImages.indexOf(img) + 1;
    compteur.textContent = `${position} / ${groupImages.length}`;
  } else {
    compteur.textContent = '';
  }
}

// Fonction pour ouvrir le zoom sur une image spécifique
function openZoom(index) {
  currentIndex = index;
  zoom.style.display = 'flex';
  tout.style.display = 'none';
  updateZoom();
}

// Fonction pour fermer le zoom
function closeZoom() {
  zoom.style.display = 'none';
  tout.style.display = 'block';
}

// Fonction pour afficher l'image suivante dans la **logique des séries**
function nextImage() {
  const img = images[currentIndex];
  const groupNum = getImageGroup(img);
  const groupImages = getImagesGroup(groupNum);
  let pos = groupImages.indexOf(img);

  if (pos < groupImages.length - 1) {
    // Image suivante dans le même groupe
    currentIndex = Array.from(images).indexOf(groupImages[pos + 1]);
  } else {
    // Passer à la première image du groupe suivant
    let groupPos = imageGroups.indexOf(groupNum);
    groupPos = (groupPos + 1) % imageGroups.length; // boucle au premier groupe si nécessaire
    const nextGroupImages = getImagesGroup(imageGroups[groupPos]);
    currentIndex = Array.from(images).indexOf(nextGroupImages[0]);
  }
  updateZoom();
}

// Fonction pour afficher l'image précédente dans la **logique des séries**
function prevImage() {
  const img = images[currentIndex];
  const groupNum = getImageGroup(img);
  const groupImages = getImagesGroup(groupNum);
  let pos = groupImages.indexOf(img);

  if (pos > 0) {
    // Image précédente dans le même groupe
    currentIndex = Array.from(images).indexOf(groupImages[pos - 1]);
  } else {
    // Passer à la dernière image du groupe précédent
    let groupPos = imageGroups.indexOf(groupNum);
    groupPos = (groupPos - 1 + imageGroups.length) % imageGroups.length; // boucle au dernier groupe si nécessaire
    const prevGroupImages = getImagesGroup(imageGroups[groupPos]);
    currentIndex = Array.from(images).indexOf(prevGroupImages[prevGroupImages.length - 1]);
  }
  updateZoom();
}

// Ajout des événements sur les images
images.forEach((img, index) => {
  img.addEventListener('click', () => openZoom(index));
});

// Ajout des événements sur les boutons
btnNext.addEventListener('click', nextImage);
btnPrev.addEventListener('click', prevImage);
btnQuit.addEventListener('click', closeZoom);

// Navigation clavier
document.addEventListener('keydown', (e) => {
  if (zoom.style.display === 'flex') {
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'Escape') closeZoom();
  }
});


