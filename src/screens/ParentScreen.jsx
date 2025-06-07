import {
  DrawerLayoutAndroid,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import CheckInOutScreen from "./CheckInOutScreen";
import LoginScreen from "./LoginScreen";

import { MMKVLoader, useMMKVStorage } from "react-native-mmkv-storage";
import {isValidWifi, requestLocationPermission, sendRequestToAdmin } from "../utils/functions";
import SuccessNotification from "../components/SuccessNotification";
import AlertModal from "../components/AlertModal";



const storage = new MMKVLoader().initialize();

const ParentScreen = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useMMKVStorage("user", storage);
  const [userId, setUserId] = useMMKVStorage("user_id", storage);
  const [session, setSession] = useMMKVStorage("session", storage);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalType, setModalType] = useState(0);
  const [successNotification,setSuccessNotification]=useState(false)
  const [notificationText,setNotificationText]=useState('')
  const [alertModal, setAlertModal] = useState(false);
   const [errorText, setErrorText] = useState('');
   const [isSubmitting,setIsSubmitting]=useState(false)

  const drawer = useRef(null);

    const handleNotificationHide=()=>{
    setSuccessNotification(false)
  }
   const receiveValueFromComponent = (value)=>{
    setAlertModal(value);
  }

  //frontend response handle
  function handleEmployeeRequestClicked(type) {
    drawer.current?.closeDrawer();
    setShowConfirmModal(true);
    // 1 means login modal display, 2 for check in modal, 3 for checkout modal
    setModalType(type);
  }

  //database response handle
  async function handleRequestSubmit(type){
    
    setIsSubmitting(true)
    const response = await sendRequestToAdmin(type,userId)
    if (response.success) {
      setSuccessNotification(true)
      setNotificationText('Request Sent')
      setIsSubmitting(false)
    }else{
     
      setAlertModal(true)
      setErrorText(response.error)
      setIsSubmitting(false)
      
    }

    
    

  }

  const navigationView = () => (
    <View style={styles.drawerContainer}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>Office-Scroll</Text>
      </View>

      {/*<!--============== 1 means login modal display, 2 for check in modal, 3 for checkout modal ==============-->*/}

      <View style={styles.drawerContent}>
        <TouchableOpacity disabled={isSubmitting}
          style={styles.drawerItem}
          onPress={() => handleEmployeeRequestClicked(2)}
        >
          <Text style={styles.drawerItemText}>🌠 Check-in Request</Text>
        </TouchableOpacity>
        <TouchableOpacity disabled={isSubmitting}
          style={styles.drawerItem}
          onPress={() => handleEmployeeRequestClicked(3)}
        >
          <Text style={styles.drawerItemText}>📤 Check-out Request</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.drawerItem}>
          <Text style={styles.drawerItemText}>📟 Info</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => drawer.current?.closeDrawer()}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const fetchIsLoggedIn = (value) => {
    if (value && value.length === 4) {
      const setArray = [setIsLoggedIn, setUsername, setUserId, setSession];
      for (let i = 0; i < value.length; i++) {
        setArray[i](value[i]);
      }
    }
  };

  useEffect(() => {
    if (username && session && userId) {
      setIsLoggedIn(true);
    } else {
      storage.clearStore();
    }
  }, [username, session, userId]);

  useEffect(() => {
    if (username && session && userId) {
      //commented out to reduce component rerenders
      // setIsLoggedIn(true);
    } else {
      storage.clearStore();
    }

    requestLocationPermission()
   
  }, []);

  return (
    <SafeAreaView style={styles.body}>
      <DrawerLayoutAndroid
        ref={drawer}
        drawerWidth={280}
        drawerPosition={"right"}
        renderNavigationView={navigationView}
      >
        {/* V- Main Content View  */}
        <View style={styles.contentContainer}>
          {/* V- Hamburder Button */}
          <TouchableOpacity
            style={styles.hamburgerButton}
            onPress={() => drawer.current?.openDrawer()}
          >
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
          </TouchableOpacity>

          {/* different screen showcase logic */}
          <View style={styles.main}>
            {isLoggedIn ? (
              <CheckInOutScreen user_id={userId} />
            ) : (
              <LoginScreen setLoginValue={fetchIsLoggedIn} />
            )}
          </View>
        </View>

        {/* Requests Confirmation Modal */}

        <Modal
          animationType="fade"
          transparent={true}
          visible={showConfirmModal}
          onRequestClose={() => {
            setShowConfirmModal(!showConfirmModal);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalContainer}>
              <View style={styles.modalShadow} />

              <View style={styles.modalView}>
                <View stlye={styles.modalHeader}>
                  <Text style={styles.modalTitle}>

                    {modalType == 1? 'Send Login Request To Admin':modalType == 2 ? 'Send Check-In Request To Admin' : modalType==3?'Send Check-Out Request To Admin':'We Are Facing Error Right Now Cannot Send Request To Admin '}
                   
                  </Text>
                  <TouchableOpacity
                    style={styles.buttonClose}
                    onPress={() => setShowConfirmModal(!showConfirmModal)}
                  >
                    <Text style={styles.modalCloseButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={() => {
                    
                    
                    handleRequestSubmit(modalType)
                    setShowConfirmModal(false);
                  }}
                >
                  <Text style={styles.submitButtonText}>Send</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>


   {     alertModal &&  <AlertModal
   
        visibleModalValue={alertModal}
        errorText={errorText}
        sendValueToParentComponent={receiveValueFromComponent}></AlertModal>}


        {successNotification&&
        <SuccessNotification onHide={handleNotificationHide} notificationText={notificationText}></SuccessNotification>
         }
      </DrawerLayoutAndroid>
    </SafeAreaView>
  );
};

export default ParentScreen;

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    flex: 1,
    position: "relative",
  },
  main: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  //<!--============== Confirm Modal Styling Begins here ==============-->
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark backdrop like web version
  },

  // Container for the shadow effect
  modalContainer: {
    position: "relative",
    margin: 20,
  },

  // Black shadow/offset container
  modalShadow: {
    position: "absolute",
    top: 8,
    left: 8,
    right: -8,
    bottom: -8,
    backgroundColor: "#000",
    zIndex: 1,
  },

  modalView: {
    backgroundColor: "#FFF",
    padding: 24,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#000",
    position: "relative",
    zIndex: 2,
    minWidth: 300,
  },

  // Header styling to match web version
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 24,
  },

  modalTitle: {
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 2,
    textAlign: "center",
    fontFamily: "monospace", // Use monospace font
  },

  buttonClose: {
    backgroundColor: "transparent",
    padding: 8,
    position: "absolute",
    top: -40,
    right: -45,
  },

  modalCloseButtonText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
    fontFamily: "monospace",
    backgroundColor: "#000",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 100,
  },

  // Submit button with shadow effect

  submitButton: {
    backgroundColor: "#E1FA57",
    borderWidth: 2,
    borderColor: "#000",
    paddingHorizontal: 24,
    paddingVertical: 8,
    position: "relative",
    zIndex: 2,
    marginTop: 25,
  },

  submitButtonDisabled: {
    backgroundColor: "#F5F5F5",
    borderColor: "#CCCCCC",
    borderWidth: 0.5,
  },

  submitButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontFamily: "monospace",
    fontSize: 14,
    letterSpacing: 1,
  },

  submitButtonTextDisabled: {
    color: "#999",
  },

  //<!--============== Confirm Modal Styling Ends here ==============-->

  // Hamburger Menu Button Styles
  hamburgerButton: {
    position: "absolute",
    top: 40,
    right: 20,
    width: 30,
    height: 30,
    justifyContent: "space-around",
    alignItems: "center",
    zIndex: 1000,
    padding: 5,
  },
  hamburgerLine: {
    width: 25,
    height: 3,
    backgroundColor: "#333",
    borderRadius: 2,
  },

  // Drawer Styles
  drawerContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    position: "relative",
  },
  drawerHeader: {
    backgroundColor: "#000",
    padding: 20,
    paddingTop: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  drawerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  closeButton: {
    alignSelf: "stretch",

    // borderRadius: 15,
    // backgroundColor: '#000',
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
  closeButtonText: {
    backgroundColor: "#000",
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: 35,
    paddingVertical: 7,
    borderRadius: 25,
  },
  drawerContent: {
    flex: 1,
    paddingTop: 20,
  },
  drawerItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  drawerItemText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },

  // Keep your existing input styles
  input: {
    height: 40,
    margin: 12,
    borderWidth: 0.4,
    padding: 10,
    color: "#000",
    width: 200,
    borderRadius: 2,
  },
});
