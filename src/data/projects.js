export const ABOUT = {
  type:   'about',
  title:  'Hong Zhang',
  role:   'Full-Stack Developer',
  bio:    'I build web experiences that blend thoughtful design with modern AI — from restaurant menus to ancient divination, always with craft.',
  skills: ['React', 'Three.js', 'Node.js', 'Firebase', 'Python', 'AI / ML'],
  links: {
    github: 'https://github.com/sheetstone',
    email:  'mailto:sheetstone@gmail.com',
  },
  accent: '#6d5b98',
};

export const PROJECTS = [
  {
    title: 'Restaurant Menu',
    subtitle:
      'AI-powered restaurant menu explorer — browse dishes, filter by dietary needs, and get personalised recommendations in real time.',
    url: 'https://restaurant-api--restaurant-menu-poc-2026.us-central1.hosted.app/',
    image: null,
    screenshot: '/screenshots/restaurant.png',
    accent: '#f4845f',
  },
  {
    title: 'Yi Jing Oracle',
    subtitle:
      'Cast a hexagram, receive an ancient interpretation. A digital divination tool built on the 64 trigrams of the I Ching.',
    url: 'https://yi-jing-tool.web.app/',
    image: null,
    screenshot: '/screenshots/yijing.png',
    accent: '#c9a84c',
  },
  {
    title: 'AI Role Player',
    subtitle:
      'Step into a conversation with any persona. An AI chat tool that lets you craft characters, set the scene, and improvise freely.',
    url: 'https://ai-role-player.web.app/',
    image: null,
    screenshot: '/screenshots/airoleplayer.png',
    accent: '#7eb8f7',
  },
  ABOUT,
];
