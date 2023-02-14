import React, { useEffect, useState, useRef } from "react";
import {
  Animated,
  Image,
  Dimensions,
  Pressable,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import styled from "styled-components/native";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
  useRewardedAd,
} from "react-native-google-mobile-ads";
import { Octicons } from "@expo/vector-icons";
import Modal from "react-native-modal";
const STORAGE_KEY_TIME = "@my_times";
const WindowWidth = Dimensions.get("window").width;
const WindowHeight = Dimensions.get("window").height;

const bannerAdUnitId = __DEV__
  ? TestIds.BANNER
  : "ca-app-pub-8647279125417942/6622534546";

const rewardeAdUnitId = __DEV__
  ? TestIds.REWARDED
  : "ca-app-pub-8647279125417942/9251411701";
let intervalId;
let tempSound;
const Button = () => {
  const positionY = useRef(new Animated.Value(95)).current;
  const [timerSound, setTimerSound] = useState();
  const [push, setPush] = useState(false);
  const [times, setTimes] = useState(10000000);
  const {
    isLoaded: rewardIsLoaded,
    isClosed: rewardIsClosed,
    load: rewardLoad,
    show: rewardShow,
  } = useRewardedAd(rewardeAdUnitId, {
    requestNonPersonalizedAdsOnly: true,
  });
  const TimerSoundPlay = async (mute) => {
    console.log("Loading TimerSound");
    // const { sound } = await Audio.Sound.createAsync(
    //   require("./Assets/Audio/timer.wav")
    // );
    tempSound.setIsLoopingAsync(true);
    tempSound.setIsMutedAsync(!mute);
    setTimerSound(tempSound);
    console.log("Playing TimerSound");
    await tempSound.playAsync();
  };
  useEffect(() => {
    return timerSound
      ? () => {
          console.log("Unloading Sound");
          timerSound.unloadAsync();
        }
      : undefined;
  }, [timerSound]);
  const storeTime = async () => {
    console.log("time stored!!");
    try {
      await AsyncStorage.setItem(STORAGE_KEY_TIME, JSON.stringify(times));
    } catch (e) {
      alert(e);
    }
  };
  const getTime = async () => {
    console.log("time loaded!");
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEY_TIME);
      if (value == null) {
        setTimes(10000000);
      } else {
        setTimes(JSON.parse(value));
      }
    } catch (e) {
      alert(e);
    }
  };
  useEffect(() => {
    getTime();
  }, []);

  useEffect(() => {
    async function prepare() {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("./Assets/Audio/timer.wav")
        );
        tempSound = sound;
      } catch (e) {
        console.warn(e);
      }
    }

    prepare();
  }, []);
  const countDown = () => {
    intervalId = setInterval(() => {
      setTimes((times) => times - 1);
    }, 10);
    setPush(true);
  };
  useEffect(() => {
    // console.log("rewardLoad!!", rewardIsLoaded);
    rewardLoad();
  }, [rewardLoad]);
  useEffect(() => {
    if (rewardIsClosed) {
      console.log("RewardClose!!");
      buttonPressIn();
      countDown();
      rewardLoad();
      // setTimes((times) => times - 100000);
    }
  }, [rewardIsClosed]);
  const pause = () => {
    clearInterval(intervalId);
    setPush(false);
  };
  const buttonPressOut = () => {
    Animated.spring(positionY, {
      toValue: 95,
      useNativeDriver: true,
    }).start();
  };
  const buttonPressIn = () => {
    Animated.spring(positionY, {
      toValue: 120,
      useNativeDriver: true,
    }).start();
  };

  return (
    <WindowContainer>
      <TimerView>
        {times > 0 ? (
          <Text
            style={
              push
                ? {
                    color: "red",
                    fontSize: 16,
                    position: "absolute",
                    color: "white",
                    zIndex: 1,
                    top: 20,
                  }
                : {
                    color: "green",
                    fontSize: 15,
                    position: "absolute",
                    color: "white",
                    zIndex: 1,
                    top: 25,
                  }
            }
          >
            {"Until the end of the world..."}
          </Text>
        ) : null}

        {times > 0 ? (
          <TimerText
            style={
              push
                ? { color: "red", fontSize: 60 }
                : { color: "green", fontSize: 55 }
            }
          >
            {times}
          </TimerText>
        ) : (
          <TimerText style={{ color: "yellow", fontSize: 38 }}>
            {"Congratulations!"}
          </TimerText>
        )}
      </TimerView>
      <ButtonBox>
        <BehindBox>
          <Image
            style={{
              height: "100%",
              width: "100%",
              resizeMode: "contain",
            }}
            source={require("./Assets/Images/BehindAll.png")}
          />
        </BehindBox>
        <FrontBox>
          <Image
            style={{
              height: "100%",
              width: "100%",
              resizeMode: "contain",
            }}
            source={require("./Assets/Images/Front.png")}
          />
        </FrontBox>
        <RedButtonBox
          style={{
            transform: [{ translateY: positionY }],
          }}
        >
          <Image
            style={{
              height: "100%",
              width: "100%",
              resizeMode: "contain",
            }}
            source={require("./Assets/Images/Red_button.png")}
          />
        </RedButtonBox>
        <ButtonPress
          onPressIn={() => {
            push ? null : (TimerSoundPlay(true), countDown(), buttonPressIn());
          }}
          onPressOut={() => {
            TimerSoundPlay(false);
            pause();
            buttonPressOut();
          }}
        />
        <BackCover />
        <SaveBtn
          onPress={() => {
            storeTime(), Alert.alert("Save success!", `${times}`);
          }}
        >
          <Text style={{ fontSize: 30, fontWeight: "bold" }}>{"Save"}</Text>
        </SaveBtn>
        {rewardIsLoaded ? (
          <ChanceBtn onPress={rewardShow}>
            <Octicons
              name="video"
              size={35}
              color="black"
              style={{ marginTop: 6 }}
            />
            <Text
              style={{
                color: "white",
                fontSize: 15,
                fontWeight: "bold",
                position: "absolute",
                bottom: 10,
              }}
            >
              {"Press Hold"}
            </Text>
          </ChanceBtn>
        ) : null}
      </ButtonBox>
      <AdsView>
        <BannerAd
          unitId={bannerAdUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
        />
      </AdsView>
      {times <= 0 ? (
        <Modal
          isVisible={true}
          backdropOpacity={0.4}
          useNativeDriver={true}
          animationIn={"pulse"}
          animationOut={"zoomOut"}
        >
          <EndView>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
              {"You are a patient person."}
            </Text>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
              {"You can do anything now."}
            </Text>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
              {"Believe in what you do!"}
            </Text>
            <Text></Text>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
              {"Thank you so much for playing!"}
            </Text>
            <ResetBtn
              onPress={() => {
                setTimes(10000000);
              }}
            >
              <Text style={{ color: "red", fontSize: 35, fontWeight: "bold" }}>
                {"Reset"}
              </Text>
            </ResetBtn>
          </EndView>
        </Modal>
      ) : null}
    </WindowContainer>
  );
};
export default Button;
const WindowContainer = styled.View`
  flex: 1;
  background-color: grey;
`;
const TimerView = styled.View`
  flex: 0.2;
  background-color: grey;
  align-items: center;
  justify-content: center;
`;
const TimerText = styled.Text`
  background-color: black;
  padding-horizontal: 10px;
  padding-bottom: 6px;
  border-radius: 30px;
  font-family: Galmuri7;
`;
const BehindBox = styled.View`
  //background-color: yellow;
  width: 350px;
  height: 350px;
  align-self: center;
`;
const FrontBox = styled.View`
  //background-color: purple;
  width: 373px;
  height: 215px;
  align-self: center;
  position: absolute;
  bottom: 2px;
  z-index: 1;
`;
const RedButtonBox = styled(Animated.createAnimatedComponent(View))`
  //background-color: white;
  width: 170px;
  height: 170px;
  position: absolute;
  align-self: center;
  bottom: 230px;
`;
const ButtonBox = styled.View`
  flex: 0.7;
  //background-color: white;
  align-self:center
  margin-bottom:15px;
  width: ${WindowWidth * 0.9}px;
`;
const ButtonPress = styled.Pressable`
  width: 170px;
  height: 130px;
  //background-color: tomato;
  postion: absolute;
  z-index: 2;
  align-self: center;
  bottom: 90px;
  border-radius: 80px;
`;

const SaveBtn = styled.TouchableOpacity`
  background-color: #228b22;
  width: 100px;
  height: 70px;
  position: absolute;
  border-radius: 40px;
  right: 0px;
  justify-content: center;
  align-items: center;
`;

const ChanceBtn = styled.TouchableOpacity`
  background-color: red;
  width: 100px;
  height: 70px;
  position: absolute;
  border-radius: 40px;
  right: 0px;
  top: 80px;
  align-items: center;
`;
const BackCover = styled.View`
  background-color: #e3ce01;
  width: 200px;
  height: 200px;
  position: absolute;
  align-self: center;
  bottom: 100px;
  z-index: -1;
`;
const AdsView = styled.View`
  flex: 0.1;
  background-color: grey;
  justify-content: flex-end;
`;
const EndView = styled.View`
  width: 350px;
  height: 350px;
  background-color: white;
  align-self: center;
  border-radius: 25px;
  border-width: 10px;
  border-color: red;
  align-items: center;
  padding-top: 50px;
`;

const ResetBtn = styled.TouchableOpacity`
  width: 130px;
  height: 70px;
  background-color: black;
  position: absolute;
  bottom: 50px;
  border-radius: 25px;
  align-items: center;
  justify-content: center;
`;
