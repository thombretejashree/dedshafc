document.addEventListener('DOMContentLoaded', () => {

    const sidebarToggle = document.getElementById('sidebar-toggle');
    const mainContent = document.getElementById('main-content');
    const pageTitle = document.getElementById('page-title');
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    const logoLink = document.querySelector('.logo-link');

    // --- Sidebar Collapse/Expand Logic ---
    sidebarToggle.addEventListener('click', () => {
        document.body.classList.toggle('sidebar-collapsed');
    });

    // --- Dynamic Page Loading (SPA Router) ---
    const loadContent = async (url) => {
        try {
            // Add a loading indicator (optional)
            mainContent.innerHTML = '<p style="text-align:center;">Loading...</p>';

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const pageHTML = await response.text();

            // Use DOMParser to avoid issues with scripts and styles
            const parser = new DOMParser();
            const doc = parser.parseFromString(pageHTML, 'text/html');
            
            // Get only the main content from the fetched page
            const newContent = doc.querySelector('main');
            if (newContent) {
                mainContent.innerHTML = newContent.innerHTML;
                
                // Find and execute any scripts within the loaded content
                const scripts = newContent.querySelectorAll('script');
                scripts.forEach(script => {
                    const newScript = document.createElement('script');
                    if (script.src) {
                        newScript.src = script.src;
                    } else {
                        newScript.innerHTML = script.innerHTML;
                    }
                    document.body.appendChild(newScript).parentNode.removeChild(newScript);
                });

            } else {
                mainContent.innerHTML = '<p style="text-align:center;color:red;">Error: Content not found.</p>';
            }

        } catch (error) {
            console.error('Failed to load page:', error);
            mainContent.innerHTML = `<p style="text-align:center;color:red;">Failed to load content. Please check the console.</p>`;
        }
    };
    
    const handleNavClick = (event, linkElement) => {
        event.preventDefault(); // Prevent default page navigation
        const url = linkElement.getAttribute('href');
        
        // Update active link style
        navLinks.forEach(link => link.classList.remove('active'));
        linkElement.classList.add('active');

        // Update page title
        const linkText = linkElement.querySelector('.link-text').textContent;
        pageTitle.textContent = linkText;

        // Load the new content
        loadContent(url);
        
        // Update URL in browser for history (optional but good practice)
        history.pushState(null, '', '?' + url.split('.')[0]);
    };
    
    // Attach event listeners to all navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => handleNavClick(event, link));
    });

    logoLink.addEventListener('click', (event) => handleNavClick(event, navLinks[0])); // Logo goes to home

    // Load initial content based on URL or default to home
    const initialPage = window.location.search.substring(1) + '.html' || 'home.html';
    const initialLink = document.querySelector(`.nav-link[href="${initialPage}"]`) || navLinks[0];
    initialLink.click();
});