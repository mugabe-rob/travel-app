// index.js
const express = require("express");
const Africastalking = require("africastalking");
const dotenv = require("dotenv");
dotenv.config();

const router = express.Router();
const username = process.env.USERNAME;
const apiKey = process.env.API_KEY;

const africasTalking = Africastalking({
  apiKey: apiKey,
  username: username
});

const sms = africasTalking.SMS;

router.post("/ussd", (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;

  console.log('information:', req.body);
  let response = "";

  if (text === "") {
    console.log(text);
    response = `CON Welcome to TemberaNawe! Choose language:
        1. Kinyarwanda
        2. English `;
  } else if (text === "1") {
    response = `CON Gusura Iyihe ntara?
    1. Amajyepfo
    2. Amajyaruguru
    3. Iburengerazuba
    4. Iburasirazuba
    5. Umujyi wa Kigali`;
  } else if (text === "2") {
    response = `CON Province to Visit?
    1. Southern Province
    2. Northern Province
    3. Western Province
    4. Eastern Province
    5. Kigali City`;
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
    2. King's Palace Museum`;
  } else if (text === "1*1*1*1") {
    sms.send({
      to: phoneNumber,
      message: `Urakoze gusura Ingoro y'Amazina y'Abanyarwanda! Dore uko amakuru y'ingenzi y'ibikorwa byacu:
      - Italiki: Nyakanga 20, 2024
      - Igiciro: 10,000 RWF
      - Isaha yo Gufungura: 09:00 AM
      - Isaha yo Gufunga: 05:00 AM
      - Uramutse ugize ikibazo wahamagara: +250 788 123 456
      Tuzishimira Kubana namwe!`
    }).then((response) => {
      console.log(response);
    }).catch((error) => {
      console.error(error);
    });
    response = "Uraza kubona ubutumwa buguha amakuru arambuye muri SMS.";
    // kinyarwanda
  } else if (text === "2*1*1") {
    response = `CON Where to visit in HUYE
    1. National Ethnographic of Rwanda
    2. King's Palace Museum`;
  }else if (text === "2*1*1*1") {
    sms.send({
      to: phoneNumber,
      message: `Thank you for visiting the National Ethnographic of Rwanda ! Here are the main details of our activities:
      - Date: July 20, 2024
      - Price: 10,000 RWF
      - Opening Hours: 09:00 AM
      - Closing Time: 05:00 AM
      - If you have a problem, call: +250 788 123 456
      We will be happy to be with you`
    }).then((response) => {
      console.log(response);
    }).catch((error) => {
      console.error(error);
    });
    response = "END You will receive details about National Ethnographic of Rwanda via SMS.";
    // english
  } else if (text === "1*2") {
    response = `CON Akahe Karere?
    1. Musanze`;
  } else if (text === "2*2") {
    response = `CON Choose the district?
    1. Musanze`;
  } else if (text === "1*2*1") {
    response = `CON Aho gusura muri MUSANZE?
    1. Volcanoes National Park
    2. Musanze Caves`;
  }else if (text === "1*2*1*1") {
    sms.send({
      to: phoneNumber,
      message: `Urakoze gusura IBIRUNGA! Dore uko amakuru y'ingenzi ugomba Kumenya:
      - Italiki: Nyakanga 20, 2024
      - Igiciro: 15,000 RWF
      - Isaha yo Gusura: 09:00 AM
      - Isaha yo Gufunga: 05:00 AM
      - Uramutse ugize ikibazo wahamagara: +250 788 123 456
      Tuzishimira Kubana namwe!`
    }).then((response) => {
      console.log(response);
    }).catch((error) => {
      console.error(error);
    });
    response = "Uraza kubona ubutumwa buguha amakuru arambuye muri SMS.";
    // kinyarwanda
  } else if (text === "2*2*1") {
    response = `CON Where to Visit in MUSANZE?
    1. Volcanoes National Park
    2. Musanze Caves`;
  }else if (text === "2*2*1*1") {
    sms.send({
      to: phoneNumber,
      message: `Thank you for visiting Volcanoes National Park ! Here are the main details you must know:
      - Date: July 20, 2024
      - Price: 15,000 RWF
      - Opening Hours: 09:00 AM
      - Closing Time: 05:00 AM
      - If you have a problem, call: +250 788 123 456
      We will be happy to be with you`
    }).then((response) => {
      console.log(response);
    }).catch((error) => {
      console.error(error);
    });
    response = "END You will receive details about National Volcanoes Park of Rwanda via SMS.";
    // english
  } else if (text === "1*3") {
    response = `CON Hitamo Akarere?
    1. Karongi
    2. Nyamasheke
    3. Nyamagabe`;
  } else if (text === "2*3") {
    response = `CON Choose the District?
    1. Karongi
    2. Nyamasheke
    3. Nyamagabe`;
  } else if (text === "1*3*1") {
    response = `CON Aho gusura muri Karongi?
    1. Amashyuza ya Karongi
    2. Kivu Belt
    3. Bises`;
  } else if (text === "1*3*1*1") {
    sms.send({
      to: phoneNumber,
      message: `Urakoze gusura amashyuza ya Karongi ! Dore uko amakuru y'ingenzi ugomba Kumenya:
      - Italiki: Nyakanga 20, 2024
      - Igiciro: Ubuntu
      - Isaha yo Gufungura: 09:00 AM
      - Isaha yo Gufunga: 05:00 AM
      - Uramutse ugize ikibazo wahamagara: +250 788 123 456
      Tuzishimira Kubana namwe!`
    }).then((response) => {
      console.log(response);
    }).catch((error) => {
      console.error(error);
    });
    response = "Uraza kubona ubutumwa buguha amakuru arambuye muri SMS.";
    // kinyarwanda
  } else if (text === "2*3*1") {
    response = `CON Where to Visit in Karongi?
    1. Karongi Hot Springs
    2. Kivu Belt
    3. Bises`;
  }else if (text === "2*3*1*1") {
    sms.send({
      to: phoneNumber,
      message: `Thank you for visiting Karongi Hot Springs ! Here are the main details you must know:
      - Date: July 20, 2024
      - Price: Free
      - Opening Hours: 09:00 AM
      - Closing Time: 05:00 AM
      - If you have a problem, call: +250 788 123 456
      We will be happy to be with you`
    }).then((response) => {
      console.log(response);
    }).catch((error) => {
      console.error(error);
    });
    response = "END You will receive details about Karongi Hot Springs of Rwanda via SMS.";
    // english
  } else if (text === "1*4") {
    response = `CON Hitamo Akarere?
    1. Kayonza
    2. Kirehe`;
  } else if (text === "1*4*1") {
    response = `CON Aho gusura muri kayonza?
    1. Akagera National Park`;
  }else if (text === "1*4*1*1") {
    sms.send({
      to: phoneNumber,
      message: `Urakoze gusura Pariki y'Akagera ! Dore uko amakuru y'ingenzi ugomba Kumenya:
      - Italiki: Nyakanga 20, 2024
      - Igiciro: 15000 RWF 
      - Isaha yo Gufungura: 09:00 AM
      - Isaha yo Gufunga: 05:00 AM
      - Uramutse ugize ikibazo wahamagara: +250 788 123 456
      Tuzishimira Kubana namwe!`
    }).then((response) => {
      console.log(response);
    }).catch((error) => {
      console.error(error);
    });
    response = "Uraza kubona ubutumwa buguha amakuru arambuye muri SMS.";
    // kinyarwanda
  } else if (text === "2*4") {
    response = `CON Choose the District?
    1. Kayonza
    2. Kirehe`;
  } else if (text === "2*4*1") {
    response = `CON Where to Visit in Kayonza?
    1. Akagera National Park`;
  }else if (text === "2*4*1*1") {
    sms.send({
      to: phoneNumber,
      message: `Thank you for visiting Akagera National Park ! Here are the main details you must know:
      - Date: July 20, 2024
      - Price: 15,000 RWF
      - Opening Hours: 09:00 AM
      - Closing Time: 05:00 AM
      - If you have a problem, call: +250 788 123 456
      We will be happy to be with you`
    }).then((response) => {
      console.log(response);
    }).catch((error) => {
      console.error(error);
    });
    response = " END You will receive details about Akagera National Park via SMS.";
    // english
  } else if (text === "1*5") {
    response = `CON Hitamo Akarere?
    1. Nyarugenge
    2. Kicukiro
    3. Gasabo`;
  } else if (text === "1*5*1") {
    response = `CON Aho gusura muri Nyarugenge?
    1. Nyamirambo Neighborhood
    2. Kandt House Museum`;
  }else if (text === "1*5*1*1") {
    sms.send({
      to: phoneNumber,
      message: `Urakoze gusura Mu Biryogo! Dore uko amakuru y'ingenzi ugomba Kumenya:
      - Italiki: Nyakanga 20, 2024
      - Igiciro: Ubuntu
      - Isaha yo Gufungura: 05:00 AM
      - Isaha yo Gufunga: 11:00 AM
      - Uramutse ugize ikibazo wahamagara kuri: +250 788 123 456
      Tuzishimira Kubana namwe!`
    }).then((response) => {
      console.log(response);
    }).catch((error) => {
      console.error(error);
    });
    response = "Uraza kubona ubutumwa buguha amakuru arambuye muri SMS.";
    // kinyarwanda
  } else if (text === "2*5") {
    response = `CON Choose The District?
    1. Nyarugenge
    2. Kicukiro
    3. Gasabo`;
  } else if (text === "2*5*1") {
    response = `CON Where to Visit in Nyarugenge?
    1. Nyamirambo Neighborhood
    2. Kandt House Museum`;
  }else if (text === "2*5*1*1") {
    sms.send({
      to: phoneNumber,
      message: `Thank you for visiting Nyamirambo Neighborhood ! Here are the main details to Notice:
      - Date: July 20, 2024
      - Price: Free
      - Opening Hours: 09:00 AM
      - Closing Time: 05:00 AM
      - If you have a problem please call: +250 788 123 456.
      We will be happy to be with you`
    }).then((response) => {
      console.log(response);
    }).catch((error) => {
      console.error(error);
    });
    response = "END You will receive details about Nyamirambo Neighborhood of Rwanda via SMS.";
    // english
  }

  res.set("Content-Type", "text/plain");
  res.send(response);
});

module.exports = router;
