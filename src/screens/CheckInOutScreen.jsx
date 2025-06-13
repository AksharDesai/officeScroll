import { StyleSheet, Text, View, TouchableOpacity,Modal,TextInput,ActivityIndicator,Image } from 'react-native'
import React,{useEffect,useState} from 'react'
import Calendar from '../components/Calendar'
import AlertModal from '../components/AlertModal'
import SuccessNotification from '../components/SuccessNotification'
import { checkInEmployee, checkOutEmployee, decideButton, getAllPresentDates } from '../utils/functions'
import { MMKVLoader, useMMKVStorage } from "react-native-mmkv-storage";

const storage2 = new MMKVLoader().initialize();

const CheckInOutScreen = ({user_id}) => {
  
  const [btnStatus,setBtnStatus]=useState(-1)
  const [checkinModalVisible, setCheckinModalVisible] = useState(false);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [report, setReport] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertModal, setAlertModal] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [successNotification,setSuccessNotification]=useState(false)
  const [notificationText,setNotificationText]=useState('')
  const [workingOnText,setWorkingOnText]=useState('')
  const [workingOnLS,setWorkingOnLS] = useMMKVStorage("working_on", storage2);
  const [checkOutID,setCheckOutID]=useState('')


  

  const handleNotificationHide=()=>{
    setSuccessNotification(false)
  }

  const receiveValueFromComponent = (value)=>{
    setAlertModal(value);
  }

   //fetch button status
  const fetchStatus = async () => {
    const status = await decideButton(user_id);

    if (status.success ) {
      if (status.documentID) {
        
        setCheckOutID(status.documentID)
      }
    }
    
    return status;
  };

  async function handleCheckIn() {
    setIsSubmitting(true);
    const checkInTime = new Date().toISOString();
    const response = await checkInEmployee(checkInTime, user_id,workingOnText);

    if (response.success) {
      // change button status
      fetchStatus().then(status => {
        // ('inside component',status);

        setBtnStatus(status.fetchStatus);
      });
      //show success notification
      setSuccessNotification(true)
      setNotificationText('Checked In')
      setWorkingOnLS(workingOnText)


      setIsSubmitting(false);
    } else {
      //change button status
      fetchStatus().then(status => {
        // ('inside component',status);

        setBtnStatus(status.fetchStatus);
      });

      //show error alert
      setAlertModal(true);
      setErrorText(response.error);
      setIsSubmitting(false);
    }
  }

    async function handleCheckOut() {
    
   
    setIsSubmitting(true);
    const checkOutTime = new Date().toISOString();
    const response = await checkOutEmployee(checkOutTime, report, checkOutID);

    if (response.success) {
      console.log('check out successfull');
      //change button status
      fetchStatus().then(status => {
        setBtnStatus(status.fetchStatus);

      });
      //show success checkout notification
      setSuccessNotification(true)
      setNotificationText('Checked Out')
      setIsSubmitting(false);
      setWorkingOnLS(null)
    } else {
      console.log('not able to checkOut');
      //change button status
      fetchStatus().then(status => {
        setBtnStatus(status.fetchStatus);
      });

      //show error message
      setAlertModal(true);
      setErrorText(response.error);
      setIsSubmitting(false);
    }
  }


  useEffect(() => {
    //0 check in remaining
    //1 checked in check out remaning
    //2 checked in and checked out both
    fetchStatus().then(status => {
      setBtnStatus(status.fetchStatus);
    });

   

  }, []);
    

  return (
    <>
<View style={styles.imgContainer}>
        <Image style={styles.img} source={require('../srcAssets/img4.png')} />
      </View>

      <Calendar user_id = {user_id}></Calendar>

        <View style={styles.buttonCollection}>
        {btnStatus === 0 ? (
          //not checked in
          <TouchableOpacity disabled={isSubmitting}
            onPress={() =>{
              
              
              setCheckinModalVisible(true)}}
            style={styles.btn}>
            {isSubmitting ? (
              <ActivityIndicator color={'#fff'} />
            ) : (
              <Text style={styles.btnText}>Check In</Text>
            )}
          </TouchableOpacity>
        ) : btnStatus === 1 ? (
          //checked in, check out remaining
          <TouchableOpacity disabled={isSubmitting}
            onPress={() => setCheckoutModalVisible(true)}
            style={styles.btn}
            >

            {isSubmitting?(
              <ActivityIndicator color={'#fff'}/>
            ):(<Text style={styles.btnText}>Check Out</Text>)}
          </TouchableOpacity>
        ) : btnStatus === 2 ? (
          //registered for today
          <TouchableOpacity style={styles.btn}>
            <Text style={styles.btnText}>Shift marked</Text>
          </TouchableOpacity>
        ) : (
          //cannot decide
          <TouchableOpacity style={styles.btn}>
            <Text style={styles.btnText}>Please Wait...</Text>
          </TouchableOpacity>
        )}
      </View>


              {/* checkIn Modal Confirmation */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={checkinModalVisible}
        onRequestClose={() => {
          setCheckinModalVisible(!checkinModalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalContainer}>
            {/* Black shadow container */}
            <View style={styles.modalShadow} />

            {/* Main modal content */}
            <View style={styles.modalView}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Confirm entry now?</Text>
                <TouchableOpacity
                  style={styles.buttonClose}
                  onPress={() => setCheckinModalVisible(!checkinModalVisible)}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

                   <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="What are you working on today?"
                  multiline
                  numberOfLines={6}
                  placeholderTextColor="#A3A3A3"
                  selectionColor={'black'}
                  value={workingOnText}
                  onChangeText={setWorkingOnText}
                />
              </View>

                <View style={{alignSelf:'flex-start',marginTop:-15,marginBottom:19,marginStart:4}}>

                <Text style={{color:'#898888',fontSize:12,fontFamily:'monospace'}}>Characters : {workingOnText?workingOnText.length:0}/150</Text>
              </View>

             {/* Submit button with shadow effect */}
              <View style={styles.submitButtonContainer}>
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    !workingOnText.trim() &&  styles.submitButtonDisabled || workingOnText.length>150 && styles.submitButtonDisabled,
                  ]}
                  onPress={()=>{
                    console.log('clicked');
                    
                    handleCheckIn()
                    setCheckinModalVisible(false) 
                  }}
                  disabled={!workingOnText.trim()|| workingOnText.length>150}>
                  {isSubmitting ? (
                    <ActivityIndicator color={'#000'} />
                  ) : (
                    <Text
                      style={[
                        styles.submitButtonText,
                        !workingOnText.trim() && styles.submitButtonTextDisabled,
                      ]}>
                      Confirm
                    </Text>
                  )}
                </TouchableOpacity>
              </View>


          
             
            </View>
          </View>
        </View>
      </Modal>

      {/* checkout modal  */}
      <Modal
  animationType="fade"
  transparent={true}
  visible={checkoutModalVisible}
  onRequestClose={() => {
    setCheckoutModalVisible(!checkoutModalVisible);
  }}>
  <View style={styles.centeredView}>
    <View style={styles.modalContainer}>
      {/* Black shadow container */}
      <View style={styles.modalShadow} />
      {/* Main modal content */}
      <View style={styles.modalView}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Confirm exit Now ?</Text>
          <TouchableOpacity
            style={styles.buttonClose}
            onPress={() => setCheckoutModalVisible(!checkoutModalVisible)}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Goal Section */}
        <View style={styles.goalContainer}>
          <Text style={styles.goalLabel}>
            Your todays goal:- 
            <Text style={styles.goalText}>
              {workingOnLS ? workingOnLS : 'Unable to fetch from server'}
            </Text>
          </Text>
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
             <Text style={[styles.goalLabel,{marginStart:3}]}>
            Report Your Work:- 
           
          </Text>
            <TextInput
              style={styles.input}
             
              multiline
              numberOfLines={6}
            
              selectionColor={'black'}
              value={report}
              onChangeText={setReport}
            />
          </View>
          
          {/* Character Counter */}
          <View style={styles.characterCountContainer}>
            <Text style={styles.characterCount}>
              Characters: {report ? report.length : 0}/195
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.submitButtonContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!report.trim() || report.length > 195) && styles.submitButtonDisabled,
            ]}
            onPress={() => {
              console.log('clicked');
              handleCheckOut();
              setCheckoutModalVisible(false);
            }}
            disabled={!report.trim() || report.length > 195}>
            {isSubmitting ? (
              <ActivityIndicator color={'#000'} />
            ) : (
              <Text
                style={[
                  styles.submitButtonText,
                  !report.trim() && styles.submitButtonTextDisabled,
                ]}>
                CONFIRM
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </View>
</Modal>


      {/* notifications for successfull action/process complete */}
      {successNotification &&
      
      <SuccessNotification onHide={handleNotificationHide} notificationText={notificationText}></SuccessNotification>
      }

      {/* Alert for errors and warnings */}
   { alertModal &&  <AlertModal

        visibleModalValue={alertModal}
        errorText={errorText}
        sendValueToParentComponent={receiveValueFromComponent}></AlertModal>

}

    </>
  )
}

