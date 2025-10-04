document.addEventListener('DOMContentLoaded', () => {

    const sidebarToggle = document.getElementById('sidebar-toggle');
    const mainContent = document.getElementById('main-content');
    const pageTitle = document.getElementById('page-title');
    const sidebarNav = document.querySelector('.sidebar-nav');
    const logoLink = document.querySelector('.logo-link');

    // --- Sidebar Collapse/Expand Logic ---
    sidebarToggle.addEventListener('click', () => {
        document.body.classList.toggle('sidebar-collapsed');
    });

    // --- Dynamic Page Loading (SPA Router) ---
    const loadContent = async (url) => {
        try {
            mainContent.innerHTML = '<p style="text-align:center;">Loading...</p>';

            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const pageHTML = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(pageHTML, 'text/html');
            const newContent = doc.querySelector('main');
            
            if (newContent) {
                mainContent.innerHTML = newContent.innerHTML;
                const scripts = doc.querySelectorAll('script');
                scripts.forEach(script => {
                    const newScript = document.createElement('script');
                    if (script.src) {
                        newScript.src = script.src;
                    } else {
                        newScript.textContent = script.textContent;
                    }
                    document.body.appendChild(newScript).parentNode.removeChild(newScript);
                });
            } else {
                mainContent.innerHTML = '<p style="text-align:center;color:red;">Error: Content not found.</p>';
            }
        } catch (error) {
            console.error('Failed to load page:', error);
            mainContent.innerHTML = `<p style="text-align:center;color:red;">Failed to load content.</p>`;
        }
    };
    
    // --- Universal Navigation Click Handler ---
    const handleNavClick = (event, linkElement) => {
        event.preventDefault();
        const url = linkElement.getAttribute('href');
        const title = linkElement.dataset.title;

        // Update page title in the header
        if (title) {
            pageTitle.textContent = title;
        }

        // Update active link style in the sidebar
        document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
            if (link.getAttribute('href') === url) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Load the new content
        loadContent(url);
        
        // Update browser URL
        history.pushState({ path: url }, '', '?' + url.split('.')[0]);
    };
    
    // Listen for clicks on sidebar links
    sidebarNav.addEventListener('click', (event) => {
        const linkElement = event.target.closest('a.nav-link');
        if (linkElement) {
            handleNavClick(event, linkElement);
        }
    });

    // Listen for clicks on links inside the main content (like homepage cards)
    mainContent.addEventListener('click', (event) => {
        const linkElement = event.target.closest('a.nav-link');
        if (linkElement) {
            handleNavClick(event, linkElement);
        }
    });

    logoLink.addEventListener('click', (event) => {
        // Find the home link in the sidebar and trigger a click on it
        const homeLink = document.querySelector('.sidebar-nav a[href="home.html"]');
        if (homeLink) {
            handleNavClick(event, homeLink);
        }
    });

    // Load initial content on page load
    const initialPage = window.location.search.substring(1) + '.html' || 'home.html';
    const initialLink = document.querySelector(`.nav-link[href="${initialPage}"]`) || document.querySelector('.nav-link[href="home.html"]');
    if (initialLink) {
        // Use a synthetic event to avoid issues
        handleNavClick(new MouseEvent('click'), initialLink);
    }
});
