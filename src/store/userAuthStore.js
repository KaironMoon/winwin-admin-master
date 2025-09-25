import { atom } from 'jotai';

const userInfoAtom = atom({"email": "", "name": ""});
const tokenInfoAtom = atom({"token": "", "timestamp": 0});

const setTokenInfoAtom = atom(null, (get, set, tokenInfo) => {
    set(tokenInfoAtom, tokenInfo);
    localStorage.setItem("tokenInfo", JSON.stringify(tokenInfo));
});

const setUserInfoAtom = atom(null, (get, set, userInfo) => {
    set(userInfoAtom, userInfo);
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
});

const getTokenInfoAtom = atom((get) => {
    return get(tokenInfoAtom);
});


const resetAuthAtom = atom(null, (get, set) => {
    set(userInfoAtom, {"email": "", "name": ""});
    localStorage.removeItem("userInfo");
    set(tokenInfoAtom, {"token": "", "timestamp": 0});
    localStorage.removeItem("tokenInfo");
});

const initAuthAtom = atom(null, (get, set) => {
    const userInfoStr = localStorage.getItem("userInfo");
    const tokenInfoStr = localStorage.getItem("tokenInfo");

    let userInfo ={"email": "", "name": ""};
    let tokenInfo = {"token": "", "timestamp": 0};

    try{
        if (userInfoStr) {
            userInfo = JSON.parse(userInfoStr);
        }
        if (tokenInfoStr) {
            tokenInfo = JSON.parse(tokenInfoStr);
        }
    } catch (error) {
        console.error("Error parsing userInfo or tokenInfo", error);
    }

    set(userInfoAtom, userInfo);
    set(tokenInfoAtom, tokenInfo);
});

export { userInfoAtom, tokenInfoAtom, setTokenInfoAtom, setUserInfoAtom, getTokenInfoAtom, resetAuthAtom, initAuthAtom };
