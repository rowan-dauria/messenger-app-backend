const users = [
  {
    id: 1,
    display_name: 'Rowan d\'Auria',
    username: 'rowandauria',
    email: 'rowandummy@gmail.com',
    password: 'password',
  },
  {
    id: 2,
    display_name: 'John Smith',
    username: 'js',
    email: 'js@gmail.com',
    password: 'x',
  },
  {
    id: 3,
    display_name: 'Jane Doe',
    username: 'jd',
    email: 'jd@gmail.com',
    password: 'y',
  },
];

const chats = [
  {
    id: 1,
    members: [1, 2],
  },
  {
    id: 2,
    members: [1, 3],
  },
  {
    id: 3,
    members: [2, 3],
  },
];

const messages = [
  // {
  //   id: 1,
  //   created_at: postgres date format
  //   created_by: 2
  //   chat_id: 1,
  //   content: {
  //     text: 'Less recent message',
  //     image: null,
  //   },
  // },
  {
    id: 2,
    chat_id: 1,
    // created_at can come later with the time stamp stuff for PG
    content: {
      text: 'Lorem ipsum 😀',
      image: null,
    },
  },
  {
    id: 1,
    chat_id: 1,
    // created_at can come later with the time stamp stuff for PG
    content: {
      text: 'Less recent message',
      image: null,
    },
  },
];

module.exports = {
  messages,
  chats,
  users,
};
