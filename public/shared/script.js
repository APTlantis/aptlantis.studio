// APTlantis shared JavaScript functionality
document.addEventListener('DOMContentLoaded', function () {
  console.log('APTlantis script.js loaded successfully');

  // Theme toggle functionality
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeToggleIcon = document.getElementById('theme-toggle-icon');

  if (themeToggleBtn && themeToggleIcon) {
    themeToggleBtn.addEventListener('click', function () {
      const isDarkMode = document.documentElement.getAttribute('data-bs-theme') === 'dark';
      document.documentElement.setAttribute('data-bs-theme', isDarkMode ? 'light' : 'dark');
      themeToggleIcon.textContent = isDarkMode ? '☀️' : '🌙';
      localStorage.setItem('theme', isDarkMode ? 'light' : 'dark');
    });

    // Set initial theme based on localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-bs-theme', savedTheme);
      themeToggleIcon.textContent = savedTheme === 'dark' ? '🌙' : '☀️';
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-bs-theme', 'dark');
      themeToggleIcon.textContent = '🌙';
    }
  }

  // Copy to clipboard functionality
  const copyButtons = document.querySelectorAll('.copy-button');
  copyButtons.forEach(button => {
    button.addEventListener('click', function () {
      const textToCopy = this.getAttribute('data-rsync');
      if (textToCopy) {
        navigator.clipboard
          .writeText(textToCopy)
          .then(() => {
            // Show success message
            const originalText = this.textContent;
            this.textContent = 'Copied!';
            setTimeout(() => {
              this.textContent = originalText;
            }, 2000);
          })
          .catch(err => {
            console.error('Failed to copy text: ', err);
          });
      }
    });
  });

  // Search functionality
  const searchForm = document.getElementById('search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', function (e) {
      const searchInput = document.getElementById('search-input');
      if (searchInput && searchInput.value.trim() === '') {
        e.preventDefault();
      }
    });
  }

  // Mobile navigation toggle
  const mobileNavToggle = document.getElementById('mobile-nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  if (mobileNavToggle && mainNav) {
    mobileNavToggle.addEventListener('click', function () {
      mainNav.classList.toggle('show');
    });
  }
});
