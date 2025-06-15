const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = false;

let isActivated = false;
let voices = [];

function loadVoices() {
  voices = speechSynthesis.getVoices();
  if (voices.length === 0) {
    speechSynthesis.onvoiceschanged = () => {
      voices = speechSynthesis.getVoices();
    };
  }
}
loadVoices();

function startListening() {
  recognition.start();
  speak("Atom is online.");
}

recognition.onresult = (event) => {
  const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
  console.log("Heard:", transcript);

  if (!isActivated && transcript.includes("atom")) {
    speak("Yes, how can I help?");
    isActivated = true;
  } else if (isActivated) {
    const command = transcript.replace("atom", "").trim();
    handleCommand(command);
    isActivated = false;
  }
};

function speak(text) {
  document.getElementById("atom-response").textContent = "ATOM: " + text;

  if (voices.length === 0) {
    setTimeout(() => speak(text), 100);
    return;
  }

  const utter = new SpeechSynthesisUtterance(text);
  const maleVoice = voices.find(v => v.name.toLowerCase().includes("male")) || voices[0];
  utter.voice = maleVoice;
  speechSynthesis.speak(utter);
}

function updateTodoList() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  document.getElementById("todo-list").innerHTML = `
    <h2>To-Do List</h2>
    <ul>${tasks.map(task => `<li>${task}</li>`).join('')}</ul>
  `;
}

function calculate(expr) {
  try {
    expr = expr
      .replace(/percent of/gi, "*")
      .replace(/%/g, "*0.01")
      .replace(/plus/gi, "+")
      .replace(/minus/gi, "-")
      .replace(/times|x/gi, "*")
      .replace(/divided by|over/gi, "/");
    return eval(expr);
  } catch {
    return null;
  }
}

function handleCommand(cmd) {
  if (cmd.includes("time")) {
    const now = new Date().toLocaleTimeString();
    speak("The time is " + now);
  }

  else if (cmd.includes("date")) {
    const today = new Date().toLocaleDateString();
    speak("Today's date is " + today);
  }

  else if (cmd.includes("google")) {
    const query = cmd.replace("google", "").trim();
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    const win = window.open(url, "_blank");
    win ? speak("Searching Google for " + query) : speak("Please allow pop-ups for this site.");
  }

  else if (cmd.includes("add") && cmd.includes("to my list")) {
    const task = cmd.replace("add", "").replace("to my list", "").trim();
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    updateTodoList();
    speak(`Added ${task} to your list.`);
  }

  else if (cmd.includes("remind me in")) {
    const match = cmd.match(/remind me in (\d+) (second|seconds|minute|minutes)/);
    const reminder = cmd.split("to")[1]?.trim() || "do something";
    if (match) {
      const amount = parseInt(match[1]);
      const ms = match[2].includes("minute") ? amount * 60000 : amount * 1000;
      setTimeout(() => speak("Reminder: " + reminder), ms);
      speak(`Okay, I’ll remind you in ${amount} ${match[2]}.`);
    } else {
      speak("Sorry, I didn't understand the time.");
    }
  }

  else if (cmd.includes("play music")) {
    const audio = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
    audio.play();
    speak("Playing music.");
  }

  else if (cmd.includes("joke")) {
    const jokes = [
      "Why did the scarecrow win an award? Because he was outstanding in his field.",
      "Why don’t scientists trust atoms? Because they make up everything.",
      "I told my computer I needed a break, and it said no problem — it needed one too."
    ];
    speak(jokes[Math.floor(Math.random() * jokes.length)]);
  }

  else if (cmd.includes("quote")) {
    const quotes = [
      "The best way to get started is to quit talking and begin doing. - Walt Disney",
      "Don’t let yesterday take up too much of today. - Will Rogers",
      "You learn more from failure than from success. - Unknown"
    ];
    speak(quotes[Math.floor(Math.random() * quotes.length)]);
  }

  else if (cmd.includes("news")) {
    const news = [
      "Scientists discover new species in the Amazon.",
      "Tech stocks rise as market recovers.",
      "Local garden initiative gains popularity."
    ];
    speak("Here's a news headline: " + news[Math.floor(Math.random() * news.length)]);
  }

  else if (cmd.includes("calculate")) {
    const expr = cmd.replace("calculate", "").trim();
    const result = calculate(expr);
    result !== null ? speak("The result is " + result) : speak("Sorry, I couldn't calculate that.");
  }

  else if (cmd.includes("set alarm for")) {
    const time = cmd.match(/set alarm for (\d{1,2}):(\d{2})/);
    if (time) {
      const [_, h, m] = time.map(Number);
      const now = new Date();
      const alarm = new Date();
      alarm.setHours(h, m, 0);
      if (alarm < now) alarm.setDate(alarm.getDate() + 1);
      const delay = alarm - now;
      setTimeout(() => speak("Alarm ringing! Time's up."), delay);
      speak(`Alarm set for ${h}:${m}`);
    } else {
      speak("Say the alarm time in hour colon minutes format.");
    }
  }

  else if (cmd.includes("scroll down")) {
    window.scrollBy(0, 200);
    speak("Scrolling down.");
  }

  else if (cmd.includes("scroll up")) {
    window.scrollBy(0, -200);
    speak("Scrolling up.");
  }

  else if (cmd.includes("go back")) {
    window.history.back();
    speak("Going back.");
  }

  else if (cmd.includes("go forward")) {
    window.history.forward();
    speak("Going forward.");
  }

  else if (cmd.includes("take a note")) {
    const note = cmd.split("take a note")[1]?.trim();
    if (note) {
      let notes = JSON.parse(localStorage.getItem("notes")) || [];
      notes.push(note);
      localStorage.setItem("notes", JSON.stringify(notes));
      speak(`Note saved: ${note}`);
    } else {
      speak("What would you like me to note?");
    }
  }

  else if (cmd.includes("show my notes")) {
    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    if (notes.length === 0) speak("You have no notes.");
    else {
      speak(`You have ${notes.length} notes.`);
      alert("Your notes:\n\n" + notes.join("\n"));
    }
  }

  else if (cmd.includes("clear my notes")) {
    localStorage.removeItem("notes");
    speak("All notes cleared.");
  }

  else {
    speak("Sorry, I didn't understand that.");
  }
}

updateTodoList();
