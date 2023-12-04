'use client'

import names from 'random-names-generator'
import { useState, useEffect } from 'react';

export const userNameKey = 'userName'

// export function getUserName():string {
//     if (typeof window != 'undefined')
//         return localStorage.getItem(userNameKey) || names.random()
// }

// export function setUserName(userName:string) {
//     if (typeof window != 'undefined')
//         localStorage.setItem(userNameKey, userName)
// }

// https://kajindowsxp.com/next-js-localstorage/
export function useUserName() {
    const key: string = userNameKey
    const defaultValue: string = names.random()
    
    const [value, setValue] = useState<string>("");

    const setValueAndStorage = (newValue: string) => {
        console.log('saving the value ' + newValue + `${typeof window}`)
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, newValue);
            console.log('new value is saved')
        }
        setValue(newValue);
    };

    useEffect(() => {
        const res = window.localStorage.getItem(key);
        if (!res) {
            console.log("local storage is empty. setting defaultValue" + defaultValue);
            setValueAndStorage(defaultValue)
        }
        console.log('got value=' + res)
        setValue(res);
    }, []);

    return { userName:value, setUserName:setValueAndStorage };
}

/**
 * UI
 */
export default function UserSessingsBox() {
    const {userName, setUserName} = useUserName();

    const handleFormSubmission = (formData: FormData) => {
        let userName:string = formData.get("name").toString()

        setUserName(userName)
    }

    return (
        <>
            Your Name:
            <form action={handleFormSubmission}>
                <input type="text" id="name" name="name" defaultValue={userName} />
                <button type="submit">Save</button>
            </form>
        </>
    )
}
