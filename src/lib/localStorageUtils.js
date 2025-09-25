const isDemoUtils = {
    isDemoName: 'isDemo',
    getIsMemo: () => {
        let localStorageValue = localStorage.getItem(isDemoUtils.isDemoName);
        if (localStorageValue === undefined) {
            localStorageValue = false;
        }
        return localStorageValue;
    },
    setIsMemo: (value) => {
        localStorage.setItem(isDemoUtils.isDemoName, value);
    },
    resetIsMemo: () => {
        localStorage.removeItem(isDemoUtils.isDemoName);
    }
};


const localStorageUtils = {

    getItem: (key) => {
        return localStorage.getItem(key);
    },
    setItem: (key, value) => {
        localStorage.setItem(key, value);
    },
    removeItem: (key) => {
        localStorage.removeItem(key);
    },
    clear: () => {
        localStorage.clear();
    },
};

export { localStorageUtils, isDemoUtils };