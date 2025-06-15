const GOOGLE_CLIENT_ID = "980046540553-ehvs3d5hor4f6ndrge1q35dljb7ho0jl.apps.googleusercontent.com";

let isLoggedIn = false;
let userRole = null; // will be set by fetchCurrentUserRole()

// Fetch /api/user/me to populate userRole
async function fetchCurrentUserRole() {
  const token = localStorage.getItem("auth_token");
  if (!token) return;

  try {
    const resp = await fetch("/api/user/me", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!resp.ok) {
      console.warn("Could not fetch /api/user/me:", resp.status);
      return;
    }
    const data = await resp.json();
    userRole = data.role; // e.g. "admin" or "user"
    console.log("Current user role:", userRole);
  } catch (err) {
    console.error("Error fetching current user:", err);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    isLoggedIn = true;
    document.getElementById("loginButton").style.display = "none";
    document.getElementById("logoutButton").style.display = "inline-block";
  } else {
    isLoggedIn = false;
    document.getElementById("loginButton").style.display = "block";
    document.getElementById("logoutButton").style.display = "none";
  }

  // Fetch and set userRole before anything else
  await fetchCurrentUserRole();

  // Footer year
  document.getElementById('year').textContent = new Date().getFullYear();

  // Nav & content container
  const navLinks = document.querySelectorAll('nav ul li a');
  const content = document.getElementById('content');

  // Nav click handling
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      const page = link.dataset.page;

      // Restrict access to "docs" if not logged in
      if (page === 'docs' && !isLoggedIn) {
        alert('Please log in with your Google account to access queries to filter.');
        return;
      }

      switch (page) {
        case 'home':
          loadHome();
          break;
        case 'about':
          loadAbout();
          break;
        case 'docs':
          loadDocs();
          break;
        case 'showcase':
          loadComingSoon('API Showcase');
          break;
      }
    });
  });

  // --- Page Loaders ---

  function loadHome() {
    content.innerHTML = `
      <section class="info-section" id="home">
        <h2>Home</h2>
        <p>
          <strong>Astronomy Image Management System</strong><br>
          A production-ready, containerized solution for astronomical observatories to automatically ingest, process, and manage FITS (Flexible Image Transport System) image files with comprehensive metadata extraction and web-based querying capabilities.
        </p>
        <h3>System Architecture</h3>
        <p>Docker · Python · FastAPI · MySQL</p>
        <h3>Features</h3>
        <ul>
          <li><strong>Automatic FITS File Ingestion:</strong> Real-time detection and processing</li>
          <li><strong>Comprehensive Metadata Extraction:</strong> 40+ astronomical parameters from FITS headers</li>
          <li><strong>Duplicate Prevention:</strong> Robust handling prevents duplicate database entries</li>
          <li><strong>Web-based Query Interface:</strong> Sophisticated filtering system for astronomical data</li>
          <li><strong>Google OAuth Integration:</strong> Secure authentication system</li>
          <li><strong>OS-Agnostic Design:</strong> Works on Windows, Linux, macOS, and cloud platforms</li>
          <li><strong>Production-Ready:</strong> Multi-method file detection with automatic fallbacks</li>
        </ul>
      </section>
    `;
  }

  function loadAbout() {
    content.innerHTML = `
      <section class="info-section" id="about">
        <h2>About Us</h2>
        <p>
          Welcome to our API universe! We build tools that empower astronomical observatories with intelligent, automated image processing pipelines designed for the cosmos.
        </p>

        <h3>Mission Statement</h3>
        <p>
          Our mission is to bridge the gap between raw celestial data and meaningful discovery by delivering cutting-edge, production-ready software that automates and streamlines astronomical imaging workflows.
        </p>

        <h3>Background</h3>
        <p>
          Founded in 2025, <strong>Planet of APIs</strong> was born out of a collaboration between astronomers, data scientists, and software engineers. Recognizing the inefficiencies in handling FITS data across observatories, we set out to build a flexible, scalable, and secure system that fits both academic and industrial needs.
        </p>

        <h3>Why It Matters</h3>
        <p>
          With the growing volume of space-based data, automation isn't a luxury—it's a necessity. Our platform empowers observatories to spend less time managing data and more time exploring the universe.
        </p>

        <h3>Technologies We Love</h3>
        <ul>
          <li>Python & FastAPI for high-performance backend services</li>
          <li>Docker for cross-platform, containerized deployments</li>
          <li>MySQL for reliable metadata storage</li>
          <li>OAuth for secure user authentication</li>
          <li>Responsive, modern web interfaces for seamless user experiences</li>
        </ul>
      </section>
    `;
  }

  function loadComingSoon(title) {
    content.innerHTML = `
      <section class="info-section">
        <h2>${title}</h2>
        <p>This exciting feature is currently under development!</p>
        
        <h3>What's Coming:</h3>
        <ul>
          <li><strong>API Analytics Dashboard</strong> - Real-time usage statistics and performance metrics</li>
          <li><strong>Third-party Integrations</strong> - Connect with popular astronomy software</li>
          <li><strong>Mobile App</strong> - Access your data on the go</li>
          <li><strong>Machine Learning</strong> - Automated object detection and classification</li>
          <li><strong>Advanced Visualizations</strong> - Interactive charts and data exploration tools</li>
          <li><strong>API Marketplace</strong> - Discover and share astronomical data processing tools</li>
        </ul>
        
        <div style="background: rgba(0, 255, 255, 0.1); padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4>Have Ideas?</h4>
          <p>We'd love to hear your suggestions for new features! The astronomy community's input drives our development roadmap.</p>
        </div>
        
        <p>Stay tuned for updates and new feature announcements. In the meantime, explore the powerful query system available in the <strong>Query</strong> section!</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="font-size: 1.2em;"><em>"The universe is not only stranger than we imagine, it is stranger than we can imagine."</em></p>
          <p style="color: #aaa;">- J.B.S. Haldane</p>
        </div>
      </section>
    `;
  }

  function loadDocs() {
    content.innerHTML = `
      <style>
        body {
          margin: 0;
          overflow-x: hidden;
        }

        /* ★ VERTICAL SCROLLER STYLES ★ */
        .image-scroller {
          display: flex;
          flex-direction: column;      /* stack cards top→bottom */
          gap: 1rem;
          max-height: 600px;           /* adjust as needed */
          overflow-y: auto;            /* enable vertical scroll */
          overflow-x: hidden;
          padding-right: 0.5rem;       /* avoid scrollbar cutoff */
        }
        .image-scroller::-webkit-scrollbar {
          width: 6px;
        }
        .image-scroller::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.3);
          border-radius: 3px;
        }
        .image-card {
          flex: 0 0 auto;
          width: 100%;                 /* full width */
          padding: 12px;
          background: rgba(255,255,255,0.1);
          border-radius: 8px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        /* ★ end scroller ★ */

        /* ★ ADVANCED SEARCH DROPDOWN STYLES ★ */
        .advanced-search-container {
          position: relative;
          margin-bottom: 20px;
        }
        
        .search-input-container {
          display: flex;
          gap: 10px;
          align-items: center;
          background: #0f3460;
          padding: 10px;
          border-radius: 8px;
          box-shadow: 0 0 8px rgba(0, 255, 255, 0.2);
        }
        
        .main-search-input {
          flex: 1;
          padding: 8px 12px;
          background: #112d4e;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 16px;
        }
        
        .search-type-dropdown {
          padding: 8px 12px;
          background: #112d4e;
          color: #fff;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          min-width: 120px;
        }
        
        .advanced-toggle-btn {
          padding: 8px 16px;
          background: #4a5568;
          color: #fff;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
        }
        
        .advanced-toggle-btn:hover {
          background: #2d3748;
        }
        
        .advanced-toggle-btn.active {
          background: #00f7ff;
          color: #000;
        }
        
        .quick-search-btn {
          padding: 8px 16px;
          background: #00f7ff;
          color: #000;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
        }
        
        .advanced-dropdown {
          background: linear-gradient(180deg, #0f3460, #1a1a2e);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 255, 255, 0.3);
          z-index: 100;
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease, padding 0.3s ease;
          margin-top: 10px;
        }
        
        .advanced-dropdown.show {
          max-height: 500px;
          padding: 20px;
        }
        
        .advanced-search-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 15px;
        }
        
        .search-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        .search-field label {
          font-size: 14px;
          color: #00f7ff;
          font-weight: bold;
        }
        
        .search-field input, .search-field select {
          padding: 6px 10px;
          background: #112d4e;
          color: #fff;
          border: none;
          border-radius: 4px;
        }
        
        .preset-searches {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 15px;
        }
        
        .preset-btn {
          padding: 6px 12px;
          background: #4a5568;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.3s ease;
        }
        
        .preset-btn:hover {
          background: #00f7ff;
          color: #000;
        }

        @keyframes moveStars {
          from { transform: translate(0, 0); }
          to   { transform: translate(-500px, -500px); }
        }

        .sidebar-filter label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.95rem;
        }

        input, select {
          transition: all 0.3s ease;
        }

        input:focus {
          outline: none;
          background: #1b3b5f;
        }
        button:hover {
          opacity: 0.9;
        }
      </style>  

      <h1>Filter Query</h1>
      <div id="docsContent">
        <div id="lockedMessage" class="locked-info" style="display: none;">
          🔒 Filtering is locked. Please sign in with your Google account to access this feature.
        </div>
      </div>

      <div class="star-background"></div>

      <section class="info-section" id="docs"
              style="color: #fff;
                     background: radial-gradient(ellipse at top left, #1a1a2e, #0f1e3e);
                     min-height: 100vh;
                     padding: 20px;">
        <h2 style="text-align: center; font-size: 2rem; margin-bottom: 20px;">
          🪐 Filter Queries
        </h2>

        <div class="date-filter-container"
            style="text-align: center; margin-bottom: 30px;">
          <label for="Date" style="font-weight: bold;">Select Date:</label>
          <input type="date" name="Date" id="Date"
                style="padding: 6px;
                       border-radius: 6px;
                       border: none;
                       background: #0f3460;
                       color: #fff;" />
        </div>

        <div class="page-layout" style="display: flex; gap: 20px;">
          <aside class="sidebar-filter"
                style="width: 320px;
                       background: linear-gradient(180deg, #0f3460, #1a1a2e);
                       padding: 20px;
                       border-radius: 12px;
                       box-shadow: 0 0 12px rgba(0, 255, 255, 0.3);">
            <h3 style="text-align: center; color: #00f7ff;">🔭 Image Filters</h3>
            <form id="filterForm" class="filter-form"
                  style="display: flex;
                         flex-direction: column;
                         gap: 20px;">
              <div class="filter-group">
                <label style="font-weight: bold;">Temperature Range (°C):</label>
                <input type="number" name="minTemp" id="minTemp" placeholder="Min"
                       style="width: 100%; padding: 6px; background: #112d4e;
                              color: #fff; border: none; border-radius: 6px;" />
                <input type="number" name="maxTemp" id="maxTemp" placeholder="Max"
                       style="width: 100%; padding: 6px; background: #112d4e;
                              color: #fff; border: none; border-radius: 6px;" />
              </div>

              <div class="filter-group">
                <label style="font-weight: bold;">Minimum Quality (%):</label>
                <input type="number" name="minQuality" id="minQuality" placeholder="e.g. 75"
                       min="0" max="100"
                       style="width: 100%; padding: 6px; background: #112d4e;
                              color: #fff; border: none; border-radius: 6px;" />
              </div>

              <div class="filter-group">
                <label style="font-weight: bold;">Camera Name:</label>
                <input type="text" name="camera" id="camera" placeholder="e.g. Canon EOS R5"
                       style="width: 100%; padding: 6px; background: #112d4e;
                              color: #fff; border: none; border-radius: 6px;" />
              </div>

              <div class="filter-group">
                <label style="font-weight: bold;">Observatories:</label>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <label><input type="checkbox" name="telescope" value="Winer Observatory"> Winer Observatory</label>
                </div>
              </div>

              <div class="filter-group">
                <label style="font-weight: bold;">Time Range:</label>
                <label for="startTime">Start:</label>
                <input type="time" name="startTime" id="startTime"
                       style="width: 100%; padding: 6px; background: #112d4e;
                              color: #fff; border: none; border-radius: 6px;" />
                <label for="endTime">End:</label>
                <input type="time" name="endTime" id="endTime"
                       style="width: 100%; padding: 6px; background: #112d4e;
                              color: #fff; border: none; border-radius: 6px;" />
              </div>

              <!-- Advanced Button -->
              <button type="button" id="advancedToggle" class="advanced-toggle-btn">
                ⚙️ Advanced
              </button>

              <!-- Advanced Dropdown -->
              <div id="advancedDropdown" class="advanced-dropdown">
                <div class="advanced-search-grid">
                  <div class="search-field">
                    <label for="filterInput">Filter Type:</label>
                    <input type="text" id="filterInput" placeholder="Type to filter (e.g., R, Ha)" />
                    <div id="filterSuggestions" style="background: #112d4e; border-radius: 4px; margin-top: 4px;"></div>
                  </div>
                </div>
              </div>

              <div style="display: flex; gap: 10px;">
                <button type="button" id="applyBtn"
                        style="flex: 1; padding: 10px; background: #00f7ff;
                              color: #000; font-weight: bold; border: none;
                              border-radius: 8px; cursor: pointer; display: flex;
                              flex-direction: column; align-items: center; gap: 4px;">
                  <span style="font-size: 1.2em;">🚀</span>
                  <span>Apply</span>
                </button>
                <button type="button" id="clearBtn"
                        style="flex: 1; padding: 10px; background: #ff5555;
                              color: #fff; font-weight: bold; border: none;
                              border-radius: 8px; cursor: pointer; display: flex;
                              flex-direction: column; align-items: center; gap: 4px;">
                  <span style="font-size: 1.2em;">🧹</span>
                  <span>Clear</span>
                </button>
                <div class="tooltip">
                  <button type="button" id="downloadBtn"
                          style="flex: 1; padding: 10px; background: #4caf50;
                                 color: #fff; font-weight: bold; border: none;
                                 border-radius: 8px; cursor: pointer; display: flex;
                                 flex-direction: column; align-items: center; gap: 4px;">
                    <span style="font-size: 1.2em;">💾</span>
                    <span>Download</span>
                  </button>
                  <span class="tooltiptext" id="downloadTooltip">Admin Only</span>
                </div>
              </div>
            </form>
          </aside>

          <main class="image-results"
                style="flex: 1; background: rgba(255,255,255,0.05);
                      padding: 20px; border-radius: 12px;">
            <div class="image-scroller" id="filterResults"></div>
          </main>
        </div>
      </section>
    `;

    // Wait for DOM to be updated, then attach event listeners
    setTimeout(() => {
      const filterForm = document.getElementById('filterForm');
      const startInput = document.getElementById('startTime');
      const endInput = document.getElementById('endTime');
      const resultsContainer = document.getElementById('filterResults');
      const clearBtn = document.getElementById('clearBtn');
      const downloadBtn = document.getElementById('downloadBtn');
      const applyBtn = document.getElementById('applyBtn');
      const downloadTooltip = document.getElementById('downloadTooltip');

      // Advanced search elements
      const advancedToggle = document.getElementById('advancedToggle');
      const advancedDropdown = document.getElementById('advancedDropdown');
      const filterInput = document.getElementById('filterInput');
      const suggestionsBox = document.getElementById('filterSuggestions');

      let currentImages = [];

      // Update download button appearance based on userRole
      function updateDownloadButton() {
        if (!downloadBtn || !downloadTooltip) return;

        if (userRole === 'admin') {
          // Admin user – enable download, hide tooltip
          downloadBtn.innerHTML = '<span style="font-size: 1.2em;">💾</span><span>Download</span>';
          downloadBtn.disabled = false;
          downloadBtn.style.background = '#4caf50';
          downloadBtn.style.cursor = 'pointer';
          downloadTooltip.style.display = 'none';
        } else {
          // Non-admin user – lock icon + tooltip
          downloadBtn.innerHTML = '<span style="font-size: 1.2em;">🔒</span><span>Download</span>';
          downloadBtn.disabled = true;
          downloadBtn.style.background = '#666';
          downloadBtn.style.cursor = 'not-allowed';
          downloadTooltip.style.display = 'block';
        }
      }

      // Call it once right away
      updateDownloadButton();

      // ADVANCED SEARCH FUNCTIONALITY

      if (advancedToggle && advancedDropdown) {
        advancedToggle.addEventListener('click', () => {
          const isShowing = advancedDropdown.classList.contains('show');
          if (isShowing) {
            advancedDropdown.classList.remove('show');
            advancedToggle.textContent = '⚙️ Advanced';
            advancedToggle.classList.remove('active');
          } else {
            advancedDropdown.classList.add('show');
            advancedToggle.textContent = 'Hide Advanced';
            advancedToggle.classList.add('active');
          }
        });
      }

      if (filterInput && suggestionsBox) {
        const filters = ['R', 'G', 'B', 'Ha', 'OIII', 'SII'];
        filterInput.addEventListener('input', () => {
          const query = filterInput.value.toLowerCase();
          suggestionsBox.innerHTML = '';
          if (!query) return;
          const matches = filters.filter(f => f.toLowerCase().includes(query));
          matches.forEach(match => {
            const div = document.createElement('div');
            div.textContent = match;
            div.style.padding = '6px 10px';
            div.style.cursor = 'pointer';
            div.addEventListener('click', () => {
              filterInput.value = match;
              suggestionsBox.innerHTML = '';
            });
            suggestionsBox.appendChild(div);
          });
        });
      }

      function clearAllFilters() {
        if (filterForm) filterForm.reset();
        if (resultsContainer) resultsContainer.innerHTML = '';
        currentImages = [];
      }

      async function applyFilters(advancedParams = {}) {
        const date = document.getElementById('Date')?.value || '';
        const startTime = startInput?.value || '';
        const endTime = endInput?.value || '';
        const minTemp = document.getElementById('minTemp')?.value || '';
        const maxTemp = document.getElementById('maxTemp')?.value || '';
        const minQuality = document.getElementById('minQuality')?.value || '';
        const camera = document.getElementById('camera')?.value || '';

        const telescopeInputs = document.querySelectorAll('input[name="telescope"]:checked');
        let telescope = null;
        if (telescopeInputs.length > 0) {
          const selectedValues = [...telescopeInputs].map(i => i.value);
          if (!selectedValues.includes('All')) {
            telescope = selectedValues[0];
          }
        }

        const lockedMessage = document.getElementById("lockedMessage");
        if (!isLoggedIn) {
          if (lockedMessage) lockedMessage.style.display = "block";
          return;
        }

        const params = new URLSearchParams();
        if (date) params.set('date', date);
        if (startTime) params.set('start_time', startTime);
        if (endTime) params.set('end_time', endTime);
        if (minTemp) params.set('min_temp', minTemp);
        if (maxTemp) params.set('max_temp', maxTemp);
        if (minQuality) params.set('min_quality', minQuality);
        if (camera) params.set('camera', camera);
        if (telescope) params.set('telescope', telescope);

        if (resultsContainer) {
          resultsContainer.innerHTML = '<p>Loading…</p>';
          resultsContainer.scrollTop = 0;
        }

        try {
          const res = await fetch(`/api/images?${params}`);
          const images = await res.json();
          currentImages = images;
          if (!images.length) {
            if (resultsContainer) {
              resultsContainer.innerHTML = '<p>No images found matching your criteria.</p>';
            }
            return;
          }

          if (resultsContainer) {
            resultsContainer.innerHTML = '';
            images.forEach(img => {
              const card = document.createElement('div');
              card.className = 'image-card';
              card.innerHTML = `
                <h4>Image #${img.image_id}</h4>
                <p><strong>Date:</strong> ${new Date(img.date_time).toLocaleString()}</p>
                <p><strong>RA:</strong> ${img.ra_deg ?? 'n/a'}°, <strong>Dec:</strong> ${img.dec_deg ?? 'n/a'}°</p>
                <p><strong>Temp:</strong> ${img.temp ?? 'n/a'}°, <strong>Quality:</strong> ${img.quality_score ?? 'n/a'}%
                </p><strong>Quality Flag:</strong> ${img.quality_flag ?? 'n/a'}</p>
                <p><strong>Exposure:</strong> ${img.exptime ?? 'n/a'} s, <strong>Filter:</strong> ${img.filter_name ?? 'n/a'}</p>
              `;
              resultsContainer.appendChild(card);
            });
          }
        } catch (err) {
          console.error(err);
          if (resultsContainer) {
            resultsContainer.innerHTML = '<p style="color:#f55">Error fetching images.</p>';
          }
        }
      }

      if (applyBtn) {
        applyBtn.addEventListener('click', () => {
          console.log('Apply filters clicked');
          applyFilters();
        });
      } else {
        console.error('Apply button not found! Make sure the button has id="applyBtn"');
      }

      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          clearAllFilters();
        });
      }

      if (downloadBtn) {
        downloadBtn.addEventListener('click', async () => {
          // Only allow download for admin users
          if (userRole !== 'admin') {
            return; // Do nothing for non-admin users
          }

          console.log('Download button clicked!');
          console.log('Current images count:', currentImages.length);
          console.log('JSZip available:', typeof JSZip !== 'undefined');

          if (!currentImages.length) {
            alert('No images to download. Please apply filters first.');
            return;
          }

          if (typeof JSZip === 'undefined') {
            alert('Download feature requires JSZip library. Please reload the page.');
            return;
          }

          console.log('Starting download process...');

          try {
            downloadBtn.textContent = '⏳ Preparing...';
            downloadBtn.disabled = true;

            const zip = new JSZip();
            console.log('JSZip instance created');

            for (let i = 0; i < currentImages.length; i++) {
              const img = currentImages[i];
              console.log(`Processing image ${i + 1}/${currentImages.length}:`, img.image_id);

              try {
                const token = localStorage.getItem('auth_token');
                const response = await fetch(`/api/images/${img.image_id}/download`, {
                  headers: { 'Authorization': `Bearer ${token}` }
                });
                console.log(`Response for image ${img.image_id}:`, response.status, response.ok);

                if (!response.ok) {
                  console.warn(`Failed to download image ${img.image_id}: ${response.status}`);
                  continue;
                }

                const blob = await response.blob();
                console.log(`Blob size for image ${img.image_id}:`, blob.size);
                zip.file(`image_${img.image_id}.fits`, blob);
              } catch (err) {
                console.error(`Failed to fetch FITS file for image ${img.image_id}`, err);
              }
            }

            console.log('Generating ZIP file...');
            const content = await zip.generateAsync({ type: "blob" });
            console.log('ZIP file generated, size:', content.size);

            const url = URL.createObjectURL(content);
            const a = document.createElement("a");
            a.href = url;
            a.download = "filtered_images.zip";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log('Download triggered');

          } catch (error) {
            console.error('Download failed:', error);
            alert('Download failed: ' + error.message);
          } finally {
            downloadBtn.innerHTML = '<span style="font-size: 1.2em;">💾</span><span>Download</span>';
            downloadBtn.disabled = false;
            console.log('Download process completed');
          }
        });
      }

    }, 100); // Small delay to ensure DOM is updated
  }

  // ---- ROBUST GOOGLE AUTHENTICATION ----
  function initGoogleAuth() {
    // Wait for both Google library and DOM to be ready
    if (typeof google === 'undefined' || !google.accounts || !google.accounts.id) {
      console.log('Google library not ready, retrying...');
      setTimeout(initGoogleAuth, 300);
      return;
    }

    // Check if login button element exists
    const loginButton = document.getElementById("loginButton");
    if (!loginButton) {
      console.log('Login button element not found, retrying...');
      setTimeout(initGoogleAuth, 100);
      return;
    }

    try {
      // Initialize first
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: false
      });

      console.log('Google Auth initialized successfully');

      // Wait a bit before rendering button to ensure initialization is complete
      setTimeout(() => {
        // Only render sign-in button if not logged in and element exists
        if (!isLoggedIn && loginButton) {
          try {
            // Clear any existing content first
            loginButton.innerHTML = '';

            google.accounts.id.renderButton(
              loginButton,
              {
                theme: "outline",
                size: "small",
                type: "standard",
                text: "signin_with",
                shape: "rectangular"
              }
            );

            console.log('Google Sign-In button rendered successfully');
          } catch (renderError) {
            console.error('Error rendering Google Sign-In button:', renderError);
            // Fallback: create a simple login button
            loginButton.innerHTML = '<button onclick="manualGoogleSignIn()">Sign in with Google</button>';
          }
        }
      }, 200);

    } catch (error) {
      console.error('Error initializing Google Auth:', error);
      setTimeout(initGoogleAuth, 1000);
    }
  }

  // Add a manual sign-in fallback
  function manualGoogleSignIn() {
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
      google.accounts.id.prompt();
    } else {
      alert('Google Sign-In is not available. Please refresh the page.');
    }
  }

  document.getElementById("logoutButton").addEventListener("click", () => {
    google.accounts.id.disableAutoSelect();
    isLoggedIn = false;

    localStorage.removeItem('auth_token');

    document.getElementById("logoutButton").style.display = "none";

    const loginBtnContainer = document.getElementById("loginButton");
    loginBtnContainer.innerHTML = "";
    google.accounts.id.renderButton(
      loginBtnContainer,
      { theme: "outline", size: "small" }
    );
    loginBtnContainer.style.display = "block";

    // Optional UI changes — will be enforced again after reload
    const filterContainer = document.getElementById("filterContainer");
    if (filterContainer) filterContainer.style.display = "none";

    const authWarning = document.getElementById("authWarning");
    if (authWarning) authWarning.style.display = "block";

    // Force a full reload to reset the UI
    window.location.reload();
  });

  function handleCredentialResponse(response) {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    alert(`Signed in as ${payload.name}`);
    isLoggedIn = true;

    document.getElementById("loginButton").style.display = "none";
    document.getElementById("logoutButton").style.display = "inline-block";

    sendTokenToBackend(response.credential);
  }

  async function sendTokenToBackend(token) {
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      if (!response.ok) throw new Error('Authentication failed');

      const data = await response.json();
      localStorage.setItem('auth_token', data.access_token);
      // Refetch current user role now that token is saved
      await fetchCurrentUserRole();
    } catch (error) {
      console.error('Authentication error:', error);
    }
  }

  initGoogleAuth();
  loadHome();
});
