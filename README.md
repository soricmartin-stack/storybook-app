# StoryTime Creator

A beautiful children's storybook creation app built with React Native and Expo. Create magical storybooks from your photos and text, read them with text-to-speech, and translate to multiple languages.

![StoryTime Creator](https://via.placeholder.com/400x300/6366F1/FFFFFF?text=StoryTime+Creator)

## Features

- 📚 **Create Storybooks** - Combine photos and text to create beautiful children's books
- 🖼️ **Easy Image Upload** - Pick photos from your gallery or take new ones
- 📖 **Story Reader** - Beautiful page-by-page reading experience
- 🔊 **Text-to-Speech** - Automatically read stories aloud to children
- 🌍 **Multi-Language Translation** - Translate stories to 12+ languages instantly
- 📚 **Library Management** - Store and organize all your storybooks
- 📱 **Cross-Platform** - Works on iOS, Android, and Web

## Tech Stack

- **React Native** with Expo SDK 51
- **TypeScript** for type safety
- **Firebase** (Auth, Firestore, Storage) for backend
- **OpenAI GPT-3.5** for translations
- **Expo Speech** for text-to-speech
- **Expo Router** for navigation
- **FlashList** for efficient list rendering

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo Go app (for mobile testing)
- Firebase project (for backend)
- OpenAI API key (for translations)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/soricmartin-stack/storybook-app.git
   cd storybook-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your credentials:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   EXPO_PUBLIC_OPENAI_API_KEY=sk-your_openai_key
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on your device**
   - Scan the QR code with Expo Go app, or
   - Press `w` for web preview

## Project Structure

```
storybook-app/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── home.tsx       # Home/Library view
│   │   ├── library.tsx    # Storybook library
│   │   ├── create.tsx     # Create new storybook
│   │   └── settings.tsx   # App settings
│   ├── book/[id]/         # Book reader/viewer
│   ├── auth.tsx           # Login/Signup
│   └── onboarding.tsx     # Welcome screen
├── components/            # Reusable UI components
│   ├── ui/               # Buttons, inputs, cards
│   └── library/          # Book-related components
├── config/               # Firebase & OpenAI config
├── context/              # React contexts (Auth)
├── hooks/                # Custom React hooks
├── types/                # TypeScript types
├── constants/            # App constants (colors, spacing)
└── assets/               # Images, fonts
```

## Available Scripts

```bash
# Start development server
npm start
npx expo start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web

# Build for production (Android)
npm run build:android
eas build --platform android

# Build for production (iOS)
npm run build:ios
eas build --platform ios
```

## Deployment to Google Play

1. **Configure app.json** with your package name
2. **Set up EAS Build**
   ```bash
   npm install -g eas-cli
   eas login
   eas build:configure
   ```

3. **Build for production**
   ```bash
   eas build --platform android --profile production
   ```

4. **Submit to Play Store**
   ```bash
   eas submit --platform android
   ```

## Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password provider)
3. Create a **Firestore Database** (Start in test mode for development)
4. Enable **Storage** for image uploads
5. Download `google-services.json` and place in project root

## OpenAI Setup

1. Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add it to your `.env` file
3. Translations are handled via GPT-3.5 Turbo

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open a GitHub issue.

---

Made with ❤️ for children everywhere
