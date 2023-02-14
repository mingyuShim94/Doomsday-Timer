import React, { useState, useEffect } from "react";
import Button from "./Button";
import * as Font from "expo-font";
import SplashScreen from "react-native-splash-screen";
export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync(
          "Galmuri7",
          require("./Assets/Fonts/Galmuri7.ttf")
        );
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
        SplashScreen.hide();
      }
    }

    prepare();
  }, []);
  if (!appIsReady) {
    return null;
  }
  return <Button />;
}
