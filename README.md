<p align="center">
  <a href="https://expo.dev" target="_blank">
    <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  </a>
</p>

# MyCademy - Student Mobile Portal

A dedicated mobile application for **students** to access the MyCademy ecosystem. This app allows students to engage with learning materials, take quizzes, and participate in class discussions directly from their mobile devices.

It serves as the client-side interface for the MyCademy web platform, designed to facilitate learning anytime, anywhere.

## Key Features

-   **Material Access**: Browse, download, and study learning materials and assignments.
-   **Discussion Forums**: Participate in dedicated discussion spaces for each material to foster student engagement.
-   **Quiz & Assignments**: Take quizzes and submit assignments seamlessly.
-   **Performance Tracking**:
    -   View **Material Understanding Scale** and **Quiz Scores**.
    -   Track **On-time Completion Rates**.
    -   Monitor **Forum Participation** and overall status.

## Backend Repository

The backend and lecturer/admin management dashboard for this application (MyCademy Web Portal) can be found here:

💻 **[MyCademy Web Portal (Laravel) - GitHub Repository](https://github.com/Alyyy07/project-skripsi)**

## Tech Stack

This project is built using:

-   **Framework:** [Expo](https://expo.dev) & [React Native](https://reactnative.dev)
-   **Language:** JavaScript / TypeScript
-   **UI / Styling:**
    -   [Gluestack UI](https://gluestack.io/)
    -   [NativeWind](https://www.nativewind.dev/) (Tailwind CSS)
    -   `@expo/vector-icons`
-   **Navigation:** [Expo Router](https://docs.expo.dev/router/introduction)
-   **Data Fetching:** Axios
-   **Authentication:** Google Sign-In & Laravel Sanctum (via API)
-   **Other Key Packages:**
    -   `react-native-reanimated` & `@legendapp/motion` - Animations
    -   `react-native-render-html` - Content rendering
    -   `react-native-svg` - Vector graphics
    -   `date-fns` - Date formatting

## Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Alyyy07/mycademy-mobile-expo.git
    cd mycademy-mobile-expo
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and configure your backend API URL.
    ```env
    EXPO_PUBLIC_API_URL=http://your-laravel-backend-url/api
    ```

4.  **Run the Application**
    ```bash
    npx expo start
    ```
    -   Press `a` for Android Emulator.
    -   Press `i` for iOS Simulator.
    -   Press `w` for Web.
    -   Scan the QR code with **Expo Go** on your physical device.

## License

This project is open-source and licensed under the [MIT License](https://opensource.org/licenses/MIT).
