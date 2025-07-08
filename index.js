// index.js (final version for full-featured USSD app)
const express = require("express");
const Africastalking = require("africastalking");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const username = process.env.USERNAME;
const apiKey = process.env.API_KEY;
const africasTalking = Africastalking({ apiKey, username });
const sms = africasTalking.SMS;

const MENU = {
  "": `CON Welcome to TemberaNawe! Choose language:\n1. Kinyarwanda\n2. English`,
  "1": `CON Gusura Iyihe ntara?\n1. Amajyepfo\n2. Amajyaruguru\n3. Iburengerazuba\n4. Iburasirazuba\n5. Umujyi wa Kigali`,
  "2": `CON Province to Visit?\n1. Southern Province\n2. Northern Province\n3. Western Province\n4. Eastern Province\n5. Kigali City`,

  // Southern Province / Amajyepfo
  "1*1": `CON Akahe Karere?\n1. Huye\n2. Kamonyi\n3. Nyamagabe\n4. Gisagara\n5. Nyanza`,
  "1*1*1": `CON Aho gusura muri HUYE\n1. National Ethnographic of Rwanda\n2. King's Palace Museum`,
  "1*1*1*2": `END Murakoze gusura King's Palace Museum. Amakuru arambuye azoherezwa ubutaha.`,

  // English Southern Province
  "2*1": `CON Choose the district?\n1. Huye\n2. Kamonyi\n3. Nyamagabe\n4. Gisagara\n5. Nyanza`,
  "2*1*1": `CON Where to visit in HUYE\n1. National Ethnographic of Rwanda\n2. King's Palace Museum`,
  "2*1*1*2": `END Thanks for selecting King's Palace Museum. More info coming soon.`,

  // Northern Province / Amajyaruguru
  "1*2": `CON Akahe Karere?\n1. Musanze`,
  "1*2*1": `CON Aho gusura muri MUSANZE?\n1. Volcanoes National Park\n2. Musanze Caves`,
  "1*2*1*2": `END Murakoze gusura Musanze Caves. Amakuru arambuye azoherezwa ubutaha.`,

  "2*2": `CON Choose the district?\n1. Musanze`,
  "2*2*1": `CON Where to Visit in MUSANZE?\n1. Volcanoes National Park\n2. Musanze Caves`,
  "2*2*1*2": `END Thanks for choosing Musanze Caves. More info will be shared soon.`,

  // Add additional regions similarly...
};

const SMS_RESPONSES = {
  "1*1*1*1": `Urakoze gusura Ingoro y'Amazina y'Abanyarwanda!\n- Italiki: Nyakanga 20, 2024\n- Igiciro: 10,000 RWF\n- Ifungura: 09:00 AM\n- Gufunga: 05:00 PM\n- Hamagara: +250 788 123 456`,
  "2*1*1*1": `Thank you for visiting the National Ethnographic Museum!\n- Date: July 20, 2024\n- Price: 10,000 RWF\n- Opening: 09:00 AM\n- Closing: 05:00 PM\n- Call: +250 788 123 456`,
  "1*2*1*1": `Urakoze gusura IBIRUNGA!\n- Italiki: Nyakanga 20, 2024\n- Igiciro: 15,000 RWF\n- Isaha: 09:00 - 17:00\n- Hamagara: +250 788 123 456`,
  "2*2*1*1": `Thank you for visiting Volcanoes National Park!\n- Date: July 20, 2024\n- Price: 15,000 RWF\n- Hours: 09:00 AM - 05:00 PM\n- Contact: +250 788 123 456`
};

app.post("/ussd", async (req, res) => {
  const { phoneNumber, text } = req.body;
  console.log("USSD Input:", text);

  // If text matches SMS paths
  if (SMS_RESPONSES[text]) {
    try {
      await sms.send({ to: phoneNumber, message: SMS_RESPONSES[text] });
    } catch (err) {
      console.error("SMS sending failed:", err);
    }
    return res.send("END You will receive an SMS with more information.");
  }

  const response = MENU[text] || "END Invalid input. Please try again.";
  res.set("Content-Type", "text/plain");
  res.send(response);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`USSD app running on port ${PORT}`));
