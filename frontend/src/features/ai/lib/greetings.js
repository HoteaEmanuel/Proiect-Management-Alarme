const timeOfDay = () => {
  const ora = new Date().getHours();
  if (ora >= 5 && ora < 12) return "morning";
  if (ora >= 12 && ora < 17) return "afternoon";
  if (ora >= 17 && ora < 21) return "evening";
  return "night";
};

const greetings = {
  morning: ["Good morning", "Rise and shine", "Morning"],
  afternoon: ["Good afternoon", "Hey there", "Hello"],
  evening: ["Good evening", "Welcome back", "Hey"],
  night: ["Hello", "That 3AM motivation", "Let's do it"],
};

const subtitles = [
  "What can I help you with today?",
  "Ask me anything.",
  "What's on your mind?",
  "Let's fix it",
  "Ready when you are.",
  "What are we solving today?",
  "Any new network problems today?",
];
// construiesc un mesaj de greeting random bazat pe momentul zilei
export const greeting = () => {
  const time = timeOfDay();
  console.log("GREET BASED ON TIME");
  console.log(greetings[time]);
  return {
    greeting:
      greetings[time][Math.floor(Math.random() * greetings[time].length)],
    subtitle: subtitles[Math.floor(Math.random() * subtitles.length)],
  };
};
