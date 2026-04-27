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
// =============================================
const submitBtn = document.getElementById('submit-name');
const nameInput = document.getElementById('name-input');

async function processSubmission() {
    if (!nameInput) return;

    if (nameInput.value.trim() !== "") {
        const name = nameInput.value.trim();
        const poem = getPoemSlug();

        localStorage.setItem('userName', name);

        if (typeof db !== 'undefined') {
            await db.from('poem_visitors').insert({ name: name, poem: poem });
        }

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
// VIEW COUNTER + NAME CHECK — any -open.html
// =============================================
async function trackView() {
    // Only run on -open pages
    if (!window.location.pathname.includes('-open')) return;

    // ✅ Check name — redirect back to -fill if missing
    const savedName = localStorage.getItem('userName');
    if (!savedName) {
        const currentPage = window.location.pathname.split('/').pop();
        window.location.href = currentPage.replace('-open.html', '-fill.html');
        return;
    }

    // ✅ Show the name on the page
    const nameEl = document.getElementById('display-name');
    if (nameEl) nameEl.textContent = savedName;

    // ✅ Update view count in Supabase
    if (typeof db === 'undefined') return;

    const poem = getPoemSlug();

    const { data: current, error: fetchError } = await db
        .from('poem_views')
        .select('views')
        .eq('poem', poem)
        .single();

    if (fetchError) { console.error('Fetch error:', fetchError); return; }

    const { data: updated, error: updateError } = await db
        .from('poem_views')
        .update({ views: current.views + 1 })
        .eq('poem', poem)
        .select('views')
        .single();

    if (updateError) { console.error('Update error:', updateError); return; }

    // ✅ Show the new count on the page
    const viewEl = document.querySelector('.view-count');
    if (viewEl) {
        viewEl.textContent = '👁 ' + updated.views;
    }
}

trackView();
