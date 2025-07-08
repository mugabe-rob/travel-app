// Enhanced USSD Tourism Application
const express = require("express");
const Africastalking = require("africastalking");
const dotenv = require("dotenv");
const fs = require("fs").promises;
const path = require("path");

dotenv.config();

const router = express.Router();
const username = process.env.USERNAME;
const apiKey = process.env.API_KEY;

const africasTalking = Africastalking({
  apiKey: apiKey,
  username: username
});

const sms = africasTalking.SMS;

// Enhanced data structures
const userData = new Map(); // Store user sessions and preferences
const bookings = new Map(); // Store user bookings
const favorites = new Map(); // Store user favorites

// Tourism data structure
const tourismData = {
  kinyarwanda: {
    provinces: {
      "1": { name: "Amajyepfo", districts: ["Huye", "Kamonyi", "Nyamagabe", "Gisagara", "Nyanza"] },
      "2": { name: "Amajyaruguru", districts: ["Musanze", "Gicumbi", "Rulindo", "Gakenke", "Burera"] },
      "3": { name: "Iburengerazuba", districts: ["Karongi", "Nyamasheke", "Rubavu", "Ngororero", "Rutsiro"] },
      "4": { name: "Iburasirazuba", districts: ["Kayonza", "Kirehe", "Ngoma", "Gatsibo", "Nyagatare"] },
      "5": { name: "Umujyi wa Kigali", districts: ["Nyarugenge", "Kicukiro", "Gasabo"] }
    }
  },
  english: {
    provinces: {
      "1": { name: "Southern Province", districts: ["Huye", "Kamonyi", "Nyamagabe", "Gisagara", "Nyanza"] },
      "2": { name: "Northern Province", districts: ["Musanze", "Gicumbi", "Rulindo", "Gakenke", "Burera"] },
      "3": { name: "Western Province", districts: ["Karongi", "Nyamasheke", "Rubavu", "Ngororero", "Rutsiro"] },
      "4": { name: "Eastern Province", districts: ["Kayonza", "Kirehe", "Ngoma", "Gatsibo", "Nyagatare"] },
      "5": { name: "Kigali City", districts: ["Nyarugenge", "Kicukiro", "Gasabo"] }
    }
  }
};

// Enhanced tourist destinations with ratings and categories
const destinations = {
  "huye": {
    kinyarwanda: {
      "1": { name: "Ingoro y'Amazina y'Abanyarwanda", price: 10000, rating: 4.5, category: "museum" },
      "2": { name: "Ingoro ya Cyami", price: 8000, rating: 4.2, category: "historical" }
    },
    english: {
      "1": { name: "National Ethnographic Museum", price: 10000, rating: 4.5, category: "museum" },
      "2": { name: "King's Palace Museum", price: 8000, rating: 4.2, category: "historical" }
    }
  },
  "musanze": {
    kinyarwanda: {
      "1": { name: "Pariki y'Ibirunga", price: 15000, rating: 4.8, category: "nature" },
      "2": { name: "Ubuvumo bwa Musanze", price: 5000, rating: 4.0, category: "adventure" }
    },
    english: {
      "1": { name: "Volcanoes National Park", price: 15000, rating: 4.8, category: "nature" },
      "2": { name: "Musanze Caves", price: 5000, rating: 4.0, category: "adventure" }
    }
  }
};

// Utility functions
function initUserSession(phoneNumber) {
  if (!userData.has(phoneNumber)) {
    userData.set(phoneNumber, {
      language: null,
      currentPath: [],
      favorites: [],
      bookings: [],
      lastActivity: Date.now()
    });
  }
  return userData.get(phoneNumber);
}

function formatPrice(price) {
  return price === 0 ? "Ubuntu" : `${price.toLocaleString()} RWF`;
}

function getRatingStars(rating) {
  const stars = "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
  return `${stars} (${rating}/5)`;
}

