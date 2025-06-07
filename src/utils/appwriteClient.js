import { Client,Databases,Query,ID} from "appwrite";

const client = new Client();

client
  .setEndpoint('https://fra.cloud.appwrite.io/v1') 
  .setProject('683eb8dc000935734680'); 

export const db = new Databases(client);



export const DATABASE_ID = "683ebd8900323ca46a22";
export const EMPLOYEES_COLLECTION_ID = "683ebd9c00398dc31b79";
export const ATTENDANCE_COLLECTION_ID='683ebfb40012c9f331a4';
export const WIFI_INFO_COLLECTION_ID='683ec1730022210d5aa1'
export const REQUESTS_COLLECTION_ID='6843e98d001cac64e22c'
export{ Query,ID}