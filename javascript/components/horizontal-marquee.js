document.addEventListener("DOMContentLoaded", function() {
    const marqueeInners = document.querySelectorAll('.marquee-inner');
  
    marqueeInners.forEach(marqueeInner => {
      if (!marqueeInner.dataset.duplicated) {
        marqueeInner.innerHTML += marqueeInner.innerHTML;
        marqueeInner.dataset.duplicated = "true";
      }
  
      let pos = 0;
      const speed = 1;
      let cycleWidth = updateCycleWidth(marqueeInner);
  
      window.addEventListener("resize", function() {
        pos = 0;
        marqueeInner.style.transform = `translateX(${pos}px)`;
        cycleWidth = updateCycleWidth(marqueeInner);
      });
  
      function animate() {
        pos -= speed;
        const effectivePos = pos % cycleWidth;
        marqueeInner.style.transform = `translateX(${effectivePos}px)`;
        requestAnimationFrame(animate);
      }
  
      animate();
    });
  
    function updateCycleWidth(marqueeInner) {
      marqueeInner.style.paddingRight = "0px";
      let originalWidth = marqueeInner.scrollWidth / 2;
      const container = marqueeInner.closest('.marquee');
      const containerWidth = container.offsetWidth;
      if (originalWidth < containerWidth) {
        marqueeInner.style.paddingRight = (containerWidth - originalWidth) + "px";
        originalWidth = marqueeInner.scrollWidth / 2;
      }
      return originalWidth;
    }
  });
  