import { atom } from 'jotai';

const isDemoName = 'isDemo';
const isDemoAtom = atom(false);

const setIsDemoAtom = atom(null, (get, set, value) => {
    set(isDemoAtom, value);
    window.localStorage.setItem(isDemoName, value.toString());
});

const resetIsDemoAtom = atom(null, (get, set) => {
    set(isDemoAtom, false);
    window.localStorage.removeItem(isDemoName);
});

const initIsDemoAtom = atom(null, (get, set) => {
    let isDemoStr = window.localStorage.getItem(isDemoName);
    let isDemo = false;
    if (isDemoStr !== undefined && isDemoStr !== null) {
        isDemo = isDemoStr === 'true';
    }
    window.localStorage.setItem(isDemoName, isDemo.toString());
    set(isDemoAtom, isDemo);
});

export { isDemoAtom, setIsDemoAtom, resetIsDemoAtom, initIsDemoAtom };