// Enhanced menu builders
function buildMainMenu(language) {
  const menus = {
    kinyarwanda: `CON Murakaza neza kuri TemberaNawe!
🏛️ Hitamo ibyo ushaka:
1. Gusura ahantu
2. Ibyo nkunda
3. Ibyo nabonye
4. Ubufasha
5. Guhindura ururimi
0. Gusohoka`,
    english: `CON Welcome to TemberaNawe!
🏛️ Choose what you want:
1. Visit places
2. My favorites
3. My bookings
4. Help
5. Change language
0. Exit`
  };
  return menus[language] || menus.english;
}

function buildProvinceMenu(language) {
  const data = tourismData[language];
  let menu = language === 'kinyarwanda' ? 
    'CON Gusura Iyihe ntara?\n' : 
    'CON Province to Visit?\n';
  
  Object.entries(data.provinces).forEach(([key, province]) => {
    menu += `${key}. ${province.name}\n`;
  });
  menu += '0. Gusubira inyuma';
  return menu;
}

function buildDistrictMenu(language, provinceId) {
  const data = tourismData[language];
  const province = data.provinces[provinceId];
  
  let menu = language === 'kinyarwanda' ? 
    `CON Akahe Karere muri ${province.name}?\n` : 
    `CON Choose district in ${province.name}?\n`;
  
  province.districts.forEach((district, index) => {
    menu += `${index + 1}. ${district}\n`;
  });
  menu += '0. Gusubira inyuma';
  return menu;
}

function buildDestinationMenu(language, district) {
  const districtData = destinations[district.toLowerCase()];
  if (!districtData) return "CON Nta hantu haboneka / No places available\n0. Gusubira inyuma";
  
  const places = districtData[language];
  let menu = language === 'kinyarwanda' ? 
    `CON Aho gusura muri ${district}:\n` : 
    `CON Where to visit in ${district}:\n`;
  
  Object.entries(places).forEach(([key, place]) => {
    menu += `${key}. ${place.name}\n`;
    menu += `   💰 ${formatPrice(place.price)}\n`;
    menu += `   ${getRatingStars(place.rating)}\n`;
  });
  menu += '0. Gusubira inyuma';
  return menu;
}

function buildFavoritesMenu(user, language) {
  if (user.favorites.length === 0) {
    return language === 'kinyarwanda' ? 
      'CON Nta hantu ukunda haboneka\n0. Gusubira inyuma' :
      'CON No favorite places found\n0. Go back';
  }
  
  let menu = language === 'kinyarwanda' ? 
    'CON Ahantu ukunda:\n' : 
    'CON Your favorite places:\n';
  
  user.favorites.forEach((fav, index) => {
    menu += `${index + 1}. ${fav.name}\n`;
  });
  menu += '0. Gusubira inyuma';
  return menu;
}

function buildBookingsMenu(user, language) {
  if (user.bookings.length === 0) {
    return language === 'kinyarwanda' ? 
      'CON Nta hantu wateguye haboneka\n0. Gusubira inyuma' :
      'CON No bookings found\n0. Go back';
  }
  
  let menu = language === 'kinyarwanda' ? 
    'CON Ahantu wateguye:\n' : 
    'CON Your bookings:\n';
  
  user.bookings.forEach((booking, index) => {
    menu += `${index + 1}. ${booking.name} - ${booking.date}\n`;
  });
  menu += '0. Gusubira inyuma';
  return menu;
}

function buildHelpMenu(language) {
  return language === 'kinyarwanda' ? 
    `CON Ubufasha bwa TemberaNawe:
📞 Hamagara: +250 788 123 456
📧 Email: info@temberanawe.rw
🌐 Website: www.temberanawe.rw
⏰ Igihe: 24/7
0. Gusubira inyuma` :
    `CON TemberaNawe Help:
📞 Call: +250 788 123 456
📧 Email: info@temberanawe.rw
🌐 Website: www.temberanawe.rw
⏰ Hours: 24/7
0. Go back`;
}

