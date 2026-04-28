// =============================================
// DROPDOWN — More Poems button on home.html
// =============================================
document.getElementById('more-poems-btn')?.addEventListener('click', function(event) {
    event.preventDefault();
    const dropdown = document.getElementById('poems-dropdown');
    dropdown.classList.toggle('show');
});

window.onclick = function(event) {
    if (!event.target.matches('.more-btn')) {
        const dropdowns = document.getElementsByClassName("dropdown-content");
        for (let i = 0; i < dropdowns.length; i++) {
            let openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

// =============================================
// HELPER — gets poem slug from filename
// =============================================
function getPoemSlug() {
    const page = window.location.pathname.split('/').pop();
    
    // Check if on home page (index.html, empty root, or no dashes)
    if (page === 'index.html' || page === '' || !page.includes('-')) {
        return 'home';
    }
    
    return page.replace('-fill.html', '').replace('-open.html', '');
}

// =============================================
// NAME SUBMISSION — any -fill.html
// =============================================
const submitBtn = document.getElementById('submit-name');
const nameInput = document.getElementById('name-input');

async function processSubmission() {
    if (!nameInput) return;

    if (nameInput.value.trim() !== "") {
        const name = nameInput.value.trim();
        const poem = getPoemSlug();

        // 1. Save name to browser memory
        localStorage.setItem('userName', name);

        // 2. Log visitor in Supabase
        if (typeof db !== 'undefined') {
            await db.from('poem_visitors').insert({ name: name, poem: poem });
        }

        // 3. Move to the poem page
        const currentPage = window.location.pathname.split('/').pop();
        window.location.href = currentPage.replace('-fill.html', '-open.html');

    } else {
        // Red border validation
        nameInput.style.border = '5px solid red';
        nameInput.placeholder = 'Please enter your name first!';
        nameInput.style.color = 'red';

        nameInput.addEventListener('input', function() {
            nameInput.style.border = '2px solid black';
            nameInput.placeholder = 'Enter your name here...';
            nameInput.style.color = '#777';
        }, { once: true });
    }
}

if (submitBtn) submitBtn.addEventListener('click', processSubmission);
if (nameInput) {
    nameInput.addEventListener('keypress', (e) => e.key === 'Enter' && processSubmission());
}

// =============================================
// VIEW COUNTER + NAME DISPLAY — any -open.html
// =============================================
async function initializePoemPage() {
    const poemSlug = getPoemSlug(); 

    // --- 1. DISPLAY THE NAME ---
    const storedName = localStorage.getItem('userName');
    const nameDisplayEl = document.getElementById('display-name') || document.querySelector('.user-name-display');
    
    if (nameDisplayEl) {
        nameDisplayEl.textContent = storedName || "Guest";
    }

    // --- 2. TRACK THE VIEW (Supabase) ---
    if (typeof db !== 'undefined') {
        const { data: current, error: fetchError } = await db
            .from('poem_views') 
            .select('views')
            .eq('poem', poemSlug)
            .single();

        if (!fetchError && current) {
            const { data: updated, error: updateError } = await db
                .from('poem_views')
                .update({ views: current.views + 1 })
                .eq('poem', poemSlug)
                .select()
                .single();

            if (!updateError && updated) {
                const viewEl = document.querySelector('.view-count');
                if (viewEl) {
                    // FORMATTING LOGIC START
                    let count = updated.views;
                    let formattedCount;

                    if (count >= 1000000) {
                        // For 1,000,000 and above (e.g., 1.2M)
                        formattedCount = (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
                    } else if (count >= 1000) {
                        // For 1,000 to 999,999 (e.g., 1.1k)
                        formattedCount = (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
                    } else {
                        // For anything under 1,000, just show the number
                        formattedCount = count;
                    }
                    // FORMATTING LOGIC END

                    // This part ensures both the home page and poem pages show correctly
                    if (viewEl) {
                        if (getPoemSlug() === 'home') {
                            // Find the specific span in index.html and only change the text
                            const countSpan = viewEl.querySelector('.view-count-text') || viewEl;
                            countSpan.textContent = formattedCount;
                        } else {
                            // Keep the icon injection for your poem pages like bbt and tssc
                            viewEl.innerHTML = `<i class="fa-solid fa-eye"></i> ${formattedCount}`;
                        }
                    }
                }
            }
        }
    }
}

// Only run view/name logic if we are on an "-open" page
if (window.location.pathname.includes('-open.html') || getPoemSlug() === 'home') {
    initializePoemPage();
}
