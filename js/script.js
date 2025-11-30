document.addEventListener('DOMContentLoaded', () => {
    console.log("Welcome to tensorlog.org!");

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Simple typing effect for the role
    const textElement = document.querySelector('.typing-effect');
    const text = "Machine Learning Engineer";
    let index = 0;
    
    // Clear initial text
    textElement.textContent = "";

    function type() {
        if (index < text.length) {
            textElement.textContent += text.charAt(index);
            index++;
            setTimeout(type, 100);
        }
    }

    // Start typing after a small delay
    setTimeout(type, 1000);
});
