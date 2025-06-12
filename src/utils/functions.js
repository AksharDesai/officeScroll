import {
  DATABASE_ID,
  db,
  EMPLOYEES_COLLECTION_ID,
  Query,
  ID,
  ATTENDANCE_COLLECTION_ID,
  REQUESTS_COLLECTION_ID,
  WIFI_INFO_COLLECTION_ID,
} from "./appwriteClient";

import { PermissionsAndroid, Platform } from "react-native";
import WifiManager from "react-native-wifi-reborn";

export async function requestLocationPermission() {
  try {
    if (Platform.OS === "android") {
      const locationPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (locationPermission) {
        return true;
      }

      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message: "This App Needs Location Permission",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      }
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}

async function getCurrentWifi() {
  try {
    if (Platform.OS === "android") {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        return {
          success: false,
          error: "Location Permission Is Required To Proceed",
        };
      }

      const ssid = await WifiManager.getCurrentWifiSSID();
      const bssid = await WifiManager.getBSSID();

      if (bssid) {
        return { success: true, bssid: bssid };
      } else {
        return {
          success: false,
          error: "Cannot Access Which Wifi You Are Connected To",
        };
      }
    }
  } catch (error) {
    return { success: false, error: `Catched An Error ${error}` };
  }
}

async function isValidWifi() {
  try {
   

    const wifiBssid = await getCurrentWifi();

    if (wifiBssid.success) {
      const response = await db.listDocuments(
        DATABASE_ID,
        WIFI_INFO_COLLECTION_ID,
        [
          Query.equal("allowed_wifi", `${wifiBssid.bssid}`)

        ]
      );      

      if (!response) {
        return {
          success: false,
          error: "Failed To Fetch Valid Wifi Details From Server",
        };
      }

      if (!response.documents || response.documents.length === 0) {
        
        return {
          success: false,
          error: `You Are Not Connected To A Valid Wifi ${response}` ,
        };
      }

      return { success: true };
    } else {
      return {
        success: false,
        error: "Failed To Verify Which Wifi You Are Connected To",
      };
    }
  } catch (error) {
    return { success: false, error: `Catched An Error ${error}` };
  }
}

//function to check if user exists or no / for loggin in user
//on success returns {userExists:true,userName,user_id:data.$id}
export async function checkEmployeeInCollection(userName) {
  try {
    //check if the input is empty or invalid
    if (!userName || userName.trim() === "" || typeof userName !== "string") {
      return { userExists: false, error: "Invalid Username Was Provided" };
    }

    //send request to database with userName as argument
    const response = await db.listDocuments(
      DATABASE_ID,
      EMPLOYEES_COLLECTION_ID,
      [
        Query.equal("user_name", userName),
        Query.limit(1),
        Query.select(["$id", "user_name", "installed"]),
      ]
    );

    //error in sending request to database
    if (!response) {
      //   console.log("No response received from database");
      return {
        userExists: false,
        error: "Unable to fetch Username from Server",
      };
    }

    //no rows found with value username meaning username does not exist
    if (!response.documents || response.documents.length === 0) {
      //   console.log("No documents found for userName:", userName);
      return { userExists: false, error: `User doesn't exist ` };
    }

    //user exists
    const data = response.documents[0];

    //if installed / session is already generated dont allow user to login without admins consent
    if (data.installed !== null) {
      return {
        userExists: false,
        error: `Access interrupted: A re-login was detected, possibly due to app uninstallation or data clearance. Kindly request to the administrator. `,allowLoginRequest:true, user_id: data.$id
      };
    }
    //if installed / session is not allow the user to login without admins consent
    else {
      const currentTime = new Date().toISOString();
      const newSession = {
        installed: currentTime,
      };

      const updateInstalledFeild = await db.updateDocument(
        DATABASE_ID,
        EMPLOYEES_COLLECTION_ID,
        data.$id,
        newSession
      );

      if (updateInstalledFeild.installed) {
        // console.log(updateInstalledFeild.installed);

        return {
          userExists: true,
          userName,
          user_id: data.$id,
          session: updateInstalledFeild.installed,
        };
      }
    }
  } catch (error) {
    // console.log(`Gotcha Error ${error}`);
    return { userExists: false, error: "Failed To Send Request To Server" };
  }
}

