
import type { Profile as ProfileType } from './seed-data';
export type Profile = ProfileType;
// export type Profile = any;

export type Message = {
  id: number;
  senderId: number; // Corresponds to a Profile ID
  text: string;
  timestamp: string; // ISO string for simplicity
};

export type Conversation = {
  id: number;
  participant: Profile;
  messages: Message[];
  unreadCount: number;
};

export const wantsOptions = [
  'Mentorship', 'Discreet', 'Long-term', 'Travel Partner', 
  'Casual', 'No Strings Attached', 'Friendship', 'Networking'
];

export const interestsOptions = [
  'Art', 'Travel', 'Fine Dining', 'Theatre', 'Wine Tasting',
  'Sports', 'Music', 'Movies', 'Reading', 'Cooking', 'Fitness'
];

export const bodyTypeOptions = ['Slim', 'Athletic', 'Average', 'Curvy', 'A few extra pounds'];
export const ethnicityOptions = ["Black/African Descent", "North/African Descent", "East Asian", "South Asian", "Hispanic/Latino", "Middle Eastern", "Native American/Indigenous", "White/Caucasian"];
export const hairColorOptions = ["Brown", "Black", "Blonde", "Chestnut", "Grey", "Auburn", "Red"];
export const eyeColorOptions = ["Blue", "Brown", "Green", "Grey", "Hazel"];
export const smokerDrinkerOptions = ['Yes', 'Socially', 'Sometimes', 'No'];
export const yesNoOptions = [{value: 'Yes', label: 'Yes'}, {value: 'No', label: 'No'}];

export const attributeKeys = [
  'Height',
  'Body Type',
  'Ethnicity',
  'Hair Color',
  'Eye Color',
  'Smoker',
  'Drinker',
  'Piercings',
  'Tattoos',
];

