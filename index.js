// index.js - Yello Saver USSD Application
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

// Simple in-memory storage (In production, use a database)
const users = new Map();
const goals = new Map();
const savingsRecords = new Map();
const challenges = new Map();

// Financial tips array
const financialTips = [
  "Save before you spend - pay yourself first!",
  "Start small - even 100 RWF daily makes a difference",
  "Set clear savings goals with deadlines",
  "Track your progress weekly to stay motivated",
  "Join savings challenges with friends for support"
];

// Helper functions
function getUser(phoneNumber) {
  if (!users.has(phoneNumber)) {
    users.set(phoneNumber, {
      id: phoneNumber,
      name: '',
      phone: phoneNumber,
      totalSaved: 0,
      rewardPoints: 0,
      streak: 0,
      lastSaveDate: null,
      language: 'en'
    });
  }
  return users.get(phoneNumber);
}

function updateStreak(user) {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  if (user.lastSaveDate === today) {
    return; // Already saved today
  } else if (user.lastSaveDate === yesterday) {
    user.streak += 1; // Continue streak
  } else {
    user.streak = 1; // Start new streak
  }
  user.lastSaveDate = today;
}

function calculatePoints(amount, streak) {
  let points = Math.floor(amount / 100); // 1 point per 100 RWF
  if (streak >= 7) points *= 2; // Double points for 7+ day streak
  return points;
}

