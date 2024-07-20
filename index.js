const express = require("express");

const router = express.Router();

router.post("/ussd", (req, res) => {



  const { sessionId, serviceCode, phoneNumber, text } = req.body;

  console.log('information:', req.body);
  let response = "";

  if (text === "") {
    console.log(text);

    response = `CON Welcome to Trekvibe! Choose language:
        1. Kinyarwanda
        2. English `;
  } else if (text === "1") {

    response = `CON Gusura Iyihe ntara?
    1. Amajyepfo
    2. Amajyaruguru
    3. Iburengerazuba
    4. Iburasirazuba
    5. Umujyi wa Kigali`;
    // Kinyarwanda here!!!

  } else if (text === "2") {

    // Business logic for first level response, option 2
    // Start the response with END since it does not proceed further, (terminal request) it ENDs
    response = `CON Province to Visit?
    1. Southern Province
    2. Northern Province
    3. Western Province
    4. Eastern Province
    5. Kigali City`
    // English here!!!
  } else if (text === "1*1") {

    response = `CON Akahe Karere?
    1. Huye
    2. Kamonyi
    3. Nyamagabe
    4. Gisagara
    5. Nyanza`;
  } else if (text === "2*1") {
    response = `CON Choose the district?
    1. Huye
    2. Kamonyi
    3. Nyamagabe
    4. Gisagara
    5. Nyanza`;

  } else if (text === "1*1*1") {
    response = `CON Aho gusura muri HUYE
1. National Ethnographic of Rwanda
2. King's Palace Museum
`;
  } else if (text === "2*1*1") {
    response = `CON Where to visit in HUYE
1. National Ethnographic of Rwanda
2. King's Palace Museum
`;
  }
  else if (text === "1*2") {

    response = `CON Hitamo Aho uri?
    1. Burera
    2. Gakenke
    3. Gicumbi
    4. Musanze
    5. Rulindo`;
  } else if (text === "2*2") {

    response = `Choose your location?
    1. Burera
    2. Gakenke
    3. Gicumbi
    4. Musanze
    5. Rulindo`;
  } else if (text === "1*3") {

    response = `CON Hitamo Aho uri?
    1. Karongi
    2. Ngororero
    3. Nyabihu
    4. Nyamasheke
    5. Rubavu
    6. Rusizi
    7. Rutsiro`;
  } else if (text === "2*3") {

    response = `CON Choose your location?
    1. Karongi
    2. Ngororero
    3. Nyabihu
    4. Nyamasheke
    5. Rubavu
    6. Rusizi
    7. Rutsiro`;
  } else if (text === "1*4") {

    response = `CON Hitamo Aho uri?
    1. Bugesera
    2. Gatsibo
    3. Kayonza 
    4. Kirehe
    5. Ngoma
    6. Nyagatare
    7. Rwamagana`;
  } else if (text === "2*4") {

    response = `CON Choose your location?
    1. Bugesera
    2. Gatsibo
    3. Kayonza 
    4. Kirehe
    5. Ngoma
    6. Nyagatare
    7. Rwamagana`;
  } else if (text === "1*5") {

    response = `CON Hitamo Aho uri?
    1. Nyarugenge
    2. Kicukiro
    3. Gasabo`;
  } else if (text === "2*5") {

    response = `CON Choose your location?
    1. Nyarugenge
    2. Kicukiro
    3. Gasabo`;
  }

  res.set("Content-Type: text/plain");
  res.send(response);
});

module.exports = router;