export const featuredProfiles: Profile[] = [
  {
    id: 1,
    name: 'Admin',
    email: 'saytee.software@gmail.com',
    password: 'admin',
    age: 49,
    location: 'London, UK',
    imageUrl: '/default_Profiles/Admin_Gemini_Generated_Image(small)-001.jpg',
    hint: 'portrait man',
    role: 'daddy',
    online: false,
    verified: true,
    bio: "I'm a successful entrepreneur with a passion for the finer things in life. I enjoy mentoring ambitious individuals and exploring the world. Looking for a genuine connection with someone who is intelligent, driven, and has a great sense of humor.",
    wants: ['Mentorship', 'Discreet', 'Long-term', 'Travel Partner'],
    interests: ['Art', 'Travel', 'Fine Dining', 'Theatre', 'Wine Tasting'],
    gallery: [],
    attributes: {
      'Height': "6'0\"",
      'Body Type': 'Athletic',
      'Ethnicity': 'Black/African Descent',
      'Hair Color': 'Black',
      'Eye Color': 'Brown',
      'Smoker': 'No',
      'Drinker': 'Socially',
      'Piercings': 'No',
      'Tattoos': 'No',
    },
    metCount: 10,
    notMetCount: 1,
    votes: [],
  },
  {
    id: 2,
    name: 'Darianna',
    email: 'darianna@gmail.com',
    password: 'password123',
    age: 24,
    location: 'London, UK',
    imageUrl: '/default_Profiles/Darianna_Gemini_Generated_Image(small)-001.jpg',
    hint: 'woman art studio',
    role: 'baby',
    online: true,
    verified: true,
    bio: 'Art student with a love for adventure and exploring new cultures. I enjoy gallery openings, weekend getaways, and trying new restaurants. Seeking a mentor and partner to share life\'s beautiful moments with.',
    wants: ['Mentorship', 'Travel Partner', 'Casual'],
    interests: ['Art', 'Travel', 'Fine Dining', 'Movies'],
    gallery: [
      '/default_Profiles/Darianna_Gemini_Generated_Image(small)-002.jpg',
      '/default_Profiles/Darianna_Gemini_Generated_Image(small)-003.jpg',
      '/default_Profiles/Darianna_Gemini_Generated_Image(small)-004.jpg'
    ],
    attributes: {
      'Height': "5'5\"",
      'Body Type': 'Slim',
      'Ethnicity': 'Hispanic/Latino',
      'Hair Color': 'Black',
      'Eye Color': 'Brown',
      'Smoker': 'No',
      'Drinker': 'Sometimes',
      'Piercings': 'No',
      'Tattoos': 'No',
    },
    metCount: 8,
    notMetCount: 0,
    votes: [],
  },
  {
    id: 3,
    name: 'Kateryna',
    email: 'kateryna@gmail.com',
    password: 'password123',
    age: 22,
    location: 'Kiev, UA',
    imageUrl: '/default_Profiles/Kateryna_Gemini_Generated_Image(small)-001.jpg',
    hint: 'woman graduate city',
    role: 'baby',
    online: true,
    verified: false,
    bio: 'Recent graduate starting my career in marketing. I\'m ambitious, fun-loving, and enjoy nights out as much as quiet nights in. Looking for a confident and established man to learn from.',
    wants: ['Networking', 'Mentorship', 'Friendship'],
    interests: ['Music', 'Cooking', 'Fitness', 'Reading'],
    gallery: [
      '/default_Profiles/Kateryna_Gemini_Generated_Image(small)-002.jpg',
      '/default_Profiles/Kateryna_Gemini_Generated_Image(small)-003.jpg'
    ],
    attributes: {
      'Height': "5'7\"",
      'Body Type': 'Average',
      'Ethnicity': 'Hispanic/Latino',
      'Hair Color': 'Blonde',
      'Eye Color': 'Blue',
      'Smoker': 'Socially',
      'Drinker': 'Socially',
      'Piercings': 'No',
      'Tattoos': 'No',
    },
    metCount: 2,
    notMetCount: 0,
    votes: [],
  },
  {
    id: 4,
    name: 'Mark',
    email: 'mark@gmail.com',
    password: 'password123',
    age: 52,
    location: 'Miami, USA',
    imageUrl: '/default_Profiles/Male_Gemini_Generated_Image(small)-002.jpg',
    hint: 'portrait man',
    role: 'daddy',
    online: true,
    verified: true,
    bio: 'Investor and lover of the great outdoors. I spend my weekends hiking and my weekdays closing deals. I appreciate honesty and a good sense of humor. Ready to spoil the right person.',
    wants: ['Long-term', 'Travel Partner'],
    interests: ['Sports', 'Travel', 'Wine Tasting'],
    gallery: [
      ''
    ],
    attributes: {
      'Height': "6'0\"",
      'Body Type': 'Average',
      'Ethnicity': 'White',
      'Hair Color': 'Grey',
      'Eye Color': 'Brown',
      'Smoker': 'No',
      'Drinker': 'Yes',
      'Piercings': 'No',
      'Tattoos': 'No',
    },
    metCount: 6,
    notMetCount: 1,
    votes: [],
  },
  {
    id: 5,
    name: 'Sofia',
    email: 'sofia@gmail.com',
    password: 'password123',
    age: 26,
    location: 'Cartagena, CO',
    imageUrl: '/default_Profiles/Sofia_Gemini_Generated_Image(small)-001.jpg',
    hint: 'woman fashion designer',
    role: 'baby',
    online: false,
    verified: true,
    bio: 'Fashion designer with an eye for beauty and a heart for adventure. I\'m looking for a sophisticated gentleman to share elegant evenings and exciting journeys with.',
    wants: ['Discreet', 'Casual', 'Travel Partner'],
    interests: ['Art', 'Theatre', 'Reading', 'Cooking'],
    gallery: [
      '/default_Profiles/Sofia_Gemini_Generated_Image(small)-002.jpg',
      '/default_Profiles/Sofia_Gemini_Generated_Image(small)-003.jpg',
      '/default_Profiles/Sofia_Gemini_Generated_Image(small)-004.jpg'
    ],
    attributes: {
      'Height': "5'8\"",
      'Body Type': 'Curvy',
      'Ethnicity': 'Hispanic/Latino',
      'Hair Color': 'Black',
      'Eye Color': 'Brown',
      'Smoker': 'No',
      'Drinker': 'No',
      'Piercings': 'No',
      'Tattoos': 'No',
    },
    metCount: 4,
    notMetCount: 0,
    votes: [],
  },
  {
    id: 6,
    name: 'James',
    email: 'james@gmail.com',
    password: 'password123',
    age: 38,
    location: 'Medellín, CO',
    imageUrl: '/default_Profiles/Male_Gemini_Generated_Image(small)-002.jpg',
    hint: 'portrait man',
    role: 'daddy',
    online: true,
    verified: false,
    bio: 'Tech CEO who works hard and plays harder. I enjoy sailing, trying new tech, and intellectual conversations. Seeking a bright, witty companion for dates and possibly more.',
    wants: ['Networking', 'No Strings Attached', 'Casual'],
    interests: ['Sports', 'Music', 'Movies', 'Reading'],
    gallery: [
      ''
    ],
    attributes: {
      'Height': "5'11\"",
      'Body Type': 'Athletic',
      'Ethnicity': 'White',
      'Hair Color': 'Black',
      'Eye Color': 'Green',
      'Smoker': 'Sometimes',
      'Drinker': 'Socially',
      'Piercings': 'No',
      'Tattoos': 'No',
    },
    metCount: 1,
    notMetCount: 2,
    votes: [],
  },
  {
    id: 7,
    name: 'Vanessa',
    email: 'vanessa@gmail.com',
    password: 'password123',
    age: 21,
    location: 'Franfurt, DE',
    imageUrl: '/default_Profiles/Vansessa_Gemini_Generated_Image(small)-001.jpg',
    hint: 'woman brown hair',
    role: 'baby',
    online: true,
    verified: true,
    bio: 'University student studying literature. I\'m a romantic at heart and love poetry, long walks, and deep conversations. Hoping to find a kind, generous man to create beautiful memories with.',
    wants: ['Long-term', 'Friendship', 'Mentorship'],
    interests: ['Reading', 'Cooking', 'Art', 'Travel'],
    gallery: [
      '/default_Profiles/Vansessa_Gemini_Generated_Image(small)-002.jpg',
      '/default_Profiles/Vansessa_Gemini_Generated_Image(small)-003.jpg'
    ],
    attributes: {
      'Height': "5'4\"",
      'Body Type': 'Slim',
      'Ethnicity': 'White',
      'Hair Color': 'Brown',
      'Eye Color': 'Green',
      'Smoker': 'No',
      'Drinker': 'Sometimes',
      'Piercings': 'No',
      'Tattoos': 'No',
    },
    metCount: 0,
    notMetCount: 0,
    votes: [],
  },
  {
    id: 8,
    name: 'Richard',
    email: 'richard@gmail.com',
    password: 'password123',
    age: 49,
    location: 'London, UK',
    imageUrl: '/default_Profiles/Male_Gemini_Generated_Image(small)-002.jpg',
    hint: 'portrait man',
    role: 'daddy',
    online: false,
    verified: true,
    bio: 'Architect with an appreciation for design, history, and good whiskey. I\'m looking for an elegant and intelligent young woman to accompany me to to social events and on travels.',
    wants: ['Travel Partner', 'Discreet', 'Networking'],
    interests: ['Travel', 'Fine Dining', 'Theatre', 'Wine Tasting'],
    gallery: [
      ''
    ],
    attributes: {
      'Height': "6'2\"",
      'Body Type': 'Slim',
      'Ethnicity': 'White',
      'Hair Color': 'Brown',
      'Eye Color': 'Blue',
      'Smoker': 'Yes',
      'Drinker': 'Yes',
      'Piercings': 'No',
      'Tattoos': 'No',
    },
    metCount: 3,
    notMetCount: 0,
    votes: [],
  },
  {
    id: 9,
    name: 'Olivia',
    email: 'olivia@gmail.com',
    password: 'password123',
    age: 23,
    location: 'Medellín, CO',
    imageUrl: '/default_Profiles/Female_Gemini_Generated_Image(small)-001.jpg',
    hint: 'woman nature',
    role: 'baby',
    online: false,
    verified: false,
    bio: 'Yoga instructor and nature lover. I find peace in the outdoors and joy in healthy living. Seeking a grounded, successful partner who values wellness and authenticity.',
    wants: ['Friendship', 'Casual', 'Long-term'],
    interests: ['Fitness', 'Cooking', 'Travel', 'Reading'],
    gallery: [
      ''
    ],
    attributes: {
      'Height': "5'6\"",
      'Body Type': 'Athletic',
      'Ethnicity': 'Hispanic/Latino',
      'Hair Color': 'Brown',
      'Eye Color': 'Brown',
      'Smoker': 'No',
      'Drinker': 'No',
      'Piercings': 'Yes',
      'Tattoos': 'Yes',
    },
    metCount: 0,
    notMetCount: 0,
    votes: [],
  },
  {
    id: 10,
    name: 'William',
    email: 'william@gmail.com',
    password: 'password123',
    age: 45,
    location: 'Cardiff, UK',
    imageUrl: '/default_Profiles/Male_Gemini_Generated_Image(small)-002.jpg',
    hint: 'man suit',
    role: 'daddy',
    online: true,
    verified: true,
    bio: 'Lawyer with a sharp mind and a generous heart. When I\'m not in the courtroom, I enjoy rugby, classical music, and fine wine. Looking for a bright, ambitious partner to share my success with.',
    wants: ['Long-term', 'Mentorship'],
    interests: ['Sports', 'Music', 'Wine Tasting', 'Reading'],
    gallery: [
        ''
    ],
    attributes: {
      'Height': "5'10\"",
      'Body Type': 'Average',
      'Ethnicity': 'White',
      'Hair Color': 'Blonde',
      'Eye Color': 'Blue',
      'Smoker': 'Socially',
      'Drinker': 'Socially',
      'Piercings': 'No',
      'Tattoos': 'No',
    },
    metCount: 1,
    notMetCount: 0,
    votes: [],
  },
  {
    id: 11,
    name: 'Cecilia',
    email: 'cecilia@gmail.com',
    password: 'password123',
    age: 25,
    location: 'Rio, Brazil',
    imageUrl: '/default_Profiles/Female_Gemini_Generated_Image(small)-001.jpg',
    hint: 'woman smiling',
    role: 'baby',
    online: true,
    verified: true,
    bio: 'Musician and free spirit. My life is filled with melodies, travel, and laughter. I\'m searching for a patron and partner who appreciates the arts and has a zest for life.',
    wants: ['Travel Partner', 'Friendship', 'Casual'],
    interests: ['Music', 'Art', 'Travel', 'Movies'],
    gallery: [
      '',
    ],
    attributes: {
      'Height': "5'7\"",
      'Body Type': 'Slim',
      'Ethnicity': 'White/Caucasian',
      'Hair Color': 'Black',
      'Eye Color': 'Green',
      'Smoker': 'No',
      'Drinker': 'Socially',
      'Piercings': 'No',
      'Tattoos': 'Yes',
    },
    metCount: 0,
    notMetCount: 0,
    votes: [],
  },
  {
    id: 12,
    name: 'George',
    email: 'george@gmail.com',
    password: 'password123',
    age: 55,
    location: 'London, UK',
    imageUrl: '/default_Profiles/Male_Gemini_Generated_Image(small)-002.jpg',
    hint: 'man outdoor',
    role: 'daddy',
    online: false,
    verified: false,
    bio: 'Retired naval officer, now enjoying a life of leisure. I spend my time sailing, golfing, and enjoying good company. Looking for a cheerful and easygoing companion for dinners, events, and travel.',
    wants: ['Casual', 'Travel Partner', 'No Strings Attached'],
    interests: ['Sports', 'Travel', 'Fine Dining', 'Reading'],
    gallery: [
      '',
    ],
    attributes: {
      'Height': "5'9\"",
      'Body Type': 'Average',
      'Ethnicity': 'White',
      'Hair Color': 'Grey',
      'Eye Color': 'Hazel',
      'Smoker': 'No',
      'Drinker': 'Yes',
      'Piercings': 'No',
      'Tattoos': 'Yes',
    },
    metCount: 2,
    notMetCount: 1,
    votes: [],
  },
  {
    id: 13,
    name: 'Larry',
    email: 'larry.saytee@email.com',
    password: 'password',
    age: 49,
    location: 'London, UK',
    imageUrl: '/default_Profiles/Larry_IMG_4828(small)-001.jpg',
    hint: 'man portrait',
    role: 'daddy',
    online: false,
    verified: true,
    bio: "Seasoned executive who enjoys mentoring and sharing life's experiences. Looking for a bright and engaging companion to enjoy fine dining and travel.",
    wants: ['Mentorship', 'Travel Partner'],
    interests: ['Fine Dining', 'Travel', 'Reading'],
    gallery: [
      '/default_Profiles/Larry_IMG_4828(small)-002.jpg'
    ],
    attributes: {
      'Height': "5'10\"",
      'Body Type': 'Average',
      'Ethnicity': 'White',
      'Hair Color': 'Brown',
      'Eye Color': 'Brown',
      'Smoker': 'No',
      'Drinker': 'Socially',
      'Piercings': 'No',
      'Tattoos': 'No',
    },
    metCount: 0,
    notMetCount: 0,
    votes: [],
  },
];

