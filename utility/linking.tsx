import { Linking, Platform } from 'react-native';

const makePhoneCall = (phone: string): void => {
  console.log('callNumber ----> ', phone);
  let phoneNumber: string = phone;
  if (Platform.OS !== 'android') {
    phoneNumber = `telprompt: ${phone}`;
  }
  else  {
    phoneNumber = `tel: ${phone}`;
  }
  Linking.openURL(phoneNumber);
};

const makeEmail = (email: string): void => {
  let emailPrompt: string = `mailto: ${email}`;
  Linking.openURL(emailPrompt);
};

export {
  makePhoneCall,
  makeEmail
};