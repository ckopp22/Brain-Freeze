const POSE_SRC = (pose) => `./assets/ui/host/host-${pose}.png`;

const LINES = {
  menu: [
    "Welcome to the coolest show on ice!",
    "Your brain called. It's on break.",
    "Ready to get a little... frosty?",
    "Let's see who keeps their cool!",
    "Warm up those brain cells... then freeze 'em!",
    "Step right up to the chilliest game in town!",
    "I hope you studied... oh wait, you can't study for this.",
    "Somewhere, a trivia nerd is sweating.",
    "Don't worry, everybody freezes sometimes.",
    "Grab your friends, it's game time!",
    "Let's turn some brains into popsicles!",
    "Snow problem. Let's play!",
  ],
  turn: [
    "{name}, you're in the hot seat. Well, the cold seat!",
    "Chill, {name}. You've got this.",
    "{name}, step into the spotlight!",
    "All eyes on {name}!",
    "Think cool thoughts, {name}.",
    "{name}, don't let your brain freeze!",
    "Ready, {name}? The clock is ticking!",
    "{name}'s up! Keep your cool.",
  ],
  nailed: [
    "That's one cool customer!",
    "Ice work!",
    "Nothing but snow-nets!",
    "Absolutely snow-stopping!",
    "You're on thin ice... of brilliance!",
    "Cool as a cucumber. Colder, actually!",
    "Chill-tastic!",
    "That answer was ice-cold perfect!",
  ],
  froze: [
    "Brrrr... that one stung.",
    "Brain freeze! It happens to the best of us.",
    "Don't worry, you'll thaw out.",
    "Oof. Slipped on the ice there.",
    "Close, but no snow-cone.",
    "That one was a little too cold.",
    "We'll chalk that up to a flurry of nerves.",
    "Shake it off, snowflake!",
  ],
  timeout: [
    "Time's up, and so is your brain!",
    "Frozen solid!",
    "The clock beat you. Brrr!",
    "Out of time! Sheer ice!",
    "Tick tock... freeze!",
    "That's a full-on brain freeze!",
    "Time melted away!",
    "Frosty finish... for the wrong reasons!",
  ],
  nearWin: [
    "{name} is one card from the finish line!",
    "Watch out, {name} is almost there!",
    "{name} smells victory. And snow.",
    "One more and {name} takes the crown!",
  ],
  winner: [
    "{name} wins Brain Freeze! Stay cool, champ.",
    "Give it up for {name}, our ice-cold champion!",
    "{name} is the coolest brain in the room!",
    "Top of the iceberg: {name}!",
  ],
};

const lastIndex = {};

export function hostLine(bucket, name = "") {
  const list = LINES[bucket];
  let i = Math.floor(Math.random() * list.length);
  if (list.length > 1) {
    while (i === lastIndex[bucket]) i = Math.floor(Math.random() * list.length);
  }
  lastIndex[bucket] = i;
  return list[i].replace("{name}", name);
}

export function randomMenuLine() {
  return hostLine("menu");
}

export function setHostPose(imgEl, pose) {
  if (imgEl) imgEl.src = POSE_SRC(pose);
}

export const MENU_POSES = ["idle", "talk", "present", "point", "laugh"];

export function randomMenuPose() {
  return MENU_POSES[Math.floor(Math.random() * MENU_POSES.length)];
}