export default CheckInOutScreen

const styles = StyleSheet.create({
  img: {
    width: 205,
    height: 200,
    marginBottom: -52,
  },
 centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    position: 'relative',
    margin: 20,
  },
  modalShadow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: -8,
    bottom: -8,
    backgroundColor: '#000',
    zIndex: 1,
  },
  modalView: {
    backgroundColor: '#FFF',
    padding: 24,
    borderWidth: 2,
    borderColor: '#000',
    position: 'relative',
    zIndex: 2,
    minWidth: 320,
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 900,
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  buttonClose: {
    backgroundColor: 'transparent',
    padding: 8,
    position: 'absolute',
    top: -40,
    right: -40,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    backgroundColor: '#000',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 100,
  },
  // Goal Section
  goalContainer: {
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  goalLabel: {
    fontWeight: '700',
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#000',
  
  },
  goalText: {
    color: '#898888',
    fontWeight: '700',
  },
  // Input Section
  inputSection: {
    width: '100%',
    marginBottom: 24,
  },
  inputContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: 8,
  },
  input: {
    width: 260,
    height: 120,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    padding: 10,
    color: '#000',
    backgroundColor: '#FFF',
    textAlignVertical: 'top',
    // fontFamily: 'monospace',
    fontSize: 14,
  },
  characterCountContainer: {
    width: '100%',
    paddingHorizontal: 4,
  },
  characterCount: {
    color: '#898888',
    fontSize: 12,
    fontFamily: 'monospace',
    textAlign: 'left',
  },
  // Submit Button
  submitButtonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#E1FA57',
    borderWidth: 2,
    borderColor: '#000',
    paddingHorizontal: 32,
    paddingVertical: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#CCCCCC',
    borderWidth: 0.5,
  },
  submitButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    fontSize: 14,
    letterSpacing: 1,
  },
  submitButtonTextDisabled: {
    color: '#999',
  },


  // Keep your existing button styles for main screen



  //<=========== modal styling ends here ==============>
  buttonCollection: {   
    marginTop: 10, 
  },
  btnText: {
    color: '#fff',
    fontWeight: 600,
    letterSpacing: 1,
  },
  btn: {
    marginTop: 10,
    backgroundColor: '#000',
    height: 40,

    justifyContent: 'center',
    alignItems: 'center',
    padding:10
    // borderRadius: 6,
  },
});