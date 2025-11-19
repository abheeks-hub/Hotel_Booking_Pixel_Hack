// Data - local image paths (make sure these exist in ./assets/)
const hotels = [
  {
    id: 1,
    name: "Grand Plaza Hotel",
    location: "New York, USA",
    price: 299,
    rating: 4.8,
    features: ["WiFi", "Pool", "Spa", "Restaurant"],
    image: "./assets/hotel1.jpg",
  },
  {
    id: 2,
    name: "Ocean View Resort",
    location: "Miami, USA",
    price: 399,
    rating: 4.9,
    features: ["Beach", "WiFi", "Pool", "Bar"],
    image: "./assets/hotel2.jpg",
  },
  {
    id: 3,
    name: "Mountain Lodge",
    location: "Colorado, USA",
    price: 249,
    rating: 4.7,
    features: ["Fireplace", "Spa", "Restaurant"],
    image: "./assets/hotel3.jpg",
  },
  {
    id: 4,
    name: "City Center Inn",
    location: "Los Angeles, USA",
    price: 199,
    rating: 4.6,
    features: ["Gym", "Parking", "Restaurant"],
    image: "./assets/hotel4.jpg",
  },
  {
    id: 5,
    name: "Lakeside Retreat",
    location: "Seattle, USA",
    price: 279,
    rating: 4.8,
    features: ["Lake View", "WiFi", "Spa"],
    image: "./assets/hotel5.jpg",
  },
  {
    id: 6,
    name: "Desert Oasis",
    location: "Las Vegas, USA",
    price: 349,
    rating: 4.9,
    features: ["Casino", "Pool", "Nightclub"],
    image: "./assets/hotel6.jpg",
  },
];

// renderHotels — builds "why-card" style hotel cards with an image slot
function renderHotels(hotelsToRender) {
  const hotelsGrid = document.getElementById("hotelsGrid");
  if (!hotelsGrid) return;
  hotelsGrid.innerHTML = "";

  hotelsToRender.forEach((hotel) => {
    const art = document.createElement("article");
    art.className = "hotel-card";

    // image wrapper
    const imgWrap = document.createElement("div");
    imgWrap.className = "hotel-img-wrap";
    const img = document.createElement("img");
    img.className = "hotel-img";
    img.src = hotel.image || "./assets/placeholder.jpg";
    img.alt = hotel.name || "Hotel image";
    imgWrap.appendChild(img);

    // content
    const info = document.createElement("div");
    info.className = "hotel-info";

    const name = document.createElement("div");
    name.className = "hotel-name";
    name.textContent = hotel.name;

    const loc = document.createElement("div");
    loc.className = "hotel-location";
    loc.textContent = "📍 " + (hotel.location || "");

    const feats = document.createElement("div");
    feats.className = "hotel-features";
    if (Array.isArray(hotel.features)) {
      hotel.features.slice(0, 4).forEach((f) => {
        const s = document.createElement("span");
        s.className = "feature";
        s.textContent = f;
        feats.appendChild(s);
      });
    }

    const rating = document.createElement("div");
    rating.className = "hotel-rating";
    rating.textContent = "⭐ " + (hotel.rating ?? "--");

    const priceRow = document.createElement("div");
    priceRow.className = "hotel-price";
    const price = document.createElement("span");
    price.className = "price";
    price.innerHTML = `$${hotel.price}<small>/night</small>`;
    const btn = document.createElement("button");
    btn.className = "book-btn";
    btn.textContent = "Book Now";
    btn.addEventListener("click", () => openBookingModal(hotel.id));

    priceRow.appendChild(price);
    priceRow.appendChild(btn);

    // assemble
    info.appendChild(name);
    info.appendChild(loc);
    info.appendChild(feats);
    info.appendChild(rating);
    info.appendChild(priceRow);

    art.appendChild(imgWrap);
    art.appendChild(info);

    hotelsGrid.appendChild(art);
  });
}

// toggle mobile menu
// Replace existing toggleMenu with this
function toggleMenu() {
  const ham = document.querySelector(".hamburger");
  const nav = document.querySelector(".nav-links");
  if (!ham || !nav) return;
  ham.classList.toggle("active");
  nav.classList.toggle("open");
}

// also ensure direct click listener for accessibility (in case inline onclick removed)
// document.addEventListener("DOMContentLoaded", () => {
//   const ham = document.querySelector(".hamburger");
//   if (ham) ham.addEventListener("click", toggleMenu);
// });


// Booking modal and forms — defensive wiring
function initBooking() {
  const bookingModal = document.getElementById("bookingModal");
  const bookingForm = document.getElementById("bookingForm");
  const closeModalBtn = document.getElementById("closeModal");
  const modalHotelName = document.getElementById("modalHotelName");

  window.openBookingModal = function (hotelId) {
    const hotel = hotels.find((h) => h.id === hotelId);
    if (!hotel) return;
    if (modalHotelName) modalHotelName.textContent = hotel.name;
    if (bookingModal) {
      bookingModal.classList.add("active");
      bookingModal.setAttribute("aria-hidden", "false");
      // optional: prefill modal dates/names from search form (left out)
    }
  };

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
      if (bookingModal) {
        bookingModal.classList.remove("active");
        bookingModal.setAttribute("aria-hidden", "true");
      }
    });
  }

  if (bookingModal) {
    bookingModal.addEventListener("click", (e) => {
      if (e.target === bookingModal) {
        bookingModal.classList.remove("active");
        bookingModal.setAttribute("aria-hidden", "true");
      }
    });
  }

  if (bookingForm) {
    bookingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      alert(
        "Booking confirmed! You will receive a confirmation email shortly."
      );
      bookingForm.reset();
      if (bookingModal) {
        bookingModal.classList.remove("active");
        bookingModal.setAttribute("aria-hidden", "true");
      }
    });
  }
}

// Search / filter handler (defensive)
function initSearch() {
  const searchForm = document.getElementById("searchForm");
  if (!searchForm) return;
  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const destInput = document.getElementById("destination");
    const dest =
      destInput && destInput.value ? destInput.value.trim().toLowerCase() : "";
    const filtered = hotels.filter(
      (h) =>
        (h.location || "").toLowerCase().includes(dest) ||
        (h.name || "").toLowerCase().includes(dest)
    );
    if (filtered.length) {
      renderHotels(filtered);
      const hotelsSection = document.getElementById("hotels");
      if (hotelsSection) hotelsSection.scrollIntoView({ behavior: "smooth" });
    } else {
      alert("No hotels found for this destination. Showing all hotels.");
      renderHotels(hotels);
    }
  });
}

// utility: set min date for date inputs
function setMinDates() {
  const today = new Date().toISOString().split("T")[0];
  ["checkin", "checkout", "modal-checkin", "modal-checkout"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.setAttribute("min", today);
  });
}

// init on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  renderHotels(hotels);
  initSearch();
  initBooking();
  setMinDates();
});
// Close mobile menu when a nav link is clicked (improves UX)
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".nav-links a");
  const ham = document.querySelector(".hamburger");
  const nav = document.querySelector(".nav-links");
  if (navLinks && nav) {
    navLinks.forEach(a => a.addEventListener("click", () => {
      // close menu
      nav.classList.remove("open");
      if (ham) ham.classList.remove("active");
    }));
  }

  // Optional: close if user taps outside the panel (on the header area)
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target) && !ham.contains(e.target)) {
      if (nav.classList.contains("open")) {
        nav.classList.remove("open");
        ham.classList.remove("active");
      }
    }
  });
});
