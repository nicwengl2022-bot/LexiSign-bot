// Select the loading bar element
const loadingBar = document.querySelector('.loading-bar');

// Initialize width
let width = 0;

// Total duration in milliseconds (20 seconds)
const duration = 20000;

// Interval update time in milliseconds
const intervalTime = 50;

// Calculate how much the bar should increment each interval
const increment = (intervalTime / duration) * 100;

// Set up the interval to animate the loading bar
const interval = setInterval(() => {
  width += increment;
  
  // Cap the width at 100%
  if (width >= 100) {
    width = 100;
    clearInterval(interval);
    
    // Redirect to Sign In Page after loading completes
    window.location.href = '../single-login-frontend/index.html';
  }
  
  // Update the loading bar width
  loadingBar.style.width = width + '%';
}, intervalTime);