function buildDetailMenu(language, place) {
  const actions = language === 'kinyarwanda' ? 
    ['Kubona amakuru', 'Kuyongera mu byo nkunda', 'Gutegura urugendo', 'Gusaba ubufasha'] :
    ['Get details', 'Add to favorites', 'Book visit', 'Get help'];
  
  let menu = language === 'kinyarwanda' ? 
    `CON ${place.name}\n💰 ${formatPrice(place.price)}\n${getRatingStars(place.rating)}\n\n` :
    `CON ${place.name}\n💰 ${formatPrice(place.price)}\n${getRatingStars(place.rating)}\n\n`;
  
  actions.forEach((action, index) => {
    menu += `${index + 1}. ${action}\n`;
  });
  menu += '0. Gusubira inyuma';
  return menu;
}

// Enhanced SMS sending with templates
function sendDetailsSMS(phoneNumber, place, language) {
  const message = language === 'kinyarwanda' ? 
    `Urakoze gusura ${place.name}! Dore amakuru y'ingenzi:
📅 Italiki: Nyakanga 20, 2024
💰 Igiciro: ${formatPrice(place.price)}
⭐ Amanota: ${getRatingStars(place.rating)}
🕘 Ifungura: 09:00 AM
🕔 Ifunga: 05:00 PM
📞 Hamagara: +250 788 123 456
Tuzishimira kubana namwe!` :
    `Thank you for visiting ${place.name}! Here are the details:
📅 Date: July 20, 2024
💰 Price: ${formatPrice(place.price)}
⭐ Rating: ${getRatingStars(place.rating)}
🕘 Opens: 09:00 AM
🕔 Closes: 05:00 PM
📞 Call: +250 788 123 456
We look forward to hosting you!`;
  
  return sms.send({
    to: phoneNumber,
    message: message
  });
}

function sendBookingConfirmationSMS(phoneNumber, place, language) {
  const bookingId = Math.random().toString(36).substr(2, 9).toUpperCase();
  const message = language === 'kinyarwanda' ? 
    `✅ Urugendo rwateguwe neza!
🎫 Nomero: ${bookingId}
📍 Ahantu: ${place.name}
📅 Italiki: Nyakanga 25, 2024
💰 Igiciro: ${formatPrice(place.price)}
📞 Hamagara: +250 788 123 456` :
    `✅ Booking confirmed!
🎫 Booking ID: ${bookingId}
📍 Place: ${place.name}
📅 Date: July 25, 2024
💰 Price: ${formatPrice(place.price)}
📞 Call: +250 788 123 456`;
  
  return sms.send({
    to: phoneNumber,
    message: message
  });
}

