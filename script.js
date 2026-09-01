// Otevření svatební pozvánky s plynulým přechodem na stránku.
function openEnvelope() {
    const overlay = document.getElementById('envelope-overlay');
    const card = document.querySelector('.invitation-card');

    if (!overlay || overlay.classList.contains('opened')) return;

    if (card) {
        card.style.transform = 'translateY(-18px) scale(1.035)';
        card.style.opacity = '0';
        card.style.transition = 'transform .65s ease, opacity .65s ease';
    }

    setTimeout(() => {
        overlay.classList.add('opened');
    }, 420);
}

// Odpočet do 8. května 2027 11:00
const targetDate = new Date("May 8, 2027 11:00:00").getTime();

function updateCountdownTimer() {
    const currentTime = new Date().getTime();
    const timeDifference = targetDate - currentTime;

    const daysEl = document.getElementById("days");
    if (!daysEl) return;

    if (timeDifference < 0) {
        document.getElementById("countdown").innerHTML = "<p>Dnes je náš svatební den! 🎉</p>";
        return;
    }

    const daysLeft = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hoursLeft = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const secondsLeft = Math.floor((timeDifference % (1000 * 60)) / 1000);

    document.getElementById("days").innerText = daysLeft.toString().padStart(2, '0');
    document.getElementById("hours").innerText = hoursLeft.toString().padStart(2, '0');
    document.getElementById("minutes").innerText = minutesLeft.toString().padStart(2, '0');
    document.getElementById("seconds").innerText = secondsLeft.toString().padStart(2, '0');
}

setInterval(updateCountdownTimer, 1000);
updateCountdownTimer();


// Kalendář je řešen přes skutečný .ics soubor, aby fungoval i v mobilních
// prohlížečích (iOS i Android). Odkaz je přímo v HTML.

// Přidávání dalších řádků hostů ve formuláři
let guestIndex = 1;

function addGuestRow() {
    guestIndex++;
    const guestContainer = document.getElementById("guests-container");
    if (!guestContainer) return;

    const newRow = document.createElement("div");
    newRow.className = "guest-row-grid";
    newRow.style.marginTop = "10px";
    newRow.innerHTML = `
        <div>
            <label class="mini-label">Jméno a příjmení</label>
            <input type="text" name="guest_name_${guestIndex}" placeholder="Jméno hosta" required>
        </div>
        <div>
            <label class="mini-label">Účast</label>
            <select name="guest_attending_${guestIndex}">
                <option value="Přijede">Přijede</option>
                <option value="Nepřijede">Nepřijede</option>
            </select>
        </div>
        <div>
            <label class="mini-label">Alergie / speciální strava</label>
            <input type="text" name="guest_diet_${guestIndex}" placeholder="např. bez lepku">
        </div>
        <div>
            <label class="mini-label">Pití</label>
            <select name="guest_drink_${guestIndex}">
                <option value="Pivo">Pivo</option>
                <option value="Víno">Víno</option>
                <option value="Prosecco">Prosecco</option>
                <option value="Nealko">Nealko</option>
            </select>
        </div>
        <div>
            <label class="mini-label">Ubytování</label>
            <select name="guest_sleep_${guestIndex}">
                <option value="Ano">Ano</option>
                <option value="Ne">Ne</option>
            </select>
        </div>
        <div>
            <label class="mini-label">Odvoz</label>
            <select name="guest_transport_${guestIndex}">
                <option value="Zůstávám">Zůstávám</option>
                <option value="Mám vlastní">Mám vlastní</option>
                <option value="Potřebuji zajistit">Potřebuji zajistit</option>
            </select>
        </div>
    `;
    guestContainer.appendChild(newRow);
}

// Odesílání dotazníku do Google Sheets přes Google Apps Script.
// Po nasazení Apps Scriptu vlož jeho URL níže.
const RSVP_SHEETS_URL = "https://script.google.com/macros/s/AKfycbzycz28Cio-h1AbdCnnzMlkFMLhSfbsQKrLdriXScnkkAUFWNVEj144SrM5QesgTCn1aQ/exec";
const rsvpForm = document.getElementById("wedding-rsvp-form");
const statusMessage = document.getElementById("form-status");

if (rsvpForm) {
    rsvpForm.action = RSVP_SHEETS_URL.startsWith("http") ? RSVP_SHEETS_URL : "#";

    rsvpForm.addEventListener("submit", function(e) {
        if (!RSVP_SHEETS_URL.startsWith("http")) {
            e.preventDefault();
            statusMessage.style.color = "#8b5e3c";
            statusMessage.innerText = "Dotazník ještě není připojený ke Google tabulce. V nastavení stránky je potřeba vložit URL Google Apps Scriptu.";
            return;
        }

        const rows = Array.from(document.querySelectorAll("#guests-container .guest-row-grid"));
        const guests = rows.map((row, index) => ({
            name: row.querySelector(`[name="guest_name_${index + 1}"]`)?.value.trim() || "",
            attending: row.querySelector(`[name="guest_attending_${index + 1}"]`)?.value || "",
            diet: row.querySelector(`[name="guest_diet_${index + 1}"]`)?.value.trim() || "",
            accommodation: row.querySelector(`[name="guest_sleep_${index + 1}"]`)?.value || "",
            transport: row.querySelector(`[name="guest_transport_${index + 1}"]`)?.value || "",
            drink: row.querySelector(`[name="guest_drink_${index + 1}"]`)?.value || ""
        }));

        document.getElementById("rsvp-payload").value = JSON.stringify({
            guests,
            note: document.querySelector('[name="poznamka"]')?.value.trim() || ""
        });

        statusMessage.style.color = "#113426";
        statusMessage.innerText = "Odesílám dotazník...";

        setTimeout(() => {
            statusMessage.style.color = "#113426";
            statusMessage.innerText = "Děkujeme! Váš dotazník byl úspěšně odeslán.";
            rsvpForm.reset();
        }, 900);
    });
}
