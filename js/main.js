document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});


window.addEventListener('scroll', function () {
  const navbar = document.querySelector('.navbar');
  const scrollPosition = window.scrollY;

  if (scrollPosition > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});


// Background Canvas
const canvas = document.getElementById("hero-bg");
const ctx = canvas.getContext("2d");

// Set canvas size to match the window dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Characters used in the effect
const characters = "01".split("");
const fontSize = 26;
const columns = Math.floor(canvas.width / fontSize);
const drops = Array(columns).fill(1);

// Function to draw the matrix rain effect
function drawMatrixRain() {
  // Draw a translucent background to create a fading effect
  ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Text color and font
  ctx.fillStyle = "#0F0";
  ctx.font = `${fontSize}px Vazir`;

  // Loop through each column and draw the characters
  drops.forEach((yPos, index) => {
    const text = characters[Math.floor(Math.random() * characters.length)];
    const xPos = index * fontSize;
    ctx.fillText(text, xPos, yPos * fontSize);

    if (yPos * fontSize > canvas.height && Math.random() > 0.975) {
      drops[index] = 0;
    }
    drops[index]++;
  });
}

// Run the function at a set interval to create the animation
setInterval(drawMatrixRain, 35);
