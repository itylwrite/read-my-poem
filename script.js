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
// e.g. "tssc-fill.html" → "tssc"
//      "bbt-open.html"  → "bbt"
// =============================================
function getPoemSlug() {
    const page = window.location.pathname.split('/').pop();
    return page.replace('-fill.html', '').replace('-open.html', '');
}

// =============================================
// NAME SUBMISSION — any -fill.html
// Saves name + poem to Supabase, then redirects
// =============================================
const submitBtn = document.getElementById('submit-name');
const nameInput = document.getElementById('name-input');

async function processSubmission() {
    if (!nameInput) return;

    if (nameInput.value.trim() !== "") {
        const name = nameInput.value.trim();
        const poem = getPoemSlug();

        // Save to localStorage for the greeting
        localStorage.setItem('userName', name);

        // ✅ Save visitor name + which poem to Supabase
        if (typeof db !== 'undefined') {
            await db.from('poem_visitors').insert({ name: name, poem: poem });
        }

        // ✅ Auto-detects which -open.html to go to
        // e.g. tssc-fill.html → tssc-open.html
        //      bbt-fill.html  → bbt-open.html
        // No changes needed here when adding new poems!
        const currentPage = window.location.pathname.split('/').pop();
        window.location.href = currentPage.replace('-fill.html', '-open.html');

    } else {
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

if (submitBtn) {
    submitBtn.addEventListener('click', processSubmission);
}

if (nameInput) {
    nameInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            processSubmission();
        }
    });
}

// =============================================
// VIEW COUNTER — runs on any -open.html
// Adds +1 to Supabase every time page is opened
// Shows the real count on the page
// =============================================
async function trackView() {
    if (!window.location.pathname.includes('-open')) return;
    if (typeof db === 'undefined') return;

    const poem = getPoemSlug();

    // ✅ Step 1: Get current view count
    const { data: current, error: fetchError } = await db
        .from('poem_stats')
        .select('view_count')
        .eq('poem_id', poem)
        .single();

    if (fetchError) {
        console.error('Fetch error:', fetchError);
        return;
    }

    // ✅ Step 2: Update with +1
    const { data: updated, error: updateError } = await db
        .from('poem_stats')
        .update({ view_count: current.view_count + 1 })
        .eq('poem_id', poem)
        .select('view_count')
        .single();

    if (updateError) {
        console.error('Update error:', updateError);
        return;
    }

    // ✅ Step 3: Show the new count on the page
    const viewEl = document.querySelector('.view-count');
    if (viewEl) {
        viewEl.textContent = '👁 ' + updated.view_count;
    }
}

// Run automatically when page loads
trackView();
