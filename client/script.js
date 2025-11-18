// Sample hotel data
const hotels = [
  {
    id: 1,
    name: "Grand Plaza Hotel",
    location: "New York, USA",
    price: 299,
    rating: 4.8,
    features: ["WiFi", "Pool", "Spa", "Restaurant"],
    icon: "🏛️",
    image: "https://images.unsplash.com/photo-1600876069659-3e3d9446f06e"
  },
  {
    id: 2,
    name: "Ocean View Resort",
    location: "Miami, USA",
    price: 399,
    rating: 4.9,
    features: ["Beach", "WiFi", "Pool", "Bar"],
    icon: "🏖️",
    image: "https://unsplash.com/photos-QaRyLFXQKDc"
  },
  {
    id: 3,
    name: "Mountain Lodge",
    location: "Colorado, USA",
    price: 249,
    rating: 4.7,
    features: ["WiFi", "Fireplace", "Spa", "Restaurant"],
    icon: "⛰️",
    image: "https://unsplash.com/photos/KF9IS77n1TQ"
  },
  {
    id: 4,
    name: "City Center Inn",
    location: "Los Angeles, USA",
    price: 199,
    rating: 4.6,
    features: ["WiFi", "Gym", "Parking", "Restaurant"],
    icon: "🌆",
    image: "https://unsplash.com/photos/9jaJ6Kjt-KA"
  },
  {
    id: 5,
    name: "Lakeside Retreat",
    location: "Seattle, USA",
    price: 279,
    rating: 4.8,
    features: ["Lake View", "WiFi", "Spa", "Restaurant"],
    icon: "🌊",
    image: "https://unsplash.com/photos/JG1KWRXPjgo"
  },
  {
    id: 6,
    name: "Desert Oasis",
    location: "Las Vegas, USA",
    price: 349,
    rating: 4.9,
    features: ["Casino", "WiFi", "Pool", "Nightclub"],
    icon: "🏜️",
    image: "https://unsplash.com/photos/UzCG00U5Wqc"
  },
];

// Render hotels
function renderHotels(hotelsToRender) {
  const hotelsGrid = document.getElementById("hotelsGrid");
  hotelsGrid.innerHTML = "";

  hotelsToRender.forEach((hotel) => {
    const hotelCard = document.createElement("div");
    hotelCard.className = "hotel-card";
    hotelCard.innerHTML = `
            <div class="hotel-image">
  <img src="${hotel.image}" />
</div>
            <div class="hotel-info">
                <div class="hotel-name">${hotel.name}</div>
                <div class="hotel-location">📍 ${hotel.location}</div>
                <div class="hotel-features">
                    ${hotel.features
                      .map((f) => `<span class="feature">${f}</span>`)
                      .join("")}
                </div>
                <div class="hotel-rating">⭐ ${hotel.rating} / 5.0</div>
                <div class="hotel-price">
                    <span class="price">$${
                      hotel.price
                    }<small>/night</small></span>
                    <button class="book-btn" onclick="openBookingModal(${
                      hotel.id
                    })">Book Now</button>
                </div>
            </div>
        `;
    hotelsGrid.appendChild(hotelCard);
  });
}
function toggleMenu() {
  const ham = document.querySelector(".hamburger");
  const nav = document.querySelector(".nav-links");

  ham.classList.toggle("active");
  nav.classList.toggle("open");
}

// Initial render
renderHotels(hotels);

// Search form handler
document.getElementById("searchForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const destination = document
    .getElementById("destination")
    .value.toLowerCase();
  const filteredHotels = hotels.filter(
    (hotel) =>
      hotel.location.toLowerCase().includes(destination) ||
      hotel.name.toLowerCase().includes(destination)
  );

  if (filteredHotels.length > 0) {
    renderHotels(filteredHotels);
    document.getElementById("hotels").scrollIntoView({ behavior: "smooth" });
  } else {
    alert("No hotels found for this destination. Showing all hotels.");
    renderHotels(hotels);
  }
});

// Modal functions
function openBookingModal(hotelId) {
  const hotel = hotels.find((h) => h.id === hotelId);
  document.getElementById("modalHotelName").textContent = hotel.name;
  document.getElementById("bookingModal").classList.add("active");
}

document.getElementById("closeModal").addEventListener("click", function () {
  document.getElementById("bookingModal").classList.remove("active");
});

document.getElementById("bookingModal").addEventListener("click", function (e) {
  if (e.target === this) {
    this.classList.remove("active");
  }
});

// Booking form handler
document.getElementById("bookingForm").addEventListener("submit", function (e) {
  e.preventDefault();
  alert("Booking confirmed! You will receive a confirmation email shortly.");
  document.getElementById("bookingModal").classList.remove("active");
  this.reset();
});

// Set minimum date for date inputs
const today = new Date().toISOString().split("T")[0];
document.getElementById("checkin").setAttribute("min", today);
document.getElementById("checkout").setAttribute("min", today);