router.post("/ussd", (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;
  
  console.log('USSD Request:', req.body);
  let response = "";
  const user = getUser(phoneNumber);

  if (text === "") {
    // Main menu
    response = `CON Welcome to Yello Saver! 💰
Choose an option:
1. Save Now
2. My Goals
3. Learn & Tips
4. My Points & Rewards
5. Challenges
6. Settings
0. Exit`;
  }
  
  // SAVE NOW FLOW
  else if (text === "1") {
    response = `CON 💸 Save Now
Enter amount to save (RWF):
(Min: 100, Max: 500000)`;
  }
  else if (text.startsWith("1*") && text.split("*").length === 2) {
    const amount = parseInt(text.split("*")[1]);
    if (isNaN(amount) || amount < 100) {
      response = `CON Invalid amount! 
Enter amount between 100-500000 RWF:`;
    } else {
      response = `CON Confirm saving RWF ${amount.toLocaleString()}?
Current streak: ${user.streak} days
Points to earn: ${calculatePoints(amount, user.streak)}

1. Confirm
2. Cancel`;
    }
  }
  else if (text.startsWith("1*") && text.endsWith("*1")) {
    const amount = parseInt(text.split("*")[1]);
    
    // Update user data
    user.totalSaved += amount;
    updateStreak(user);
    const pointsEarned = calculatePoints(amount, user.streak);
    user.rewardPoints += pointsEarned;
    
    // Save record
    const recordId = Date.now().toString();
    savingsRecords.set(recordId, {
      id: recordId,
      userId: phoneNumber,
      amount: amount,
      date: new Date(),
      pointsEarned: pointsEarned
    });

    response = `END 🎉 Success! Saved RWF ${amount.toLocaleString()}
Streak: ${user.streak} days
Points earned: ${pointsEarned}
Total saved: RWF ${user.totalSaved.toLocaleString()}

Keep it up! 💪`;
  }
  else if (text.startsWith("1*") && text.endsWith("*2")) {
    response = `END Save cancelled. 
Try again anytime! 💰`;
  }
  
  // MY GOALS FLOW
  else if (text === "2") {
    const userGoals = Array.from(goals.values()).filter(g => g.userId === phoneNumber);
    if (userGoals.length === 0) {
      response = `CON 🎯 My Goals
You have no goals yet.

1. Create New Goal
2. Back to Main Menu`;
    } else {
      let goalsList = userGoals.map((g, index) => 
        `${index + 1}. ${g.title} (${Math.round((g.savedSoFar/g.targetAmount)*100)}%)`
      ).join('\n');
      
      response = `CON 🎯 My Goals
${goalsList}

${userGoals.length + 1}. Create New Goal
0. Back`;
    }
  }
  else if (text === "2*1" || (text.startsWith("2*") && text.split("*").length === 2 && 
           parseInt(text.split("*")[1]) > Array.from(goals.values()).filter(g => g.userId === phoneNumber).length)) {
    response = `CON 📝 Create New Goal
Enter goal name (e.g., School Fees):`;
  }
  else if (text.startsWith("2*1*") && text.split("*").length === 3) {
    const goalName = text.split("*")[2];
    response = `CON Goal: "${goalName}"
Enter target amount (RWF):`;
  }
  else if (text.startsWith("2*1*") && text.split("*").length === 4) {
    const [, , goalName, targetAmountStr] = text.split("*");
    const targetAmount = parseInt(targetAmountStr);
    if (isNaN(targetAmount) || targetAmount < 1000) {
      response = `CON Invalid amount!
Enter target amount (min 1000 RWF):`;
    } else {
      response = `CON Goal: "${goalName}"
Amount: RWF ${targetAmount.toLocaleString()}
Enter deadline (days from today):`;
    }
  }
  else if (text.startsWith("2*1*") && text.split("*").length === 5) {
    const [, , goalName, targetAmountStr, daysStr] = text.split("*");
    const targetAmount = parseInt(targetAmountStr);
    const days = parseInt(daysStr);
    
    if (isNaN(days) || days < 1) {
      response = `CON Invalid deadline!
Enter number of days (min 1):`;
    } else {
      // Create goal
      const goalId = Date.now().toString();
      const deadline = new Date(Date.now() + (days * 86400000));
      
      goals.set(goalId, {
        id: goalId,
        userId: phoneNumber,
        title: goalName,
        targetAmount: targetAmount,
        deadline: deadline,
        savedSoFar: 0,
        status: 'active'
      });

      response = `END ✅ Goal Created!
"${goalName}"
Target: RWF ${targetAmount.toLocaleString()}
Deadline: ${deadline.toDateString()}

Start saving towards your goal! 🎯`;
    }
  }
  
  // LEARN & TIPS FLOW
  else if (text === "3") {
    const randomTip = financialTips[Math.floor(Math.random() * financialTips.length)];
    sms.send({
      to: phoneNumber,
      message: `💡 Financial Tip: ${randomTip}\n\nYello Saver - Building your financial future! 🌟`
    }).catch(console.error);
    
    response = `END 📚 Today's Financial Tip sent via SMS!

Keep learning and growing! 🧠💪`;
  }
  
  // POINTS & REWARDS FLOW
  else if (text === "4") {
    response = `CON 🏆 My Points & Rewards
Points: ${user.rewardPoints}
Streak: ${user.streak} days
Total Saved: RWF ${user.totalSaved.toLocaleString()}

1. Redeem Airtime
2. View Rewards Store
0. Back`;
  }
  else if (text === "4*1") {
    if (user.rewardPoints < 50) {
      response = `END ❌ Insufficient Points!
You need at least 50 points for airtime.
Current: ${user.rewardPoints} points

Keep saving to earn more! 💪`;
    } else {
      response = `CON 📱 Redeem Airtime
Your Points: ${user.rewardPoints}

1. 500 RWF Airtime (50 points)
2. 1000 RWF Airtime (90 points)
3. 2000 RWF Airtime (150 points)
0. Back`;
    }
  }
  else if (text === "4*1*1" && user.rewardPoints >= 50) {
    user.rewardPoints -= 50;
    response = `END 🎉 Success! 
500 RWF airtime redeemed!
Remaining points: ${user.rewardPoints}

Airtime will be sent shortly! 📱`;
  }
  
  // CHALLENGES FLOW
  else if (text === "5") {
    response = `CON 🏃‍♂️ Savings Challenges
Join a challenge to stay motivated!

1. 7-Day Challenge (Save 500 RWF daily)
2. Monthly Goal (Save 30,000 RWF)
3. Weekend Warrior (Save 1000 RWF Sat-Sun)
0. Back`;
  }
  else if (text === "5*1") {
    response = `CON 🏃‍♂️ 7-Day Challenge
Save 500 RWF daily for 7 days
Reward: 100 bonus points!

1. Join Challenge
2. View Rules
0. Back`;
  }
  else if (text === "5*1*1") {
    response = `END ✅ Challenge Joined!
7-Day Savings Challenge
Target: 500 RWF daily

You'll receive daily reminders.
Good luck! 🍀💪`;
  }
  
  // SETTINGS FLOW
  else if (text === "6") {
    response = `CON ⚙️ Settings
Current Language: ${user.language === 'en' ? 'English' : 'Kinyarwanda'}

1. Change Language
2. View Profile
3. Help & Support
0. Back`;
  }
  else if (text === "6*1") {
    response = `CON 🌐 Language Settings
Current: ${user.language === 'en' ? 'English' : 'Kinyarwanda'}

1. English
2. Kinyarwanda
0. Back`;
  }
  else if (text === "6*1*1") {
    user.language = 'en';
    response = `END ✅ Language set to English`;
  }
  else if (text === "6*1*2") {
    user.language = 'rw';
    response = `END ✅ Ururimi rwahindujwe ku Kinyarwanda`;
  }
  else if (text === "6*2") {
    response = `END 👤 Your Profile
Phone: ${phoneNumber}
Total Saved: RWF ${user.totalSaved.toLocaleString()}
Reward Points: ${user.rewardPoints}
Current Streak: ${user.streak} days
Active Goals: ${Array.from(goals.values()).filter(g => g.userId === phoneNumber && g.status === 'active').length}`;
  }
  
  // ERROR HANDLING
  else {
    response = `CON ❌ Invalid option selected.
Press 0 to return to main menu.

0. Main Menu`;
  }
  
  if (text === "0" || text.endsWith("*0")) {
    response = `CON Welcome to Yello Saver! 💰
Choose an option:
1. Save Now
2. My Goals
3. Learn & Tips
4. My Points & Rewards
5. Challenges
6. Settings
0. Exit`;
  }

  res.set("Content-Type", "text/plain");
  res.send(response);
});

// Additional endpoint for webhook notifications (optional)
router.post("/webhook", (req, res) => {
  console.log('Webhook received:', req.body);
  res.status(200).send('OK');
});

module.exports = router;