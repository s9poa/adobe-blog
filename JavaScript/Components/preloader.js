const MIN_DISPLAY_TIME = 1000;
const preloader = document.querySelector('.preloader');
const preloaderStartTime = Date.now();

document.body.style.overflow = 'hidden';

window.addEventListener('load', () => {
  const elapsed = Date.now() - preloaderStartTime;
  const remainingTime = Math.max(0, MIN_DISPLAY_TIME - elapsed);
  setTimeout(hidePreloader, remainingTime);
});

function hidePreloader() {
  if (!preloader) return;
  preloader.style.opacity = '0';
  setTimeout(() => {
    preloader.style.display = 'none';
    document.body.style.overflow = '';
  }, 500);
}
