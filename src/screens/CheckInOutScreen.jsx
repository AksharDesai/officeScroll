import { StyleSheet, Text, View, TouchableOpacity,Modal,TextInput,ActivityIndicator,Image } from 'react-native'
import React,{useEffect,useState} from 'react'
import Calendar from '../components/Calendar'
import AlertModal from '../components/AlertModal'
import SuccessNotification from '../components/SuccessNotification'
import { checkInEmployee, checkOutEmployee, decideButton, getAllPresentDates } from '../utils/functions'


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
  const [presentDates,setPresentDates]=useState([])
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
    const response = await checkInEmployee(checkInTime, user_id);

    if (response.success) {
      // change button status
      fetchStatus().then(status => {
        // ('inside component',status);

        setBtnStatus(status.fetchStatus);
      });
      //show success notification
      setSuccessNotification(true)
      setNotificationText('Checked In')
      

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

    const fetchAttendanceDates = async()=>{
    const dates = await getAllPresentDates(user_id)
    return dates.data
  }



  useEffect(() => {
    //0 check in remaining
    //1 checked in check out remaning
    //2 checked in and checked out both
    fetchStatus().then(status => {
      setBtnStatus(status.fetchStatus);
    });

    

    fetchAttendanceDates().then(dates=>{
      setPresentDates(dates)
     
      
    })

    
    
  }, []);
    

  return (
    <>
<View style={styles.imgContainer}>
        <Image style={styles.img} source={require('../srcAssets/img2.png')} />
      </View>

      <Calendar presentDates={presentDates}></Calendar>

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

                <TouchableOpacity style={styles.submitButton} onPress={()=>{
                  handleCheckIn()
                  setCheckinModalVisible(false)
                }}>
                  <Text style={styles.submitButtonText}>Confirm</Text>
                </TouchableOpacity>
             
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
                <Text style={styles.modalTitle}>Daily Report</Text>
                <TouchableOpacity
                  style={styles.buttonClose}
                  onPress={() => setCheckoutModalVisible(!checkoutModalVisible)}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="What did you accomplish today..."
                  multiline
                  numberOfLines={6}
                  placeholderTextColor="#A3A3A3"
                  selectionColor={'black'}
                  value={report}
                  onChangeText={setReport}
                />
              </View>

              {/* Submit button with shadow effect */}
              <View style={styles.submitButtonContainer}>
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    !report.trim() && styles.submitButtonDisabled,
                  ]}
                  onPress={()=>{
                    console.log('clicked');
                    
                    handleCheckOut()
                    setCheckoutModalVisible(false)
                  }}
                  disabled={!report.trim()}>
                  {isSubmitting ? (
                    <ActivityIndicator color={'#000'} />
                  ) : (
                    <Text
                      style={[
                        styles.submitButtonText,
                        !report.trim() && styles.submitButtonTextDisabled,
                      ]}>
                      SUBMIT
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
    width: 150,
    height: 100,
    marginBottom: -28,
    zIndex: 100,
    marginRight: -150,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark backdrop like web version
  },

  // Container for the shadow effect
  modalContainer: {
    position: 'relative',
    margin: 20,
  },

  // Black shadow/offset container
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
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
    position: 'relative',
    zIndex: 2,
    minWidth: 300,
  },

  // Header styling to match web version
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },

  modalTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,

    fontFamily: 'monospace', // Use monospace font
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

  // Input container with shadow effect like web version
  inputContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: 16,
  },

  input: {
    width: 270,
    height: 120,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    padding: 12,
    color: '#000',
    backgroundColor: '#FFF',
    textAlignVertical: 'top',
    fontFamily: 'monospace',
    fontSize: 14,
    position: 'relative',
    zIndex: 2,
  },

  // Character counter
  characterCount: {
    alignSelf: 'flex-center',
    marginBottom: 24,
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#666',
  },

  // Submit button with shadow effect
  submitButtonContainer: {
    position: 'relative',
    alignSelf: 'center',
  },


  submitButton: {
    backgroundColor: '#E1FA57',
    borderWidth: 2,
    borderColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 8,
    position: 'relative',
    zIndex: 2,
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