export const rawConversationsData = [
  {
      id: 1,
      participantId: 2, // Darianna
      unreadCount: 1,
      messages: [
          { id: 1, senderId: 2, text: 'Hey there! Loved your profile, especially your taste in art.', timestamp: '2024-07-28T10:00:00.000Z' },
      ]
  },
  {
      id: 2,
      participantId: 3, // Kateryna
      unreadCount: 0,
      messages: [
          { id: 1, senderId: 1, text: 'Good morning, Kateryna. I hope you have a great day.', timestamp: '2024-07-27T09:00:00.000Z' },
          { id: 2, senderId: 3, text: 'Morning! You too. Thanks for the message :)', timestamp: '2024-07-27T09:12:00.000Z' },
          { id: 3, senderId: 1, text: 'Any plans for the upcoming week?', timestamp: '2024-07-27T18:30:00.000Z' },
          { id: 4, senderId: 3, text: 'Not yet! Still trying to figure things out. You?', timestamp: '2024-07-27T18:35:00.000Z' },
      ]
  },
   {
      id: 3,
      participantId: 5, // Sofia
      unreadCount: 1,
      messages: [
          { id: 1, senderId: 5, text: 'Your profile mentioned you enjoy fine dining. Any favorite spots?', timestamp: '2024-07-26T15:00:00.000Z' },
      ]
  },
  {
      id: 4,
      participantId: 7, // Vanessa
      unreadCount: 1,
      messages: [
          { id: 1, senderId: 7, text: 'Hi! I saw you\'re a travel partner. What\'s the most amazing place you\'ve visited?', timestamp: '2024-07-28T12:00:00.000Z' },
      ]
  },
];
