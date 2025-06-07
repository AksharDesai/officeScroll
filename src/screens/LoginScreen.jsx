import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState } from 'react'
import AlertModal from '../components/AlertModal';
import { checkEmployeeInCollection } from '../utils/functions';


const LoginScreen = ({setLoginValue}) => {

  const [usernameInput,setUsernameInput]=useState('')
  const [isSubmitting,setIsSubmitting]=useState(false)

  const [alertModal,setAlertModal]=useState(false)
  const [error,setError]=useState('');

  const [requestLoginBtn,setRequestLoginBtn]=useState(null)
  

  //alert component returns boolean to change state of displaying alert here
  const recieveValueFromComponent = (value)=>{
    setAlertModal(value)
  }

  async function handleLogin(username){
    setIsSubmitting(true)

   
      const response = await checkEmployeeInCollection(username);
      if(response.userExists){
        setIsSubmitting(false)
        setAlertModal(false)
        setLoginValue([true, response.userName, response.user_id, response.session])
      }else if(response.allowLoginRequest){

        setIsSubmitting(false)
        setAlertModal(true)
        setRequestLoginBtn(response.user_id)
        setError(response.error)


      }
      else{
        setIsSubmitting(false)
        setAlertModal(true)
        setError(response.error)
      }
    
  }

  useEffect(()=>{
      //('inside login.jsx')
  },[])


  return (
    <>
    <View style={styles.imgContainer}>
      <Image style={styles.img} source={require('../srcAssets/img.png')}/>
    </View>
    <TextInput
    style={styles.input}
        placeholder="Enter Your Username"
        placeholderTextColor="#A3A3A3"
        selectionColor={'black'}
        value={usernameInput}
        onChangeText={setUsernameInput}
    >
    </TextInput>

     <View style={styles.buttonCollection}>
      {/* The button is still clickable on prcoessing */}
        <TouchableOpacity
          onPress={() => handleLogin(usernameInput)}
          style={styles.btn}>
          {isSubmitting ? (
            <ActivityIndicator color={'#fff'} />
          ) : (
            <Text style={styles.btnText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>


      {/* alert modal here */}
      {alertModal&&
      <AlertModal visibleModalValue={alertModal}
          errorText={error}
          sendValueToParentComponent={recieveValueFromComponent} requestLoginBtn={requestLoginBtn}/>

      }
    </>
  )
}

export default LoginScreen

const styles = StyleSheet.create({
  imgContainer: {
    height: 250,
  },
  img: {
    width: 200,
    height: 240,
  },

  input: {
    height: 40,
    margin: -18,
    borderWidth: 0.4,
    padding: 10,
    color: '#000',
    width: 200,
    borderRadius: 6,
  },
  buttonCollection: {
    width: 100,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 70,
    marginTop: 30,
  },
  btnText: {
    color: '#fff',
    fontWeight: 300,
  },
  btn: {
    backgroundColor: '#000',
    height: 35,

    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
  },
});