const MENU_LINES = [
  "Welcome to the coolest show on ice!",
  "Your brain called. It's on break.",
  "Ready to get a little... frosty?",
  "Let's see who keeps their cool!",
  "Warm up those brain cells... then freeze 'em!",
  "Step right up to the chilliest game in town!",
  "I hope you studied... oh wait, you can't study for this.",
  "Somewhere, a trivia nerd is sweating.",
  "This is the thinking (hu)man's deep freeze!",
  "Don't worry, everybody freezes sometimes.",
  "Grab your friends, it's game time!",
  "Let's turn some brains into popsicles!",
];

let lastIndex = -1;

export function randomMenuLine() {
  let i = Math.floor(Math.random() * MENU_LINES.length);
  if (MENU_LINES.length > 1) {
    while (i === lastIndex) {
      i = Math.floor(Math.random() * MENU_LINES.length);
    }
  }
  lastIndex = i;
  return MENU_LINES[i];
}