// Main USSD handler
router.post("/ussd", async (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;
  
  console.log('USSD Request:', { sessionId, serviceCode, phoneNumber, text });
  
  const user = initUserSession(phoneNumber);
  user.lastActivity = Date.now();
  
  let response = "";
  const textParts = text.split("*");
  
  try {
    // Language selection (first interaction)
    if (text === "") {
      response = `CON Welcome to TemberaNawe! 🏛️
Choose your language:
1. Kinyarwanda
2. English`;
    }
    // Set language and show main menu
    else if (text === "1" || text === "2") {
      user.language = text === "1" ? "kinyarwanda" : "english";
      response = buildMainMenu(user.language);
    }
    // Main menu navigation
    else if (textParts.length === 2) {
      const choice = textParts[1];
      
      switch (choice) {
        case "1": // Visit places
          response = buildProvinceMenu(user.language);
          break;
        case "2": // Favorites
          response = buildFavoritesMenu(user, user.language);
          break;
        case "3": // Bookings
          response = buildBookingsMenu(user, user.language);
          break;
        case "4": // Help
          response = buildHelpMenu(user.language);
          break;
        case "5": // Change language
          user.language = user.language === "kinyarwanda" ? "english" : "kinyarwanda";
          response = buildMainMenu(user.language);
          break;
        case "0": // Exit
          response = user.language === "kinyarwanda" ? 
            "END Murakoze gukoresha TemberaNawe!" :
            "END Thank you for using TemberaNawe!";
          break;
        default:
          response = buildMainMenu(user.language);
      }
    }
    // Province selection
    else if (textParts.length === 3 && textParts[1] === "1") {
      const provinceId = textParts[2];
      if (provinceId === "0") {
        response = buildMainMenu(user.language);
      } else {
        response = buildDistrictMenu(user.language, provinceId);
      }
    }
    // District selection
    else if (textParts.length === 4 && textParts[1] === "1") {
      const districtChoice = textParts[3];
      if (districtChoice === "0") {
        response = buildProvinceMenu(user.language);
      } else {
        // Get district name based on province and choice
        const provinceId = textParts[2];
        const province = tourismData[user.language].provinces[provinceId];
        const district = province.districts[parseInt(districtChoice) - 1];
        response = buildDestinationMenu(user.language, district);
      }
    }
    // Destination selection
    else if (textParts.length === 5 && textParts[1] === "1") {
      const destinationChoice = textParts[4];
      if (destinationChoice === "0") {
        const provinceId = textParts[2];
        response = buildDistrictMenu(user.language, provinceId);
      } else {
        // Get destination details
        const provinceId = textParts[2];
        const districtChoice = textParts[3];
        const province = tourismData[user.language].provinces[provinceId];
        const district = province.districts[parseInt(districtChoice) - 1];
        const destination = destinations[district.toLowerCase()];
        if (destination) {
          const place = destination[user.language][destinationChoice];
          response = buildDetailMenu(user.language, place);
        }
      }
    }
    // Destination actions
    else if (textParts.length === 6 && textParts[1] === "1") {
      const action = textParts[5];
      const provinceId = textParts[2];
      const districtChoice = textParts[3];
      const destinationChoice = textParts[4];
      
      const province = tourismData[user.language].provinces[provinceId];
      const district = province.districts[parseInt(districtChoice) - 1];
      const destination = destinations[district.toLowerCase()];
      const place = destination[user.language][destinationChoice];
      
      switch (action) {
        case "1": // Get details
          sendDetailsSMS(phoneNumber, place, user.language);
          response = user.language === "kinyarwanda" ? 
            "END Uraza kubona amakuru arambuye muri SMS." :
            "END You will receive detailed information via SMS.";
          break;
        case "2": // Add to favorites
          user.favorites.push(place);
          response = user.language === "kinyarwanda" ? 
            "END Byongerewe mu byo ukunda!" :
            "END Added to your favorites!";
          break;
        case "3": // Book visit
          user.bookings.push({...place, date: "July 25, 2024"});
          sendBookingConfirmationSMS(phoneNumber, place, user.language);
          response = user.language === "kinyarwanda" ? 
            "END Urugendo rwateguwe! Uraza kubona amakuru muri SMS." :
            "END Booking confirmed! You will receive details via SMS.";
          break;
        case "4": // Get help
          response = buildHelpMenu(user.language);
          break;
        case "0": // Go back
          response = buildDestinationMenu(user.language, district);
          break;
      }
    }
    // Handle going back from any menu
    else if (textParts[textParts.length - 1] === "0") {
      if (textParts.length === 3) {
        response = buildMainMenu(user.language);
      } else {
        response = buildMainMenu(user.language);
      }
    }
    // Default fallback
    else {
      response = buildMainMenu(user.language);
    }
    
  } catch (error) {
    console.error('USSD Error:', error);
    response = user.language === "kinyarwanda" ? 
      "END Habaye ikosa. Gerageza nanone." :
      "END An error occurred. Please try again.";
  }
  
  res.set("Content-Type", "text/plain");
  res.send(response);
});

// Cleanup inactive sessions (run periodically)
setInterval(() => {
  const now = Date.now();
  const timeout = 30 * 60 * 1000; // 30 minutes
  
  for (const [phoneNumber, user] of userData.entries()) {
    if (now - user.lastActivity > timeout) {
      userData.delete(phoneNumber);
    }
  }
}, 5 * 60 * 1000); // Run every 5 minutes

module.exports = router;