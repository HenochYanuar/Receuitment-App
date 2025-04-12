const searchPopup = document.getElementById('search-popup');
const openSearch = document.getElementById('open-search');
const closeSearch = document.getElementById('close-search');

// Open pop-up
openSearch.addEventListener('click', (e) => {
  e.preventDefault(); // Prevent default link behavior
  searchPopup.style.display = 'flex';
});

// Close pop-up
closeSearch.addEventListener('click', () => {
  searchPopup.style.display = 'none';
});

// Close pop-up when clicking outside content
window.addEventListener('click', (event) => {
  if (event.target === searchPopup) {
    searchPopup.style.display = 'none';
  }
});