'use client'

const { uniqueNamesGenerator, languages, animals } = require('unique-names-generator');

import { useState, useEffect } from 'react';
import styles from './UserSettings.module.css'

export const userNameKey = 'userName'

function generateDefaultUserName() {
    // 'JapaneseDragon'
    return uniqueNamesGenerator({ dictionaries: [languages, animals], style: 'capital', separator: '' });
}

/**
 * Use useUserName() if you want to update
 */
export function getUserName() {
  // const {userName} = useUserName();
  if (typeof window != 'undefined')
    return window.localStorage.getItem('userName');

  return '';
}

// https://kajindowsxp.com/next-js-localstorage/
export function useUserName() {
    const key:string = userNameKey
    const defaultValue:string = generateDefaultUserName()

    const [value, setValue] = useState<string>(getUserName());

    const setValueAndStorage = (newValue: string) => {
        // console.log('saving the value ' + newValue + `${typeof window}`)
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, newValue);
            // console.log('new value is saved')
        }
        setValue(newValue);
    };

    useEffect(() => {
        const res = window.localStorage.getItem(key);
        if (!res) {
            console.log("local storage is empty. setting defaultValue=" + defaultValue);
            setValueAndStorage(defaultValue)
        }
        else
        {
            console.log('got value=' + res)
            setValue(res);   
        }
    }, []);

    return { userName:value, setUserName:setValueAndStorage };
}

/**
 * UI
 */
export default function UserSessingsBox() {
    const {userName, setUserName} = useUserName();

    const handleFormSubmission = (formData: FormData) => {
        let userNameValue:string = formData.get("name").toString()
        if (userNameValue.length === 0) {
            // hidden feature - reset name 
            // XXX need to refresh
            userNameValue = generateDefaultUserName()
            formData.set('name', userNameValue)
        }
        setUserName(userNameValue)
    }

    return (
        <>
            <h2 className={styles.nameTitle}>1. Configure Your Name</h2>
            <form action={handleFormSubmission} className={styles.settingsForm}>
                Name: <input type="text" id="name" name="name" defaultValue={userName} />
                <button type="submit">Save</button>
            </form>
        </>
    )
}