export async function decideButton(user_id) {
  try {
    //get the start of today and start of tomorrow
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysDateISO = today.toISOString();
    const tomorrowsDateISO = tomorrow.toISOString();

    const response = await db.listDocuments(
      DATABASE_ID,
      ATTENDANCE_COLLECTION_ID,
      [
        Query.equal("employee_id", user_id),
        Query.greaterThanEqual("check_in", todaysDateISO),
        Query.lessThan("check_in", tomorrowsDateISO),
        Query.select(["$id", "check_in", "check_out"]),

        Query.limit(1),
      ]
    );

    //error in sending request to database
    if (!response) {
      return {
        success: false,
        error: "Unable to fetch data from Server",
      };
    }
    // fetch status  0  means show checkin btn , 1 means show checkout btn , 2 means show shift marked
    if (response.documents.length === 0) {
      return {
        success: true,
        fetchStatus: 0,
        // checkInTime: null,
        //  CheckOutTime: null
      };
    } else if (
      response.documents[0].check_in == null &&
      response.documents[0].check_out == null
    ) {
      return {
        success: true,
        fetchStatus: 0,
        // checkInTime: null,
        //  CheckOutTime: null
      };
    } else if (
      response.documents[0].check_in !== null &&
      response.documents[0].check_out == null
    ) {
      return {
        success: true,
        fetchStatus: 1,
        documentID: response.documents[0].$id,
        // checkInTime: null,
        //  CheckOutTime: null
      };
    } else if (
      response.documents[0].check_in !== null &&
      response.documents[0].check_out !== null
    ) {
      return {
        sucess: true,
        fetchStatus: 2,
        // checkInTime: row[0].check_in,
        // CheckOutTime: row[0].check_out,
      };
    } else {
      return {
        sucess: false,
        fetchStatus: -1,
        // checkInTime: row[0].check_in,
        // CheckOutTime: row[0].check_out,
      };
    }
  } catch (error) {
    return {
      sucess: false,
      fetchStatus: -1,
      // checkInTime: row[0].check_in,
      // CheckOutTime: row[0].check_out,
    };
  }
}

export async function checkInEmployee(checkInTime, user_id) {
  try {
    const fetchCheckWifi = await isValidWifi();

    if (fetchCheckWifi.success) {

      const checkIndata = {
        check_in: checkInTime,
        employee: user_id,
        employee_id: user_id,
      };

      const response = await db.createDocument(
        DATABASE_ID,
        ATTENDANCE_COLLECTION_ID,
        ID.unique(),
        checkIndata
      );

      if (!response) {
        return {
          success: false,
          error: "Failed To Insert Check-In Time {Server Error} ",
        };
      }

      if (!response.$id) {
        return {
          success: false,
          error: "Failed To Insert Check-In Time {Server Error}",
        };
      }

      return { success: true };
    } 
    else {
      return { success: false, error: `Wifi Error - ${fetchCheckWifi.error}` };
    }
  } catch (error) {
    return { success: false, error: `Catched An Error - ${error}` };
  }
}

export async function checkOutEmployee(time, report, document_id) {
  try {
    const fetchCheckWifi = await isValidWifi();

    if (fetchCheckWifi.success) {

        if (document_id) {
      const checkOutData = {
        check_out: time,
        report: report,
      };

      const response = await db.updateDocument(
        DATABASE_ID,
        ATTENDANCE_COLLECTION_ID,
        document_id,
        checkOutData
      );

      if (!response) {
        // console.log("No response recieved from database");
        return {
          success: false,
          error: "Failed To Insert Check-Out Time {Server Error}",
        };
      }

      if (!response.$id) {
        return {
          success: false,
          error: "Failed To Insert Check-Out Time {Server Error}",
        };
      }

      return { success: true };
    } else {
      console.log("no document id give error");
      return { success: false, error: "Failed To Get The Insertion ID" };
    }
      
    }else{

      return {success:false, error:`Catched An Error - ${fetchCheckWifi.error}`}

    }
  
  
  } catch (error) {
    console.log(`Catched An Error => ${error}`);
    return { success: false, error: `Catched An Error - ${error}` };
  }
}

export async function getAllPresentDates(user_id,year,month) {
  
  try {
    
    month+=1

    const monthStartDate = new Date(year,month-1,1).toISOString();
    const monthEndDate = new Date(year,month,0,23, 59, 59).toISOString();



    
    const response = await db.listDocuments(
      DATABASE_ID,
      ATTENDANCE_COLLECTION_ID,

      [
        Query.equal("employee_id", user_id), 
        Query.greaterThanEqual("check_in", monthStartDate),
        Query.lessThanEqual("check_in", monthEndDate),
        Query.select(["check_in","check_out","report"]),
      ]
    );

    if (!response) {
      return { success: false, error: "Failed To Get Your Attendance Data" };
    }

    if (response.documents.length > 0) {
      
      
      const checkIndata = response.documents.map((entry) => {
        return entry.check_in.split("T")[0];
      });

      return { success: true, data: checkIndata , row : response.documents };
    }else{
      return {success:false,error:'No Month Data Available'}
    }


  } catch (error) {
    return { success: false, error: "Failed To Get Your Attendance Data" };
  }
}

export async function sendRequestToAdmin(request_type, user_id) {
  const requestData = {
    request_type: `${request_type}`,
    employee_id: user_id,
    employee: user_id,
  };

  let response;

  try {
    if (request_type == 1) {
      response = await db.createDocument(
        DATABASE_ID,
        REQUESTS_COLLECTION_ID,
        ID.unique(),
        requestData
      );
    } else if (request_type == 2) {
      response = await db.createDocument(
        DATABASE_ID,
        REQUESTS_COLLECTION_ID,
        ID.unique(),
        requestData
      );
    } else if (request_type == 3) {
      response = await db.createDocument(
        DATABASE_ID,
        REQUESTS_COLLECTION_ID,
        ID.unique(),
        requestData
      );
    } else {
      return { success: false, error: "Cannot Define The Request" };
    }

    if (!response) {
      // console.log("Failed To Record The Request In Database");
      return {
        success: false,
        error: "Failed To Record The Request In Database ",
      };
    }

    return { success: true };
  } catch (error) {
    console.log("Gotcha Error", error);
    return { success: false, error: `Catched An Error ${error}` };
  }
}
