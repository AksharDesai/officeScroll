import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { sendRequestToAdmin } from "../utils/functions";
import { useState } from "react";
import SuccessNotification from "./SuccessNotification";

const AlertModal = ({
  visibleModalValue,
  errorText,
  sendValueToParentComponent,
  requestLoginBtn = null,
}) => {
  const [ifErrorInRequest, setIfErrorInRequest] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successRequest, setSuccessRequest] = useState(false);

  async function handleReqestBtnSubmit() {
    if (!successRequest) {
      setIsSubmitting(true);
      console.log(requestLoginBtn);

      const response = await sendRequestToAdmin(1, requestLoginBtn);
      if (response.success) {
        setSuccessRequest(true);
        setIsSubmitting(false);
      } else {
        visibleModalValue = true;
        setIfErrorInRequest("Failed To Send Login Request To Server");

        setIsSubmitting(false);
      }
    }

    // const repsonse = await sendRequestToAdmin(1,)
  }

  return (
    <>
      <Modal
        animationType="fade"
        transparent={true}
        visible={visibleModalValue}
        onRequestClose={() => {
          sendValueToParentComponent(false);
        }}
      >
        <View style={styles.modalBody}>
          <View style={styles.modalMain}>
            <View style={styles.modalShadow} />

            <View style={styles.modalSection}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeader_text}>Error</Text>
              </View>

              <View style={styles.modalErrorContainer}>
                <Text>
                  {ifErrorInRequest
                    ? ifErrorInRequest
                    : errorText || "Failed to fetch the error from the server"}
                </Text>
              </View>

              <View style={styles.modalCloseBtnContainer}>
                {requestLoginBtn && (
                  <TouchableOpacity
                    style={[
                      styles.modalCloseBtn,
                      { backgroundColor: "#E1FA57" },
                    ]}
                    onPress={() => {
                      handleReqestBtnSubmit();
                    }}
                  >
                    <Text
                      style={[
                        styles.modalCloseBtn_text,
                        { color: "#000", fontWeight: 400 },
                      ]}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator color={"#000"} />
                      ) : successRequest ? (
                        "Done"
                      ) : (
                        "Request"
                      )}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.modalCloseBtn]}
                  disabled={isSubmitting}
                  onPress={() => {
                    sendValueToParentComponent(false);
                  }}
                >
                  <Text style={styles.modalCloseBtn_text}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default AlertModal;

const styles = StyleSheet.create({
  modalBody: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // background overlay
  },
  modalMain: {
    position: "relative",
    margin: 20,
  },
  modalShadow: {
    position: "absolute",
    top: 8,
    left: 8,
    right: -8,
    bottom: -8,
    backgroundColor: "#000",
    zIndex: 1,
  },
  modalSection: {
    backgroundColor: "#fff",
    padding: 24,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#000",
    zIndex: 2,
    minWidth: 300,
  },
  modalHeader: {
    alignSelf: "flex-start",
  },
  modalHeader_text: {
    fontSize: 24,
    fontWeight: 800,
  },
  modalErrorContainer: {
    alignSelf: "flex-start",
  },
  modalCloseBtnContainer: {
    flex: 1,
    maxHeight: 35,
    flexDirection: "row",
    alignSelf: "flex-end",
    marginTop: 30,
    gap: 20,
  },
  modalCloseBtn: {
    backgroundColor: "#000",
    // padding:4,
    flex: 1,
    maxWidth: 75,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseBtn_text: {
    color: "#fff",
    fontSize: 15,
    fontWeight: 300,
    letterSpacing: 2,
  },
});
