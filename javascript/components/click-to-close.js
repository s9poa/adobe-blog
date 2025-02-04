// Click-to-Close Structure and Class Details:
// .ctc_container         - <div></div>
// .ctc_close             - <button></button> 

document.addEventListener('click', (event) => {
    if (event.target.closest('.ctc_close')) {
      const container = event.target.closest('.ctc_container');
      if (container) {
        container.remove();
      }
    }
  });
  
